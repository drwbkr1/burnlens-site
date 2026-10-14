import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const verifierPath = "scripts/verify-public-candidate.mjs";
const manifestPath = "scripts/public-candidate-allowlist.json";
const verifierBytes = await readFile(resolve(sourceRoot, verifierPath));
const sourceManifest = JSON.parse(await readFile(resolve(sourceRoot, manifestPath), "utf8"));
const ignoreBytes = await readFile(resolve(sourceRoot, ".gitignore"));
const generatedAudioSourcesPath = "public/media/projects/after-the-tip/sources.json";
const generatedAudioPaths = [
  "public/media/projects/after-the-tip/lead-voices-all-40x.wav",
  "public/media/projects/after-the-tip/lead-voices-purdue-40x.wav",
];
const generatedAudioSourcesBytes = await readFile(resolve(sourceRoot, generatedAudioSourcesPath));
const generatedAudioBytes = new Map(await Promise.all(generatedAudioPaths.map(async (path) => [
  path, await readFile(resolve(sourceRoot, path)),
])));
const datedRadarAtlasPath = "public/media/projects/nepal-satellite-atlas/dated-radar-atlas.png";
const datedRadarAtlasBytes = await readFile(resolve(sourceRoot, datedRadarAtlasPath));
const temporaryBase = await realpath(tmpdir());
const fixturePrefix = "portfolio-scope-fixture-";
function createFixtureEnvironment(inherited) {
  // No inherited Git routing, object-store, config, template, hook, or transport setting reaches a fixture.
  const environment = Object.fromEntries(Object.entries(inherited).filter(([name]) => !/^GIT_/iu.test(name)));
  return {
    ...environment,
    GIT_OPTIONAL_LOCKS: "0",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
  };
}

async function withFixture(run, { repository = false, inheritedEnvironment = process.env } = {}) {
  const fixtureEnvironment = createFixtureEnvironment(inheritedEnvironment);
  const root = await mkdtemp(join(temporaryBase, fixturePrefix));
  const write = async (path, bytes) => {
    const destination = resolve(root, path);
    assert.ok(destination.startsWith(`${root}/`) || destination.startsWith(`${root}\\`));
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  };
  const git = (args, input) => execFileSync("git", [
    "--no-optional-locks", "-c", "core.autocrlf=false", "-c", "core.safecrlf=false", ...args,
  ], {
    cwd: root,
    encoding: "utf8",
    env: fixtureEnvironment,
    input,
    stdio: ["pipe", "pipe", "pipe"],
  });
  const verify = (environment = {}) => spawnSync(process.execPath, [verifierPath], {
    cwd: root,
    encoding: "utf8",
    env: { ...fixtureEnvironment, ...environment },
    timeout: 15_000,
  });
  const manifest = {
    schema_version: sourceManifest.schema_version,
    publication_authority: "none",
    root_files: [".gitignore"],
    script_files: [manifestPath, verifierPath],
    include_trees: ["public"],
    files: [".gitignore", manifestPath, verifierPath, "public/media/example.txt"],
    explicit_deletions: ["public/removed.txt"],
    explicit_exclusions: sourceManifest.explicit_exclusions,
    owner_gates: sourceManifest.owner_gates,
    downstream_external_action_gates: sourceManifest.downstream_external_action_gates,
  };
  try {
    await write(verifierPath, verifierBytes);
    await write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await write(".gitignore", ignoreBytes);
    await write("public/media/example.txt", "Public fixture.\n");
    if (repository) git(["init", "--quiet", "--template="]);
    await run({ root, write, git, verify, manifest });
  } finally {
    const resolvedRoot = await realpath(root);
    assert.equal(resolvedRoot, root);
    assert.equal(dirname(resolvedRoot), temporaryBase);
    assert.ok(basename(resolvedRoot).startsWith(fixturePrefix));
    await rm(resolvedRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

function passed(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.status, "pass");
  return receipt;
}

function failed(result, message) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0, "Unsafe fixture unexpectedly passed.");
  assert.match(result.stderr, message);
}

async function withGeneratedAudioFixture(run, options) {
  await withFixture(async (fixture) => {
    const { manifest, write } = fixture;
    manifest.files.push(...generatedAudioPaths, generatedAudioSourcesPath);
    for (const [path, bytes] of generatedAudioBytes) await write(path, bytes);
    await write(generatedAudioSourcesPath, generatedAudioSourcesBytes);
    await write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await run(fixture);
  }, options);
}

test("Git-free allowlisted release snapshot is explicit, not a staged-scope pass", async () => {
  await withFixture(async ({ verify }) => {
    const receipt = passed(verify());
    assert.equal(receipt.files, 4);
    assert.deepEqual(receipt.git_index_scope, { status: "not_applicable_no_repository", index_entries: 0 });
  });
});

test("allowlisted staged files pass without changing the disposable Git index", async () => {
  await withFixture(async ({ root, git, verify, manifest }) => {
    git(["add", "--", ...manifest.files]);
    const digest = async () => createHash("sha256").update(await readFile(join(root, ".git", "index"))).digest("hex");
    const before = await digest();
    const receipt = passed(verify());
    assert.deepEqual(receipt.git_index_scope, { status: "pass", index_entries: 4 });
    assert.equal(await digest(), before);
  }, { repository: true });
});

test("unborn empty Git index is read successfully", async () => {
  await withFixture(async ({ verify }) => {
    assert.deepEqual(passed(verify()).git_index_scope, { status: "pass", index_entries: 0 });
  }, { repository: true });
});

test("inherited Git object-store and config overrides cannot redirect synthetic writes", async () => {
  await withFixture(async ({ root: guardRoot, write }) => {
    await write("redirected-objects/untouched.txt", "Guard fixture.\n");
    const objectTarget = join(guardRoot, "redirected-objects");
    const inheritedEnvironment = {
      ...process.env,
      GIT_OBJECT_DIRECTORY: objectTarget,
      GIT_ALTERNATE_OBJECT_DIRECTORIES: objectTarget,
      GIT_INDEX_FILE: join(guardRoot, "redirected-index"),
      GIT_COMMON_DIR: join(guardRoot, "redirected-common"),
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "core.worktree",
      GIT_CONFIG_VALUE_0: guardRoot,
      GIT_TEMPLATE_DIR: guardRoot,
      GIT_SSH_COMMAND: "fixture-command-must-not-run",
    };
    // Assert the boundary before initializing or writing objects in the inner repository.
    const sanitized = createFixtureEnvironment(inheritedEnvironment);
    assert.deepEqual(Object.keys(sanitized).filter((name) => /^GIT_/iu.test(name)).sort(), [
      "GIT_CONFIG_GLOBAL", "GIT_CONFIG_NOSYSTEM", "GIT_OPTIONAL_LOCKS",
    ]);
    await withFixture(async ({ root, git, verify }) => {
      const object = git(["hash-object", "-w", "--stdin"], "Isolated object fixture.\n").trim();
      assert.equal((await stat(join(root, ".git", "objects", object.slice(0, 2), object.slice(2)))).isFile(), true);
      assert.deepEqual(await readdir(objectTarget), ["untouched.txt"]);
      assert.equal(passed(verify()).git_index_scope.status, "pass");
    }, { repository: true, inheritedEnvironment });
  });
});

for (const path of ["public/draft.txt", "public/attachments/draft.txt", "public/.hidden", "public/media/extra.txt"]) {
  test(`unlisted static file fails: ${path}`, async () => {
    await withFixture(async ({ write, verify }) => {
      await write(path, "Not intended for publication.\n");
      failed(verify(), /Candidate scope drifted/);
    });
  });
}

test("a narrowed manifest cannot omit the rest of public", async () => {
  await withFixture(async ({ manifest, write, verify }) => {
    manifest.include_trees = ["public/media"];
    await write(manifestPath, `${JSON.stringify(manifest)}\n`);
    failed(verify(), /complete public tree must be included/);
  });
});

test("unsafe discovery roots fail before traversing them", async () => {
  await withFixture(async ({ manifest, write, verify }) => {
    manifest.include_trees.push("../outside");
    await write(manifestPath, `${JSON.stringify(manifest)}\n`);
    failed(verify(), /Unsafe candidate path/);
  });
});

test("an existing explicit deletion remains rejected", async () => {
  await withFixture(async ({ write, verify }) => {
    await write("public/removed.txt", "Deleted candidate fixture.\n");
    failed(verify(), /Explicit deletion still exists/);
  });
});

test("a linked static directory cannot escape discovery", async () => {
  await withFixture(async ({ root, write, verify }) => {
    await write("fixture-assets/example.txt", "Outside the public tree.\n");
    await symlink(join(root, "fixture-assets"), join(root, "public", "linked"), process.platform === "win32" ? "junction" : "dir");
    failed(verify(), /Candidate trees may not contain links or special files/);
  });
});

for (const [index, exclusion] of sourceManifest.explicit_exclusions.entries()) {
  test(`ignored control exclusion ${index + 1} still fails when force-staged`, async () => {
    await withFixture(async ({ write, git, verify }) => {
      const path = exclusion.endsWith(".mjs") ? exclusion : `${exclusion}/fixture.json`;
      await write(path, "{}\n");
      assert.equal(git(["check-ignore", "--", path]).trim(), path);
      // This is a new disposable repository, never the source repository's index.
      git(["add", "--force", "--", path]);
      failed(verify(), /Excluded or unallowlisted path in candidate Git index/);
    }, { repository: true });
  });
}

test("a staged non-allowlisted root file fails outside static discovery", async () => {
  await withFixture(async ({ write, git, verify }) => {
    await write("draft-record.json", "{}\n");
    git(["add", "--", "draft-record.json"]);
    failed(verify(), /Excluded or unallowlisted path in candidate Git index/);
  }, { repository: true });
});

test("Git paths containing a newline cannot bypass NUL-delimited checks", async () => {
  await withFixture(async ({ git, verify }) => {
    const object = git(["hash-object", "-w", "--stdin"], "Fixture.\n").trim();
    // Windows Git otherwise silently ignores a filesystem-invalid fixture path.
    git(["-c", "core.protectNTFS=false", "update-index", "-z", "--index-info"], `100644 ${object}\tdraft\nrecord.txt\0`);
    assert.match(git(["ls-files", "-z"]), /draft\nrecord\.txt\0/u);
    failed(verify(), /Excluded or unallowlisted path in candidate Git index/);
  }, { repository: true });
});

test("an allowlisted name cannot conceal a staged symbolic link", async () => {
  await withFixture(async ({ git, verify }) => {
    const object = git(["hash-object", "-w", "--stdin"], "somewhere\n").trim();
    git(["update-index", "-z", "--index-info"], `120000 ${object}\tpublic/media/example.txt\0`);
    failed(verify(), /Link or special entry in candidate Git index/);
  }, { repository: true });
});

test("unmerged index entries fail closed", async () => {
  await withFixture(async ({ git, verify }) => {
    const object = git(["hash-object", "-w", "--stdin"], "Fixture.\n").trim();
    git(["update-index", "-z", "--index-info"], `100644 ${object} 1\tpublic/media/example.txt\0`);
    failed(verify(), /Unmerged path in candidate Git index/);
  }, { repository: true });
});

test("an alternate index environment cannot substitute a different index", async () => {
  await withFixture(async ({ root, verify }) => {
    failed(verify({ GIT_INDEX_FILE: join(root, "alternate-index") }), /Git routing override/);
  }, { repository: true });
});

for (const name of ["GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES"]) {
  test(`source index verification rejects ${name}`, async () => {
    await withFixture(async ({ root, verify }) => {
      failed(verify({ [name]: join(root, "alternate-objects") }), /Git routing override/);
    }, { repository: true });
  });
}

test("inherited Git config cannot redirect source index inspection", async () => {
  await withFixture(async ({ root, verify }) => {
    const receipt = passed(verify({
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "core.worktree",
      GIT_CONFIG_VALUE_0: join(root, "wrong-root"),
    }));
    assert.equal(receipt.git_index_scope.status, "pass");
  }, { repository: true });
});

test("an invalid Git marker is a failure, not a Git-free snapshot", async () => {
  await withFixture(async ({ write, verify }) => {
    await write(".git", "invalid fixture\n");
    failed(verify(), /Cannot inspect the candidate Git index/);
  });
});

test("ignore-declaration handling does not hide unrelated internal references", async () => {
  await withFixture(async ({ write, verify }) => {
    await write(".gitignore", `${ignoreBytes.toString("utf8")}# ${sourceManifest.explicit_exclusions[0]}/fixture.json\n`);
    failed(verify(), /internal review path found/);
  });
});

test("the exact generated audio pair and scanned source manifest pass", async () => {
  await withGeneratedAudioFixture(async ({ verify }) => {
    assert.equal(passed(verify()).files, 7);
  });
});

test("exact generated audio verification preserves a disposable staged index", async () => {
  await withGeneratedAudioFixture(async ({ root, manifest, git, verify }) => {
    git(["add", "--", ...manifest.files]);
    const digest = async () => createHash("sha256").update(await readFile(join(root, ".git", "index"))).digest("hex");
    const before = await digest();
    assert.deepEqual(passed(verify()).git_index_scope, { status: "pass", index_entries: 7 });
    assert.equal(await digest(), before);
  }, { repository: true });
});

for (const missing of [...generatedAudioPaths, generatedAudioSourcesPath]) {
  test(`generated audio scope cannot omit ${missing.split("/").at(-1)}`, async () => {
    await withFixture(async ({ manifest, write, verify }) => {
      for (const path of [...generatedAudioPaths, generatedAudioSourcesPath].filter((path) => path !== missing)) {
        manifest.files.push(path);
        await write(path, path === generatedAudioSourcesPath ? generatedAudioSourcesBytes : generatedAudioBytes.get(path));
      }
      await write(manifestPath, `${JSON.stringify(manifest)}\n`);
      failed(verify(), /exact two-file pair and its allowlisted source manifest/);
    });
  });
}

for (const path of ["public/media/recording.wav", "public/media/projects/after-the-tip/lead-voices-copy.WAV"]) {
  test(`an otherwise allowlisted WAV is not a new audio exception: ${path}`, async () => {
    await withGeneratedAudioFixture(async ({ manifest, write, verify }) => {
      manifest.files.push(path);
      await write(path, generatedAudioBytes.get(generatedAudioPaths[0]));
      await write(manifestPath, `${JSON.stringify(manifest)}\n`);
      failed(verify(), /Unsupported binary type/);
    });
  });
}

test("a case-only manifest alias cannot substitute the exact approved audio path", async () => {
  await withGeneratedAudioFixture(async ({ manifest, write, verify }) => {
    manifest.files = manifest.files.map((path) => path === generatedAudioPaths[0] ? path.replace(/\.wav$/, ".WAV") : path);
    await write(manifestPath, `${JSON.stringify(manifest)}\n`);
    failed(verify(), /Candidate scope drifted/);
  });
});

test("swapping the generated audio contents fails exact source identity", async () => {
  await withGeneratedAudioFixture(async ({ write, verify }) => {
    await write(generatedAudioPaths[0], generatedAudioBytes.get(generatedAudioPaths[1]));
    await write(generatedAudioPaths[1], generatedAudioBytes.get(generatedAudioPaths[0]));
    failed(verify(), /Generated WAV source identity mismatch/);
  });
});

test("a format-valid sample alteration fails exact source identity", async () => {
  await withGeneratedAudioFixture(async ({ write, verify }) => {
    const bytes = Buffer.from(generatedAudioBytes.get(generatedAudioPaths[0]));
    bytes[44] ^= 1;
    await write(generatedAudioPaths[0], bytes);
    failed(verify(), /Generated WAV source identity mismatch/);
  });
});

test("updating the manifest cannot authorize an altered sample payload", async () => {
  await withGeneratedAudioFixture(async ({ write, verify }) => {
    const bytes = Buffer.from(generatedAudioBytes.get(generatedAudioPaths[0]));
    bytes[44] ^= 1;
    const sources = JSON.parse(generatedAudioSourcesBytes.toString("utf8"));
    sources.assets[0].sha256 = createHash("sha256").update(bytes).digest("hex");
    await write(generatedAudioPaths[0], bytes);
    await write(generatedAudioSourcesPath, `${JSON.stringify(sources)}\n`);
    failed(verify(), /Generated WAV source identity mismatch/);
  });
});

const malformedAudioCases = [
  ["truncated header", (bytes) => bytes.subarray(0, 43), /signature or truncated header/],
  ["bad RIFF signature", (bytes) => { bytes.write("RIFX", 0); return bytes; }, /signature or truncated header/],
  ["high-bit RIFF alias", (bytes) => { bytes[0] |= 0x80; return bytes; }, /signature or truncated header/],
  ["bad WAVE signature", (bytes) => { bytes.write("AVI ", 8); return bytes; }, /signature or truncated header/],
  ["RIFF length", (bytes) => { bytes.writeUInt32LE(bytes.length - 7, 4); return bytes; }, /RIFF length mismatch/],
  ["format chunk tag", (bytes) => { bytes.write("JUNK", 12); return bytes; }, /unsupported chunk layout/],
  ["extended format chunk", (bytes) => { bytes.writeUInt32LE(18, 16); return bytes; }, /unsupported chunk layout/],
  ["data chunk tag", (bytes) => { bytes.write("LIST", 36); return bytes; }, /unsupported chunk layout/],
  ["float encoding", (bytes) => { bytes.writeUInt16LE(3, 20); return bytes; }, /PCM profile/],
  ["compressed encoding", (bytes) => { bytes.writeUInt16LE(6, 20); return bytes; }, /PCM profile/],
  ["extensible encoding", (bytes) => { bytes.writeUInt16LE(0xfffe, 20); return bytes; }, /PCM profile/],
  ["stereo channels", (bytes) => { bytes.writeUInt16LE(2, 22); return bytes; }, /PCM profile/],
  ["sample rate", (bytes) => { bytes.writeUInt32LE(44100, 24); return bytes; }, /PCM profile/],
  ["byte rate", (bytes) => { bytes.writeUInt32LE(44101, 28); return bytes; }, /PCM profile/],
  ["block alignment", (bytes) => { bytes.writeUInt16LE(4, 32); return bytes; }, /PCM profile/],
  ["sample depth", (bytes) => { bytes.writeUInt16LE(8, 34); return bytes; }, /PCM profile/],
  ["data length", (bytes) => { bytes.writeUInt32LE(bytes.length - 45, 40); return bytes; }, /data length, alignment, or trailing-content/],
  ["truncated samples", (bytes) => {
    const truncated = bytes.subarray(0, bytes.length - 2);
    truncated.writeUInt32LE(truncated.length - 8, 4);
    return truncated;
  }, /data length, alignment, or trailing-content/],
  ["odd sample length", (bytes) => {
    const truncated = bytes.subarray(0, bytes.length - 1);
    truncated.writeUInt32LE(truncated.length - 8, 4);
    truncated.writeUInt32LE(truncated.length - 44, 40);
    return truncated;
  }, /data length, alignment, or trailing-content/],
  ["different duration", (bytes) => {
    const truncated = bytes.subarray(0, bytes.length - 2);
    truncated.writeUInt32LE(truncated.length - 8, 4);
    truncated.writeUInt32LE(truncated.length - 44, 40);
    return truncated;
  }, /duration differs/],
  ["trailing content", (bytes) => {
    const extended = Buffer.concat([bytes, Buffer.from("extra")]);
    extended.writeUInt32LE(extended.length - 8, 4);
    return extended;
  }, /data length, alignment, or trailing-content/],
];
for (const [name, mutate, message] of malformedAudioCases) {
  test(`generated WAV format validation precedes hash validation: ${name}`, async () => {
    await withGeneratedAudioFixture(async ({ write, verify }) => {
      await write(generatedAudioPaths[0], mutate(Buffer.from(generatedAudioBytes.get(generatedAudioPaths[0]))));
      failed(verify(), message);
    });
  });
}

for (const tag of ["LIST", "bext", "iXML", "JUNK"]) {
  test(`generated WAV rejects an inserted ${tag} chunk`, async () => {
    await withGeneratedAudioFixture(async ({ write, verify }) => {
      const bytes = generatedAudioBytes.get(generatedAudioPaths[0]);
      const chunk = Buffer.alloc(12);
      chunk.write(tag, 0);
      chunk.writeUInt32LE(4, 4);
      chunk.write("note", 8);
      const extended = Buffer.concat([bytes.subarray(0, 36), chunk, bytes.subarray(36)]);
      extended.writeUInt32LE(extended.length - 8, 4);
      await write(generatedAudioPaths[0], extended);
      failed(verify(), /metadata or unsupported chunk layout/);
    });
  });
}

for (const [name, mutate] of [
  ["asset hash", (sources) => { sources.assets[0].sha256 = "0".repeat(64); }],
  ["asset profile", (sources) => { sources.assets[0].sample_rate = 44100; }],
  ["duplicated asset", (sources) => { sources.assets[1] = { ...sources.assets[0] }; }],
  ["extra asset", (sources) => { sources.assets.push({ ...sources.assets[0], file: "extra.wav" }); }],
  ["underlying source hash", (sources) => { sources.figure_derivation.input_sha256 = "0".repeat(64); }],
  ["publication authority", (sources) => { sources.publication_authority = "granted"; }],
]) {
  test(`the exact audio source manifest rejects drift: ${name}`, async () => {
    await withGeneratedAudioFixture(async ({ write, verify }) => {
      const sources = JSON.parse(generatedAudioSourcesBytes.toString("utf8"));
      mutate(sources);
      await write(generatedAudioSourcesPath, `${JSON.stringify(sources)}\n`);
      failed(verify(), /source manifest identity mismatch/);
    });
  });
}

for (const [name, value, message] of [
  ["local path", ["C:", "private", "source.csv"].join(String.fromCharCode(92)), /local absolute path found/],
  ["email", ["private-person", "example.invalid"].join("@"), /Unexpected email address/],
  ["credential", ["ghp", "A".repeat(36)].join("_"), /token-like secret found/],
  ["review reference", ["owner-", "response"].join(""), /internal review path found/],
]) {
  test(`audio manifest remains subject to normal privacy scanning: ${name}`, async () => {
    await withGeneratedAudioFixture(async ({ write, verify }) => {
      const sources = JSON.parse(generatedAudioSourcesBytes.toString("utf8"));
      sources.note = value;
      await write(generatedAudioSourcesPath, `${JSON.stringify(sources)}\n`);
      failed(verify(), message);
    });
  });
}

function fixturePngChunk(type, payload) {
  const chunk = Buffer.alloc(payload.length + 12);
  chunk.writeUInt32BE(payload.length, 0);
  chunk.write(type, 4, "latin1");
  payload.copy(chunk, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, chunk.length - 4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4);
  return chunk;
}

function datedRadarAtlasChunks() {
  const chunks = [];
  for (let offset = 8; offset < datedRadarAtlasBytes.length;) {
    const length = datedRadarAtlasBytes.readUInt32BE(offset);
    chunks.push({
      type: datedRadarAtlasBytes.toString("latin1", offset + 4, offset + 8),
      payload: Buffer.from(datedRadarAtlasBytes.subarray(offset + 8, offset + 8 + length)),
      bytes: Buffer.from(datedRadarAtlasBytes.subarray(offset, offset + 12 + length)),
    });
    offset += 12 + length;
  }
  return chunks;
}

function rebuildDatedRadarAtlas(chunks) {
  return Buffer.concat([datedRadarAtlasBytes.subarray(0, 8), ...chunks.map((chunk) => chunk.bytes)]);
}

async function withDatedRadarAtlasFixture(run, { path = datedRadarAtlasPath, bytes = datedRadarAtlasBytes } = {}) {
  await withFixture(async (fixture) => {
    const { manifest, write } = fixture;
    manifest.files.push(path);
    await write(path, bytes);
    await write(manifestPath, `${JSON.stringify(manifest)}\n`);
    await run(fixture);
  });
}

test("the exact source PNG passes with its numeric sRGB and pHYs chunks", async () => {
  await withDatedRadarAtlasFixture(async ({ verify }) => {
    assert.equal(passed(verify()).files, 5);
  });
});

test("ordinary PNGs retain support for IHDR, IDAT and IEND only", async () => {
  const bytes = rebuildDatedRadarAtlas(datedRadarAtlasChunks().filter((chunk) => chunk.type !== "sRGB" && chunk.type !== "pHYs"));
  await withDatedRadarAtlasFixture(async ({ verify }) => {
    passed(verify());
  }, { path: "public/media/plain.png", bytes });
});

for (const path of ["public/media/other-atlas.png", "public/media/projects/nepal-satellite-atlas/renamed-radar-atlas.PNG"]) {
  test(`reviewed color/density chunks are not allowed at another PNG path: ${path}`, async () => {
    await withDatedRadarAtlasFixture(async ({ verify }) => {
      failed(verify(), /PNG metadata or unsupported ancillary chunk sRGB/);
    }, { path });
  });
}

const malformedAtlasCases = [
  ["signature", (chunks) => {
    const bytes = rebuildDatedRadarAtlas(chunks);
    bytes[0] = 0;
    return bytes;
  }, /Invalid PNG signature/],
  ["width", (chunks) => {
    chunks[0].payload.writeUInt32BE(1559, 0);
    chunks[0].bytes = fixturePngChunk("IHDR", chunks[0].payload);
    return rebuildDatedRadarAtlas(chunks);
  }, /dimensions or RGB8 format mismatch/],
  ["color format", (chunks) => {
    chunks[0].payload[9] = 6;
    chunks[0].bytes = fixturePngChunk("IHDR", chunks[0].payload);
    return rebuildDatedRadarAtlas(chunks);
  }, /dimensions or RGB8 format mismatch/],
  ["bit depth", (chunks) => {
    chunks[0].payload[8] = 16;
    chunks[0].bytes = fixturePngChunk("IHDR", chunks[0].payload);
    return rebuildDatedRadarAtlas(chunks);
  }, /dimensions or RGB8 format mismatch/],
  ["CRC", (chunks) => {
    chunks[1].bytes[chunks[1].bytes.length - 1] ^= 1;
    return rebuildDatedRadarAtlas(chunks);
  }, /Invalid PNG chunk checksum/],
  ["sRGB payload", (chunks) => {
    chunks[1].bytes = fixturePngChunk("sRGB", Buffer.from([0]));
    return rebuildDatedRadarAtlas(chunks);
  }, /sRGB payload or placement mismatch/],
  ["sRGB length", (chunks) => {
    chunks[1].bytes = fixturePngChunk("sRGB", Buffer.from([1, 1]));
    return rebuildDatedRadarAtlas(chunks);
  }, /sRGB payload or placement mismatch/],
  ["pHYs payload", (chunks) => {
    chunks[2].payload[3] ^= 1;
    chunks[2].bytes = fixturePngChunk("pHYs", chunks[2].payload);
    return rebuildDatedRadarAtlas(chunks);
  }, /pHYs payload or placement mismatch/],
  ["pHYs length", (chunks) => {
    chunks[2].bytes = fixturePngChunk("pHYs", chunks[2].payload.subarray(0, 8));
    return rebuildDatedRadarAtlas(chunks);
  }, /pHYs payload or placement mismatch/],
  ["missing sRGB", (chunks) => rebuildDatedRadarAtlas(chunks.filter((chunk) => chunk.type !== "sRGB")), /pHYs payload or placement mismatch/],
  ["missing pHYs", (chunks) => rebuildDatedRadarAtlas(chunks.filter((chunk) => chunk.type !== "pHYs")), /requires its exact sRGB and pHYs chunks/],
  ["missing both ancillary chunks", (chunks) => rebuildDatedRadarAtlas(chunks.filter((chunk) => chunk.type !== "sRGB" && chunk.type !== "pHYs")), /requires its exact sRGB and pHYs chunks/],
  ["duplicate sRGB", (chunks) => rebuildDatedRadarAtlas([...chunks.slice(0, 2), chunks[1], ...chunks.slice(2)]), /sRGB payload or placement mismatch/],
  ["duplicate pHYs", (chunks) => rebuildDatedRadarAtlas([...chunks.slice(0, 3), chunks[2], ...chunks.slice(3)]), /pHYs payload or placement mismatch/],
  ["reordered ancillary chunks", (chunks) => rebuildDatedRadarAtlas([chunks[0], chunks[2], chunks[1], ...chunks.slice(3)]), /pHYs payload or placement mismatch/],
  ["sRGB after image data", (chunks) => rebuildDatedRadarAtlas([chunks[0], ...chunks.slice(3, 4), chunks[1], chunks[2], ...chunks.slice(4)]), /sRGB payload or placement mismatch/],
  ["pHYs after image data", (chunks) => rebuildDatedRadarAtlas([chunks[0], chunks[1], chunks[3], chunks[2], ...chunks.slice(4)]), /pHYs payload or placement mismatch/],
  ["missing IEND", (chunks) => rebuildDatedRadarAtlas(chunks.slice(0, -1)), /Incomplete PNG structure/],
  ["missing IDAT", (chunks) => rebuildDatedRadarAtlas(chunks.filter((chunk) => chunk.type !== "IDAT")), /Invalid PNG IEND placement/],
  ["truncated chunk", (chunks) => rebuildDatedRadarAtlas(chunks).subarray(0, datedRadarAtlasBytes.length - 1), /Truncated PNG chunk/],
  ["trailing bytes", (chunks) => Buffer.concat([rebuildDatedRadarAtlas(chunks), Buffer.from("tail")]), /Invalid PNG IEND placement/],
  ["validly checksummed changed image payload", (chunks) => {
    chunks[3].payload[10] ^= 1;
    chunks[3].bytes = fixturePngChunk("IDAT", chunks[3].payload);
    return rebuildDatedRadarAtlas(chunks);
  }, /source identity mismatch/],
  ["different byte count", (chunks) => rebuildDatedRadarAtlas([...chunks.slice(0, 3), ...chunks.slice(4)]), /source identity mismatch/],
];
for (const [name, mutate, message] of malformedAtlasCases) {
  test(`dated atlas PNG structure and CRC validation precede source identity: ${name}`, async () => {
    await withDatedRadarAtlasFixture(async ({ write, verify }) => {
      await write(datedRadarAtlasPath, mutate(datedRadarAtlasChunks()));
      failed(verify(), message);
    });
  });
}

for (const type of ["tEXt", "iTXt", "zTXt", "eXIf", "gAMA", "iCCP"]) {
  test(`exact dated atlas still rejects unapproved ${type} metadata`, async () => {
    const chunks = datedRadarAtlasChunks();
    const extra = { bytes: fixturePngChunk(type, Buffer.from("not-approved")) };
    await withDatedRadarAtlasFixture(async ({ verify }) => {
      failed(verify(), new RegExp(`PNG metadata or unsupported ancillary chunk ${type}`));
    }, { bytes: rebuildDatedRadarAtlas([...chunks.slice(0, 3), extra, ...chunks.slice(3)]) });
  });
}

for (const type of ["sRGB", "pHYs"]) {
  test(`ordinary PNG still rejects ${type} even without other ancillary chunks`, async () => {
    const chunks = datedRadarAtlasChunks().filter((chunk) => chunk.type !== "sRGB" && chunk.type !== "pHYs" || chunk.type === type);
    await withDatedRadarAtlasFixture(async ({ verify }) => {
      failed(verify(), new RegExp(`PNG metadata or unsupported ancillary chunk ${type}`));
    }, { path: "public/media/ordinary.png", bytes: rebuildDatedRadarAtlas(chunks) });
  });
}

const dashboardPaths = [
  "public/dashboard/explore/index.html",
  "public/dashboard/explore/snapshot.591dd3b8ea5ef905b3d90fb0bbc1b5610054629024ccb4837957aadd0a711ea3.json",
  "public/dashboard/explore/data-app-build.json",
];
const dashboardBytes = new Map(await Promise.all(dashboardPaths.map(async path => [path, await readFile(resolve(sourceRoot, path))])));
async function withDashboardFixture(run) {
  await withFixture(async fixture => {
    for (const path of dashboardPaths) {
      fixture.manifest.files.push(path);
      await fixture.write(path, dashboardBytes.get(path));
    }
    await fixture.write(manifestPath, JSON.stringify(fixture.manifest) + "\n");
    await run(fixture);
  });
}
test("exact reviewed dashboard remains privacy-scanned with only non-secret CSS identifier redaction", async () => {
  await withDashboardFixture(async ({ verify }) => { assert.equal(passed(verify()).files, 7); });
});
for (const missing of dashboardPaths) {
  test(`reviewed dashboard scope cannot omit ${missing.split("/").at(-1)}`, async () => {
    await withFixture(async ({ manifest, write, verify }) => {
      for (const path of dashboardPaths.filter(path => path !== missing)) {
        manifest.files.push(path); await write(path, dashboardBytes.get(path));
      }
      await write(manifestPath, JSON.stringify(manifest) + "\n");
      failed(verify(), /exact HTML, snapshot and build-manifest tuple/);
    });
  });
}
for (const path of dashboardPaths) {
  test(`reviewed dashboard rejects even a harmless byte change to ${path.split("/").at(-1)}`, async () => {
    await withDashboardFixture(async ({ write, verify }) => {
      await write(path, Buffer.concat([dashboardBytes.get(path), Buffer.from("\n")]));
      failed(verify(), /Reviewed dashboard identity mismatch/);
    });
  });
}
test("renaming compiled HTML does not inherit the reviewed runtime identifier exception", async () => {
  await withFixture(async ({ manifest, write, verify }) => {
    const path = "public/other-dashboard.html";
    manifest.files.push(path); await write(path, dashboardBytes.get(dashboardPaths[0]));
    await write(manifestPath, JSON.stringify(manifest) + "\n");
    failed(verify(), /token-like secret found/);
  });
});
test("appending an actual token to reviewed HTML fails immutable identity before any redaction", async () => {
  await withDashboardFixture(async ({ write, verify }) => {
    const token = ["sk", "X".repeat(30)].join("-");
    await write(dashboardPaths[0], Buffer.concat([dashboardBytes.get(dashboardPaths[0]), Buffer.from(token)]));
    failed(verify(), /Reviewed dashboard identity mismatch/);
  });
});
test("authored JSX gets ordinary UTF-8 and secret scanning, not generated-runtime exemptions", async () => {
  await withFixture(async ({ manifest, write, verify }) => {
    const path = "public/authored.jsx";
    manifest.files.push(path); await write(manifestPath, JSON.stringify(manifest) + "\n");
    await write(path, "export const caption = 'Selected work';\n"); passed(verify());
    await write(path, ["sk", "X".repeat(30)].join("-")); failed(verify(), /token-like secret found/);
    await write(path, Buffer.from([0xff, 0xfe])); failed(verify(), /Byte-order mark/);
  });
});

test("bounded email enumeration preserves original global matches and their exact offsets", () => {
  const verifierText = verifierBytes.toString("utf8");
  const start = verifierText.indexOf("function* findEmailMatches(text) {");
  const end = verifierText.indexOf("const utf8Decoder =", start);
  assert.ok(start >= 0 && end > start, "Test the exact scanner helper, not a duplicated implementation.");
  const findEmailMatches = runInNewContext(`(${verifierText.slice(start, end).trim()})`);
  const address = (local, domain) => [local, domain].join("@");
  const owner = address("206760088+drwbkr1", "users.noreply.github.com");
  const allowed = address("test", "example.com");
  const unexpected = address("1bar", "private.example");
  const samples = [
    "", "No address", "a".repeat(2000), owner, owner.toUpperCase(), allowed, allowed.toUpperCase(),
    `prefix-${owner}`, `(${owner})`, `mailto:${owner}?subject=portfolio`,
    `${owner}123`, `${owner}${unexpected}`, `${owner}@private.example`, `${allowed}${unexpected}`,
    `${owner}; ${unexpected}`, `${owner}\n${unexpected}`, `${owner}\u2014${unexpected}`,
    address("a.b+tag_%-", "Mixed.Example.COM"), address(".a", "b.co9"),
    address("a", "b.co.x1"), address("a", "b..co"), address("a", "b.-c"),
    address("", "b.co"), address("a", ""), address("a", "b.c"),
    address("Ka", "b.co"), address("ſa", "b.co"),
    `${address("a", "b.co")}@${address("c", "d.example")}`,
  ];
  // Deterministic bounded punctuation/token corpus, including multiple @ signs.
  const alphabet = "AaZz09._%+-@:/() []!";
  let seed = 34073;
  for (let row = 0; row < 512; row += 1) {
    let sample = "";
    for (let column = 0; column < 120; column += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      sample += alphabet[seed % alphabet.length];
    }
    samples.push(sample);
  }
  const project = matches => Array.from(matches, match => ({ value: match[0], index: match.index }));
  for (const sample of samples) {
    assert.deepEqual(project(findEmailMatches(sample)),
      project(sample.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)), sample);
  }
  assert.deepEqual(project(findEmailMatches(`${owner}${unexpected}`)), [
    { value: owner, index: 0 }, { value: unexpected, index: owner.length },
  ], "A simple negative-lookbehind would incorrectly hide the second address.");
});

test("ordinary privacy scanning accepts a 600k benign encoded token within the unchanged timeout", async () => {
  await withFixture(async ({ write, verify }) => {
    await write("public/media/example.txt", `${"r".repeat(600_000)}\n`);
    const start = performance.now();
    assert.equal(passed(verify()).files, 4);
    assert.ok(performance.now() - start < 15_000);
  });
});

test("ordinary privacy scanning rejects giant and allowed-email suffix addresses within the unchanged timeout", async () => {
  await withFixture(async ({ write, verify }) => {
    const domain = "private.example";
    await write("public/media/example.txt", ["r".repeat(600_000), domain].join("@"));
    const start = performance.now();
    failed(verify(), /Unexpected email address/);
    assert.ok(performance.now() - start < 15_000);
    const owner = ["206760088+drwbkr1", "users.noreply.github.com"].join("@");
    const suffix = ["1bar", domain].join("@");
    const allowed = ["test", "example.com"].join("@");
    await write("public/media/example.txt", allowed);
    passed(verify());
    await write("public/media/example.txt", `${allowed}${suffix}`);
    failed(verify(), /Unexpected email address[^\n]*1bar/);
    // The GitHub author address is not in the scanner's existing email
    // allowlist. Preserve that refusal; do not expand it for this fixture.
    await write("public/media/example.txt", `${owner}${suffix}`);
    failed(verify(), /Unexpected email address[^\n]*206760088/);
  });
});
