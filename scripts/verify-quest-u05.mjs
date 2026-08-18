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
import questMedia from "../public/media/projects/quest-craft/sources.json" with { type: "json" };

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pagePath = "app/work/quest-craft/page.tsx";
const cssPath = "app/work/quest-craft/page.module.css";
const mediaPath = "public/media/projects/quest-craft/sources.json";
const socialPath = "public/media/projects/quest-craft/social-preview.jpg";
const pageSource = readFileSync(resolve(root, pagePath), "utf8");
const cssSource = readFileSync(resolve(root, cssPath), "utf8");
const globalCss = readFileSync(resolve(root, "app/globals.css"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const publicAllowlist = JSON.parse(
  readFileSync(resolve(root, "scripts/public-candidate-allowlist.json"), "utf8"),
);
const project = getProject("quest-craft");

const routeFields = [
  "problem",
  "intendedUser",
  "decisionSupported",
  "personalRole",
  "implementation",
  "testStrategy",
  "outcome",
  "failureDividend",
  "limitations",
  "maturity",
];
const movementValues = [
  "agency-score",
  "evaluation-corrections",
  "evidence-limits-sources",
];
const beatValues = ["honor", "effect", "return", "carry"];
const expectedBeats = [
  ["honor", "01", "Honor the choice", "Honor", "The completed player action remains true."],
  ["effect", "02", "Show the effect", "Effect", "The immediate result becomes playable."],
  ["return", "03", "Return agency", "Return", "A meaningful decision goes back to the players."],
  ["carry", "04", "Carry consequence", "Carry", "Later pressure stays open and non-punitive."],
];
const expectedRows = [
  ["A1", "Expected gameplay"],
  ["A2", "Expected gameplay"],
  ["A3", "Expected gameplay"],
  ["B1", "Agency stress"],
  ["B2", "Agency stress"],
  ["B3", "Agency stress"],
  ["C1", "Youth suitability"],
  ["C2", "Youth suitability"],
  ["C3", "Youth suitability"],
  ["D1", "Privacy and facilitator authority"],
  ["D2", "Privacy and facilitator authority"],
  ["D3", "Privacy and facilitator authority"],
];
const exactAlt =
  "Quest Craft editorial social card: one slate-teal input branches into three paper ribbons above a separate olive authority rail, with the line The story branches. Authority does not.";

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

function jpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff, "Expected a JPEG SOI marker.");
  assert.equal(buffer[1], 0xd8, "Expected a JPEG SOI marker.");
  let offset = 2;
  while (offset < buffer.length) {
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const segmentLength = buffer.readUInt16BE(offset);
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]
      .includes(marker);
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  throw new Error("JPEG dimensions were not found.");
}

assert.equal(project.lane, "supporting");
assert.equal(project.routeType, "supporting-field-note");
assert.equal(project.visualWorld, "branching-manuscript");
assert.equal(project.capabilityBoundaries.runtimeInspected, false);
assert.deepEqual(projectSurfacePlan["quest-craft"].missingFields, ["stack", "nextStep"]);
assert.deepEqual(projectSurfacePlan["quest-craft"].fields.projectRoute, routeFields);
for (const field of routeFields) {
  assert.equal(project.evidence[field].state, "supported", `${field} must remain source-supported.`);
}
assert.equal(project.evidence.stack.state, "missing");
assert.equal(project.evidence.nextStep.state, "missing");

const expectedCorrections = [
  {
    id: "QC.F01",
    failure: "Unrelated setting facts appeared in generated paths.",
    buildChange: "Narrow the grounding instructions and rerun the affected scenario.",
    earnedCapability: "The corrected release suite retained setting-grounded output under the fixed rubric.",
    boundary: "One fixed synthetic suite does not establish general grounding reliability.",
    sourceIds: ["quest.attempts", "quest.results"],
  },
  {
    id: "QC.F02",
    failure: "Softened mockery still centered a young rival's embarrassment.",
    buildChange: "Tighten youth-suitability instructions and exclude superseded passing rows.",
    earnedCapability: "The corrected release suite records the revised behavior and preserves the failed attempts.",
    boundary: "Does not establish general child safety or developmental suitability.",
    sourceIds: ["quest.attempts", "quest.results"],
  },
];
assert.deepEqual(
  project.evidence.failureDividend.value.map((record) => ({
    id: record.id,
    failure: record.failure,
    buildChange: record.buildChange,
    earnedCapability: record.earnedCapability,
    boundary: record.boundary,
    sourceIds: [...record.sourceIds],
  })),
  expectedCorrections,
);

for (const sourceId of [
  "quest.snapshot",
  "quest.results",
  "quest.attempts",
  "quest.guardrails",
  "quest.readme-ai-use",
]) {
  const source = getProjectSource(sourceId);
  assert.equal(source.availability, "public", `${sourceId} must remain public.`);
  assert.ok("href" in source, `${sourceId} must remain linkable.`);
}
assert.equal(
  getProjectSource("quest.snapshot").immutableIdentity,
  "commit bc14c43840aabb11ca35e94df0c8682672f24f3c; tree 01d7e8a0051d4b226e8e0232b5e4ab8f87105964",
);
assert.equal(
  getProjectSource("quest.readme-ai-use").href,
  "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/README.md#8-ai-use-memo",
  "Quest Craft AI-use evidence must target the exact published README heading.",
);

requireText(pageSource, "getProject(\"quest-craft\")", pagePath);
for (const field of routeFields.filter((field) => field !== "failureDividend")) {
  requireText(
    pageSource,
    `getSupportedEvidence(\"quest-craft\", \"${field}\")`,
    pagePath,
  );
}
requireText(pageSource, "const corrections = project.evidence.failureDividend.value;", pagePath);
reject(
  pageSource,
  /const\s+(?:quest|projectFacts|questFacts|evidence)\s*=\s*\{/i,
  pagePath,
  "route-local Quest claim objects are forbidden",
);

requireText(pageSource, "data-supporting-route=\"quest-craft\"", pagePath);
requireText(pageSource, "data-visual-world=\"branching-manuscript\"", pagePath);
const declaredMovements = [...pageSource.matchAll(/data-supporting-movement="([^"]+)"/g)]
  .map((match) => match[1]);
assert.deepEqual(declaredMovements, movementValues, "Quest must expose exactly three ordered movements.");

const firstScreenBlock = between(pageSource, "const firstScreenLedger = [", "] as const;", pagePath);
const firstScreenFields = [...firstScreenBlock.matchAll(/\[\s*"[^"]+"\s*,\s*"([^"]+)"/g)]
  .map((match) => match[1]);
assert.deepEqual(firstScreenFields, [
  "problem",
  "intendedUser",
  "personalRole",
  "implementation",
  "outcome",
  "limitations",
]);
assert.equal(
  (pageSource.match(/data-project-field=\{field\}/g) ?? []).length,
  1,
  "The first-screen projection must emit one field hook per ledger record.",
);
const literalFieldHooks = [...pageSource.matchAll(/data-project-field="([^"]+)"/g)]
  .map((match) => match[1]);
assert.deepEqual(
  [...firstScreenFields, ...literalFieldHooks].sort(),
  [...routeFields].sort(),
  "Quest route field hooks must project the exact canonical ten-field set once each.",
);
assert.match(
  pageSource,
  /<p\s+className=\{styles\.authorityStatement\}\s+data-project-field="decisionSupported"\s*>\s*\{decisionSupported\.summary\}\s*<\/p>/,
  `${pagePath}: decisionSupported must own the exact canonical summary node.`,
);
reject(
  pageSource,
  /className=\{styles\.authorityRail\}[^>]*data-project-field="decisionSupported"/,
  pagePath,
  "the shortened authority rail must not impersonate the canonical decision field",
);

for (const forbidden of [
  /CaseChapterDisclosure/,
  /ProjectFactLedger/,
  /chapterIndex|caseNavigation/i,
  /data-case-chapter/i,
  /data-failure-dividend/i,
  /data-governed-figure/i,
  /Adjacent portfolio case studies/i,
  /previous project|next project/i,
]) {
  reject(pageSource, forbidden, pagePath, "flagship and chapter-shell vocabulary is forbidden");
}
reject(pageSource, /from\s+["']next\/image["']|<\s*(?:Image|img)\b/, pagePath,
  "the route must not render raster media");
reject(pageSource, /<\s*(?:canvas|video|audio)\b/, pagePath,
  "canvas and media runtime surfaces are forbidden");
reject(pageSource, /\bQC\.F0[12]\b/, pagePath,
  "opaque correction identifiers must remain data attributes supplied by the model");

reject(pageSource, /^(?:["'])use client(?:["']);/m, pagePath, "the route must remain a server component");
reject(pageSource, /\b(?:useState|useEffect|useReducer|useRef|useTransition)\s*\(/, pagePath,
  "client-side runtime state is forbidden");
reject(pageSource, /\bfetch\s*\(|\bset(?:Timeout|Interval)\s*\(|\brequestAnimationFrame\s*\(/, pagePath,
  "runtime requests, timers, and animation loops are forbidden");
reject(pageSource, /\bon(?:Click|Change|Input|Submit|KeyDown|KeyUp|PointerDown|PointerUp)\s*=/, pagePath,
  "event handlers are forbidden");
reject(pageSource, /<\s*form\b|\baction\s*=/i, pagePath,
  "the native score must not submit or invoke generation");

const beatBlock = between(pageSource, "const beats = [", "] as const;", pagePath);
const declaredBeats = [...beatBlock.matchAll(
  /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g,
)].map((match) => match.slice(1));
assert.deepEqual(declaredBeats, expectedBeats, "Quest must expose the exact four ordered editorial beats.");
for (const [, , , , definition] of expectedBeats) {
  assert.equal(
    pageSource.split(definition).length - 1,
    1,
    `${pagePath}: each long beat definition must occur exactly once in the route source.`,
  );
}
assert.equal((pageSource.match(/data-beat-definition=/g) ?? []).length, 1,
  "The four beat explanations must come from one fixed definition template.");
assert.equal((pageSource.match(/data-path-trace=/g) ?? []).length, 1,
  "The three compact paths must come from one fixed trace template.");
requireText(pageSource, "{beats.map(([beat, number, , shortLabel]) => (", pagePath);
requireText(pageSource, "<strong>{shortLabel}</strong>", pagePath);
const pathTraceBlock = between(
  pageSource,
  '<div className={styles.branchingManuscript}>',
  '<p className={styles.authorityRail}>',
  pagePath,
);
reject(pathTraceBlock, /<p>\{note\}<\/p>/, pagePath,
  "Compact path traces must not repeat the four beat explanations.");
reject(pathTraceBlock, /\{(?:note|label)\}|data-beat-definition/, pagePath,
  "Compact traces may render only the number and short beat label.");
assert.match(
  pathTraceBlock,
  /\{\["A", "B", "C"\]\.map\(\(path\) => \([\s\S]*?data-path-trace=\{path\}[\s\S]*?\{beats\.map\(\(\[beat, number, , shortLabel\]\) => \([\s\S]*?data-beat=\{beat\}[\s\S]*?<span>\{number\}<\/span>[\s\S]*?<strong>\{shortLabel\}<\/strong>/,
  `${pagePath}: paths A/B/C must each render the exact ordered four-beat compact trace.`,
);
assert.equal((pageSource.match(/type="radio"/g) ?? []).length, 1,
  "The four radios must come from one fixed native-radio template.");
requireText(pageSource, 'name="quest-beat"', pagePath);
requireText(pageSource, "defaultChecked={beat === \"honor\"}", pagePath);
requireText(cssSource, ":has(input:checked)", cssPath);
for (const beat of beatValues) {
  requireText(cssSource, `:has(input[value=\"${beat}\"]:checked)`, cssPath);
  requireText(cssSource, `[data-beat=\"${beat}\"]`, cssPath);
}
const selectedTraceMarker = ruleBody(
  "\\.agencyScore:has\\(input\\[value=\"honor\"\\]:checked\\) \\.pathBeat\\[data-beat=\"honor\"\\]::after,[\\s\\S]*?\\.agencyScore:has\\(input\\[value=\"carry\"\\]:checked\\) \\.pathBeat\\[data-beat=\"carry\"\\]::after",
  "selected trace marker",
);
requireCss(selectedTraceMarker, /content\s*:\s*[^;]+;/, "selected trace marker",
  "checked traces need an explicit non-color marker");

const rowBlock = between(pageSource, "const evaluationRows = [", "] as const;", pagePath);
const declaredRows = [...rowBlock.matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)]
  .map((match) => [match[1], match[2]]);
assert.deepEqual(declaredRows, expectedRows, "The fixed suite must retain exactly twelve scenarios.");
assert.equal((pageSource.match(/<table\b/g) ?? []).length, 1, "Quest must use one evaluation table.");
requireText(pageSource, "evaluationRows.map", pagePath);
requireText(pageSource, "{[1, 2, 3].map", pagePath);
requireText(pageSource, 'const isLocalRejection = scenario === "D1";', pagePath);
requireText(pageSource, 'data-kind={isLocalRejection ? "rejected" : "generated"}', pagePath);
requireText(pageSource, "Local reject", pagePath);
requireText(pageSource, "model not called", pagePath);
for (const value of ["12", "36", "33", "360 / 360", "Six failed or superseded attempts"]) {
  requireText(pageSource, value, pagePath);
}
assert.match(
  pageSource,
  /<p\s+className=\{styles\.evaluationSummary\}>\s*Twelve scenarios yielded 36 retained rows: 33 model generations and three local\s+rejections where the model was not called\. Human review recorded 360 \/ 360 passing\s+cells in this bounded frozen suite\.\s*<\/p>/,
  `${pagePath}: evaluation metrics must stay one exact narrative summary.`,
);
reject(pageSource, /<dl\s+className=\{styles\.evaluationSummary\}|evaluationSummary\.map/, pagePath,
  "the supporting evaluation must not become a trophy-metric grid");
assert.equal(expectedRows.length * 3, 36);
assert.equal(expectedRows.filter(([scenario]) => scenario !== "D1").length * 3, 33);
assert.equal(expectedRows.filter(([scenario]) => scenario === "D1").length * 3, 3);
assert.equal(project.evidence.outcome.summary,
  "The reviewer snapshot retains 36 rows: 33 model generations, three local privacy rejections, six failed or superseded attempts, and two behavior corrections.");
reject(pageSource, /36\s+(?:model\s+)?(?:runs|generations)/i, pagePath,
  "36 retained rows must never be relabeled as model calls");

for (const stage of ["failure", "buildChange", "earnedCapability", "boundary"]) {
  requireText(pageSource, `{correction.${stage}}`, pagePath);
}
requireText(pageSource, 'data-source-id="quest.attempts"', pagePath);
requireText(pageSource, 'data-source-id="quest.results"', pagePath);
assert.match(
  pageSource,
  /corrections\.map[\s\S]*?<article\s+data-evidence-id=\{correction\.id\}[\s\S]*?<footer>[\s\S]*?quest\.attempts[\s\S]*?quest\.results[\s\S]*?<\/footer>[\s\S]*?<\/article>/,
  `${pagePath}: each correction must own its attempts and results sources.`,
);
reject(pageSource, /const\s+retainedAttempts\s*=|retainedAttempts\.map|<ol>[\s\S]*?Grounding miss/i,
  pagePath, "retained attempts may not be route-local numbered claim data");
assert.match(
  pageSource,
  /<p\s+className=\{styles\.attemptSummary\}>\s*<a\s+href=\{attemptsHref\}\s+data-source-id="quest\.attempts">[\s\S]*?one grounding miss[\s\S]*?two youth-suitability misses[\s\S]*?one invalid service or fallback rerun[\s\S]*?two\s+passes excluded for a superseded prompt[\s\S]*?<\/a>\s*<\/p>/i,
  `${pagePath}: the retained-attempt aggregate must be source-owned.`,
);

assert.equal(project.evidence.intendedUser.summary,
  "An adult Game Master facilitating players ages 9 to 12; the adult retains final authority.");
assert.equal(project.evidence.limitations.summary,
  "A bounded public reviewer snapshot, not the private canonical implementation or a general safety result.");
for (const value of [
  "adult Game Master",
  "ages 9 to 12",
  "private canonical implementation",
  "general child safety",
  "not proof of production maturity",
]) {
  const modelAndPage = `${JSON.stringify(project)}\n${pageSource}`;
  assert.match(modelAndPage, new RegExp(value, "i"), `${value}: required Quest boundary is missing.`);
}
const renderedBody = pageSource.slice(pageSource.indexOf("export default function"));
reject(
  renderedBody,
  /\b(?:Next\.js|React|OpenAI|Anthropic|Claude|Gemini|GPT-?\d*|Vercel|Supabase|Firebase|Postgres(?:QL)?)\b/i,
  pagePath,
  "named framework, provider, host, or persistence claims are unauthorized",
);
reject(
  renderedBody
    .replace(/\bnot production-ready\b/gi, "")
    .replace(/\bnot proof of production maturity\b/gi, "")
    .replace(/\bdoes not establish general child safety\b/gi, ""),
  /\b(?:is|are|remains?|establish(?:es|ed)?)\s+(?:production[- ]ready|safe for children|secure by design|compliant|zero[- ]retention|injection[- ]proof)\b/i,
  pagePath,
  "positive safety, security, compliance, or maturity claims are unauthorized",
);

assert.equal(questMedia.source_boundary.review_snapshot_commit,
  "bc14c43840aabb11ca35e94df0c8682672f24f3c");
assert.equal(questMedia.source_boundary.review_snapshot_tree,
  "01d7e8a0051d4b226e8e0232b5e4ab8f87105964");
assert.equal(questMedia.assets.length, 1);
const asset = questMedia.assets[0];
assert.deepEqual(
  {
    path: asset.path,
    status: asset.status,
    sha256: asset.sha256,
    bytes: asset.bytes,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
  },
  {
    path: "/media/projects/quest-craft/social-preview.jpg",
    status: "approved_for_public_personal_portfolio",
    sha256: "1ca659804462c6d4036408061f7c0e1ccbe32da4246085c44c958c48ccc23f5a",
    bytes: 146283,
    width: 1200,
    height: 630,
    alt: exactAlt,
  },
);
assert.equal(
  asset.reuse_basis,
  "Owner-directed original portfolio asset approved for public display in Drew Baker's personal portfolio; no source-project or third-party visual asset was supplied, reproduced, or authorized by this record.",
);
const socialBytes = readFileSync(resolve(root, socialPath));
assert.equal(socialBytes.length, asset.bytes);
assert.equal(sha256(socialBytes), asset.sha256);
assert.deepEqual(jpegDimensions(socialBytes), { width: asset.width, height: asset.height });
requireText(pageSource, exactAlt, pagePath);
requireText(pageSource, 'href="/media/projects/quest-craft/sources.json"', pagePath);
requireText(pageSource, "no general reuse grant", pagePath);
requireText(pageSource, "Public reviewer snapshot", pagePath);
requireText(pageSource, "https://choice-weaver-aid.lovable.app/", pagePath);
assert.match(pageSource, /generation[^.]{0,30}not re-tested/i,
  `${pagePath}: the mutable prototype must disclose that generation was not re-tested.`);
reject(pageSource, />\s*(?:Source|Canonical|Implementation) (?:code|repository)\s*</i, pagePath,
  "the reviewer mirror must not be labeled as a source or canonical implementation repository");

reject(cssSource, /#[0-9a-f]{3,8}\b|rgba?\s*\(|hsla?\s*\(/i, cssPath,
  "route CSS must use shared foundation tokens");
reject(cssSource, /url\s*\(/i, cssPath, "raster and remote CSS assets are forbidden");
reject(cssSource, /--qc-[a-z0-9-]+/i, cssPath, "route-local Quest foundation aliases are forbidden");
reject(cssSource, /--[a-z0-9-]+\s*:/i, cssPath, "route CSS must not redeclare foundation tokens");
reject(cssSource, /position\s*:\s*sticky/i, cssPath, "sticky flagship rails are forbidden");
reject(cssSource, /\b(?:88|100)s?vh\b/i, cssPath, "viewport-filling flagship shells are forbidden");
const h1Rule = ruleBody("\\.hero h1", ".hero h1");
requireCss(h1Rule, /letter-spacing\s*:\s*-0\.0(?:[0-2]\d*|3)em\s*;/,
  ".hero h1", "tracking must be no tighter than -0.03em");
requireCss(h1Rule, /line-height\s*:\s*(?:0\.9[89]|[1-9](?:\.\d+)?)\s*;/,
  ".hero h1", "line height must be at least 0.98");
const h2Rule = ruleBody("\\.manuscriptLead h2,[\\s\\S]*?\\.movementHeader h2", "Quest h2 rules");
requireCss(h2Rule, /letter-spacing\s*:\s*-0\.0(?:[0-2]\d*|3)em\s*;/,
  "Quest h2 rules", "tracking must be no tighter than -0.03em");
requireCss(h2Rule, /line-height\s*:\s*(?:0\.9[89]|[1-9](?:\.\d+)?)\s*;/,
  "Quest h2 rules", "line height must be at least 0.98");
for (const [selector, label] of [
  ["\\.kicker,[\\s\\S]*?\\.movementLabel", "movement labels"],
  ["\\.firstScreenLedger dt", "first-screen labels"],
  ["\\.agencyScore legend", "radio-group legend"],
  ["\\.beatControls label > strong", "radio labels"],
  ["\\.beatControls label > small", "beat definitions"],
  ["\\.beatControls label:has\\(input:checked\\)::after", "selected status"],
  ["\\.pathLabel", "path labels"],
  ["\\.scrollCue", "table cue"],
  ["\\.evaluationLedger th,[\\s\\S]*?\\.evaluationLedger td", "evaluation cells"],
  ["\\.corrections header p", "correction labels"],
  ["\\.corrections dt", "correction field labels"],
  ["\\.corrections footer a", "correction actions"],
  ["\\.sourceFolio a > p", "source boundaries"],
]) {
  requireCss(ruleBody(selector, label), /font-size\s*:\s*(?:0\.8(?:125|[2-9]\d*)|[1-9](?:\.\d+)?)rem\s*;/,
    label, "essential text must be at least 0.8125rem");
}
for (const [selector, label] of [
  ["\\.heroIntroduction \\.authorityStatement", "decision boundary"],
  ["\\.firstScreenLedger dd", "first-screen evidence"],
  ["\\.manuscriptLead > p:last-child", "movement prose"],
  ["\\.movementHeader > p", "movement evidence"],
  ["\\.evaluationSummary", "evaluation narrative"],
  ["\\.registerIntroduction > p:last-child", "correction introduction"],
  ["\\.corrections dd", "correction evidence"],
  ["\\.attemptSummary(?=\\s*\\{\\s*margin)", "attempt summary"],
  ["\\.boundaryNotes li", "boundary prose"],
]) {
  const rule = ruleBody(selector, label);
  requireCss(rule, /font-size\s*:\s*(?:1(?:\.\d+)?|[2-9](?:\.\d+)?)rem\s*;/,
    label, "body and evidence prose must be at least 1rem");
  requireCss(rule, /line-height\s*:\s*(?:1\.[6-9]\d*|[2-9](?:\.\d+)?)\s*;/,
    label, "body and evidence prose needs line-height at least 1.6");
}
for (const [selector, label] of [
  ["\\.heroHeading,[\\s\\S]*?\\.heroIntroduction", "hero movement"],
  ["\\.manuscriptLead", "agency lead"],
  ["\\.agencyScore", "agency score"],
  ["\\.evidenceMovement", "evidence movement"],
  ["\\.boundaryMovement", "boundary movement"],
]) {
  assert.doesNotMatch(
    ruleBody(selector, label),
    /(?:padding|padding-block|padding-top|padding-bottom)\s*:[^;]*(?:[6-9]|\d{2,})rem/i,
    `${label}: a supporting movement may not use more than 5rem of outer padding.`,
  );
}
assert.doesNotMatch(ruleBody("\\.evaluationSummary", "evaluation summary"),
  /display\s*:\s*grid|grid-template-columns/i,
  "Quest evaluation summary must remain narrative, not a metric-trophy grid.");
for (const [selector, label] of [
  ["\\.page a:focus-visible", "Quest links"],
  ["\\.beatControls label:has\\(input:focus-visible\\)", "Quest radio labels"],
  ["\\.tableScroll:focus-visible", "Quest table scroller"],
]) {
  const rule = ruleBody(selector, label);
  requireCss(rule, /outline\s*:\s*3px\s+solid\s+var\(--terracotta-dark\)\s*;/,
    label, "focus ring must be 3px terracotta-dark");
  requireCss(rule, /outline-offset\s*:\s*4px\s*;/,
    label, "focus ring must sit 4px outside the target");
}
const printRule = cssSource.slice(cssSource.lastIndexOf("@media print {"));
for (const value of [
  ".tableScroll",
  "overflow: visible",
  ".evaluationLedger",
  "min-width: 0",
  "table-layout: auto",
  "content: \" (\" attr(href) \")\"",
  ".attemptSummary a",
]) {
  requireText(printRule, value, `${cssPath} print rules`);
}
const globalVariables = new Set(
  [...globalCss.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
);
const usedVariables = new Set(
  [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]),
);
assert.deepEqual(
  [...usedVariables].filter((name) => !globalVariables.has(name)),
  [],
  "Quest route CSS uses an undefined shared token.",
);
assert.ok(
  /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(cssSource) ||
    !/(?:animation(?:-name|-duration)?|transition(?:-duration)?|scroll-behavior)\s*:/i.test(cssSource),
  `${cssPath}: any authored motion must have a reduced-motion treatment.`,
);
assert.match(cssSource, /@media\s+print/, `${cssPath}: print treatment is required.`);

assert.equal(
  packageJson.scripts["verify:quest-u05"],
  "node --experimental-strip-types scripts/verify-quest-u05.mjs",
  "package.json must expose the U05 verifier.",
);
assert.match(
  packageJson.scripts.check,
  /verify:front-door-u04\s+&&\s+npm run verify:quest-u05\s+&&\s+npm run verify:openclaw-u06\s+&&\s+npm run verify:media/,
  "The U05 verifier must run after the front door and before OpenClaw and media verification.",
);
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site",
  "The integrated verify command must retain the browser suite after static checks.");
for (const requiredPath of [pagePath, cssPath, mediaPath, socialPath, "scripts/verify-quest-u05.mjs", "tests/portfolio.spec.ts"]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from explicit public files.`);
}
assert.ok(
  publicAllowlist.script_files.includes("scripts/verify-quest-u05.mjs"),
  "The U05 verifier is absent from script_files.",
);

console.log(JSON.stringify({
  status: "pass",
  project: project.id,
  lane: project.lane,
  visualWorld: project.visualWorld,
  movements: movementValues,
  routeFields,
  radios: beatValues.length,
  table: { rows: expectedRows.length, retainedCells: 36, generations: 33, localRejections: 3 },
  corrections: expectedCorrections.map((record) => record.id),
  socialMediaSha256: asset.sha256,
  pageSha256: sha256(readFileSync(resolve(root, pagePath))),
  cssSha256: sha256(readFileSync(resolve(root, cssPath))),
}));
