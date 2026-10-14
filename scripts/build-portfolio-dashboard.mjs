import { copyFile, mkdir, readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const repo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const args=process.argv.slice(2);
const pluginAt=args.indexOf('--plugin-root'), projectAt=args.indexOf('--project-dir');
if(pluginAt<0||projectAt<0) throw new Error('Provide --plugin-root installed Data plugin and --project-dir prepared authoring app.');
const plugin=path.resolve(args[pluginAt+1]), project=path.resolve(args[projectAt+1]);
await access(path.join(project,'AGENTS.md'));
const source=path.join(repo,'content/dashboard-artifact');
const authored=JSON.parse(await readFile(path.join(source,'data.json'),'utf8'));
if(!/^dashboard:[a-f0-9-]{36}$/.test(authored.id)) throw new Error('Stable artifact identity missing.');
for (const [src,dst] of [['data.json','src/data.json'],['theme.css','src/theme.css'],['DashboardContent.jsx','src/content/dashboard/DashboardContent.jsx'],['portfolio.css','src/content/dashboard/portfolio.css']])
 await copyFile(path.join(source,src),path.join(project,dst));
// Public-candidate output has no local task handoff identity. No protected code is changed.
const built=spawnSync(process.execPath,[path.join(plugin,'scripts/data-app.mjs'),'build','--project-dir',project,'--separate-data'],{encoding:'utf8',env:{...process.env,CODEX_SESSION_ID:'',CODEX_THREAD_ID:''}});
if(built.status!==0) throw new Error(built.stderr||'Data build failed.');
const manifest=JSON.parse(await readFile(path.join(project,'dist/data-app-build.json'),'utf8'));
if(manifest.runtimeSha256!=='b5514c44f112ed9b8fe2e8674369e515b7e712abfc70a896140b96f0ab65cfd2') throw new Error('Pinned Data runtime changed; review required.');
const output=path.join(repo,'public/dashboard/explore');
await mkdir(output,{recursive:true});
for(const entry of [manifest.html,manifest.snapshot]){
 if(!/^(?:index\.html|snapshot\.[a-f0-9]{64}\.json)$/.test(entry.path)) throw new Error('Unsafe build entry.');
 const bytes=await readFile(path.join(project,'dist',entry.path));
 if(bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256) throw new Error('Build entry identity mismatch.');
 if(entry.path==='index.html'&&bytes.toString().includes('name="data-app-local-thread"')) throw new Error('Local handoff metadata must not enter portfolio output; use a fresh prepared build app.');
 await copyFile(path.join(project,'dist',entry.path),path.join(output,entry.path));
}
await copyFile(path.join(project,'dist/data-app-build.json'),path.join(output,'data-app-build.json'));
process.stdout.write(JSON.stringify({artifact:authored.id,manifest},null,2)+'\n');
