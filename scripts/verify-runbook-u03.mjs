import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProject,
  getProjectSource,
} from "../content/project-model.ts";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pagePath = join(root, "app", "work", "runbook-sentinel", "page.tsx");
const cssPath = join(root, "app", "work", "runbook-sentinel", "page.module.css");
const socialPath = join(root, "app", "work", "runbook-sentinel", "opengraph-image.tsx");
const globalCssPath = join(root, "app", "globals.css");
const mediaRoot = join(root, "public", "media", "projects", "runbook-sentinel");
const mediaPath = join(mediaRoot, "sources.json");
const pageSource = readFileSync(pagePath, "utf8");
const normalizedPageSource = pageSource.replace(/\s+/g, " ");
const normalizedPageSourceLower = normalizedPageSource.toLowerCase();
const cssSource = readFileSync(cssPath, "utf8");
const socialSource = readFileSync(socialPath, "utf8");
const globalCss = readFileSync(globalCssPath, "utf8");
const media = JSON.parse(readFileSync(mediaPath, "utf8"));
const project = getProject("runbook-sentinel");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.slice(1);
  return (
    0.2126 * channel(Number.parseInt(value.slice(0, 2), 16)) +
    0.7152 * channel(Number.parseInt(value.slice(2, 4), 16)) +
    0.0722 * channel(Number.parseInt(value.slice(4, 6), 16))
  );
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function constantObjectArray(source, constantName, fields) {
  const block = source.match(
    new RegExp(`const ${constantName} = \\[([\\s\\S]*?)\\] as const(?: satisfies[^;]+)?;`),
  );
  assert.ok(block, `${constantName} must remain an explicit const array.`);

  const fieldPattern = fields
    .map((field) => `${field}:\\s*"([^"]+)"`)
    .join("[\\s\\S]*?");
  return [...block[1].matchAll(new RegExp(`\\{[\\s\\S]*?${fieldPattern}[\\s\\S]*?\\}`, "g"))]
    .map((match) => Object.fromEntries(fields.map((field, index) => [field, match[index + 1]])));
}

function selectorFontSizeRem(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = source.match(new RegExp(`^\\s*${escapedSelector}\\s*\\{([^}]*)\\}`, "m"));
  assert.ok(block, `${selector} must retain a dedicated declaration block.`);
  const size = block[1].match(/font-size\s*:\s*([0-9.]+)rem\s*;/i);
  assert.ok(size, `${selector} must declare its review-critical font size in rem.`);
  return Number(size[1]);
}

assert.equal(project.lane, "flagship");
assert.equal(project.visualWorld, "control-trace");
assert.deepEqual(project.capabilityBoundaries, {
  eeEvidence: false,
  operational: false,
  implementedSystem: true,
  evaluatedSystem: true,
  productionReady: false,
  hardwareImplemented: false,
  runtimeInspected: true,
  currentGuidance: false,
});
for (const field of [
  "personalRole",
  "implementation",
  "outcome",
  "failureDividend",
  "limitations",
  "maturity",
  "nextStep",
]) {
  assert.equal(project.evidence[field].state, "supported", `${field} must remain supported.`);
}

const canonicalFailures = new Map(
  project.evidence.failureDividend.value.map((record) => [record.id, record]),
);
const expectedFailures = [
  ["RS.F03", ["rs.model_comparison.0018", "rs.evaluation_report.v0020"]],
  ["RS.F02", ["rs.action_split_gap.0020", "rs.evaluation.v0020", "rs.milestone.0020"]],
  ["RS.F01", ["rs.trace_gap.0016", "rs.trace.0020.attempt003", "rs.architecture.v0020"]],
];
for (const [id, sourceIds] of expectedFailures) {
  assert.deepEqual(canonicalFailures.get(id)?.sourceIds, sourceIds, `${id} source drift`);
}
assert.deepEqual(
  [...pageSource.matchAll(/data-evidence-id="(RS\.F\d{2})"/g)].map((match) => match[1]),
  ["RS.F03", "RS.F02", "RS.F01"],
  "Runbook failure presentation order drifted.",
);

const publicSourceIds = [
  "rs.git.v0020",
  "rs.architecture.v0020",
  "rs.threat_model.v0020",
  "rs.evaluation.v0020",
  "rs.evaluation_report.v0020",
  "rs.model_comparison.0018",
  "rs.action_split_gap.0020",
  "rs.trace_gap.0016",
  "rs.trace.0020.attempt003",
  "rs.milestone.0020",
];
for (const sourceId of publicSourceIds) {
  const source = getProjectSource(sourceId);
  assert.equal(source.availability, "public", `${sourceId} must remain public.`);
  assert.match(source.href, /f149ac2408f30b504b78844780b8533bed2ebfdc/);
}

for (const hook of [
  'data-control-trace="runbook-sentinel"',
  'data-first-screen-ledger="runbook-sentinel"',
  'data-authority-trace="runbook-sentinel"',
  'data-authority-rail="signal"',
  'data-authority-rail="authority"',
  "data-authority-break",
  "data-model-output-matrix",
  'data-release-progression="runbook-sentinel"',
  'data-failure-dividend="runbook-sentinel"',
  'data-proof-room="runbook-sentinel"',
  'data-governed-figure="runbook-dashboard"',
  "data-media-conditions",
  'data-source-ledger="runbook-sentinel"',
]) {
  assert.ok(pageSource.includes(hook), `Missing Runbook U03 hook: ${hook}`);
}

const expectedRails = {
  signalRail: [
    {
      title: "Untrusted evidence",
      body: "Fresh content stays distinguishable from stale identity and untrusted guidance.",
    },
    {
      title: "Bounded agent",
      body: "Diagnose, request evidence, propose one predefined test action, or abstain.",
    },
    {
      title: "Structured proposal",
      body: "A typed action request with no approval or execution authority.",
    },
  ],
  authorityRail: [
    {
      title: "Separate approval",
      body: "A project-specific launch-scoped loopback credential—not proof of human identity.",
    },
    {
      title: "Fixed software checks",
      body: "Policy, arguments, replay, one-use approval, repeated-request, and state checks.",
    },
    {
      title: "Synthetic executor",
      body: "Only restart worker, roll back deployment, or warm cache in repository-local state.",
    },
  ],
};
for (const [constantName, expected] of Object.entries(expectedRails)) {
  assert.deepEqual(
    constantObjectArray(pageSource, constantName, ["title", "body"]),
    expected,
    `${constantName} content or order drifted.`,
  );
}
const authorityRailOrder = [...pageSource.matchAll(/data-authority-rail="([^"]+)"/g)]
  .map((match) => match[1]);
assert.deepEqual(
  authorityRailOrder,
  ["signal", "authority"],
  "The signal rail must precede the authority rail exactly once.",
);

for (const label of [
  "Problem",
  "Intended reviewer",
  "My role",
  "Control system",
  "Result",
  "Limit",
  "Verified synthetic testbed · v0.0.20",
  "Software-control metaphor; no electrical or hardware implementation is claimed.",
  "three-billion-parameter local model",
  "chained event logs",
  "each action was covered in both development and held-out cases",
]) {
  assert.ok(
    normalizedPageSource.toLowerCase().includes(label.toLowerCase()),
    `Missing reader-safe Runbook text: ${label}`,
  );
}
assert.match(pageSource, /ProjectFactLedger/);
assert.match(pageSource, /EvidenceLink/);

for (const forbidden of [
  "synthetic SRE incident-agent system",
  "can remain useful",
  "lost on validity, usefulness",
  "parser and policy gate rejected its invalid outputs",
  "authenticated external-operator boundary",
  "Research-informed public preview",
  '"AI safety"',
  "the proposal crosses no boundary by itself",
]) {
  assert.ok(
    !normalizedPageSourceLower.includes(forbidden.toLowerCase()),
    `Forbidden Runbook route language: ${forbidden}`,
  );
}
assert.doesNotMatch(
  `${pageSource}\n${cssSource}\n${socialSource}`,
  /(?:\u00e2|\u00c2|\u00c3|\u00f0\u0178|\ufffd)/u,
  "Runbook source contains likely encoding corruption.",
);
assert.doesNotMatch(pageSource, /href\s*=\s*["']\/media\/[^"']+\.png/i);
assert.doesNotMatch(pageSource, /href\s*=\s*\{[^}]*\.path/i);

assert.doesNotMatch(cssSource, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|\blab\(|color-mix\(/i);
assert.doesNotMatch(cssSource, /(?:100|88)svh|backdrop-filter|scroll-snap|animation\s*:/i);
assert.doesNotMatch(cssSource, /\.page\s*\{[^}]*overflow(?:-x)?\s*:\s*(?:hidden|clip)/is);
for (const declaration of cssSource.matchAll(/font-family\s*:\s*([^;]+);/gi)) {
  assert.match(
    declaration[1].trim(),
    /^var\(--(?:sans|serif|mono)\)$/,
    `Unsupported Runbook font-family: ${declaration[0]}`,
  );
}
assert.match(globalCss, /--mono:\s*ui-monospace,\s*SFMono-Regular,\s*Menlo,\s*Consolas,\s*monospace;/);
for (const match of cssSource.matchAll(/font-size\s*:\s*([0-9.]+)rem/gi)) {
  assert.ok(Number(match[1]) >= 0.75, `Runbook type below 0.75rem: ${match[0]}`);
}
for (const selector of [
  ".statusBus span",
  ".sourceAction",
  ".heroLedger dt",
  ".failureMeta nav a",
]) {
  assert.ok(
    selectorFontSizeRem(cssSource, selector) >= 0.8125,
    `${selector} must remain at least 0.8125rem on an essential review surface.`,
  );
}
const heroHeadingBlock = cssSource.match(/^\s*\.hero h1\s*\{([^}]*)\}/m);
assert.ok(heroHeadingBlock, "The Runbook hero heading must retain its dedicated CSS block.");
const heroClamp = heroHeadingBlock[1].match(
  /font-size\s*:\s*clamp\(\s*([0-9.]+)rem\s*,[^,]+,\s*([0-9.]+)rem\s*\)\s*;/i,
);
assert.ok(heroClamp, "The Runbook hero heading must retain a bounded clamp().");
assert.ok(Number(heroClamp[1]) >= 3.25, "The Runbook hero clamp minimum fell below 3.25rem.");
assert.ok(Number(heroClamp[2]) <= 6.75, "The Runbook hero clamp maximum exceeds 6.75rem.");
const globalVariables = new Set(
  [...globalCss.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
);
const usedVariables = new Set(
  [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]),
);
assert.deepEqual([...usedVariables].filter((variable) => !globalVariables.has(variable)), []);

assert.deepEqual(new Set(readdirSync(mediaRoot)), new Set(["dashboard-baseline-0020.png", "sources.json"]));
assert.equal(media.source_commit, "f149ac2408f30b504b78844780b8533bed2ebfdc");
assert.equal(media.release_tag, "v0.0.20");
assert.equal(media.assets.length, 1);
const asset = media.assets[0];
assert.equal(asset.status, "approved_for_public_personal_portfolio");
assert.equal(asset.author, "Drew Baker / Runbook Sentinel project");
assert.match(asset.reuse_basis, /Owner-directed reuse/);
assert.match(media.reuse_boundary, /no top-level license/);
assert.match(media.reuse_boundary, /does not grant general reuse rights/);
assert.equal(
  asset.alt,
  "Runbook Sentinel dashboard screenshot showing the frozen evaluation pass, exact test metrics, a launch-scoped loopback approval boundary, and real infrastructure disconnected.",
);
assert.ok(pageSource.includes("alt={runbookMedia.assets[0].alt}"));
const dashboardBytes = readFileSync(join(mediaRoot, "dashboard-baseline-0020.png"));
assert.equal(dashboardBytes.length, 78862);
assert.equal(sha256(dashboardBytes), "66f153bac21c2ce5f5b287115c162e9122a66253be59222dd0195332aa25c80c");
assert.deepEqual(pngDimensions(dashboardBytes), { width: 1440, height: 1000 });
for (const phrase of [
  "Synthetic state only; real infrastructure disconnected.",
  "launch-scoped loopback credential",
  "Owner-approved display of this exact hash-bound asset",
  "no top-level license",
  "no general reuse right is granted",
]) {
  assert.ok(normalizedPageSource.includes(phrase), `Missing dashboard condition: ${phrase}`);
}

for (const phrase of [
  "RUNBOOK SENTINEL / SOFTWARE FLAGSHIP",
  "The model is not the control plane.",
  "EVIDENCE",
  "BOUNDED AGENT",
  "PROPOSAL",
  "SEPARATE APPROVAL",
  "FIXED GATE",
  "SYNTHETIC STATE",
  "NO AUTHORITY ALONE",
]) {
  assert.ok(socialSource.includes(phrase), `Missing Runbook social text: ${phrase}`);
}
const socialPalette = new Set(
  [...socialSource.matchAll(/#[0-9a-f]{6}\b/gi)].map((match) => match[0].toUpperCase()),
);
assert.deepEqual(
  [...socialPalette].sort(),
  [
    "#222222",
    "#314E54",
    "#454843",
    "#48513F",
    "#757F64",
    "#C7CDBF",
    "#CB7A5C",
    "#E9E2D8",
    "#FFFFFF",
  ],
  "Runbook social-image palette drifted outside its approved exact colors.",
);
const socialTextPairs = [
  ["#222222", "#E9E2D8"],
  ["#314E54", "#E9E2D8"],
  ["#48513F", "#E9E2D8"],
  ["#454843", "#E9E2D8"],
  ["#FFFFFF", "#222222"],
  ["#C7CDBF", "#222222"],
  ["#CB7A5C", "#222222"],
  ["#FFFFFF", "#314E54"],
  ["#222222", "#C7CDBF"],
];
for (const [foreground, background] of socialTextPairs) {
  assert.ok(socialPalette.has(foreground), `Missing social foreground ${foreground}`);
  assert.ok(socialPalette.has(background), `Missing social background ${background}`);
  assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background} failed`);
}

console.log(JSON.stringify({
  status: "pass",
  project: project.id,
  visualWorld: project.visualWorld,
  ledgerFields: firstScreenFieldCount(pageSource),
  authorityRails: authorityRailOrder,
  failures: expectedFailures.length,
  progressionStages: releaseProgressionCount(pageSource),
  governedAssets: media.assets.length,
  publicSources: publicSourceIds.length,
  pageSha256: sha256(readFileSync(pagePath)),
  cssSha256: sha256(readFileSync(cssPath)),
  socialSha256: sha256(readFileSync(socialPath)),
  assetSha256: sha256(dashboardBytes),
}));

function firstScreenFieldCount(source) {
  const block = source.match(/const firstScreenFacts = \[([\s\S]*?)\] as const satisfies/);
  assert.ok(block, "First-screen fact block must remain present.");
  const terms = [...block[1].matchAll(/term:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(terms, ["Problem", "Intended reviewer", "My role", "Control system", "Result", "Limit"]);
  return terms.length;
}

function releaseProgressionCount(source) {
  const block = source.match(/const releaseProgression = \[([\s\S]*?)\] as const;/);
  assert.ok(block, "Release-progression data must remain present.");
  const values = [...block[1].matchAll(/value:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(values, ["3 / 3", "5 / 6", "+ 1 case", "6 / 6"]);
  return values.length;
}
