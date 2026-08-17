import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProject,
  getProjectSource,
  projectSurfacePlan,
} from "../content/project-model.ts";
import openclawMedia from "../public/media/projects/openclaw-showcase/sources.json" with { type: "json" };

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pagePath = "app/work/openclaw-showcase/page.tsx";
const cssPath = "app/work/openclaw-showcase/page.module.css";
const ogPath = "app/work/openclaw-showcase/opengraph-image.tsx";
const mediaPath = "public/media/projects/openclaw-showcase/sources.json";
const pageSource = readFileSync(resolve(root, pagePath), "utf8");
const cssSource = readFileSync(resolve(root, cssPath), "utf8");
const ogSource = readFileSync(resolve(root, ogPath), "utf8");
const globalCss = readFileSync(resolve(root, "app/globals.css"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const publicAllowlist = JSON.parse(
  readFileSync(resolve(root, "scripts/public-candidate-allowlist.json"), "utf8"),
);
const project = getProject("openclaw-showcase");

const expectedTargetHashes = {
  [pagePath]: "0d84b95d21edf86ae99f1c4f8bff237744e74726d8a3a5d5ff705b6a50a8ee80",
  [cssPath]: "d9d1511633968c6c6b2259676a41944f7511accd9261bc8661ba5e4fba527d57",
  [ogPath]: "ecc4216222b0bff86bf02672b21d63debd606040bb5d6298f24e847a11e9c658",
};
const routeFields = [
  "problem",
  "decisionSupported",
  "personalRole",
  "implementation",
  "stack",
  "outcome",
  "limitations",
  "maturity",
];
const movementValues = [
  "disclosure-layers",
  "workflow-receipt-anatomy",
  "boundary-source-folio",
];
const expectedLedger = [
  ["Problem", "problem", "problem.summary"],
  ["Public decision boundary", "decisionSupported", "decisionSupported.summary"],
  ["My role", "personalRole", "personalRole.summary"],
  ["Public artifact", "implementation", "implementation.summary"],
  ["Result", "outcome", "outcome.summary"],
  ["Limit", "limitations", "limitations.summary"],
];
const expectedLayers = [
  {
    id: "public",
    number: "01",
    label: "Public",
    status: "Readable now",
    contentsLabel: "Available in the public source",
    contents: [
      "Workflow and review patterns",
      "Conceptual diagrams",
      "Sanitized representative receipt",
      "Claim and limitation discipline",
    ],
    boundary: "The documents explain an intended process. They do not show that the private runtime performed or enforced it.",
  },
  {
    id: "approval-gated",
    number: "02",
    label: "Approval-gated",
    status: "Human decision required",
    contentsLabel: "No item is authorized here",
    contents: [
      "Any private-derived screenshot or example",
      "Any claimed lesson about the excluded runtime",
      "Any capability statement",
      "Any new publication claim",
    ],
    boundary: "Nothing enters this layer by implication. Scope, provenance, safety, and publication authority require a separate exact review.",
  },
  {
    id: "private",
    number: "03",
    label: "Private / not inspected",
    status: "Outside this field note",
    contentsLabel: "Excluded from the public source",
    contents: [
      "Runtime code or configuration is not included",
      "Raw logs or exact traces are not included",
      "Credentials or live tool authority are not included",
      "Operational memory or private task history is not included",
    ],
    boundary: "This route neither inspects nor reconstructs the private layer. Its absence is not evidence about implementation quality.",
  },
];
const expectedWorkflow = [
  ["01", "Task", "Define the outcome, files, exclusions, risks, and human decision needed."],
  ["02", "Draft", "Prepare a bounded artifact in an isolated work state; polished still means draft."],
  ["03", "Trace", "Record intended inputs, outputs, checks, limits, and unresolved uncertainty."],
  ["04", "QA", "Review artifact quality and workflow quality as separate questions."],
  ["05", "Human decision", "Approve, revise, hold, or decline; release is never the automatic ending."],
];
const expectedReceipt = [
  ["Identity", "Task type named · private identifier not included · draft status visible"],
  ["Scope", "Intended artifact and exclusions stated before interpretation"],
  ["Trace", "Inputs · intended outputs · checks · limitations"],
  ["Review", "Claim support · disclosure boundary · artifact status"],
  ["Disposition", "Human decision required before any public release"],
];
const expectedSources = [
  { id: "openclaw.snapshot", hrefBinding: "sourceRoot", label: "Public documentation repository" },
  { id: "openclaw.workflow-doc", hrefBinding: "workflowSourceHref", label: "Workflow model" },
  { id: "openclaw.safety-doc", hrefBinding: "safetySourceHref", label: "Boundary document" },
  { id: "openclaw.receipt-doc", hrefBinding: "receiptSourceHref", label: "Representative receipt" },
];
const exactRuntimeCommitment =
  "The private runtime was not inspected or evaluated; this route establishes no runtime quality, capability, failure dividend, or intended user.";
const exactSocialAlt =
  "OpenClaw Showcase public documentation folio; the excluded runtime was not inspected or evaluated";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function requireText(source, value, location) {
  assert.ok(source.includes(value), `${location} must include ${JSON.stringify(value)}.`);
}

function reject(source, pattern, location, reason) {
  assert.doesNotMatch(source, pattern, `${location}: ${reason}`);
}

function between(source, start, end, location) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.ok(startIndex >= 0 && endIndex > startIndex, `${location}: bounded source region is absent.`);
  return source.slice(startIndex, endIndex);
}

function ruleBody(selectorPattern, location) {
  const match = cssSource.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, "s"));
  assert.ok(match, `${location}: required CSS rule is missing.`);
  return match[1];
}

function requireCss(body, pattern, location, requirement) {
  assert.match(body, pattern, `${location}: ${requirement}`);
}

function parseHex(value) {
  const normalized = value.replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
}

function contrast(foreground, background) {
  const luminance = (rgb) => rgb
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const a = luminance(parseHex(foreground));
  const b = luminance(parseHex(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const expectedCapabilityBoundaries = {
  eeEvidence: false,
  operational: false,
  implementedSystem: false,
  evaluatedSystem: false,
  productionReady: false,
  hardwareImplemented: false,
  runtimeInspected: false,
  currentGuidance: false,
};
const expectedSupportedEvidence = {
  problem: {
    summary: "Explain a private agent-workflow pattern publicly without disclosure drift or pretending to prove the runtime.",
    sourceIds: ["openclaw.snapshot", "openclaw.source-gate", "openclaw.safety-doc"],
  },
  decisionSupported: {
    summary: "Separate public, approval-gated, and private material so only a human decision can expand the public boundary.",
    sourceIds: ["openclaw.workflow-doc", "openclaw.safety-doc", "openclaw.source-gate"],
  },
  personalRole: {
    summary: "Author and designer of the public documentation layer only.",
    sourceIds: ["openclaw.snapshot", "openclaw.source-gate"],
  },
  implementation: {
    summary: "Eight Markdown documents, nine conceptual diagrams, a five-stage workflow model, and one sanitized representative receipt.",
    sourceIds: ["openclaw.snapshot", "openclaw.workflow-doc", "openclaw.receipt-doc"],
  },
  stack: {
    summary: "Markdown and Mermaid are the public documentation formats, not evidence of runtime technologies.",
    sourceIds: ["openclaw.snapshot", "openclaw.workflow-doc", "openclaw.source-gate"],
  },
  outcome: {
    summary: "A frozen, inspectable public documentation artifact with explicit disclosure boundaries.",
    sourceIds: ["openclaw.snapshot", "openclaw.source-gate"],
  },
  limitations: {
    summary: "The route documents a public workflow model and cannot establish anything about the excluded runtime's quality or capability.",
    sourceIds: ["openclaw.source-gate", "openclaw.safety-doc", "openclaw.receipt-doc"],
  },
  maturity: {
    summary: "Public documentation artifact at an exact frozen commit.",
    sourceIds: ["openclaw.snapshot", "openclaw.source-gate"],
  },
};
const expectedMissingReasons = {
  intendedUser: "The frozen source does not name a project-owned intended user beyond a bounded public-review context.",
  testStrategy: "The public snapshot contains no source-bound evaluation of documentation usability or runtime behavior.",
  failureDividend: "No retained source shows a failure causing a specific documentation or system change.",
  nextStep: "No source-bound current project roadmap is public.",
};
const expectedPublicSources = {
  "openclaw.snapshot": {
    href: "https://github.com/drwbkr1/openclaw-showcase/tree/3695666f6a44c095674049e64d23f0bdace2fb70",
    boundary: "Public documentation snapshot only; excluded runtime remains uninspected.",
  },
  "openclaw.workflow-doc": {
    href: "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/docs/agentic-studio-workflow.md",
    boundary: "Conceptual public workflow model, not evidence of runtime execution or enforcement.",
  },
  "openclaw.safety-doc": {
    href: "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/docs/safety-boundaries.md",
    boundary: "Documentation boundary only; not software-enforced security proof.",
  },
  "openclaw.receipt-doc": {
    href: "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/examples/sanitized-run-receipt.md",
    boundary: "Representative example, not an actual-run receipt or raw trace.",
  },
};

for (const [field, expected] of Object.entries(expectedSupportedEvidence)) {
  assert.deepEqual(
    {
      state: project.evidence[field].state,
      summary: project.evidence[field].summary,
      sourceIds: project.evidence[field].sourceIds,
    },
    { state: "supported", ...expected },
    `project-model: ${field} drifted from the independently frozen registry expectation.`,
  );
}
for (const [field, reason] of Object.entries(expectedMissingReasons)) {
  assert.deepEqual(
    { state: project.evidence[field].state, reason: project.evidence[field].reason },
    { state: "missing", reason },
    `project-model: ${field} missing-evidence reason drifted.`,
  );
}
for (const [sourceId, expected] of Object.entries(expectedPublicSources)) {
  const modelSource = getProjectSource(sourceId);
  assert.deepEqual(
    { href: modelSource.href, boundary: modelSource.claimBoundary },
    expected,
    `project-model: ${sourceId} drifted from the independently frozen registry expectation.`,
  );
}

assert.equal(project.lane, "supporting");
assert.equal(project.routeType, "supporting-field-note");
assert.equal(project.visualWorld, "disclosure-folio");
assert.deepEqual(project.capabilityBoundaries, expectedCapabilityBoundaries);
assert.deepEqual(projectSurfacePlan["openclaw-showcase"].fields.projectRoute, routeFields);
assert.deepEqual(projectSurfacePlan["openclaw-showcase"].missingFields, [
  "intendedUser",
  "testStrategy",
  "failureDividend",
  "nextStep",
]);
assert.deepEqual(projectSurfacePlan["openclaw-showcase"].featuredFailureIds.projectRoute, []);
for (const field of routeFields) {
  assert.equal(project.evidence[field].state, "supported", `${field} must remain source-supported.`);
}
for (const field of ["intendedUser", "testStrategy", "failureDividend", "nextStep"]) {
  assert.equal(project.evidence[field].state, "missing", `${field} must remain explicitly missing.`);
}

for (const [path, expectedHash] of Object.entries(expectedTargetHashes)) {
  assert.equal(sha256(readFileSync(resolve(root, path))), expectedHash, `${path}: frozen U06 target drifted.`);
}

requireText(pageSource, 'getProject("openclaw-showcase")', pagePath);
for (const field of routeFields) {
  requireText(pageSource, `getSupportedEvidence("openclaw-showcase", "${field}")`, pagePath);
}
reject(
  pageSource,
  /const\s+(?:openclaw|projectFacts|openclawFacts|evidence)\s*=\s*\{/i,
  pagePath,
  "route-local claim objects are forbidden",
);
requireText(pageSource, 'data-project-model-id={project.id}', pagePath);
requireText(pageSource, 'data-supporting-route="openclaw-showcase"', pagePath);
requireText(pageSource, 'data-visual-world="disclosure-folio"', pagePath);
assert.deepEqual(
  [...pageSource.matchAll(/data-supporting-movement="([^"]+)"/g)].map((match) => match[1]),
  movementValues,
  "OpenClaw must expose exactly three ordered supporting movements.",
);
assert.deepEqual(
  [...pageSource.matchAll(/data-route-movement="([^"]+)"/g)].map((match) => match[1]),
  movementValues,
  "Route movement hooks must match the supporting movement order.",
);

const ledgerBlock = between(pageSource, "const firstScreenLedger = [", "] as const;", pagePath);
assert.deepEqual(
  [...ledgerBlock.matchAll(/\["([^"]+)", "([^"]+)", ([^\]]+)\]/g)]
    .map((match) => [match[1], match[2], match[3].trim()]),
  expectedLedger,
  "The first-screen label, owner, and value triples must remain exact.",
);
assert.equal((pageSource.match(/data-project-field=\{field\}/g) ?? []).length, 1);
const literalOwners = [...pageSource.matchAll(/data-project-field="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(literalOwners, ["maturity", "stack"]);
assert.deepEqual(
  [...expectedLedger.map(([, field]) => field), ...literalOwners].sort(),
  [...routeFields].sort(),
  "Every supported field must have exactly one route owner.",
);
assert.match(
  pageSource,
  /<span\s+data-project-field="maturity">\{maturity\.summary\}<\/span>/,
  `${pagePath}: maturity must own its exact canonical value.`,
);
const movementTwo = between(
  pageSource,
  'data-supporting-movement="workflow-receipt-anatomy"',
  'data-supporting-movement="boundary-source-folio"',
  pagePath,
);
assert.match(
  movementTwo,
  /data-project-field="stack"[\s\S]*?\{stack\.summary\}/,
  `${pagePath}: stack must be owned inside movement two.`,
);

const layerBlock = between(pageSource, "const disclosureLayers = [", "] as const;", pagePath);
const parsedLayers = [...layerBlock.matchAll(
  /\{\s*id:\s*"([^"]+)",\s*number:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*status:\s*"([^"]+)",\s*contentsLabel:\s*"([^"]+)",\s*contents:\s*\[([\s\S]*?)\],\s*boundary:\s*"([^"]+)",?\s*\}/g,
)].map((match) => ({
  id: match[1],
  number: match[2],
  label: match[3],
  status: match[4],
  contentsLabel: match[5],
  contents: [...match[6].matchAll(/"([^"]+)"/g)].map((item) => item[1]),
  boundary: match[7],
}));
assert.deepEqual(parsedLayers, expectedLayers, "The three disclosure records must remain exact and ordered.");
assert.equal(parsedLayers.flatMap(({ contents }) => contents).length, 12,
  "The disclosure register must retain exactly twelve decisive content items.");
assert.equal(parsedLayers.filter(({ boundary }) => boundary.length > 0).length, 3,
  "Every disclosure layer must retain one exact boundary.");
assert.equal((pageSource.match(/<details\b/g) ?? []).length, 1,
  "The three native details must come from one fixed disclosure template.");
requireText(pageSource, "disclosureLayers.map", pagePath);
requireText(pageSource, "data-disclosure-layer={layer.id}", pagePath);
assert.match(pageSource, /<details\s+data-disclosure-layer=\{layer\.id\}\s+open\s+key=\{layer\.id\}/,
  `${pagePath}: all independent disclosure layers must begin open for complete print and wide-screen reading.`);
reject(pageSource, /<details[^>]*\bname\s*=/s, pagePath,
  "disclosures must remain independent and cannot share an accordion name");
reject(pageSource, /<details[^>]*(?:onToggle|onClick|onChange)\s*=/s, pagePath,
  "native disclosure behavior must not be replaced by handlers");

const workflowBlock = between(pageSource, "const workflowStages = [", "] as const;", pagePath);
assert.deepEqual(
  [...workflowBlock.matchAll(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g)]
    .map((match) => [match[1], match[2], match[3]]),
  expectedWorkflow,
  "The five conceptual workflow descriptions must remain exact and ordered.",
);
requireText(pageSource, "data-conceptual-workflow", pagePath);
requireText(pageSource, 'getPublicSourceHref("openclaw.workflow-doc")', pagePath);
assert.equal((pageSource.match(/workflowStages\.map/g) ?? []).length, 1);
assert.equal(project.evidence.implementation.summary,
  "Eight Markdown documents, nine conceptual diagrams, a five-stage workflow model, and one sanitized representative receipt.");

const receiptBlock = between(pageSource, "const receiptFields = [", "] as const;", pagePath);
assert.deepEqual(
  [...receiptBlock.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)]
    .map((match) => [match[1], match[2]]),
  expectedReceipt,
  "The five representative receipt fields must remain exact and ordered.",
);
assert.match(
  pageSource,
  /<figure[\s\S]*?data-receipt-anatomy[\s\S]*?data-source-id="openclaw\.receipt-doc"[\s\S]*?<figcaption>[\s\S]*?Sanitized representative example[\s\S]*?not a raw export, actual-run receipt, or proof[\s\S]*?runtime behavior\.[\s\S]*?<\/figcaption>[\s\S]*?<\/figure>/,
  `${pagePath}: the native receipt figure must own its exact source and warnings.`,
);
assert.equal((pageSource.match(/receiptFields\.map/g) ?? []).length, 1);

const sourceBlock = between(pageSource, "const sourceFolio = [", "] as const;", pagePath);
const parsedSources = [...sourceBlock.matchAll(
  /\{\s*id:\s*"([^"]+)",\s*href:\s*([A-Za-z][A-Za-z0-9]*),\s*label:\s*"([^"]+)",\s*boundary:\s*getProjectSource\("([^"]+)"\)\.claimBoundary,?\s*\}/g,
)].map((match) => ({ id: match[1], hrefBinding: match[2], label: match[3], boundarySourceId: match[4] }));
assert.deepEqual(
  parsedSources,
  expectedSources.map((source) => ({ ...source, boundarySourceId: source.id })),
  "The source folio object order, labels, href bindings, and canonical boundary owners must remain exact.",
);
for (const { id, hrefBinding } of expectedSources) {
  const source = getProjectSource(id);
  assert.equal(source.availability, "public", `${id} must remain public.`);
  assert.ok("href" in source, `${id} must remain linkable.`);
  requireText(pageSource, `const ${hrefBinding} = getPublicSourceHref("${id}")`, pagePath);
  assert.equal(source.claimBoundary, expectedPublicSources[id].boundary);
}
assert.match(
  pageSource,
  /sourceFolio\.map\(\(source, index\) => \([\s\S]*?<a href=\{source\.href\} data-source-id=\{source\.id\}[\s\S]*?<strong>\{source\.label\}<\/strong>[\s\S]*?<small>\{source\.boundary\}<\/small>[\s\S]*?<\/a>/,
  `${pagePath}: every rendered source link must own its canonical boundary.`,
);
for (const value of [
  "original code-native composition",
  "copies no source-project badge",
  "commit email metadata",
  "third-party asset",
]) {
  requireText(pageSource, value, pagePath);
}
assert.match(pageSource, /private-derived\s+material/, `${pagePath}: private-derived material boundary is missing.`);
assert.match(pageSource, /no\s+detected license/, `${pagePath}: no-license boundary is missing.`);
assert.match(pageSource, /not general reuse permission/, `${pagePath}: reuse boundary is missing.`);

const renderedBody = pageSource.slice(pageSource.indexOf("export default function"));
assert.doesNotMatch(pageSource.trimStart(), /^(?:"use client"|'use client')\s*;?/,
  `${pagePath}: the full route must remain a server component.`);
const boundaryPanel = between(pageSource, '<div className={styles.boundaryPanel}', '</div>', pagePath)
  .replace(/\s+/g, " ");
requireText(boundaryPanel, exactRuntimeCommitment, `${pagePath} visible boundary panel`);
for (const [pattern, reason] of [
  [/\b(?:fetch|setTimeout|setInterval|requestAnimationFrame)\s*\(/, "runtime requests, timers, and animation loops are forbidden"],
  [/\b(?:XMLHttpRequest|WebSocket|EventSource)\b/, "runtime network clients are forbidden"],
  [/\bon(?:Click|Change|Input|Submit|Toggle|KeyDown|KeyUp|PointerDown|PointerUp)\s*=/, "event handlers are forbidden"],
  [/<\s*(?:form|input|button|select|textarea|canvas|video|audio|img|iframe|object|embed)\b/i, "forms, controls, embeds, runtime UI, and media elements are forbidden"],
  [/\brole\s*=\s*["'](?:application|log|status|progressbar)["']/i, "runtime-interface roles are forbidden"],
  [/data-runtime-ui|data-evidence-id|data-failure-dividend|data-failure-record/i, "runtime and positive failure hooks are forbidden"],
  [/CaseChapterDisclosure|data-case-chapter|chapterIndex|caseNavigation|Adjacent portfolio case studies/i, "flagship shell vocabulary is forbidden"],
  [/from\s+["']next\/image["']/, "raster rendering is forbidden"],
]) {
  reject(renderedBody, pattern, pagePath, reason);
}
reject(
  renderedBody,
  /\b(?:implemented|evaluated|tested|benchmarked|deployed|production-ready|autonomous|reliable|secure)\s+(?:private|excluded)?\s*runtime\b/i,
  pagePath,
  "positive excluded-runtime claims are forbidden",
);

reject(cssSource, /#[0-9a-f]{3,8}\b|rgba?\s*\(|hsla?\s*\(/i, cssPath,
  "route CSS must use shared palette tokens");
reject(cssSource, /url\s*\(/i, cssPath, "CSS imagery is forbidden");
reject(cssSource, /position\s*:\s*sticky/i, cssPath, "sticky flagship rails are forbidden");
reject(cssSource, /\b(?:88|100)s?vh\b|\b(?:svh|dvh|lvh)\b/i, cssPath,
  "viewport-filling shells are forbidden");
reject(cssSource, /overflow\s*:\s*hidden/i, cssPath, "blanket clipping is forbidden");

const localDeclarations = [...cssSource.matchAll(/(--folio-[a-z0-9-]+)\s*:\s*([^;]+);/gi)];
assert.ok(localDeclarations.length > 0, "OpenClaw semantic aliases are missing.");
for (const [, alias, value] of localDeclarations) {
  assert.match(value.trim(), /^var\(--[a-z0-9-]+\)$/i, `${alias}: aliases may only reference shared tokens.`);
}
const globalVariables = new Set(
  [...globalCss.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
);
const localVariables = new Set(localDeclarations.map((match) => match[1]));
const usedVariables = new Set(
  [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]),
);
assert.deepEqual(
  [...usedVariables].filter((name) => !globalVariables.has(name) && !localVariables.has(name)),
  [],
  "OpenClaw route CSS uses an undefined token.",
);

const h1Rule = ruleBody("\\.hero h1", ".hero h1");
requireCss(h1Rule, /font-size\s*:\s*clamp\(3rem,\s*5\.5vw,\s*4\.5rem\)\s*;/,
  ".hero h1", "supporting h1 must stay between 2.75rem and 4.5rem");
requireCss(h1Rule, /letter-spacing\s*:\s*-0\.03em\s*;/,
  ".hero h1", "tracking must be no tighter than -0.03em");
requireCss(h1Rule, /line-height\s*:\s*(?:0\.9[89]|[1-9](?:\.\d+)?)\s*;/,
  ".hero h1", "line height must be at least 0.98");
const h2Rule = ruleBody("\\.movementLead h2,[\\s\\S]*?\\.movementHeader h2", "movement h2 rules");
requireCss(h2Rule, /font-size\s*:\s*clamp\([^;]+,\s*3\.5rem\)\s*;/,
  "movement h2 rules", "supporting h2 must cap at 3.5rem");
requireCss(h2Rule, /letter-spacing\s*:\s*-0\.03em\s*;/,
  "movement h2 rules", "tracking must be no tighter than -0.03em");
requireCss(h2Rule, /line-height\s*:\s*(?:0\.9[89]|[1-9](?:\.\d+)?)\s*;/,
  "movement h2 rules", "line height must be at least 0.98");

for (const [selector, label] of [
  ["\\.firstScreenLedger dd", "first-screen evidence"],
  ["\\.movementLead > p:last-child,[\\s\\S]*?\\.movementHeader > p", "movement prose"],
  ["\\.layerBody li", "disclosure contents"],
  ["\\.layerBoundary", "disclosure boundary"],
  ["\\.formatBoundary", "format boundary"],
  ["\\.conceptualWorkflow li p", "workflow prose"],
  ["\\.workflowBoundary", "workflow boundary"],
  ["\\.receiptAnatomy > header > p:last-child", "receipt introduction"],
  ["\\.receiptPaper dd", "receipt fields"],
  ["\\.receiptWarnings dd", "receipt warnings"],
  ["\\.boundaryPanel li", "claim boundaries"],
  ["\\.missingBoundary", "missing-evidence boundary"],
  ["\\.rightsNote", "rights boundary"],
]) {
  const rule = ruleBody(selector, label);
  requireCss(rule, /font-size\s*:\s*(?:clamp\(1(?:\.\d+)?rem,[^;]+|(?:1(?:\.\d+)?|[2-9](?:\.\d+)?)rem)\s*(?:!important)?\s*;/,
    label, "body and evidence prose must be at least 1rem");
  requireCss(rule, /line-height\s*:\s*(?:1\.[6-9]\d*|[2-9](?:\.\d+)?)\s*(?:!important)?\s*;/,
    label, "body and evidence prose needs line-height at least 1.6");
}
for (const [selector, label] of [
  ["\\.kicker,[\\s\\S]*?\\.movementLabel", "movement labels"],
  ["\\.firstScreenLedger dt", "first-screen labels"],
  ["\\.layerRegister summary > span", "disclosure numbers"],
  ["\\.layerRegister summary em", "disclosure statuses"],
  ["\\.layerContentsLabel", "disclosure content labels"],
  ["\\.modelWarning", "workflow warning"],
  ["\\.receiptPaper dt", "receipt labels"],
  ["\\.receiptWarnings dt", "receipt warning labels"],
  ["\\.sourceFolio a > span", "source numbers"],
  ["\\.sourceFolio a > small", "source boundaries"],
]) {
  requireCss(ruleBody(selector, label), /font-size\s*:\s*(?:0\.8(?:125|[2-9]\d*)|[1-9](?:\.\d+)?)rem\s*;/,
    label, "essential metadata must be at least 0.8125rem");
}
for (const [selector, label] of [
  ["\\.disclosureMovement", "disclosure movement"],
  ["\\.workflowMovement", "workflow movement"],
  ["\\.boundaryMovement", "boundary movement"],
]) {
  assert.match(
    cssSource,
    new RegExp(`${selector}\\s*\\{[^}]*padding\\s*:\\s*clamp\\(3rem,[^,]+,\\s*5rem\\)`, "s"),
    `${label}: outer movement padding must remain between 3rem and 5rem`,
  );
}
const focusRule = ruleBody("\\.page a:focus-visible,[\\s\\S]*?\\.page summary:focus-visible", "focus rules");
requireCss(focusRule, /outline\s*:\s*3px\s+solid\s+var\(--folio-attention\)\s*;/,
  "focus rules", "focus ring must be at least 3px");
requireCss(focusRule, /outline-offset\s*:\s*4px\s*;/,
  "focus rules", "focus offset must be at least 4px");
requireText(cssSource, ".layerRegister summary::marker", cssPath);
requireText(cssSource, ".layerRegister details[open] summary", cssPath);
requireText(cssSource, "@media (prefers-reduced-motion: reduce)", cssPath);
requireText(cssSource, "@media (forced-colors: active)", cssPath);
const printRule = cssSource.slice(cssSource.lastIndexOf("@media print {"));
for (const value of [
  ".layerRegister details:not([open]) > :not(summary)",
  ".layerRegister details::details-content",
  "content-visibility: visible !important",
  "display: block",
  ".returnLink",
  "display: none",
  'content: " [" attr(href) "]"',
]) {
  requireText(printRule, value, `${cssPath} print rules`);
}
assert.match(
  printRule,
  /\.missingBoundary\s*\{[^}]*color:\s*var\(--folio-ink\)\s*!important;/s,
  `${cssPath}: print must restore the missing-boundary copy to the canonical ink contrast.`,
);

assert.equal(openclawMedia.source_boundary.public_snapshot_commit,
  "3695666f6a44c095674049e64d23f0bdace2fb70");
assert.equal(openclawMedia.source_boundary.public_snapshot_tree,
  "f7629e844aa1e93be622a0b7a9307afd7b3beab5");
assert.deepEqual(openclawMedia.assets, []);
assert.equal(openclawMedia.code_native_surfaces.length, 1);
assert.equal(openclawMedia.code_native_surfaces[0].implementation, ogPath);
assert.match(openclawMedia.code_native_surfaces[0].reuse_basis,
  /no source-project badge, image, private-derived material, or third-party asset was copied/i);
requireText(pageSource, exactSocialAlt, pagePath);
requireText(ogSource, exactSocialAlt, ogPath);
const expectedOgColors = [
  "#222222", "#314E54", "#48513F", "#5F5F5F", "#7A3828", "#C7CDBF",
  "#CB7A5C", "#E9E2D8", "#F7F3ED", "#FFFFFF",
];
const ogColors = [...ogSource.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0].toUpperCase());
assert.ok(ogColors.length > 0, "OpenClaw social image must define its static palette.");
assert.deepEqual([...new Set(ogColors)].sort(), expectedOgColors,
  "OpenClaw social image must use the exact canonical U06 palette.");
reject(ogSource, /#F0C5B4/i, ogPath, "the superseded pale-terracotta color is forbidden");
reject(ogSource, /\b(?:rgb|rgba|hsl|hsla)\s*\(/i, ogPath,
  "social-image colors must remain exact canonical hex values");
const ogLayerBlock = between(ogSource, "const layers = [", "] as const;", ogPath);
const parsedOgLayers = [...ogLayerBlock.matchAll(
  /\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"(#[0-9A-Fa-f]{6})",\s*"(#[0-9A-Fa-f]{6})"\]/g,
)].map((match) => [match[1], match[2], match[3], match[4].toUpperCase(), match[5].toUpperCase()]);
assert.deepEqual(parsedOgLayers, [
  ["01", "PUBLIC", "workflow · review · limits", "#C7CDBF", "#222222"],
  ["02", "APPROVAL-GATED", "interpretation · release · claims", "#CB7A5C", "#222222"],
  ["03", "NOT INSPECTED", "excluded runtime · no capability claim", "#314E54", "#FFFFFF"],
], "OpenClaw social-image layer tuples must remain exact and ordered.");
const numberColorBranch = ogSource.match(
  /color:\s*index === 2 \? "(#[0-9A-Fa-f]{6})" : index === 1 \? "(#[0-9A-Fa-f]{6})" : "(#[0-9A-Fa-f]{6})",/,
);
assert.ok(numberColorBranch, "OpenClaw social-image layer-number color branches are missing.");
const layerNumberColors = [numberColorBranch[3], numberColorBranch[2], numberColorBranch[1]]
  .map((color) => color.toUpperCase());
assert.deepEqual(layerNumberColors, ["#7A3828", "#222222", "#C7CDBF"],
  "Layer-number colors must map exactly to public, approval-gated, and private layers.");
for (const [index, [, label, , background, textColor]] of parsedOgLayers.entries()) {
  assert.ok(contrast(textColor, background) >= 4.5,
    `${label} text ${textColor} on ${background} must meet normal-text contrast.`);
  assert.ok(contrast(layerNumberColors[index], background) >= 4.5,
    `${label} number ${layerNumberColors[index]} on ${background} must meet normal-text contrast.`);
}
for (const [foreground, background] of [
  ["#314E54", "#F7F3ED"],
  ["#48513F", "#F7F3ED"],
  ["#5F5F5F", "#F7F3ED"],
  ["#7A3828", "#E9E2D8"],
]) {
  assert.ok(contrast(foreground, background) >= 4.5,
    `${foreground} on ${background} must meet normal-text contrast.`);
}
for (const value of ["NOT INSPECTED", "excluded runtime", "no capability claim"]) {
  requireText(ogSource, value, ogPath);
}

assert.equal(
  packageJson.scripts["verify:openclaw-u06"],
  "node --experimental-strip-types scripts/verify-openclaw-u06.mjs",
  "package.json must expose the U06 verifier.",
);
assert.match(
  packageJson.scripts.check,
  /verify:quest-u05\s+&&\s+npm run verify:openclaw-u06\s+&&\s+npm run verify:media/,
  "The U06 verifier must run after Quest and before media verification.",
);
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site");
for (const requiredPath of [
  pagePath,
  cssPath,
  ogPath,
  mediaPath,
  "scripts/verify-openclaw-u06.mjs",
  "tests/portfolio.spec.ts",
]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from explicit public files.`);
}
assert.ok(publicAllowlist.script_files.includes("scripts/verify-openclaw-u06.mjs"),
  "The U06 verifier is absent from script_files.");

console.log(JSON.stringify({
  status: "pass",
  project: project.id,
  lane: project.lane,
  visualWorld: project.visualWorld,
  movements: movementValues,
  routeFields,
  disclosureLayers: expectedLayers.map(({ id }) => id),
  workflowStages: expectedWorkflow.map(([, label]) => label),
  receiptFields: expectedReceipt.map(([label]) => label),
  sources: expectedSources.map(({ id }) => id),
  targetHashes: expectedTargetHashes,
}));
