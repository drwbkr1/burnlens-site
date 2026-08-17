import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function listFiles(directory, suffix) {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await listFiles(path, suffix)));
    else if (entry.isFile() && (!suffix || path.endsWith(suffix))) result.push(path);
  }
  return result.sort();
}

function contrast(foreground, background) {
  const luminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function topLevelCommaSplit(value) {
  const parts = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (value[index] === "," && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

const manifest = JSON.parse(await read("scripts/public-candidate-allowlist.json"));
const packageJson = JSON.parse(await read("package.json"));
const globals = await read("app/globals.css");
const rootOg = await read("app/opengraph-image.tsx");
const homePage = await read("app/page.tsx");
const burnlensPage = await read("app/work/burnlens/page.tsx");
const burnlensCss = await read("app/work/burnlens/page.module.css");
const tests = await read("tests/portfolio.spec.ts");
const releaseVerifier = await read("scripts/verify-release-candidate.mjs");

assert.equal(sha256(globals), "ae655323e3669e0bc79b0f2db30cba0a1e08e8d6636dda2cf73074ba465205a0");
assert.equal(sha256(rootOg), "8aa5fe00254fc714ff2daa242d59c5dc9e7b9187feb48d6cc83d7b649b78a99e");

const exactDeletedPaths = [
  "DEPLOY_TRIGGER.md",
  "app/favicon.svg",
  "app/gradportfolio/page.tsx",
  "app/gradportfolio/resume/page.tsx",
  "app/usgif/page.tsx",
  "app/usgif/resume/page.tsx",
  "components/burnlens/EvidenceSpine.module.css",
  "components/burnlens/EvidenceSpine.tsx",
  "components/editorial/EvidenceSpine.tsx",
  "components/editorial/HistoricalCourseworkShelf.tsx",
  "components/runbook/ControlPlane.module.css",
  "components/runbook/ControlPlane.tsx",
  "components/runbook/EvidenceSpine.module.css",
  "components/runbook/EvidenceSpine.tsx",
  "docs/portfolio-notes.md",
  "next-env.d.ts",
  "public/images/gradportfolio-workflow.svg",
  "app/work/burnlens/opengraph-image.tsx",
  "public/media/projects/burnlens/LICENSE.txt",
  "public/media/projects/burnlens/manifest.json",
  "public/media/projects/burnlens/baseline-evaluation.png",
  "public/media/projects/burnlens/model-decision.png",
  "public/media/projects/burnlens/ward-creek-overlay.png",
];
assert.deepEqual([...manifest.explicit_deletions].sort(), [...exactDeletedPaths].sort());
assert.deepEqual(manifest.owner_gates, [
  "approval of the exact public representation candidate, with no publication action",
  "one exact local allowlist-bound commit, with no external write",
]);
assert.deepEqual(manifest.downstream_external_action_gates, [
  "fresh authenticated read-only Vercel project-settings inspection, only after an authenticated session already exists",
  "separate exact authority for branch push and the resulting hosted preview",
  "separate exact authority for merge, production deployment to burnlensproject.org, domain or DNS changes, production indexing, and rollback",
]);
for (const path of exactDeletedPaths) {
  assert.ok(!manifest.files.includes(path), `${path} remains allowlisted`);
}
assert.equal(manifest.files.length, 69);

const componentFiles = await listFiles("components");
assert.deepEqual(componentFiles, [
  "components/CaseChapterDisclosure.tsx",
  "components/chrome/SiteFooter.tsx",
  "components/chrome/SiteHeader.tsx",
  "components/editorial/EvidenceLink.tsx",
  "components/editorial/ProjectFactLedger.tsx",
]);
const applicationSource = (
  await Promise.all((await listFiles("app")).filter((path) => /\.tsx?$/.test(path)).map(read))
).join("\n");
for (const componentPath of componentFiles) {
  const importPath = `@/${componentPath.replace(/\.tsx$/, "")}`;
  assert.ok(applicationSource.includes(importPath), `Unreachable public component: ${componentPath}`);
}

const cssFiles = await listFiles("app", ".css");
const cssSources = new Map(await Promise.all(cssFiles.map(async (path) => [path, await read(path)])));
const rootBlock = globals.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
assert.ok(rootBlock, "Shared token foundation is missing");
const foundationNames = new Set([...rootBlock.matchAll(/--([\w-]+)\s*:/g)].map((match) => match[1]));
assert.deepEqual([...foundationNames].sort(), [
  "charcoal", "gray", "ink-soft", "max", "mono", "olive", "olive-dark", "paper", "rule",
  "sage", "sand", "sans", "serif", "shadow", "teal", "teal-dark", "terracotta",
  "terracotta-dark", "white",
]);

const folioAliases = new Map([
  ["folio-canvas", "sand"], ["folio-sheet", "paper"], ["folio-ink", "charcoal"],
  ["folio-copy", "ink-soft"], ["folio-muted", "gray"], ["folio-rule", "rule"],
  ["folio-reference", "olive-dark"], ["folio-process", "teal-dark"],
  ["folio-attention", "terracotta-dark"], ["folio-public", "sage"],
  ["folio-gated", "terracotta"], ["folio-private", "charcoal"],
]);
const definedNames = new Set(foundationNames);
for (const [path, source] of cssSources) {
  const definitions = [...source.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)];
  for (const [, name, value] of definitions) {
    if (path === "app/globals.css" && foundationNames.has(name)) continue;
    assert.equal(path, "app/work/openclaw-showcase/page.module.css", `Route-local token in ${path}: --${name}`);
    assert.equal(value.trim(), `var(--${folioAliases.get(name)})`, `OpenClaw alias drifted: --${name}`);
    definedNames.add(name);
  }
  const withoutFoundation = path === "app/globals.css" ? source.replace(/:root\s*\{[\s\S]*?\}/, "") : source;
  assert.ok(!/(?:#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\()/i.test(withoutFoundation), `Raw color outside foundation: ${path}`);
  assert.ok(!/\b(?:backdrop-)?filter\s*:/i.test(source), `Filter effect is forbidden: ${path}`);
  assert.ok(!/\burl\s*\(/i.test(source), `CSS imagery is forbidden: ${path}`);
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const body = match[2];
    if (/\boverflow(?:-x)?\s*:\s*(?:hidden|clip)\b/i.test(body)) {
      assert.ok(!/(?:^|,)\s*(?:html|body|main|article|\.page)(?:\b|\s|[,:.#>+~[])/i.test(selector), `Blanket canvas clipping in ${path}: ${selector}`);
    }
  }
  for (const declaration of source.matchAll(/box-shadow\s*:\s*([^;]+);/gi)) {
    for (const shadow of topLevelCommaSplit(declaration[1])) {
      const normalized = shadow.trim();
      if (/^(?:none|var\(--shadow\))$/.test(normalized)) continue;
      const stripped = normalized
        .replace(/(?:rgba?|color-mix|var)\([^)]*\)/g, "")
        .replace(/#[0-9a-f]{3,8}/gi, "");
      const lengths = stripped.match(/-?(?:\d*\.)?\d+(?:px|rem|em)?/g) ?? [];
      assert.ok(lengths.length >= 3, `Unreviewed shadow syntax in ${path}: ${normalized}`);
      assert.equal(Number.parseFloat(lengths[2]), 0, `Blurred shadow in ${path}: ${normalized}`);
    }
  }
}
for (const [path, source] of cssSources) {
  for (const match of source.matchAll(/var\(--([\w-]+)/g)) {
    assert.ok(definedNames.has(match[1]), `Undefined CSS variable --${match[1]} in ${path}`);
  }
}

assert.match(globals, /html\s*\{[\s\S]*scroll-padding-top:\s*5rem;/);
assert.match(globals, /\.site-header\s*\{[\s\S]*background:\s*var\(--sand\);/);
assert.doesNotMatch(globals, /backdrop-filter|background:\s*color-mix[^;]*\.site-header/i);
for (const selector of [".brand-mark", ".desktop-nav", ".mobile-menu summary", ".mobile-menu nav a", ".footer-links"]) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = globals.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1];
  assert.match(rule ?? "", /font-size:\s*0\.8125rem/);
}

assert.match(rootOg, /export const size = \{ width: 1200, height: 630 \}/);
assert.doesNotMatch(rootOg, /\brgba?\(|\bhsla?\(/i);
const rootOgPalette = [...new Set([...rootOg.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0].toUpperCase()))].sort();
assert.deepEqual(rootOgPalette, ["#222222", "#314E54", "#48513F", "#7A3828", "#E9E2D8"]);
for (const foreground of ["#222222", "#314E54", "#48513F", "#7A3828"]) {
  assert.ok(contrast(foreground, "#E9E2D8") >= 4.5, `Root social-image contrast failed: ${foreground}`);
}

assert.match(homePage, /How this portfolio was made/);
assert.match(homePage, /data-portfolio-making/);
assert.doesNotMatch(homePage, /BL\.F0[1-3]|burnlens-report|burnlens-media-manifest/);
assert.doesNotMatch(
  burnlensPage,
  /(?:BL\.F0[1-3]|data-governed-figure|data-media-warning|burnlens-(?:report|failure-record|media-manifest)|baseline-evaluation\.png|model-decision\.png|ward-creek-overlay\.png)/,
);
assert.doesNotMatch(burnlensPage, /from\s+["']next\/image["']|<\s*(?:Image|img)\b/);
assert.doesNotMatch(burnlensCss, /url\s*\(/i);
const generatedRouteBlock = tests.match(/const representativeRoutes = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
const generatedRouteTests = (generatedRouteBlock.match(/^\s*"\//gm) ?? []).length;
const topLevelTests = (tests.match(/^test\(/gm) ?? []).length;
assert.equal(topLevelTests + generatedRouteTests, 65,
  "The browser regression suite must retain 65 expanded tests.");

assert.equal(packageJson.scripts["verify:integrated-u08"], "node scripts/verify-integrated-u08.mjs");
assert.ok(packageJson.scripts.check.includes("npm run verify:integrated-u08"));
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site");
assert.ok(manifest.script_files.includes("scripts/verify-integrated-u08.mjs"));
assert.ok(manifest.files.includes("scripts/verify-integrated-u08.mjs"));
assert.match(releaseVerifier, /EXPECTED_BROWSER_TESTS\s*=\s*65/);
assert.match(releaseVerifier, /verifySourcePublicScope\(\);/);
assert.match(releaseVerifier, /verify:integrated-u08/);
assert.match(tests, /shared chrome keeps one opaque, readable, high-contrast system across every route/);
assert.match(tests, /root Open Graph endpoint is an exact meaningful 1200 by 630 PNG/);

console.log(JSON.stringify({
  status: "pass",
  publication_authority: "none",
  css_files: cssFiles.length,
  foundation_tokens: foundationNames.size,
  reachable_components: componentFiles.length,
  explicit_deletions: manifest.explicit_deletions.length,
  expected_browser_tests: 65,
  root_social_image_pairs: 4,
}, null, 2));
