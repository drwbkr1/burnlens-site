import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pagePath = join(root, "app", "work", "burnlens", "page.tsx");
const cssPath = join(root, "app", "work", "burnlens", "page.module.css");
const routeSocialPath = join(root, "app", "work", "burnlens", "opengraph-image.tsx");
const rootSocialPath = join(root, "app", "opengraph-image.tsx");
const globalCssPath = join(root, "app", "globals.css");
const mediaRoot = join(root, "public", "media", "projects", "burnlens");
const sourceGateBinding = {
  contractVersion: "source-gate/v1",
  assessmentId: "NFA-031-BURNLENS-POSITIVE-STORY-SOURCE-GATE-20260816",
  bytes: 22561,
  sha256: "6eb87bf1e43b2cf5e1c7a7cd814d91742b45602dfd85831e12729e1f3b44c13d",
  storyFocus:
    "A bounded release-governance and evidence-system case study for technical and technical-adjacent portfolio reviewers, not a computer-vision performance case or operational wildfire product.",
  exactPositiveClaimAtoms: [
    {
      field: "problem",
      sentence:
        "BurnLens asks how one bounded experimental computer-vision-to-GEOINT release can become understandable, inspectable, citable, and responsibly interpretable as a coherent whole.",
    },
    {
      field: "audience",
      sentence:
        "It is an experimental portfolio project for technical and technical-adjacent reviewers, not an operational wildfire tool.",
    },
    {
      field: "role",
      sentence:
        "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
    },
    {
      field: "constraint",
      sentence:
        "The public release had to remain useful while excluding credentials, private owner responses, private logs, and machine-local paths, without implying official or operational capability.",
    },
    {
      field: "decision",
      sentence:
        "When the story was fragmented across correct artifacts, the project chose one canonical reviewer entry point around them rather than rewriting them.",
    },
    {
      field: "outcome",
      sentence:
        "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
    },
    {
      field: "limitation",
      sentence:
        "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
    },
    {
      field: "lesson",
      sentence:
        "Reliability includes recognizing when evidence is insufficient and making that stop reproducible.",
    },
  ],
};

const pageSource = readFileSync(pagePath, "utf8");
const cssSource = readFileSync(cssPath, "utf8");
const globalCss = readFileSync(globalCssPath, "utf8");

const controlRecordMode = "embedded-gate-binding";

const expectedAtoms = Object.fromEntries(
  sourceGateBinding.exactPositiveClaimAtoms.map((atom) => [
    atom.field,
    atom.sentence,
  ]),
);
assert.deepEqual(Object.keys(expectedAtoms), [
  "problem",
  "audience",
  "role",
  "constraint",
  "decision",
  "outcome",
  "limitation",
  "lesson",
]);

for (const [field, sentence] of Object.entries(expectedAtoms)) {
  assert.equal(
    pageSource.split(sentence).length - 1,
    1,
    `BurnLens must declare the exact ${field} atom once.`,
  );
  assert.match(
    pageSource,
    new RegExp(`data-claim-atom=["']${field}["']`),
    `BurnLens must render the ${field} atom with its review hook.`,
  );
}
assert.equal(
  [...pageSource.matchAll(/data-claim-atom=/g)].length,
  8,
  "BurnLens must expose exactly the eight cleared positive atoms.",
);

for (const hook of [
  'data-field-atlas="burnlens"',
  'data-first-screen="burnlens"',
  'data-case-chapter-index="burnlens"',
  'data-release-governance="authority"',
  'data-release-governance="assembly"',
  'data-release-governance="boundary"',
  'id="frame"',
  'id="authority"',
  'id="assembly"',
  'id="boundary"',
]) {
  assert.ok(pageSource.includes(hook), `Missing BurnLens shareable-route hook: ${hook}`);
}

const evidenceSourceIds = [
  ...pageSource.matchAll(/\bsourceId="([^"]+)"/g),
].map((match) => match[1]);
assert.deepEqual(
  new Set(evidenceSourceIds),
  new Set(["burnlens-release", "burnlens-pinned-tree"]),
  "Only the two cleared BurnLens evidence links may remain.",
);
assert.equal(evidenceSourceIds.length, 2, "Each cleared evidence link must render exactly once.");
assert.ok(pageSource.includes('href="/work"'), "BurnLens must retain a route back to selected work.");

const removedPaths = [
  routeSocialPath,
  join(mediaRoot, "LICENSE.txt"),
  join(mediaRoot, "manifest.json"),
  join(mediaRoot, "baseline-evaluation.png"),
  join(mediaRoot, "model-decision.png"),
  join(mediaRoot, "ward-creek-overlay.png"),
];
for (const removedPath of removedPaths) {
  assert.equal(existsSync(removedPath), false, `Held BurnLens surface remains: ${removedPath}`);
}
assert.ok(existsSync(rootSocialPath), "The generic root social image must remain available.");
assert.deepEqual(
  existsSync(mediaRoot) ? readdirSync(mediaRoot) : [],
  [],
  "The successor BurnLens route must not retain or introduce local media.",
);

assert.doesNotMatch(pageSource, /(?:from\s+["']next\/image["']|<Image\b|<img\b)/);
assert.doesNotMatch(pageSource, /(?:openGraph|twitter)\s*:/, "Route metadata must inherit generic root social metadata.");
assert.doesNotMatch(pageSource, /["'][^"']*\.(?:png|jpe?g|gif|webp|svg)["']/i);
assert.doesNotMatch(pageSource, /["']use client["']/);
assert.doesNotMatch(pageSource, /\b(?:useState|useEffect|onClick|onKeyDown)\b/);

let residualCopy = pageSource;
for (const sentence of Object.values(expectedAtoms)) {
  residualCopy = residualCopy.replace(sentence, "");
}
for (const forbidden of [
  /BL\.F0[1-3]/i,
  /\bRBR\b/i,
  /U-Net/i,
  /\bDice\b/i,
  /\bIoU\b/i,
  /Ward Creek/i,
  /Sentinel/i,
  /Copernicus/i,
  /\bUSGS\b/i,
  /\bMTBS\b/i,
  /\b(?:imagery|threshold|mask|raster|vector|overlay|chart)\b/i,
  /media manifest/i,
  /package[- ]valid/i,
  /failure dividend/i,
  /end-to-end/i,
  /field validation/i,
  /generalization/i,
  /measured climate impact/i,
  /production readiness/i,
]) {
  assert.doesNotMatch(
    residualCopy,
    forbidden,
    `Held BurnLens content escaped into the shareable route: ${forbidden}`,
  );
}

assert.doesNotMatch(
  `${pageSource}\n${cssSource}`,
  /(?:\u00e2|\u00c2|\u00c3|\u00f0\u0178|\ufffd)/u,
  "BurnLens source contains likely encoding corruption.",
);

const primitiveDeclarationPattern =
  /--(?:olive|terracotta|sand|sage|teal|charcoal|gray|white|paper|ink-soft|terracotta-dark|olive-dark|teal-dark)\s*:/;
assert.doesNotMatch(cssSource, primitiveDeclarationPattern, "Route CSS must not redeclare palette primitives.");
assert.doesNotMatch(cssSource, /#[0-9a-f]{3,8}\b|rgba?\(/i, "Route CSS must use shared color tokens.");
assert.doesNotMatch(cssSource, /\b(?:Inter|Georgia|Times New Roman)\b/i, "Route CSS uses an unapproved font.");
assert.match(cssSource, /var\(--sans\)/);
assert.match(cssSource, /var\(--serif\)/);
assert.match(cssSource, /var\(--mono\)/);
assert.match(cssSource, /@media \(max-width: 780px\)/);
assert.match(cssSource, /@media \(max-width: 520px\)/);
assert.match(cssSource, /overflow-wrap: anywhere/);
assert.match(cssSource, /@media print/);

const globalVariables = new Set(
  [...globalCss.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
);
const usedVariables = new Set(
  [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]),
);
const undefinedVariables = [...usedVariables].filter((name) => !globalVariables.has(name));
assert.deepEqual(undefinedVariables, [], `Undefined BurnLens CSS variables: ${undefinedVariables.join(", ")}`);

for (const match of cssSource.matchAll(/font-size\s*:\s*([0-9.]+)rem/gi)) {
  assert.ok(Number(match[1]) >= 0.75, `Visible BurnLens type below 0.75rem: ${match[0]}`);
}

console.log(
  JSON.stringify({
    status: "pass",
    project: "burnlens",
    storyFocus: sourceGateBinding.storyFocus,
    claimAtoms: Object.keys(expectedAtoms).length,
    publicEvidenceLinks: evidenceSourceIds.length,
    localMedia: existsSync(mediaRoot) ? readdirSync(mediaRoot).length : 0,
    routeSocialImage: "inherited-root",
    cssBytes: readFileSync(cssPath).length,
    pageBytes: readFileSync(pagePath).length,
    sourceGateBytes: sourceGateBinding.bytes,
    sourceGateSha256: sourceGateBinding.sha256,
    controlRecordMode,
  }),
);
