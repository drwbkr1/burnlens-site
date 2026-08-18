import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProjectSource,
  projectHierarchy,
  projectRecords,
  projectSurfacePlan,
  targetSurfaceHierarchy,
  toReaderFirst,
} from "../content/project-model.ts";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function read(path) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

function requireText(source, value, location) {
  assert.ok(source.includes(value), `${location} must include ${JSON.stringify(value)}.`);
}

function requireCompactedText(source, value, location) {
  const compactSource = source.replace(/\s+/g, " ");
  assert.ok(compactSource.includes(value), `${location} must include ${JSON.stringify(value)}.`);
}

function reject(source, pattern, location, reason) {
  assert.doesNotMatch(source, pattern, `${location}: ${reason}`);
}

const homePath = "app/page.tsx";
const workPath = "app/work/page.tsx";
const homeCssPath = "app/home.module.css";
const workCssPath = "app/work/work-index.module.css";
const home = read(homePath);
const work = read(workPath);
const homeCss = read(homeCssPath);
const workCss = read(workCssPath);
const packageJson = JSON.parse(read("package.json"));
const publicAllowlist = JSON.parse(read("scripts/public-candidate-allowlist.json"));

const expectedHierarchy = {
  flagship: ["burnlens", "runbook-sentinel"],
  supporting: ["quest-craft", "openclaw-showcase"],
  archive: [
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp",
  ],
};
assert.deepEqual(projectHierarchy, expectedHierarchy, "Canonical three-lane project hierarchy drifted.");
assert.deepEqual(targetSurfaceHierarchy.homepage, {
  flagshipProjectIds: expectedHierarchy.flagship,
  supportingProjectIds: expectedHierarchy.supporting,
  archiveProjectIds: [],
}, "Homepage project hierarchy drifted.");
assert.deepEqual(
  Object.fromEntries(
    Object.entries(targetSurfaceHierarchy.workIndex).map(([lane, value]) => [lane, value.projectIds]),
  ),
  {
    flagships: expectedHierarchy.flagship,
    "supporting-notes": expectedHierarchy.supporting,
    "historical-reading-shelf": expectedHierarchy.archive,
  },
  "Work-index lane membership drifted.",
);

const exactWorkIndexFields = {
  burnlens: ["problem", "intendedUser", "personalRole", "decisionSupported", "outcome", "limitations", "maturity"],
  "runbook-sentinel": ["problem", "intendedUser", "personalRole", "decisionSupported", "stack", "outcome", "limitations", "maturity"],
  "quest-craft": ["problem", "intendedUser", "personalRole", "decisionSupported", "testStrategy", "outcome", "limitations", "maturity"],
  "openclaw-showcase": ["problem", "decisionSupported", "personalRole", "implementation", "stack", "outcome", "limitations", "maturity"],
};
for (const [projectId, fields] of Object.entries(exactWorkIndexFields)) {
  assert.deepEqual(
    projectSurfacePlan[projectId].fields.workIndex,
    fields,
    `${projectId}: work-index field projection drifted.`,
  );
  for (const field of fields) {
    assert.equal(
      projectRecords[projectId].evidence[field].state,
      "supported",
      `${projectId}.${field}: a projected work-index field must remain supported.`,
    );
  }
}

const featuredTargets = {
  "runbook-sentinel": ["RS.F03"],
};
for (const [projectId, homepageTargets] of Object.entries(featuredTargets)) {
  assert.deepEqual(
    projectSurfacePlan[projectId].featuredFailureIds.homepage,
    homepageTargets,
    `${projectId}: homepage failure target drifted.`,
  );
  assert.deepEqual(
    projectSurfacePlan[projectId].featuredFailureIds.workIndex,
    [],
    `${projectId}: the work index must not repeat a featured failure.`,
  );

  const failureField = projectRecords[projectId].evidence.failureDividend;
  assert.equal(failureField.state, "supported", `${projectId}: failure evidence is not supported.`);
  const selected = failureField.value.find((failure) => failure.id === homepageTargets[0]);
  assert.ok(selected, `${projectId}: selected homepage failure is absent.`);
  assert.equal(selected.featured, true, `${selected.id}: selected homepage failure is not featured.`);
  for (const stage of ["failure", "buildChange", "earnedCapability", "boundary"]) {
    assert.equal(typeof selected[stage], "string", `${selected.id}.${stage}: value is absent.`);
    assert.ok(selected[stage].trim().length > 0, `${selected.id}.${stage}: value is empty.`);
  }
  assert.ok(
    selected.sourceIds.some((sourceId) => {
      const source = getProjectSource(sourceId);
      return source.availability === "public" && "href" in source;
    }),
    `${selected.id}: at least one public, linkable source is required.`,
  );
  const firstPublicSourceId = selected.sourceIds.find((sourceId) => {
    const source = getProjectSource(sourceId);
    return source.availability === "public" && "href" in source;
  });
  assert.equal(
    firstPublicSourceId,
    "rs.model_comparison.0018",
    `${selected.id}: the first public source projection drifted.`,
  );
}
assert.deepEqual(projectSurfacePlan.burnlens.featuredFailureIds.homepage, []);
assert.deepEqual(projectSurfacePlan.burnlens.featuredFailureIds.workIndex, []);
assert.equal(projectRecords.burnlens.evidence.failureDividend.state, "not_applicable");

for (const [path, source] of [[homePath, home], [workPath, work]]) {
  assert.match(
    source,
    /from\s+["']@\/content\/project-model["']/,
    `${path} must consume the canonical project model directly.`,
  );
  reject(source, /\ballPublishedWork\b|\bprojects\.secondary\b/, path,
    "legacy aggregate projections are forbidden on the front door");
  reject(source, /const\s+(?:burnlens|runbook(?:Sentinel)?|questCraft|openclaw)\s*=\s*\{/i, path,
    "route-local duplicate project facts are forbidden");
  reject(source, /^(?:["'])use client(?:["']);/m, path, "the page must remain a server component");
  reject(source, /\b(?:useState|useEffect|useLayoutEffect|useReducer|useRef)\s*\(/, path,
    "client hooks are forbidden");
  reject(source, /<\s*(?:canvas|video|audio)\b|\bautoPlay\b|addEventListener\s*\(\s*["']scroll/i, path,
    "canvas, autoplay media, and scroll handlers are forbidden");
}
reject(home, /@\/content\/projects/, homePath, "the homepage must use only the canonical model");
assert.match(
  work,
  /import\s*\{\s*historicalCoursework\s*\}\s*from\s*["']@\/content\/projects["'];/,
  `${workPath}: only the reader-first historical shelf may use the legacy content projection.`,
);
const legacyWorkImports = [...work.matchAll(
  /import\s*\{([^}]*)\}\s*from\s*["']@\/content\/projects["']/g,
)].flatMap((match) => match[1].split(",").map((name) => name.trim()).filter(Boolean));
assert.deepEqual(
  legacyWorkImports,
  ["historicalCoursework"],
  `${workPath}: no designed-lane symbol may come from the legacy content projection.`,
);

requireText(home, 'import styles from "./home.module.css";', homePath);
requireText(work, 'import styles from "./work-index.module.css";', workPath);
for (const [path, source] of [[homePath, home], [workPath, work]]) {
  requireText(source, "className={styles.", path);
}

for (const [pattern, reason] of [
  [/HistoricalCourseworkShelf/, "the complete historical shelf belongs only on /work"],
  [/from\s+["']next\/image["']|<\s*Image\b|<\s*img\b/, "front-door flagships must be CSS-authored, not raster cards"],
  [/dashboard-baseline-0020\.png|ward-creek-overlay\.png/, "case-study raster evidence must not be promoted to the homepage"],
  [/flagship-media|image-card|media-card/i, "generic image-card markup is forbidden"],
]) {
  reject(home, pattern, homePath, reason);
}

const exactHomeCopy = [
  "Software engineering · geospatial evidence · climate-relevant systems",
  "01 / Proven",
  "Software systems",
  "02 / Applied",
  "Climate and geospatial",
  "03 / Context",
  "Energy governance",
  "The tested local model produced 9 of 84 outputs that passed the required structure, so the candidate was excluded and fixed-rule control remained.",
  "How this portfolio was made",
];
for (const value of exactHomeCopy) requireText(home, value, homePath);
const exactLedgerCopy = [
  "I orchestrate Codex through bounded goals, explicit authority, critique, verification, and human gates—not as an authorial stand-in.",
  "Set the audience and use boundaries, make product and presentation decisions, and approve the exact public representation when a human gate is required.",
  "Decompose milestones, research approved public sources, implement within exact scope, critique the UX, preserve failed attempts, and verify the result.",
  "For BurnLens, I bounded the release to one repository and directed it to Codex Sites. Codex assembled a canonical reviewer path, rechecked source and claim boundaries, and verified the production result. A local preview and two social-card attempts failed their gates, so they stayed rejected.",
  "The verified v0.56.0 release shipped without a bespoke social image and without rewriting the underlying evidence.",
  "This demonstrates a bounded human–Codex workflow—not autonomous authorship, independent user testing, or universal design superiority.",
];
for (const value of exactLedgerCopy) requireCompactedText(home, value, homePath);
requireText(home, "I build evidence-bound systems ", homePath);
requireText(home, "<em>for uncertain terrain.</em>", homePath);
assert.match(
  home,
  /These shorter field notes show bounded interaction and documentation work\.\s*Each is\s*designed only from what its public evidence supports\./,
  `${homePath}: supporting-note introduction drifted.`,
);
requireText(work, "Two flagships, two focused field notes, and a bounded historical shelf.", workPath);
for (const [path, source] of [[homePath, home], [workPath, work]]) {
  requireText(source, "toReaderFirst", path);
  reject(source, /function\s+readerFirst\s*\(/, path, "reader-first copy must stay in the canonical model layer");
}
assert.equal(toReaderFirst("9 of 84 valid outputs"), "9 of 84 outputs that passed the required structure");
assert.equal(toReaderFirst("JSON and JSONL traces"), "JSON records and chained event logs");
assert.doesNotMatch(toReaderFirst("MCP server"), /\bMCP\b/);

for (const clause of [
  "Energy is historical governance context and a direction of interest",
  "not evidence of an implemented energy system",
  "electrical engineering, controls, embedded",
  "power-systems, or hardware implementation experience",
]) {
  requireCompactedText(home, clause, homePath);
  requireCompactedText(work, clause, workPath);
}
assert.match(home, /Public reviewer snapshot[\s\S]*private stack[\s\S]*general[\s-]+child[\s-]+safety/i,
  `${homePath}: Quest Craft public/private/safety boundary is incomplete.`);
assert.match(home, /Public documentation artifact[\s\S]*private runtime[\s\S]*not inspected or\s*evaluated[\s\S]*no runtime capability, intended user, or failure dividend/i,
  `${homePath}: OpenClaw disclosure boundary is incomplete.`);

for (const value of [
  "data-front-door-flagships",
  'data-flagship-teaser="burnlens"',
  'data-flagship-teaser="runbook-sentinel"',
  "data-visual-world={burnlens.visualWorld}",
  "data-visual-world={runbook.visualWorld}",
  "data-portfolio-making",
  'data-orchestration-marker="D.01"',
  'data-orchestration-marker="C.01"',
  'data-orchestration-marker="E.01"',
  'data-orchestration-marker="B.01"',
  "data-evidence-id={failure.id}",
  "data-source-id={source.id}",
  'href="/work#historical-reading"',
  'data-capability-boundary="energy-ee"',
]) {
  requireText(home, value, homePath);
}
assert.match(
  home,
  /data-portfolio-making[\s\S]*data-orchestration-marker="D\.01"[\s\S]*data-orchestration-marker="C\.01"[\s\S]*data-orchestration-marker="E\.01"[\s\S]*data-orchestration-marker="B\.01"[\s\S]*data-source-id="burnlens-pinned-tree"[\s\S]*data-source-id="burnlens-release"/,
  `${homePath}: the static portfolio-making ledger order or source topology drifted.`,
);
requireText(home, "https://github.com/drwbkr1/burnlens-deschutes/blob/a741111d82e69689022d2058118ed8f4b9bf3546/records/prompt-build-log/2026-07-27-p6o1-t02.md#L26-L69", homePath);
assert.equal(getProjectSource("burnlens-release").href,
  "https://github.com/drwbkr1/burnlens-deschutes/releases/tag/v0.56.0-baseline-first-portfolio-release");
reject(home, /BL\.F0[1-3]|burnlens-(?:report|failure-record|media-manifest)/, homePath,
  "held BurnLens failures and governed-evidence sources must not return to the homepage");
for (const value of [
  'data-work-lane="flagships"',
  'data-work-lane="supporting-notes"',
  'data-work-lane="historical-reading-shelf"',
  "data-work-entry",
  "data-work-ordinal",
  "data-work-facts",
  "data-method-list",
  'data-field-key="problem"',
  'data-field-key="intendedUser"',
  'data-field-key="personalRole"',
  'data-field-key="decisionSupported"',
  'data-field-key="implementation"',
  'data-field-key="stack"',
  'data-field-key="testStrategy"',
  'data-field-key="outcome"',
  'data-field-key="limitations"',
  'data-field-key="maturity"',
  "data-atlas-grid",
  "data-atlas-transect",
  "data-control-rail",
  "data-authority-break",
  'data-capability-boundary="energy-ee"',
]) {
  requireText(work, value, workPath);
}
reject(work, /data-featured-turn|featuredFailureIds|failureDividend/, workPath,
  "the work index must not duplicate homepage failure turns");

for (const [path, css] of [[homeCssPath, homeCss], [workCssPath, workCss]]) {
  requireText(css, "var(--sand)", path);
  requireText(css, "var(--charcoal)", path);
  requireText(css, "var(--sage)", path);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, `${path}: reduced-motion treatment is required.`);
  assert.match(css, /@media\s+print/, `${path}: print treatment is required.`);
  reject(css, /url\s*\(/i, path, "front-door visual worlds must not smuggle in raster or remote background assets");
  reject(css, /#[0-9a-f]{3,8}\b|rgba?\s*\(/i, path, "route-local color literals are forbidden; use shared semantic tokens");
}
assert.match(homeCss, /\.atlas[A-Za-z0-9_-]*/, `${homeCssPath}: atlas selectors are required.`);
assert.match(homeCss, /\.making(?:Ledger|Roles|Boundary|Links)/,
  `${homeCssPath}: the static Nordic portfolio-making ledger selectors are required.`);
assert.match(homeCss, /\.(?:control|rail|breaker)[A-Za-z0-9_-]*/,
  `${homeCssPath}: control-trace selectors are required.`);
assert.match(homeCss, /:focus-visible[^}]*\{[^}]*outline[^}]*var\(--sage\)/s,
  `${homeCssPath}: dark-surface focus must use the sage token.`);
assert.match(workCss, /\.atlas[A-Za-z0-9_-]*/, `${workCssPath}: atlas selectors are required.`);
assert.match(workCss, /\.(?:control|rail|breaker)[A-Za-z0-9_-]*/,
  `${workCssPath}: control-trace selectors are required.`);
assert.match(workCss, /:focus-visible[^}]*\{[^}]*outline[^}]*var\(--sage\)/s,
  `${workCssPath}: dark-surface focus must use the sage token.`);

assert.equal(
  packageJson.scripts["verify:front-door-u04"],
  "node --experimental-strip-types scripts/verify-front-door-u04.mjs",
  "package.json must expose the U04 verifier.",
);
assert.match(
  packageJson.scripts.check,
  /verify:runbook-u03\s+&&\s+npm run verify:front-door-u04\s+&&\s+npm run verify:quest-u05\s+&&\s+npm run verify:openclaw-u06\s+&&\s+npm run verify:media/,
  "The U04 verifier must run after Runbook and before the Quest, OpenClaw, and media verification gates.",
);
assert.equal(
  packageJson.scripts.verify,
  "npm run check && npm run test:site",
  "The integrated verify command must retain the browser suite after static checks.",
);
for (const requiredPath of [
  homePath,
  homeCssPath,
  workPath,
  workCssPath,
  "scripts/verify-front-door-u04.mjs",
  "tests/portfolio.spec.ts",
]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from the explicit public files.`);
}
assert.ok(
  publicAllowlist.script_files.includes("scripts/verify-front-door-u04.mjs"),
  "The U04 verifier is absent from script_files.",
);

console.log(JSON.stringify({
  status: "passed",
  hierarchy: expectedHierarchy,
  homepageFeaturedFailures: ["RS.F03"],
  workIndexFeaturedFailures: [],
  orchestrationMarkers: ["D.01", "C.01", "E.01", "B.01"],
  visualWorlds: ["field-atlas", "control-trace"],
  rasterFlagshipTeasers: 0,
  frontDoorConsumers: [homePath, workPath],
}));
