import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProject,
  getProjectsInLane,
  getProjectSource,
  getPublicSourceHref,
  getSupportedEvidence,
  legacySurfaceExceptions,
  plainLanguageGlossary,
  projectHierarchy,
  projectIds,
  projectModel,
  projectRecords,
  projectSources,
  projectSurfacePlan,
  publicProjectionRules,
  targetSurfaceHierarchy,
} from "../content/project-model.ts";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const expectedModelSha256 = "8e2821882dc7b7801d716935baeeedbf014c38d75fedb2bfa577d0ac77e9f918";

const evidenceFields = [
  "problem",
  "intendedUser",
  "decisionSupported",
  "personalRole",
  "implementation",
  "stack",
  "testStrategy",
  "outcome",
  "failureDividend",
  "limitations",
  "nextStep",
  "maturity",
];

const expectedHierarchy = {
  flagship: ["burnlens", "runbook-sentinel"],
  supporting: ["quest-craft", "openclaw-showcase"],
  archive: [
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp",
  ],
};

const expectedPlacements = {
  burnlens: [
    "flagship",
    "designed-case-study",
    "/work/burnlens",
    "full-case-study",
    "field-atlas",
  ],
  "runbook-sentinel": [
    "flagship",
    "designed-case-study",
    "/work/runbook-sentinel",
    "full-case-study",
    "control-trace",
  ],
  "quest-craft": [
    "supporting",
    "designed-case-study",
    "/work/quest-craft",
    "supporting-field-note",
    "branching-manuscript",
  ],
  "openclaw-showcase": [
    "supporting",
    "designed-case-study",
    "/work/openclaw-showcase",
    "supporting-field-note",
    "disclosure-folio",
  ],
  "hierarchical-clustering": [
    "archive",
    "link-only-shelf",
    null,
    "external-link-only",
    "historical-reading-shelf",
  ],
  "energy-sector-data-governance": [
    "archive",
    "link-only-shelf",
    null,
    "external-link-only",
    "historical-reading-shelf",
  ],
  "der-dcp": [
    "archive",
    "link-only-shelf",
    null,
    "external-link-only",
    "historical-reading-shelf",
  ],
};

const supported = "supported";
const missing = "missing";
const notApplicable = "not_applicable";
const expectedStates = {
  burnlens: [
    supported, supported, supported, supported, supported, notApplicable,
    supported, supported, notApplicable, supported, missing, supported,
  ],
  "runbook-sentinel": evidenceFields.map(() => supported),
  "quest-craft": [
    supported, supported, supported, supported, supported, missing,
    supported, supported, supported, supported, missing, supported,
  ],
  "openclaw-showcase": [
    supported, missing, supported, supported, supported, supported,
    missing, supported, missing, supported, missing, supported,
  ],
  "hierarchical-clustering": [
    supported, missing, missing, missing, supported, supported,
    missing, missing, missing, supported, missing, supported,
  ],
  "energy-sector-data-governance": [
    supported, missing, notApplicable, supported, supported, notApplicable,
    notApplicable, supported, missing, supported, missing, supported,
  ],
  "der-dcp": [
    supported, missing, notApplicable, supported, supported, notApplicable,
    notApplicable, supported, notApplicable, supported, missing, supported,
  ],
};

const falseBoundaries = {
  eeEvidence: false,
  operational: false,
  implementedSystem: false,
  evaluatedSystem: false,
  productionReady: false,
  hardwareImplemented: false,
  runtimeInspected: false,
  currentGuidance: false,
};
const expectedBoundaries = {
  burnlens: {
    ...falseBoundaries,
    implementedSystem: true,
    evaluatedSystem: true,
    runtimeInspected: true,
  },
  "runbook-sentinel": {
    ...falseBoundaries,
    implementedSystem: true,
    evaluatedSystem: true,
    runtimeInspected: true,
  },
  "quest-craft": {
    ...falseBoundaries,
    implementedSystem: true,
    evaluatedSystem: true,
  },
  "openclaw-showcase": falseBoundaries,
  "hierarchical-clustering": falseBoundaries,
  "energy-sector-data-governance": falseBoundaries,
  "der-dcp": falseBoundaries,
};

const expectedFailures = {
  burnlens: [],
  "runbook-sentinel": [
    ["RS.F01", false],
    ["RS.F02", false],
    ["RS.F03", true],
  ],
  "quest-craft": [
    ["QC.F01", true],
    ["QC.F02", false],
  ],
  "openclaw-showcase": [],
  "hierarchical-clustering": [],
  "energy-sector-data-governance": [],
  "der-dcp": [],
};

const expectedFailureTargets = {
  burnlens: {
    homepage: [],
    workIndex: [],
    resume: [],
    projectRoute: [],
  },
  "runbook-sentinel": {
    homepage: ["RS.F03"],
    workIndex: [],
    resume: [],
    projectRoute: ["RS.F03", "RS.F02", "RS.F01"],
  },
  "quest-craft": {
    homepage: [],
    workIndex: [],
    resume: [],
    projectRoute: ["QC.F01", "QC.F02"],
  },
  "openclaw-showcase": { homepage: [], workIndex: [], resume: [], projectRoute: [] },
  "hierarchical-clustering": { homepage: [], workIndex: [], resume: [], projectRoute: [] },
  "energy-sector-data-governance": { homepage: [], workIndex: [], resume: [], projectRoute: [] },
  "der-dcp": { homepage: [], workIndex: [], resume: [], projectRoute: [] },
};

const expectedGlossaryTokens = [
  "TRACE R.20",
  "CV / CV-to-GEOINT",
  "SRE",
  "MCP",
  "terminal state",
  "action/split pair",
  "JSONL trace",
  "HDBSCAN",
  "Jaccard / Euclidean / Rogers–Tanimoto",
  "DER Distributed Control Planner",
  "SCLA 521",
  "RS.F## / QC.F##",
  "NFA-* / gate IDs / source IDs",
];

const expectedLegacyExceptionIds = [
  "home-energy-equal-lane",
  "home-supporting-bar-overclaim",
  "work-flat-hierarchy",
  "supporting-route-scale",
  "resume-selection-drift",
  "resume-unregistered-skills",
  "opaque-primary-labels",
  "clustering-boundary-drift",
];

const expectedBurnLensClaims = {
  problem: "BurnLens asks how one bounded experimental computer-vision-to-GEOINT release can become understandable, inspectable, citable, and responsibly interpretable as a coherent whole.",
  intendedUser: "It is an experimental portfolio project for technical and technical-adjacent reviewers, not an operational wildfire tool.",
  decisionSupported: "When the story was fragmented across correct artifacts, the project chose one canonical reviewer entry point around them rather than rewriting them.",
  personalRole: "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
  implementation: "The public release had to remain useful while excluding credentials, private owner responses, private logs, and machine-local paths, without implying official or operational capability.",
  testStrategy: "Reliability includes recognizing when evidence is insufficient and making that stop reproducible.",
  outcome: "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
  limitations: "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
};

const expectedBurnLensSources = {
  problem: ["burnlens-pinned-tree"],
  intendedUser: ["burnlens-release", "burnlens-pinned-tree"],
  decisionSupported: ["burnlens-pinned-tree"],
  personalRole: ["burnlens-pinned-tree"],
  implementation: ["burnlens-pinned-tree"],
  testStrategy: ["burnlens-pinned-tree"],
  outcome: ["burnlens-release", "burnlens-pinned-tree"],
  limitations: ["burnlens-release"],
};

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function assertNonemptyString(value, message) {
  assert.equal(typeof value, "string", message);
  assert.notEqual(value.trim(), "", message);
}

function assertNonemptyArray(value, message) {
  assert.ok(Array.isArray(value) && value.length > 0, message);
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function walkSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkSourceFiles(path);
    }
    return [path];
  });
}

assert.equal(projectModel.sources, projectSources, "Raw model must expose canonical sources.");
assert.equal(projectModel.projects, projectRecords, "Raw model must expose canonical projects.");
assert.deepEqual(projectIds, Object.values(expectedHierarchy).flat(), "Project order drifted.");
assert.deepEqual(projectHierarchy, expectedHierarchy, "Three-lane hierarchy drifted.");
assert.deepEqual(targetSurfaceHierarchy, {
  homepage: {
    flagshipProjectIds: ["burnlens", "runbook-sentinel"],
    supportingProjectIds: ["quest-craft", "openclaw-showcase"],
    archiveProjectIds: [],
  },
  workIndex: {
    flagships: {
      projectIds: ["burnlens", "runbook-sentinel"],
      numbering: "01-02",
      visualWeight: "primary",
    },
    "supporting-notes": {
      projectIds: ["quest-craft", "openclaw-showcase"],
      numbering: "none",
      visualWeight: "subordinate",
    },
    "historical-reading-shelf": {
      projectIds: [
        "hierarchical-clustering",
        "energy-sector-data-governance",
        "der-dcp",
      ],
      numbering: "none",
      visualWeight: "quiet-link-only",
    },
  },
  resume: {
    selectedProjectIds: ["burnlens", "runbook-sentinel", "quest-craft"],
    selectedProjectHierarchy: ["flagship", "flagship", "supporting-prototype"],
    researchAndWritingProjectIds: [
      "hierarchical-clustering",
      "energy-sector-data-governance",
      "der-dcp",
    ],
    omittedSelectedProjectIds: ["openclaw-showcase"],
  },
}, "Surface hierarchy drifted.");

for (const projectId of projectIds) {
  const project = projectRecords[projectId];
  assert.equal(getProject(projectId), project, `${projectId}: selector must preserve identity.`);
  assert.deepEqual(
    [project.lane, project.treatment, project.route, project.routeType, project.visualWorld],
    expectedPlacements[projectId],
    `${projectId}: lane and treatment coupling drifted.`,
  );
  assert.deepEqual(
    Object.keys(project.evidence),
    evidenceFields,
    `${projectId}: canonical evidence field order or membership drifted.`,
  );
  assert.deepEqual(
    evidenceFields.map((fieldName) => project.evidence[fieldName].state),
    expectedStates[projectId],
    `${projectId}: evidence-state matrix drifted.`,
  );
  assert.deepEqual(
    project.capabilityBoundaries,
    expectedBoundaries[projectId],
    `${projectId}: capability boundary drifted.`,
  );
  assertNonemptyArray(project.claimsNotAuthorized, `${projectId}: claims boundary must be nonempty.`);

  for (const fieldName of evidenceFields) {
    const field = project.evidence[fieldName];
    if (field.state === supported) {
      assertNonemptyString(field.summary, `${projectId}.${fieldName}: summary must be nonempty.`);
      assertNonemptyArray(field.sourceIds, `${projectId}.${fieldName}: supported facts need sources.`);
      assert.ok(!hasOwn(field, "reason") && !hasOwn(field, "evidenceNeeded"));
      for (const sourceId of field.sourceIds) {
        const source = projectSources[sourceId];
        assert.ok(source, `${projectId}.${fieldName}: unknown source ${sourceId}.`);
        assert.ok(source.projectIds.includes(projectId), `${sourceId} does not support ${projectId}.`);
      }
    } else if (field.state === missing) {
      assertNonemptyString(field.reason, `${projectId}.${fieldName}: missing reason required.`);
      assertNonemptyArray(field.evidenceNeeded, `${projectId}.${fieldName}: evidence-needed list required.`);
      for (const forbiddenKey of ["strength", "summary", "value", "sourceIds"]) {
        assert.ok(!hasOwn(field, forbiddenKey), `${projectId}.${fieldName}: missing state leaked ${forbiddenKey}.`);
      }
    } else {
      assert.equal(field.state, notApplicable, `${projectId}.${fieldName}: unknown evidence state.`);
      assert.deepEqual(Object.keys(field).sort(), ["reason", "state"]);
      assertNonemptyString(field.reason, `${projectId}.${fieldName}: not_applicable reason required.`);
    }
  }

  const failureField = project.evidence.failureDividend;
  const failures = failureField.state === supported ? failureField.value : [];
  assert.deepEqual(
    failures.map((failure) => [failure.id, failure.featured === true]),
    expectedFailures[projectId],
    `${projectId}: failure-dividend set or featured flag drifted.`,
  );
  for (const failure of failures) {
    for (const stage of publicProjectionRules.failureDividendShape) {
      assertNonemptyString(failure[stage], `${failure.id}: ${stage} must be nonempty.`);
    }
    assertNonemptyArray(failure.sourceIds, `${failure.id}: evidence sources required.`);
    for (const sourceId of failure.sourceIds) {
      assert.ok(projectSources[sourceId].projectIds.includes(projectId));
    }
  }
  assert.deepEqual(
    projectSurfacePlan[projectId].featuredFailureIds,
    expectedFailureTargets[projectId],
    `${projectId}: surface failure targets drifted.`,
  );
}

assert.equal(
  Object.values(expectedFailures).flat().length,
  5,
  "The canonical model must contain exactly five surviving failure dividends.",
);

const burnlens = projectRecords.burnlens;
for (const [fieldName, expectedSummary] of Object.entries(expectedBurnLensClaims)) {
  assert.equal(
    burnlens.evidence[fieldName].summary,
    expectedSummary,
    `burnlens.${fieldName}: selected-use sentence drifted.`,
  );
  assert.deepEqual(
    burnlens.evidence[fieldName].sourceIds,
    expectedBurnLensSources[fieldName],
    `burnlens.${fieldName}: selected-use source binding drifted.`,
  );
}
assert.equal(burnlens.evidence.stack.state, notApplicable);
assert.equal(burnlens.evidence.failureDividend.state, notApplicable);
assert.equal(burnlens.evidence.nextStep.state, missing);
assert.equal(
  burnlens.evidence.nextStep.reason,
  "No designated next milestone or active evidence checkpoint exists; a future step requires separate owner approval and source support.",
);
assert.equal(burnlens.evidence.maturity.summary, expectedBurnLensClaims.outcome);
assert.deepEqual(burnlens.evidence.maturity.sourceIds, ["burnlens-release", "burnlens-pinned-tree"]);
assert.deepEqual(projectSurfacePlan.burnlens.notApplicableFields, ["stack", "failureDividend"]);

const burnlensSourceIds = Object.entries(projectSources)
  .filter(([, source]) => source.projectIds.includes("burnlens"))
  .map(([sourceId]) => sourceId);
assert.deepEqual(
  burnlensSourceIds,
  ["burnlens-pinned-tree", "burnlens-release"],
  "BurnLens must retain exactly the two selected-use sources.",
);
assert.equal(
  getPublicSourceHref("burnlens-release"),
  "https://github.com/drwbkr1/burnlens-deschutes/releases/tag/v0.56.0-baseline-first-portfolio-release",
);
assert.equal(
  getPublicSourceHref("burnlens-pinned-tree"),
  "https://github.com/drwbkr1/burnlens-deschutes/tree/a741111d82e69689022d2058118ed8f4b9bf3546",
);
assert.equal(
  getPublicSourceHref("quest.readme-ai-use"),
  "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/README.md#8-ai-use-memo",
);
const burnlensSelectedUseJson = JSON.stringify({
  sources: Object.fromEntries(burnlensSourceIds.map((sourceId) => [sourceId, projectSources[sourceId]])),
  project: burnlens,
  surfacePlan: projectSurfacePlan.burnlens,
});
assert.doesNotMatch(
  burnlensSelectedUseJson,
  /(?:burnlens-(?:evidence-model-gate|failure-record|media-manifest|report|source-boundary)|BL\.F0[1-3]|\bRBR\b|U-Net|\bDice\b|\bIoU\b|Ward Creek|\bMTBS\b|Sentinel(?:-2)?|Copernicus|\bUSGS\b|89 selected|native-grid|public\/media\/projects\/burnlens)/i,
  "Held BurnLens sources, failures, analytical claims, or local media re-entered selected use.",
);

for (const [lane, expectedProjectIds] of Object.entries(expectedHierarchy)) {
  assert.deepEqual(
    getProjectsInLane(lane).map((project) => project.id),
    expectedProjectIds,
    `${lane}: lane selector drifted.`,
  );
}
assert.equal(getSupportedEvidence("burnlens", "problem"), projectRecords.burnlens.evidence.problem);
assert.equal(getSupportedEvidence("burnlens", "nextStep"), null);

const internalSources = [];
for (const [sourceId, source] of Object.entries(projectSources)) {
  assert.equal(getProjectSource(sourceId), source, `${sourceId}: selector must preserve identity.`);
  assertNonemptyArray(source.projectIds, `${sourceId}: source ownership required.`);
  assertNonemptyString(source.claimBoundary, `${sourceId}: claim boundary required.`);
  if (source.availability === "internal-only") {
    internalSources.push(sourceId);
    assert.equal(source.reuse, "internal-gate-only", `${sourceId}: internal reuse boundary drifted.`);
    for (const forbiddenKey of ["href", "repositoryPath", "immutableIdentity", "locator"]) {
      assert.ok(!hasOwn(source, forbiddenKey), `${sourceId}: internal binding leaked ${forbiddenKey}.`);
    }
  } else {
    assert.notEqual(hasOwn(source, "href"), hasOwn(source, "repositoryPath"), `${sourceId}: public locator must be singular.`);
    if (hasOwn(source, "href")) {
      assert.match(source.href, /^https:\/\//, `${sourceId}: public links must use HTTPS.`);
      assert.equal(getPublicSourceHref(sourceId), source.href);
    } else {
      assert.match(source.repositoryPath, /^public\//, `${sourceId}: repository assets stay under public/.`);
    }
  }
}
assert.equal(internalSources.length, 12, "Internal source-binding count drifted.");
assert.throws(
  () => getPublicSourceHref("portfolio.blueprint.008"),
  /not approved as a public link/,
  "Internal source IDs must fail closed at runtime too.",
);

const supportedTruthJson = JSON.stringify(projectModel);
const internalDocsPath = ["docs", "portfolio-redesign"].join("/");
assert.ok(!supportedTruthJson.toLowerCase().includes(internalDocsPath));
assert.doesNotMatch(supportedTruthJson, /(?:[A-Za-z]:\\\\|\\\\\\\\)/);
for (const forbiddenMetadataKey of [
  "locator",
  ["authority", "ref"].join("_"),
  ["thread", "goal"].join("_"),
]) {
  assert.ok(!supportedTruthJson.includes(`"${forbiddenMetadataKey}"`));
}

assert.deepEqual(
  plainLanguageGlossary.map((entry) => entry.token),
  expectedGlossaryTokens,
  "Plain-language glossary membership or order drifted.",
);
assert.equal(new Set(expectedGlossaryTokens).size, expectedGlossaryTokens.length);
for (const entry of plainLanguageGlossary) {
  assertNonemptyString(entry.readerFirst, `${entry.token}: reader-first language required.`);
  assertNonemptyString(entry.secondaryDisposition, `${entry.token}: secondary disposition required.`);
  assert.equal(entry.rawTokenPrimaryAllowed, false, `${entry.token}: raw token cannot lead.`);
}

assert.deepEqual(
  legacySurfaceExceptions.map((exception) => exception.id),
  expectedLegacyExceptionIds,
  "Legacy exception references drifted.",
);
for (const exception of legacySurfaceExceptions) {
  assert.equal(exception.status, "legacy-parity-only");
  assert.equal(exception.supportsTruth, false);
  assert.ok(!supportedTruthJson.includes(exception.id), `${exception.id}: legacy finding entered supported truth.`);
}

assert.deepEqual(publicProjectionRules.failureDividendShape, [
  "failure",
  "buildChange",
  "earnedCapability",
  "boundary",
]);
assert.deepEqual(
  {
    renderSupportedFieldsOnly: publicProjectionRules.renderSupportedFieldsOnly,
    renderMissingFieldsAsClaims: publicProjectionRules.renderMissingFieldsAsClaims,
    renderNotApplicableFieldsAsClaims: publicProjectionRules.renderNotApplicableFieldsAsClaims,
    plainLanguageBeforeIdentifier: publicProjectionRules.plainLanguageBeforeIdentifier,
    sourceIdsPrimaryLabelAllowed: publicProjectionRules.sourceIdsPrimaryLabelAllowed,
    archiveCanBeSelectedEngineeringProject: publicProjectionRules.archiveCanBeSelectedEngineeringProject,
    supportingCaseCanShareFlagshipVisualShell: publicProjectionRules.supportingCaseCanShareFlagshipVisualShell,
  },
  {
    renderSupportedFieldsOnly: true,
    renderMissingFieldsAsClaims: false,
    renderNotApplicableFieldsAsClaims: false,
    plainLanguageBeforeIdentifier: true,
    sourceIdsPrimaryLabelAllowed: false,
    archiveCanBeSelectedEngineeringProject: false,
    supportingCaseCanShareFlagshipVisualShell: false,
  },
);

const primitiveDefinitionPaths = new Set([
  join(projectRoot, "components", "editorial", "EvidenceLink.tsx"),
  join(projectRoot, "components", "editorial", "ProjectFactLedger.tsx"),
]);
const allowedModelConsumerPaths = new Set([
  "app/page.tsx",
  "app/resume/page.tsx",
  "app/work/burnlens/page.tsx",
  "app/work/openclaw-showcase/page.tsx",
  "app/work/page.tsx",
  "app/work/quest-craft/page.tsx",
  "app/work/runbook-sentinel/page.tsx",
  "content/projects.ts",
]);
const allowedPrimitiveConsumerPaths = new Set([
  "app/resume/page.tsx",
  "app/work/burnlens/page.tsx",
  "app/work/runbook-sentinel/page.tsx",
]);
const runtimeFiles = [
  join(projectRoot, "app"),
  join(projectRoot, "components"),
  join(projectRoot, "content"),
]
  .flatMap(walkSourceFiles)
  .filter((path) => [".js", ".jsx", ".ts", ".tsx"].includes(extname(path)))
  .filter((path) => !primitiveDefinitionPaths.has(path))
  .filter((path) => path !== join(projectRoot, "content", "project-model.ts"));
const observedModelConsumerPaths = [];
const observedPrimitiveConsumerPaths = [];
for (const path of runtimeFiles) {
  const sourceText = readFileSync(path, "utf8");
  const relativePath = relative(projectRoot, path).replaceAll("\\", "/");
  if (/\b(?:ProjectFactLedger|EvidenceLink)\b/.test(sourceText)) {
    assert.ok(
      allowedPrimitiveConsumerPaths.has(relativePath),
      `${relativePath} mounts a shared editorial primitive outside its authorized visual-design unit.`,
    );
    observedPrimitiveConsumerPaths.push(relativePath);
  }
  if (/(?:from\s*|import\s*\()\s*["'][^"']*project-model["']/.test(sourceText)) {
    assert.ok(
      allowedModelConsumerPaths.has(relativePath),
      `${relativePath} is not an authorized U01 project-model consumer.`,
    );
    observedModelConsumerPaths.push(relativePath);
  }
}
assert.deepEqual(
  observedModelConsumerPaths.sort(),
  [...allowedModelConsumerPaths].sort(),
  "The exact U01 project-model consumer set drifted.",
);
assert.deepEqual(
  observedPrimitiveConsumerPaths.sort(),
  [...allowedPrimitiveConsumerPaths].sort(),
  "The exact shared editorial primitive consumer set drifted.",
);
for (const componentPath of [
  join(projectRoot, "components", "editorial", "EvidenceLink.tsx"),
  join(projectRoot, "components", "editorial", "ProjectFactLedger.tsx"),
]) {
  const sourceText = readFileSync(componentPath, "utf8");
  assert.doesNotMatch(sourceText, /className\s*=/, `${relative(projectRoot, componentPath)} must remain unstyled.`);
  assert.doesNotMatch(sourceText, /^["']use client["'];/m, `${relative(projectRoot, componentPath)} must remain server-safe.`);
}

const canonicalPayload = canonicalize({
  projectModel,
  projectHierarchy,
  targetSurfaceHierarchy,
  projectSurfacePlan,
  publicProjectionRules,
  plainLanguageGlossary,
});
const modelSha256 = createHash("sha256")
  .update(JSON.stringify(canonicalPayload))
  .digest("hex");
assert.equal(
  modelSha256,
  expectedModelSha256,
  `Canonical project-model digest drifted; measured ${modelSha256}.`,
);

console.log(JSON.stringify({
  status: "passed",
  projectCount: projectIds.length,
  sourceCount: Object.keys(projectSources).length,
  internalSourceCount: internalSources.length,
  failureDividendCount: Object.values(expectedFailures).flat().length,
  glossaryCount: plainLanguageGlossary.length,
  legacyExceptionCount: legacySurfaceExceptions.length,
  modelSha256,
  runtimeBoundary: "canonical-model-consumed-by-front-door-and-designed-routes; editorial-primitives-mounted-on-burnlens-runbook-and-resume",
}));
