import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
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
// NFA106 counts and audits the actual migrated suite below, not historical byte prefixes.
const releaseVerifier = await read("scripts/verify-release-candidate.mjs");

// NFA-073 supersedes the warm presentation bytes, not the scientific display
// record or release authority. Validate the reviewed semantic foundation and
// print roles explicitly so bounded rendered repairs do not erase this gate.
assert.match(rootOg, /flexDirection: "column"[\s\S]*?<div style=\{\{ display: "flex" \}\}>Data and complex ideas,<\/div>\s*<div style=\{\{ display: "flex" \}\}>made usable\.<\/div>/);
assert.doesNotMatch(rootOg, /<br\s*\/?\s*>/);

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
assert.equal(manifest.files.length, 128,
  "NFA109 retains112 predecessor paths and exactly16 declared native component/screenshot additions.");
const predecessorPublicPaths = [
  ".env.example",
  ".gitattributes",
  ".gitignore",
  "README.md",
  "app/api/contact/route.ts",
  "app/globals.css",
  "app/home.module.css",
  "app/icon.svg",
  "app/layout.tsx",
  "app/manifest.ts",
  "app/not-found.tsx",
  "app/opengraph-image.tsx",
  "app/page.tsx",
  "app/resume/page.tsx",
  "app/resume/print-button.tsx",
  "app/resume/resume.module.css",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/work/after-the-tip/lead-figures.ts",
  "app/work/after-the-tip/listening-comparison.tsx",
  "app/work/after-the-tip/page.module.css",
  "app/work/after-the-tip/page.tsx",
  "app/work/after-the-tip/ribbon-figure.tsx",
  "app/work/burnlens/page.module.css",
  "app/work/burnlens/page.tsx",
  "app/work/nepal-satellite-atlas/page.module.css",
  "app/work/nepal-satellite-atlas/page.tsx",
  "app/work/openclaw-showcase/opengraph-image.tsx",
  "app/work/openclaw-showcase/page.module.css",
  "app/work/openclaw-showcase/page.tsx",
  "app/work/page.tsx",
  "app/work/quest-craft/page.module.css",
  "app/work/quest-craft/page.tsx",
  "app/work/runbook-sentinel/opengraph-image.tsx",
  "app/work/runbook-sentinel/page.module.css",
  "app/work/runbook-sentinel/page.tsx",
  "app/work/west-hawaii-heat-exposure/exposure-data.ts",
  "app/work/west-hawaii-heat-exposure/page.module.css",
  "app/work/west-hawaii-heat-exposure/page.tsx",
  "app/work/wildfire-response/page.module.css",
  "app/work/wildfire-response/page.tsx",
  "app/work/work-index.module.css",
  "components/CaseChapterDisclosure.tsx",
  "components/chrome/SiteFooter.tsx",
  "components/chrome/SiteHeader.tsx",
  "components/editorial/EvidenceLink.tsx",
  "components/editorial/ProjectFactLedger.tsx",
  "content/project-model.ts",
  "content/projects.ts",
  "eslint.config.mjs",
  "lib/site-origin.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "postcss.config.mjs",
  "public/media/licenses/manifest.json",
  "public/media/licenses/manrope-OFL-1.1.txt",
  "public/media/licenses/newsreader-OFL-1.1.txt",
  "public/media/projects/after-the-tip/lead-voices-all-40x.wav",
  "public/media/projects/after-the-tip/lead-voices-purdue-40x.wav",
  "public/media/projects/after-the-tip/sources.json",
  "public/media/projects/nepal-satellite-atlas/dated-radar-atlas.png",
  "public/media/projects/nepal-satellite-atlas/sources.json",
  "public/media/projects/openclaw-showcase/sources.json",
  "public/media/projects/quest-craft/social-preview.jpg",
  "public/media/projects/quest-craft/sources.json",
  "public/media/projects/runbook-sentinel/dashboard-baseline-0020.png",
  "public/media/projects/runbook-sentinel/sources.json",
  "public/media/projects/west-hawaii-heat-exposure/heat-exposure-2015.svg",
  "public/media/projects/west-hawaii-heat-exposure/heat-exposure-2019.svg",
  "public/media/projects/west-hawaii-heat-exposure/sources.json",
  "public/media/projects/wildfire-response/planning-v027.jpg",
  "public/media/projects/wildfire-response/saved-plan-v024.jpg",
  "public/media/projects/wildfire-response/sources.json",
  "scripts/clean-generated-next-env.mjs",
  "scripts/public-candidate-allowlist.json",
  "scripts/test-public-candidate.mjs",
  "scripts/verify-burnlens-u02.mjs",
  "scripts/verify-front-door-u04.mjs",
  "scripts/verify-integrated-u08.mjs",
  "scripts/verify-media-manifests.mjs",
  "scripts/verify-openclaw-u06.mjs",
  "scripts/verify-project-model.mjs",
  "scripts/verify-public-candidate.mjs",
  "scripts/verify-quest-u05.mjs",
  "scripts/verify-release-candidate.mjs",
  "scripts/verify-resume-u07.mjs",
  "scripts/verify-runbook-u03.mjs",
  "scripts/verify-site-origin.mjs",
  "tests/after-the-tip.spec.ts",
  "tests/homepage-contributions.spec.ts",
  "tests/nepal-satellite-atlas.spec.ts",
  "tests/portfolio.spec.ts",
  "tests/project-model.typecheck.ts",
  "tests/west-hawaii-heat-exposure.spec.ts",
  "tests/wildfire-response.spec.ts",
  "tsconfig.json"
];
const nfa073PublicAdditions = [
  "app/dashboard/dashboard.module.css",
  "app/dashboard/page.tsx",
  "components/ProjectCarousel.module.css",
  "components/ProjectCarousel.tsx",
  "content/dashboard-artifact/DashboardContent.jsx",
  "content/dashboard-artifact/README.md",
  "content/dashboard-artifact/data.json",
  "content/dashboard-artifact/portfolio.css",
  "content/dashboard-artifact/theme.css",
  "public/dashboard/explore/data-app-build.json",
  "public/dashboard/explore/index.html",
  "public/dashboard/explore/snapshot.591dd3b8ea5ef905b3d90fb0bbc1b5610054629024ccb4837957aadd0a711ea3.json",
  "scripts/build-portfolio-dashboard.mjs",
  "tests/polar-night.spec.ts"
];
const nativeHomepageAdditions = [
  "components/home/PersonalFieldAtlas.tsx",
  "components/home/ProjectImageReveal.tsx",
  "components/home/projects.ts",
  "components/home/homepage.module.css",
  "public/media/projects/homepage-reveal/after-the-tip-expanded-mobile.webp",
  "public/media/projects/homepage-reveal/after-the-tip-expanded.webp",
  "public/media/projects/homepage-reveal/after-the-tip-thumbnail.webp",
  "public/media/projects/homepage-reveal/nepal-expanded-mobile.webp",
  "public/media/projects/homepage-reveal/nepal-expanded.webp",
  "public/media/projects/homepage-reveal/nepal-thumbnail.webp",
  "public/media/projects/homepage-reveal/runbook-interface-expanded-mobile-v2.webp",
  "public/media/projects/homepage-reveal/runbook-interface-expanded-v2.webp",
  "public/media/projects/homepage-reveal/runbook-interface-thumbnail-v2.webp",
  "public/media/projects/homepage-reveal/west-hawaii-expanded-mobile.webp",
  "public/media/projects/homepage-reveal/west-hawaii-expanded.webp",
  "public/media/projects/homepage-reveal/west-hawaii-thumbnail.webp"
];
assert.equal(nativeHomepageAdditions.length, 16);
assert.equal(predecessorPublicPaths.length, 98);
assert.equal(nfa073PublicAdditions.length, 14);
assert.equal(new Set(manifest.files).size, manifest.files.length, "Duplicate candidate path");
assert.deepEqual([...manifest.files].sort(), [...predecessorPublicPaths, ...nfa073PublicAdditions, ...nativeHomepageAdditions].sort(),
  "The public roster must retain every predecessor path and only the exact16 native-homepage additions, including the three reviewed Hawaiʻi frames.");

const componentFiles = await listFiles("components");
assert.deepEqual(componentFiles, [
  "components/CaseChapterDisclosure.tsx",
  "components/ProjectCarousel.module.css",
  "components/ProjectCarousel.tsx",
  "components/chrome/SiteFooter.tsx",
  "components/chrome/SiteHeader.tsx",
  "components/editorial/EvidenceLink.tsx",
  "components/editorial/ProjectFactLedger.tsx",
  "components/home/PersonalFieldAtlas.tsx",
  "components/home/ProjectImageReveal.tsx",
  "components/home/homepage.module.css",
  "components/home/projects.ts",
]);
const appFiles = await listFiles("app");
const modulePaths = [...appFiles, ...componentFiles].filter((path) => /\.(?:tsx?|css)$/.test(path));
const knownModules = new Set(modulePaths);
const moduleSources = new Map(await Promise.all(modulePaths.map(async (path) => [path, await read(path)])));
function importedModule(importer, specifier) {
  let base;
  if (specifier.startsWith("@/")) base = specifier.slice(2);
  else if (specifier.startsWith(".")) {
    base = relative(root, resolve(root, dirname(importer), specifier)).replaceAll("\\", "/");
  } else return null;
  return [base, `${base}.tsx`, `${base}.ts`, `${base}.css`, `${base}/index.tsx`, `${base}/index.ts`]
    .find((path) => knownModules.has(path)) ?? null;
}
const reachableModules = new Set();
const pendingModules = appFiles.filter((path) => /\.tsx?$/.test(path));
while (pendingModules.length) {
  const path = pendingModules.pop();
  if (reachableModules.has(path)) continue;
  reachableModules.add(path);
  const source = moduleSources.get(path);
  for (const [, specifier] of source.matchAll(/(?:\bfrom\s*|\bimport\s*)["']([^"']+)["']/g)) {
    const imported = importedModule(path, specifier);
    if (imported && !reachableModules.has(imported)) pendingModules.push(imported);
  }
}
// Only the two exact retained predecessor modules may be unreachable.
// They are preserved history in this test-only migration, not active homepage code.
const retainedUnusedPredecessor = new Map([
  ["components/ProjectCarousel.tsx","7cc7805020ea5895f4f035ba3b0e1501fe8ab652c2c75c4515ebc7a500b472a7"],
  ["components/ProjectCarousel.module.css","7490ee2cf5f746b8f9c4361f1b5614fc0f3339e5a0edbcf2905e2e9176a3a0c4"],
]);
for (const componentPath of componentFiles) {
  assert.ok(manifest.files.includes(componentPath), "Component/module missing from public roster: " + componentPath);
  if (retainedUnusedPredecessor.has(componentPath)) {
    assert.equal(sha256(moduleSources.get(componentPath)), retainedUnusedPredecessor.get(componentPath),
      "Retained unused predecessor bytes changed: " + componentPath);
    assert.ok(!reachableModules.has(componentPath), "Legacy carousel must not be active in the selected application.");
  } else {
    assert.ok(reachableModules.has(componentPath), "Unreachable public component/module: " + componentPath);
  }
}
for (const [path, source] of moduleSources) {
  if (retainedUnusedPredecessor.has(path)) continue;
  assert.doesNotMatch(source, /from\s*["'][^"']*ProjectCarousel(?:\.module\.css)?["']/,
    "Active source may not import the retained predecessor carousel: " + path);
}
assert.ok(moduleSources.get("components/home/PersonalFieldAtlas.tsx").includes('"./homepage.module.css"'));
assert.ok(moduleSources.get("components/home/ProjectImageReveal.tsx").includes('"./homepage.module.css"'));
const nativeCssPath = "components/home/homepage.module.css";
const nativeHome = moduleSources.get("components/home/PersonalFieldAtlas.tsx");
const nativeReveal = moduleSources.get("components/home/ProjectImageReveal.tsx");

const cssFiles = [...await listFiles("app", ".css"), ...await listFiles("components", ".css")].sort();
const cssSources = new Map(await Promise.all(cssFiles.map(async (path) => [path, await read(path)])));
const rootBlocks = [...globals.matchAll(/:root\s*\{([^{}]*)\}/g)];
assert.equal(rootBlocks.length, 2, "Only the reviewed screen foundation and light print root are permitted.");
const rootBlock = rootBlocks[0][1];
const printRootBlock = rootBlocks[1][1];
assert.match(globals.slice(0, rootBlocks[1].index), /@media print\s*\{\s*$/,
  "The second root token block must belong to the exact print scope.");
const legacyFoundation = new Map([
  ["olive", "#757f64"], ["terracotta", "#cb7a5c"], ["sand", "#e9e2d8"],
  ["sage", "#c7cdbf"], ["teal", "#5c757a"], ["charcoal", "#222222"],
  ["gray", "#5f5f5f"], ["white", "#ffffff"], ["paper", "#f7f3ed"],
  ["ink-soft", "#454843"], ["terracotta-dark", "#7a3828"],
  ["olive-dark", "#48513f"], ["teal-dark", "#314e54"],
  ["rule", "rgba(34, 34, 34, 0.18)"], ["shadow", "0.5rem 0.5rem 0 rgba(34, 34, 34, 0.16)"],
  ["sans", '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif'],
  ["serif", '"Newsreader Variable", Newsreader, Iowan Old Style, Georgia, serif'],
  ["mono", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"], ["max", "90rem"],
]);
const presentationRoles = new Map([
  ["color-page", "#12232f"], ["color-panel", "#19313f"], ["color-panel-alt", "#264957"],
  ["color-deep", "#0b1821"], ["color-ink", "#f0f9fc"], ["color-soft", "#bdd3df"],
  ["color-accent", "#a7e0f1"], ["color-rule", "#4b7182"], ["color-rule-strong", "#78a9bd"],
  ["color-focus", "#a7e0f1"], ["color-button", "#a7e0f1"], ["color-button-ink", "#12232f"],
  ["color-caution", "#f0c8ab"], ["color-caution-panel", "#493a34"],
  ["color-plot-surface", "#e9e2d8"], ["color-plot-ink", "#222222"],
]);
const printRoles = new Map([
  ["color-page", "#ffffff"], ["color-panel", "#ffffff"], ["color-panel-alt", "#f7f3ed"],
  ["color-deep", "#ffffff"], ["color-ink", "#222222"], ["color-soft", "#454843"],
  ["color-accent", "#314e54"], ["color-rule", "rgba(34, 34, 34, 0.18)"],
  ["color-rule-strong", "#222222"], ["color-focus", "#7a3828"],
  ["color-button", "#314e54"], ["color-button-ink", "#ffffff"],
  ["color-caution", "#7a3828"], ["color-caution-panel", "#f7f3ed"],
]);
function exactDefinitions(block, expected, description) {
  const entries = [...block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]);
  assert.equal(new Set(entries.map(([name]) => name)).size, entries.length, `${description}: duplicate token`);
  assert.deepEqual([...entries].sort(([first], [second]) => first.localeCompare(second)),
    [...expected].sort(([first], [second]) => first.localeCompare(second)), `${description}: token/value drift`);
}
exactDefinitions(rootBlock, new Map([...legacyFoundation, ...presentationRoles]), "Screen foundation");
exactDefinitions(printRootBlock, printRoles, "Light print foundation");
assert.match(rootBlock, /color-scheme:\s*dark;/);
assert.match(printRootBlock, /color-scheme:\s*light;/);
for (const [block, colorScheme] of [[rootBlock, "dark"], [printRootBlock, "light"]]) {
  const remaining = block.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[\w-]+\s*:[^;]+;/g, "").trim();
  assert.equal(remaining, `color-scheme: ${colorScheme};`, "Unexpected declaration in reviewed root scope.");
}
const foundationNames = new Set([...legacyFoundation.keys(), ...presentationRoles.keys()]);
for (const background of ["color-page", "color-panel", "color-panel-alt", "color-deep", "color-caution-panel"]) {
  for (const foreground of ["color-ink", "color-soft", "color-accent", "color-caution"]) {
    assert.ok(contrast(presentationRoles.get(foreground), presentationRoles.get(background)) >= 4.5,
      `Semantic text contrast failed: --${foreground} on --${background}`);
  }
}

const folioAliases = new Map([
  ["folio-canvas", "color-page"], ["folio-sheet", "color-panel"], ["folio-ink", "color-ink"],
  ["folio-copy", "color-soft"], ["folio-muted", "color-soft"], ["folio-rule", "color-rule"],
  ["folio-edge", "color-rule"], ["folio-reference", "color-accent"], ["folio-process", "color-accent"],
  ["folio-attention", "color-caution"], ["folio-public", "color-panel-alt"],
  ["folio-gated", "color-caution-panel"], ["folio-private", "color-deep"],
]);
const printFolioAliases = new Map([
  ["folio-canvas", "sand"], ["folio-sheet", "paper"], ["folio-ink", "charcoal"],
  ["folio-copy", "ink-soft"], ["folio-muted", "gray"], ["folio-rule", "rule"],
  ["folio-edge", "charcoal"], ["folio-reference", "olive-dark"], ["folio-process", "teal-dark"],
  ["folio-attention", "terracotta-dark"], ["folio-public", "sage"],
  ["folio-gated", "terracotta"], ["folio-private", "charcoal"],
]);
const localDefinedNames = new Map();
for (const [path, source] of cssSources) {
  const definitions = [...source.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)];
  const localNames = new Set();
  for (const [, name, value] of definitions) {
    if (path === "app/globals.css" && foundationNames.has(name)) continue;
    if (path === nativeCssPath) {
      const nativeTokens = new Map([["pfr-night","#193342"],["pfr-ink","#163443"],["pfr-frost","#f0f6f5"],["pfr-muted","#bfd0d8"]]);
      assert.ok(nativeTokens.has(name), "Unreviewed native token: --" + name);
      assert.equal(value.trim(), nativeTokens.get(name), "Native presentation token drifted: --" + name);
      localNames.add(name);
      continue;
    }
    assert.equal(path, "app/work/openclaw-showcase/page.module.css", "Route-local token in " + path + ": --" + name);
    assert.ok([folioAliases.get(name), printFolioAliases.get(name)].some((alias) => value.trim() === "var(--" + alias + ")"),
      "OpenClaw alias drifted: --" + name);
    localNames.add(name);
  }
  if (path === nativeCssPath) {
    assert.deepEqual([...localNames].sort(), ["pfr-frost","pfr-ink","pfr-muted","pfr-night"]);
    assert.ok(nativeReveal.includes('"--pfr-image-surface": imageSurface'), "Native image surface must remain typed source data.");
    localNames.add("pfr-image-surface");
  }
  localDefinedNames.set(path, localNames);
  if (path === "app/work/openclaw-showcase/page.module.css") {
    const folioBlocks = [...source.matchAll(/\.page\s*\{([^{}]*)\}/g)].filter(([, body]) => /--folio-/.test(body));
    assert.equal(folioBlocks.length, 2, "Only reviewed OpenClaw screen and print alias blocks are allowed.");
    exactDefinitions(folioBlocks[0][1], new Map([...folioAliases].map(([name, alias]) => [name, `var(--${alias})`])), "OpenClaw screen aliases");
    exactDefinitions(folioBlocks[1][1], new Map([...printFolioAliases].map(([name, alias]) => [name, `var(--${alias})`])), "OpenClaw print aliases");
  }
  let withoutFoundation = path === "app/globals.css" ? rootBlocks.reduce((remaining, [block]) => remaining.replace(block, ""), source) : source;
  // Preserve the exact reviewed missing-data hatch from NFA-068. This is not a
  // route-wide palette exception: any source-byte or rule drift fails closed.
  if (path === "app/work/west-hawaii-heat-exposure/page.module.css") {
    assert.equal(sha256(source), "d3a579420d1e9a8611848e6b616b30f82d80c55fbbdc0e1b89948d525cf7b56c",
      "The preserved reef-case stylesheet must remain byte-exact.");
    const reviewedHatch = ".unknown { background-image: repeating-linear-gradient(135deg, transparent 0px, transparent 4px, #666666 4px, #666666 5px); }";
    assert.equal(source.split(reviewedHatch).length - 1, 1,
      "Exactly the reviewed missing-data hatch is allowed.");
    withoutFoundation = source.replace(reviewedHatch, "");
  }
  if (path === nativeCssPath) {
    // Scoped, reviewed design/crop exceptions apply ONLY to the selected preview component.
    // Full scientific/case media elsewhere keep the unchanged no-crop/no-literal policy.
    const allowedNativeColors = new Set(["#193342","#163443","#f0f6f5","#bfd0d8","#9eb6c1","#294653","#ffffff"]);
    const actualColors = [...new Set([...source.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(([hex]) =>
      hex.length === 4 ? "#" + [...hex.slice(1)].map(c => c + c).join("") : hex.toLowerCase()))].sort();
    assert.deepEqual(actualColors, [...allowedNativeColors].sort(), "Only the reviewed native palette is permitted.");
    withoutFoundation = source.replace(/#[0-9a-f]{3,8}\b/gi, "reviewed-native-color");
    const clipValues = [...source.matchAll(/\bclip-path\s*:\s*([^;]+);/gi)].map(([,value]) => value.trim());
    assert.deepEqual(clipValues, ["inset(50%)"],
      "Only screen-reader hiding is permitted; physical frame expansion replaces the reveal wipe.");
    assert.doesNotMatch(source, /\bmask(?:-image)?\s*:/i, "No masking exception is granted.");
    assert.equal((source.match(/\bobject-fit\s*:\s*cover\b/gi) ?? []).length, 1,
      "Only one reviewed thumbnail detail crop may use cover.");
    assert.match(source, /\.pfrThumbnail\s*\{[^}]*object-fit:cover/);
    assert.match(source, /\.pfrFullImage\s+img\s*\{[^}]*object-fit:contain;/,
      "Expanded source evidence must remain proportional and fully contained.");
    assert.match(source, /\.pfrMediaFrame\s*\{[^}]*transition:top 650ms[^}]*width 650ms[^}]*height 650ms/,
      "One persistent frame must interpolate its real geometry in both directions.");
    assert.ok(nativeReveal.includes('data-project-image-frame aria-hidden="true"') && nativeReveal.includes("data-project-image-semantic"),
      "Decorative motion and the qualified native accessible image must remain separate.");
    const cleanCss = source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, selector] of cleanCss.matchAll(/(?:^|})\s*([^{}]+)\{[^{}]*\}/g)) {
      assert.ok(selector.trim().startsWith(".pfr") || /^(?:from|to)$/.test(selector.trim()) || selector.trim().startsWith("@"),
        "Native styles may not escape their local component scope: " + selector);
    }
    for (const [foreground,background] of [["#163443","#9eb6c1"],["#294653","#9eb6c1"],["#f0f6f5","#193342"],["#bfd0d8","#193342"],["#f0f6f5","#163443"]]) {
      assert.ok(contrast(foreground,background) >= 4.5, "Native role contrast fails: " + foreground + " / " + background);
    }
  }
  assert.ok(!/(?:#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\()/i.test(withoutFoundation), `Raw color outside foundation: ${path}`);
  assert.ok(!/\b(?:backdrop-)?filter\s*:/i.test(source), `Filter effect is forbidden: ${path}`);
  assert.ok(!/\burl\s*\(/i.test(source), `CSS imagery is forbidden: ${path}`);
  if (path !== nativeCssPath) {
    for (const [, value] of source.matchAll(/\b(?:clip-path|mask(?:-image)?)\s*:\s*([^;]+);/gi)) {
      assert.equal(value.trim(), "none", "Unreviewed cropping/masking is forbidden: " + path);
    }
    assert.ok(!/\bobject-fit\s*:\s*cover\b/i.test(source), "Scientific/source media cropping is forbidden: " + path);
  }
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
    assert.ok(foundationNames.has(match[1]) || localDefinedNames.get(path).has(match[1]),
      `Undefined or out-of-scope CSS variable --${match[1]} in ${path}`);
  }
}

const ncaaCss = cssSources.get("app/work/after-the-tip/page.module.css");
for (const preservedRule of [
  ".firstSide { color: var(--olive-dark); }",
  ".secondSide { color: var(--teal-dark); }",
  ".firstRibbon { fill: var(--olive); stroke: var(--olive-dark); stroke-width: 1.5; vector-effect: non-scaling-stroke; }",
  ".secondRibbon { fill: var(--teal); stroke: var(--teal-dark); stroke-width: 1.5; vector-effect: non-scaling-stroke; }",
  ".quarterRule { stroke: var(--rule); stroke-width: .75; vector-effect: non-scaling-stroke; shape-rendering: crispEdges; }",
  ".zeroRule { stroke: var(--ink-soft); stroke-width: .75; vector-effect: non-scaling-stroke; shape-rendering: crispEdges; }",
]) {
  assert.equal(ncaaCss.split(preservedRule).length - 1, 1, `Preserved NCAA display rule drifted: ${preservedRule}`);
}
assert.match(ncaaCss, /\.ribbonFigure\s*\{[^}]*color:\s*var\(--charcoal\);[^}]*background:\s*var\(--sand\);[^}]*color-scheme:\s*light;/,
  "NCAA recorded series and axes must remain on their neutral light surface.");
assert.match(globals, /main:has\(\[data-reef-map\]\)\s*>\s*#maps\s*\{\s*color:\s*var\(--charcoal\);\s*color-scheme:\s*light;\s*\}/,
  "The byte-preserved reef scientific section must keep dark ink and light controls.");

assert.match(globals, /html\s*\{[\s\S]*scroll-padding-top:\s*5rem;/);
assert.match(globals, /\.site-header\s*\{[^}]*background:\s*var\(--color-page\);/);
assert.doesNotMatch(globals, /backdrop-filter|background:\s*color-mix[^;]*\.site-header/i);
for (const selector of [".brand-mark", ".desktop-nav", ".mobile-menu summary", ".mobile-menu nav a", ".footer-links"]) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = globals.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1];
  assert.match(rule ?? "", /font-size:\s*0\.8125rem/);
}

assert.match(rootOg, /export const size = \{ width: 1200, height: 630 \}/);
assert.doesNotMatch(rootOg, /\brgba?\(|\bhsla?\(/i);
const rootOgPalette = [...new Set([...rootOg.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0].toUpperCase()))].sort();
assert.deepEqual(rootOgPalette, ["#12232F", "#4B7182", "#A7E0F1", "#BDD3DF", "#F0F9FC"]);
assert.match(rootOg, /background:\s*"#12232F"/);
assert.match(rootOg, /color:\s*"#F0F9FC"/);
for (const foreground of ["#F0F9FC", "#BDD3DF", "#A7E0F1"]) {
  assert.ok(contrast(foreground, "#12232F") >= 4.5, `Root social-image contrast failed: ${foreground}`);
}

assert.match(homePage, /import\s*\{\s*PersonalFieldAtlas\s*\}\s*from\s*["']@\/components\/home\/PersonalFieldAtlas["']/);
assert.match(nativeHome, /aria-label="About Drew"/);
assert.match(nativeHome, /I set the direction, make product decisions and review the result\./);
assert.match(nativeHome, /Development is collaborative and includes Codex assistance\./);
assert.match(nativeHome, /aria-label="Selected project previews"/);
assert.match(nativeHome, /href="\/work\/burnlens"/);
assert.doesNotMatch(homePage + nativeHome, /ProjectCarousel|data-carousel-slide/);
assert.doesNotMatch(homePage + nativeHome, /data-featured-turn|9 of 84/);
assert.doesNotMatch(homePage + nativeHome, /BL\.F0[1-3]|burnlens-report|burnlens-media-manifest/);
assert.doesNotMatch(
  burnlensPage,
  /(?:BL\.F0[1-3]|data-governed-figure|data-media-warning|burnlens-(?:report|failure-record|media-manifest)|baseline-evaluation\.png|model-decision\.png|ward-creek-overlay\.png)/,
);
assert.doesNotMatch(burnlensPage, /from\s+["']next\/image["']|<\s*(?:Image|img)\b/);
assert.doesNotMatch(burnlensCss, /url\s*\(/i);
// NFA106: explicit reviewed current titles and route expansion; not historical byte slices.
const reviewedSpecCoverage = new Map([
  [
    "tests/portfolio.spec.ts",
    {
      "titles": [
        "NFA-084 résumé printing has a native no-JavaScript fallback",
        "NFA-084 hydrated résumé print action invokes browser print",
        "NFA-086 contribution-first résumé preserves exact copy and collapsed canonical evidence with and without JavaScript",
        "NFA-086 résumé details expose complete facts through independent native keyboard controls",
        "NFA-086 closed résumé details print every canonical fact without changing open state",
        "mobile navigation is native, visible, and keyboard-reachable",
        "NFA-047 mobile navigation closes with owned focus across widths and inputs",
        "NFA-047 delayed hydration preserves a native open menu at mobile widths",
        "NFA-047 modified and external links retain the current mobile disclosure",
        "NFA-047 breakpoint navigation closes a hidden menu without stealing desktop focus",
        "case-study chapter indexes remain keyboard-native at mobile and desktop widths",
        "representative routes hold at every required review width",
        "mobile homepage keeps biography first and selected contributions legible",
        "reduced-motion preference disables smooth scrolling",
        "homepage preserves biography, supported contributions and portfolio journeys without JavaScript",
        "work index preserves its three-lane hierarchy without JavaScript",
        "front-door copy explains technical identifiers before using them",
        "work-index visual worlds and lane hierarchy remain distinct without titles or raster images",
        "front-door accessibility holds at mobile and desktop review widths",
        "front-door links expose unobscured high-contrast keyboard focus",
        "front-door descendants remain contained at every review width",
        "front-door routes respect reduced motion and preserve decisive print evidence",
        "BurnLens release-governance story remains readable without JavaScript",
        "Runbook authority evidence remains readable without JavaScript",
        "Runbook headings and accessibility hold at mobile and desktop review widths",
        "Runbook descendants remain contained and the output matrix keeps its intended columns",
        "Runbook dark surfaces expose a strong keyboard focus indicator",
        "Runbook respects reduced motion and prints its evidence in readable contrast",
        "Runbook Open Graph endpoint is an exact 1200 by 630 PNG",
        "flagship failure evidence remains only where the selected public story supports it",
        "Quest Craft is exactly three supporting movements with the canonical route projection",
        "Quest Craft native agency score changes state without generating or mutating content",
        "Quest Craft remains complete and operable without JavaScript",
        "Quest Craft corrections own exact claims and immutable evidence links",
        "Quest Craft passes targeted accessibility and semantic hierarchy at mobile and desktop",
        "Quest Craft contains every review width and only its labeled table scrolls",
        "Quest Craft focus, reduced motion, and print retain every decisive boundary",
        "Quest Craft keeps a coherent reading order and branching identity without titles",
        "Quest Craft preserves native control meaning in forced-colors mode",
        "Quest Craft metadata and governed social media remain exact",
        "OpenClaw is exactly three documentary movements with canonical ownership",
        "OpenClaw native disclosure layers remain independent without runtime requests",
        "OpenClaw documentary evidence and independent disclosures survive without JavaScript",
        "OpenClaw passes targeted Axe, focus, and target-size gates",
        "OpenClaw contains every required width, 200 percent text, and 400 percent reflow",
        "OpenClaw preserves disclosure meaning in forced colors, reduced motion, and print",
        "OpenClaw metadata, social image, and title-hidden folio identity remain exact",
        "OpenClaw stays inside its isolated local supporting-route budget",
        "historical coursework forms a bounded reading shelf outside the case-study lane",
        "résumé projects canonical hierarchy, provenance, no-JavaScript, and technology bindings",
        "résumé survives every review width, text zoom, forced colors, reduced motion, and print",
        "résumé metadata, professional profile URLs, and isolated performance remain bounded",
        "historical coursework and résumé lanes retain their exact source-bound separation",
        "historical coursework remains complete without JavaScript",
        "flagship case studies preserve a clear next portfolio destination",
        "BurnLens release and evidence identities remain visibly distinct",
        "selected learning distinguishes linked credentials from unlinked study",
        "metadata and discovery surfaces identify the personal site",
        "shared chrome keeps one opaque, readable, high-contrast system across every route",
        "root Open Graph endpoint is an exact meaningful 1200 by 630 PNG",
        "convenience and legacy routes are permanent and contact intake is disabled",
        "security and privacy defaults are present",
        "homepage and work index independently stay inside conservative local lab budgets",
        "homepage stays inside conservative local lab budgets",
        "BurnLens stays inside conservative local lab budgets",
        "Runbook Sentinel stays inside conservative local lab budgets",
        "Quest Craft stays inside its isolated local supporting-route budget",
        "NFA-047 existing evidence receives truthful work and resume labels",
        "NFA-047 Runbook next threshold stays historical, sourced, and readable",
        "NFA-099 OpenClaw natural keyboard traversal preserves independent disclosures and return"
      ],
      "templates": [
        "`${route} is semantic, accessible, and contained at mobile width`"
      ],
      "routes": [
        "/",
        "/work",
        "/work/burnlens",
        "/work/runbook-sentinel",
        "/work/quest-craft",
        "/work/openclaw-showcase",
        "/resume"
      ],
      "declared": 77
    }
  ],
  [
    "tests/wildfire-response.spec.ts",
    {
      "titles": [
        "Wildfire case study renders its contribution and actual media across sizes",
        "Tradeoffs work by keyboard and the case is discoverable from selected work",
        "Case study has no automated WCAG A or AA violations",
        "Core case-study journey works without JavaScript and with reduced motion"
      ],
      "templates": [],
      "routes": [],
      "declared": 4
    }
  ],
  [
    "tests/after-the-tip.spec.ts",
    {
      "titles": [
        "After the Tip shows the contribution and two legible figures across viewport sizes",
        "Selected work links to the case and ribbon explanation operates by keyboard",
        "Shared-clock listening is optional, native, and does not autoplay",
        "A paused cohort switch preserves the elapsed position on the common clock",
        "Playback and rapid cohort switches keep the selected excerpt on the shared clock",
        "A persistent selected-track failure retains paused position and the selected cohort for retry",
        "A persistent selected-track failure retains the active playback intent for retry",
        "After the Tip has no automated WCAG A or AA violations",
        "The core comparison and native audio fallback remain usable without JavaScript"
      ],
      "templates": [],
      "routes": [],
      "declared": 9
    }
  ],
  [
    "tests/west-hawaii-heat-exposure.spec.ts",
    {
      "titles": [
        "Year-specific reef maps decode and the case stays contained at four viewport sizes",
        "Habitat shares preserve the common denominator and visible missing-data category",
        "The native explanation opens by keyboard and distinguishes all from assessed habitat",
        "Selected work shows both real maps and leads to the reef study",
        "Closed and open explanations have no automated WCAG A or AA violations with reduced motion",
        "The comparison, work-index navigation and values remain usable without JavaScript",
        "Core routes fetch local resources while official source links remain unvisited"
      ],
      "templates": [],
      "routes": [],
      "declared": 7
    }
  ],
  [
    "tests/nepal-satellite-atlas.spec.ts",
    {
      "titles": [
        "The complete dated radar map decodes and stays contained at four viewport sizes",
        "The full-size map opens the same local PNG without contacting source sites",
        "Native keyboard details preserve exact coverage and distinguish display from change",
        "Selected work foregrounds the Nepal project and leads to the actual map",
        "Closed and open methods have no automated WCAG A or AA violations with reduced motion",
        "The map, contribution story, coverage and navigation remain usable without JavaScript",
        "Core routes use local resources while credited source links remain unvisited"
      ],
      "templates": [],
      "routes": [],
      "declared": 7
    }
  ],
  [
    "tests/homepage-contributions.spec.ts",
    {
      "titles": [
        "Biography-first discovery preserves contributions, skills and screenshot source boundaries",
        "All-project discovery retains current-project qualifications and distinct flagship records",
        "Actual screenshot previews decode in their purpose-made mobile and desktop frames at four widths",
        "Real keyboard journeys expand native previews, restore focus with Escape and reach each selected case",
        "Direct homepage journeys reach all projects, the other flagship, résumé, workbench and contact",
        "Native previews, project journeys and the mobile menu remain usable without JavaScript",
        "Reduced-motion reading keeps local resources, accurate metadata and no autoplay media",
        "Closed previews, each expanded screenshot and the native mobile menu have no automated WCAG violations"
      ],
      "templates": [],
      "routes": [],
      "declared": 8
    }
  ],
  [
    "tests/polar-night.spec.ts",
    {
      "titles": [
        "Polar-night project previews stay manual and native disclosure exclusivity never hides project links",
        "Image reveal motion is finite, image inspection stays unfaded and only the separate Collapse control closes it",
        "Dashboard SSR and no-JavaScript companion retain the exact five dated qualified records",
        "Independent dashboard HTTP artifacts match reviewed bytes and its CSP exception stays route-local",
        "Interactive dashboard filters real records and exposes only the selected source preview",
        "Actual independent dashboard is usable at three widths with no overflow or automated WCAG violations",
        "Print keeps a light motion-free biography and project-link handoff while scientific qualifiers remain on All projects",
        "Native expanded screenshots keep controls, context and attribution inside responsive frames with a touch inspection path"
      ],
      "templates": [],
      "routes": [],
      "declared": 8
    }
  ]
]);
assert.deepEqual(await listFiles("tests", ".spec.ts"), [...reviewedSpecCoverage.keys()].sort(),
  "Only the seven reviewed browser specs may be declared.");
const declaredBySpec = new Map();
for (const [path, expected] of reviewedSpecCoverage) {
  const source = await read(path);
  assert.doesNotMatch(source, /\btest\.(?:skip|fixme|only)\s*\(/,
    "Skipping, fixme or exclusive execution is forbidden in the qualification suite: " + path);
  const calls = [...source.matchAll(/^\s*test\(\s*("(?:[^"\\]|\\.)*"|`[^`]*`)/gm)].map((match) => match[1]);
  const titles = calls.filter(value => value.startsWith('"')).map(value => JSON.parse(value));
  const templates = calls.filter(value => value.startsWith("`"));
  assert.equal((source.match(/^\s*test\s*\(/gm) ?? []).length, calls.length,
    "A non-reviewed or dynamic test declaration cannot be silently omitted: " + path);
  assert.deepEqual(titles, expected.titles, "Reviewed regression titles/order drifted: " + path);
  assert.deepEqual(templates, expected.templates, "Reviewed generated test title drifted: " + path);
  const routeBlock = source.match(/const representativeRoutes = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const routes = [...routeBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(routeBlock.replace(/"[^"]+"|[\s,]/g, ""), "", "Representative routes must remain a static literal array.");
  assert.deepEqual(routes, expected.routes, "Representative route coverage drifted.");
  const declared = titles.length + templates.length * routes.length;
  assert.equal(declared, expected.declared, "Reviewed declaration census drifted: " + path);
  assert.ok(manifest.files.includes(path), "Browser spec missing from public roster: " + path);
  declaredBySpec.set(path, declared);
}
const expectedBrowserTests = [...declaredBySpec.values()].reduce((total,count) => total + count,0);
assert.equal(expectedBrowserTests, 120,
  "Current source census must match the reviewed120-case declaration contract; execution is verified separately.");

assert.equal(packageJson.scripts["verify:integrated-u08"], "node scripts/verify-integrated-u08.mjs");
assert.ok(packageJson.scripts.check.includes("npm run verify:integrated-u08"));
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site");
assert.ok(manifest.script_files.includes("scripts/verify-integrated-u08.mjs"));
assert.ok(manifest.files.includes("scripts/verify-integrated-u08.mjs"));
assert.match(releaseVerifier, /EXPECTED_BROWSER_TESTS\s*=\s*120/);
// The release helper must enforce the current native-homepage census.
// Actual clean-snapshot collection and browser execution remain separate checks.
assert.match(releaseVerifier, /verifySourcePublicScope\(\);/);
assert.match(releaseVerifier, /verify:integrated-u08/);
assert.match(tests, /shared chrome keeps one opaque, readable, high-contrast system across every route/);
assert.match(tests, /root Open Graph endpoint is an exact meaningful 1200 by 630 PNG/);

console.log(JSON.stringify({
  status: "pass",
  publication_authority: "none",
  css_files: cssFiles.length,
  foundation_tokens: foundationNames.size,
  preserved_legacy_tokens: legacyFoundation.size,
  reviewed_presentation_roles: presentationRoles.size,
  exact_light_print_roles: printRoles.size,
  reachable_components: componentFiles.filter((path) => path.endsWith(".tsx") && reachableModules.has(path)).length,
  retained_unused_predecessor_files: [...retainedUnusedPredecessor.keys()],
  reachable_component_stylesheets: componentFiles.filter((path) => path.endsWith(".css") && reachableModules.has(path)).length,
  explicit_deletions: manifest.explicit_deletions.length,
  declared_browser_tests: expectedBrowserTests,
  declared_cases_by_spec: Object.fromEntries(declaredBySpec),
  browser_execution_qualified: false,
  coverage_authority: "NFA109 exact named source declarations; actual candidate collection and browser execution are separate required checks",
  root_social_image_pairs: 3,
  historical_release_helper_test_count: 104,
  predecessor_release_helper_test_count: 112,
  release_helper_expected_test_count: expectedBrowserTests,
  release_helper_requires_actual_browser_collection: true,
  historical_release_helper_is_nfa073_final_validator: false,
}, null, 2));
