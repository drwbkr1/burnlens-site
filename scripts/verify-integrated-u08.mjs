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
assert.equal(manifest.files.length, 112,
  "NFA-073 must retain the 98-file predecessor and exactly 14 declared carousel/dashboard/regression additions.");
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
assert.equal(predecessorPublicPaths.length, 98);
assert.equal(nfa073PublicAdditions.length, 14);
assert.equal(new Set(manifest.files).size, manifest.files.length, "Duplicate candidate path");
assert.deepEqual([...manifest.files].sort(), [...predecessorPublicPaths, ...nfa073PublicAdditions].sort(),
  "The public roster must retain every exact predecessor path and only the 14 NFA-073 additions.");

const componentFiles = await listFiles("components");
assert.deepEqual(componentFiles, [
  "components/CaseChapterDisclosure.tsx",
  "components/ProjectCarousel.module.css",
  "components/ProjectCarousel.tsx",
  "components/chrome/SiteFooter.tsx",
  "components/chrome/SiteHeader.tsx",
  "components/editorial/EvidenceLink.tsx",
  "components/editorial/ProjectFactLedger.tsx",
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
for (const componentPath of componentFiles) {
  assert.ok(reachableModules.has(componentPath), `Unreachable public component/module: ${componentPath}`);
  assert.ok(manifest.files.includes(componentPath), `Component/module missing from public roster: ${componentPath}`);
}
assert.ok(moduleSources.get("components/ProjectCarousel.tsx").includes('"./ProjectCarousel.module.css"'),
  "The carousel must own its reachable scoped stylesheet.");

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
    assert.equal(path, "app/work/openclaw-showcase/page.module.css", `Route-local token in ${path}: --${name}`);
    assert.ok([folioAliases.get(name), printFolioAliases.get(name)].some((alias) => value.trim() === `var(--${alias})`),
      `OpenClaw alias drifted: --${name}`);
    localNames.add(name);
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
  assert.ok(!/(?:#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\()/i.test(withoutFoundation), `Raw color outside foundation: ${path}`);
  assert.ok(!/\b(?:backdrop-)?filter\s*:/i.test(source), `Filter effect is forbidden: ${path}`);
  assert.ok(!/\burl\s*\(/i.test(source), `CSS imagery is forbidden: ${path}`);
  for (const [, value] of source.matchAll(/\b(?:clip-path|mask(?:-image)?)\s*:\s*([^;]+);/gi)) {
    assert.equal(value.trim(), "none", `Unreviewed cropping/masking is forbidden: ${path}`);
  }
  assert.ok(!/\bobject-fit\s*:\s*cover\b/i.test(source), `Scientific/source media cropping is forbidden: ${path}`);
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

assert.match(homePage, /How I work/);
assert.match(homePage, /data-portfolio-making/);
assert.match(homePage, /<ProjectCarousel\s+projectNames=\{projectNames\}/);
assert.match(moduleSources.get("components/ProjectCarousel.tsx"), /data-current-work\s+data-front-door-flagships\s+data-project-carousel/);
assert.doesNotMatch(homePage, /data-featured-turn|9 of 84/);
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
assert.equal(topLevelTests + generatedRouteTests, 71,
  "The browser regression suite must retain 65 predecessor tests and six NFA-047 regressions.");
const exactBrowserSpecs = new Map([
  ["tests/portfolio.spec.ts", 71],
  ["tests/wildfire-response.spec.ts", 4],
  ["tests/after-the-tip.spec.ts", 9],
  ["tests/west-hawaii-heat-exposure.spec.ts", 7],
  ["tests/nepal-satellite-atlas.spec.ts", 7],
  ["tests/homepage-contributions.spec.ts", 6],
  ["tests/polar-night.spec.ts", 8],
]);
assert.deepEqual(await listFiles("tests", ".spec.ts"), [...exactBrowserSpecs.keys()].sort(),
  "The integrated browser suite must contain only the explicit 104-test predecessor and eight NFA-073 regressions.");
for (const [path, expectedCount] of exactBrowserSpecs) {
  if (path === "tests/portfolio.spec.ts") continue;
  const source = await read(path);
  assert.equal((source.match(/^test\(/gm) ?? []).length, expectedCount,
    `${path}: the explicit bounded browser regression count drifted.`);
  assert.ok(manifest.files.includes(path), `${path}: the exact browser spec must be allowlisted.`);
}
const expectedBrowserTests = [...exactBrowserSpecs.values()].reduce((total, count) => total + count, 0);
assert.equal(expectedBrowserTests, 112);

assert.equal(packageJson.scripts["verify:integrated-u08"], "node scripts/verify-integrated-u08.mjs");
assert.ok(packageJson.scripts.check.includes("npm run verify:integrated-u08"));
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site");
assert.ok(manifest.script_files.includes("scripts/verify-integrated-u08.mjs"));
assert.ok(manifest.files.includes("scripts/verify-integrated-u08.mjs"));
assert.match(releaseVerifier, /EXPECTED_BROWSER_TESTS\s*=\s*112/);
// The current release helper matches the full 112-test suite. Its historical
// 104-test NFA-064/070 predecessor remains recorded below, not current authority.
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
  reachable_components: componentFiles.filter((path) => path.endsWith(".tsx")).length,
  reachable_component_stylesheets: componentFiles.filter((path) => path.endsWith(".css")).length,
  explicit_deletions: manifest.explicit_deletions.length,
  expected_browser_tests: expectedBrowserTests,
  root_social_image_pairs: 3,
  historical_release_helper_test_count: 104,
  current_release_helper_test_count: 112,
  historical_release_helper_is_nfa073_final_validator: false,
}, null, 2));
