import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

async function inspectAsset(publicPath) {
  const bytes = await readFile(resolve(root, "public", publicPath.replace(/^\//, "")));
  return {
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

const verified = [];
for (const removedPath of [
  "public/media/projects/burnlens/manifest.json",
  "public/media/projects/burnlens/LICENSE.txt",
  "public/media/projects/burnlens/baseline-evaluation.png",
  "public/media/projects/burnlens/model-decision.png",
  "public/media/projects/burnlens/ward-creek-overlay.png",
]) {
  try {
    await access(resolve(root, removedPath));
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  throw new Error(`Removed BurnLens governed-media path still exists: ${removedPath}`);
}

const runbook = await readJson("public/media/projects/runbook-sentinel/sources.json");
if (runbook.source_commit !== "f149ac2408f30b504b78844780b8533bed2ebfdc" || runbook.release_tag !== "v0.0.20") {
  throw new Error("Runbook Sentinel source identity drifted from the approved release.");
}
if (/"[A-Za-z]:[\\/]/.test(JSON.stringify(runbook))) {
  throw new Error("Runbook Sentinel public provenance must not disclose a local absolute path.");
}
for (const entry of runbook.assets) {
  const actual = await inspectAsset(entry.path);
  if (actual.sha256 !== entry.sha256) {
    throw new Error(`Runbook Sentinel media hash mismatch: ${entry.path}`);
  }
  if (actual.bytes !== entry.bytes) {
    throw new Error(`Runbook Sentinel media byte-count mismatch: ${entry.path}`);
  }
  if (!entry.reuse_basis?.includes("Owner-directed reuse")) {
    throw new Error(`Runbook Sentinel media reuse basis missing: ${entry.path}`);
  }
  if (entry.status !== "approved_for_public_personal_portfolio") {
    throw new Error(`Runbook Sentinel public-display status is invalid: ${entry.path}`);
  }
  verified.push({ project: "Runbook Sentinel", path: entry.path, ...actual });
}

for (const source of runbook.evidence_sources ?? []) {
  if (!/^[a-f0-9]{64}$/.test(source.sha256) || !Number.isInteger(source.bytes) || source.bytes <= 0) {
    throw new Error(`Runbook Sentinel evidence identity is invalid: ${source.source_path}`);
  }
  if (!source.source_path?.startsWith("artifacts/")) {
    throw new Error(`Runbook Sentinel evidence path is not repository-relative: ${source.source_path}`);
  }
}

const questCraft = await readJson("public/media/projects/quest-craft/sources.json");
if (
  questCraft.source_boundary?.review_snapshot_commit !==
    "bc14c43840aabb11ca35e94df0c8682672f24f3c" ||
  questCraft.source_boundary?.review_snapshot_tree !==
    "01d7e8a0051d4b226e8e0232b5e4ab8f87105964"
) {
  throw new Error("Quest Craft reviewer-snapshot identity drifted from the approved gate.");
}
if (/[A-Za-z]:[\\/]/.test(JSON.stringify(questCraft))) {
  throw new Error("Quest Craft public provenance must not disclose a local absolute path.");
}
for (const entry of questCraft.assets ?? []) {
  const actual = await inspectAsset(entry.path);
  if (actual.sha256 !== entry.sha256) {
    throw new Error(`Quest Craft media hash mismatch: ${entry.path}`);
  }
  if (actual.bytes !== entry.bytes) {
    throw new Error(`Quest Craft media byte-count mismatch: ${entry.path}`);
  }
  if (!entry.reuse_basis?.includes("Owner-directed original portfolio asset")) {
    throw new Error(`Quest Craft media reuse basis missing: ${entry.path}`);
  }
  if (entry.status !== "approved_for_public_personal_portfolio") {
    throw new Error(`Quest Craft public-display status is invalid: ${entry.path}`);
  }
  if (entry.width !== 1200 || entry.height !== 630) {
    throw new Error(`Quest Craft social-preview dimensions are invalid: ${entry.path}`);
  }
  verified.push({ project: "Quest Craft", path: entry.path, ...actual });
}

const openClaw = await readJson("public/media/projects/openclaw-showcase/sources.json");
if (
  openClaw.source_boundary?.public_snapshot_commit !==
    "3695666f6a44c095674049e64d23f0bdace2fb70" ||
  openClaw.source_boundary?.public_snapshot_tree !==
    "f7629e844aa1e93be622a0b7a9307afd7b3beab5"
) {
  throw new Error("OpenClaw Showcase public-snapshot identity drifted from the approved gate.");
}
if (/[A-Za-z]:[\\/]/.test(JSON.stringify(openClaw))) {
  throw new Error("OpenClaw Showcase public provenance must not disclose a local absolute path.");
}
if ((openClaw.assets ?? []).length !== 0) {
  throw new Error("OpenClaw Showcase must not copy source-project or private-derived media.");
}
if (
  openClaw.code_native_surfaces?.[0]?.implementation !==
  "app/work/openclaw-showcase/opengraph-image.tsx"
) {
  throw new Error("OpenClaw Showcase code-native social surface is not manifested.");
}

const fontLicenses = await readJson("public/media/licenses/manifest.json");
if (fontLicenses.source !== "Exact license files bundled with the locked Fontsource packages") {
  throw new Error("Font license notices are not bound to the locked package source.");
}
for (const entry of fontLicenses.entries ?? []) {
  const actual = await inspectAsset(entry.path);
  if (entry.license !== "OFL-1.1") {
    throw new Error(`Unexpected font license: ${entry.package}`);
  }
  if (actual.sha256 !== entry.sha256 || actual.bytes !== entry.bytes) {
    throw new Error(`Font license notice mismatch: ${entry.path}`);
  }
  verified.push({ project: entry.package, path: entry.path, ...actual });
}

console.log(JSON.stringify({
  status: "pass",
  burnlens_governed_assets: 0,
  verified_assets: verified,
}, null, 2));
