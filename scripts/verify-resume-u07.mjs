import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProject,
  getProjectSource,
  getPublicSourceHref,
  getSupportedEvidence,
  projectSurfacePlan,
  targetSurfaceHierarchy,
  toReaderFirst,
} from "../content/project-model.ts";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pagePath = "app/resume/page.tsx";
const cssPath = "app/resume/resume.module.css";
const compatibilityPath = "content/projects.ts";
const modelPath = "content/project-model.ts";
const testsPath = "tests/portfolio.spec.ts";
const pageSource = readFileSync(resolve(root, pagePath), "utf8");
const cssSource = readFileSync(resolve(root, cssPath), "utf8");
const compatibilitySource = readFileSync(resolve(root, compatibilityPath), "utf8");
const modelSource = readFileSync(resolve(root, modelPath), "utf8");
const testsSource = readFileSync(resolve(root, testsPath), "utf8");
const globalCss = readFileSync(resolve(root, "app/globals.css"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const publicAllowlist = JSON.parse(
  readFileSync(resolve(root, "scripts/public-candidate-allowlist.json"), "utf8"),
);

// Preserve predecessor identities; the NFA-073 migration is presentation-only.
const predecessorTargetHashes = {
  [pagePath]: "3c1147a921ce0c8d1a94958331425d9cc96c994021eb6e8f14f2114c93e13ee1",
  [cssPath]: "3a61192574d4c2109a012043ee8b7efd3c20d24d32c79ab3b049af109e7cc994",
  [compatibilityPath]: "f387814bc38945860d3173f2020354beb3ef16371fbb8295c10dab7b2021b43d",
};
const acceptedNfa073Css = {
  predecessorBytes: 17_507,
  bytes: 17_754,
  sha256: "72a733e20cf3b8de1403c0371d142031757203f0957c314df86bf92c0bb6f171",
};
const acceptedNfa086Targets = {
  page: { bytes: 24_415, sha256: "72c3dff2c8b43cd33bb895d36190aa28920965bed98b8c17e428956b688a8df6" },
  css: { bytes: 19_396, sha256: "97f8642618c129d622b78ea6da582e61b5a0d8ece2a73db58051e55155032d64" },
};
const expectedTargetHashes = {
  ...predecessorTargetHashes,
  [pagePath]: acceptedNfa086Targets.page.sha256,
  [cssPath]: acceptedNfa086Targets.css.sha256,
};
const acceptedResumeBeforeSemanticRepair = {
  bytes: 21_425,
  sha256: "43bbe9476841c55750cc56f56631c779bd063dd2ed9c93d79fbc353039259b54",
};
const predecessorU06Targets = {
  "app/work/openclaw-showcase/page.tsx": "0d84b95d21edf86ae99f1c4f8bff237744e74726d8a3a5d5ff705b6a50a8ee80",
  "app/work/openclaw-showcase/page.module.css": "d9d1511633968c6c6b2259676a41944f7511accd9261bc8661ba5e4fba527d57",
  "app/work/openclaw-showcase/opengraph-image.tsx": "ecc4216222b0bff86bf02672b21d63debd606040bb5d6298f24e847a11e9c658",
  "scripts/verify-openclaw-u06.mjs": "576f37d6b04e25d5a88e74260a8b27f7f6903d8afb4e0c0a2dc1914a1292be18",
};
const acceptedU06Targets = {
  ...predecessorU06Targets,
  "app/work/openclaw-showcase/page.module.css": "8ce93dcbbfbc6740cd63ce0a11a2aa614e99b4f1ea4f2ab844748c19e7429122",
  "scripts/verify-openclaw-u06.mjs": "02c1f086a084a5069cebececfd62cfd0494542aeaaa265df0904da129192197c",
};
const acceptedU06BrowserBlock = {
  bytes: 36_753,
  sha256: "d167bfbf12b9f0ba3e353a826414cde59a6b5b2ed5dda5d14fb6ffe5713ac2d0",
};

const exactRoleLine = "Software development · geospatial analysis · product direction";
const exactSummary =
  "I develop software and explore geospatial questions, from a synthetic Python incident-response testbed to satellite heat-exposure maps. I frame the problem, make product decisions and work with Codex on implementation and testing.";
const exactContributionCopy = {
  burnlens: {
    status: "Public v0.56.0 research portfolio release",
    summary: "I defined the audience, public story and use limits for an experimental computer-vision and geospatial project, and owned its publication decisions. Codex led technical, product and reliability work within that direction. The result was a public v0.56.0 research portfolio release—not an operational wildfire tool.",
  },
  "runbook-sentinel": {
    status: "Released synthetic testbed · v0.0.20",
    summary: "I designed and implemented a Python/SQLite synthetic incident-response testbed that separates diagnosis and proposals from approval and execution. I owned its release and evaluation, including the rejection of a local-model candidate that failed the output contract. At v0.0.20, it used synthetic state only; no real systems were connected.",
  },
  "quest-craft": {
    status: "Reviewed prototype · public reviewer snapshot",
    summary: "I designed a three-path interaction for an adult Game Master handling an unexpected player choice. I directed AI-assisted development, evaluation and corrections; the adult can accept, revise or ignore the suggestions. The public reviewer snapshot documents this work; it is not the private implementation or a general child-safety result.",
  },
};
const exactEnergyBoundary =
  "Energy is historical governance context and a direction of interest—not evidence of an implemented energy system. The current work does not yet establish electrical engineering, controls, embedded, power-systems, or hardware implementation experience.";
const exactMetadata = {
  title: "Resume | William Drew Baker",
  description:
    "Portfolio of Drew Baker: inspectable software systems, geospatial evidence workflows, bounded model evaluation, and climate-relevant technical work.",
  openGraphDescription:
    "Portfolio of Drew Baker: inspectable software systems, geospatial evidence workflows, bounded model evaluation, and climate-relevant technical work.",
  twitterDescription:
    "Portfolio of Drew Baker: inspectable software systems, geospatial evidence workflows, bounded model evaluation, and climate-relevant technical work.",
};
const expectedHierarchy = {
  selectedProjectIds: ["burnlens", "runbook-sentinel", "quest-craft"],
  selectedProjectHierarchy: ["flagship", "flagship", "supporting-prototype"],
  researchAndWritingProjectIds: [
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp",
  ],
  omittedSelectedProjectIds: ["openclaw-showcase"],
};
const expectedResumeFields = {
  burnlens: [
    "personalRole", "implementation", "testStrategy", "outcome", "limitations", "maturity",
  ],
  "runbook-sentinel": [
    "personalRole", "implementation", "stack", "testStrategy", "outcome", "limitations", "maturity",
  ],
  "quest-craft": [
    "personalRole", "implementation", "testStrategy", "outcome", "limitations", "maturity",
  ],
  "hierarchical-clustering": ["problem", "limitations", "maturity"],
  "energy-sector-data-governance": [
    "problem", "personalRole", "outcome", "limitations", "maturity",
  ],
  "der-dcp": ["problem", "personalRole", "outcome", "limitations", "maturity"],
};
const expectedCapabilities = {
  burnlens: {
    eeEvidence: false,
    operational: false,
    implementedSystem: true,
    evaluatedSystem: true,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: true,
    currentGuidance: false,
  },
  "runbook-sentinel": {
    eeEvidence: false,
    operational: false,
    implementedSystem: true,
    evaluatedSystem: true,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: true,
    currentGuidance: false,
  },
  "quest-craft": {
    eeEvidence: false,
    operational: false,
    implementedSystem: true,
    evaluatedSystem: true,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: false,
    currentGuidance: false,
  },
  "hierarchical-clustering": {
    eeEvidence: false,
    operational: false,
    implementedSystem: false,
    evaluatedSystem: false,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: false,
    currentGuidance: false,
  },
  "energy-sector-data-governance": {
    eeEvidence: false,
    operational: false,
    implementedSystem: false,
    evaluatedSystem: false,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: false,
    currentGuidance: false,
  },
  "der-dcp": {
    eeEvidence: false,
    operational: false,
    implementedSystem: false,
    evaluatedSystem: false,
    productionReady: false,
    hardwareImplemented: false,
    runtimeInspected: false,
    currentGuidance: false,
  },
};
const expectedEvidence = {
  burnlens: {
    personalRole: [
      "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
      ["burnlens-pinned-tree"],
    ],
    implementation: [
      "The public release had to remain useful while excluding credentials, private owner responses, private logs, and machine-local paths, without implying official or operational capability.",
      ["burnlens-pinned-tree"],
    ],
    testStrategy: [
      "Reliability includes recognizing when evidence is insufficient and making that stop reproducible.",
      ["burnlens-pinned-tree"],
    ],
    outcome: [
      "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
      ["burnlens-release", "burnlens-pinned-tree"],
    ],
    limitations: [
      "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
      ["burnlens-release"],
    ],
    maturity: [
      "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
      ["burnlens-release", "burnlens-pinned-tree"],
    ],
  },
  "runbook-sentinel": {
    personalRole: [
      "Repository author and release owner for the pinned public checkpoint.",
      ["rs.git_history.v0020", "rs.package_contract.0020", "rs.milestone.0020", "rs.release_audit.v0020"],
    ],
    implementation: [
      "A dependency-free synthetic control system that separates reasoning, approval, policy, execution, state, and audit.",
      ["rs.architecture.v0020", "rs.threat_model.v0020", "rs.package_contract.0020", "rs.pyproject.v0020"],
    ],
    stack: [
      "Pinned standard-library runtime and release primitives.",
      ["rs.pyproject.v0020", "rs.architecture.v0020", "rs.package_contract.0020", "rs.release_audit.v0020"],
    ],
    testStrategy: [
      "Exact synthetic trajectories and terminal states, split-aware coverage, fail-closed contracts, package parity, and real-surface verification.",
      ["rs.evaluation.v0020", "rs.milestone.0020", "rs.package_contract.0020", "rs.release_audit.v0020"],
    ],
    outcome: [
      "The pinned v0.0.20 synthetic release passed its exact deterministic gate and excluded the weaker local-model candidate.",
      ["rs.evaluation.v0020", "rs.model_comparison.0018", "rs.evaluation_report.v0020", "rs.release_audit.v0020", "rs.status.v0020"],
    ],
    limitations: [
      "A released synthetic testbed with explicit infrastructure, identity, trace, security, and evaluation limits.",
      ["rs.readme.v0020", "rs.threat_model.v0020", "rs.release_audit.v0020", "rs.model_comparison.0018"],
    ],
    maturity: [
      "Verified synthetic testbed with a public v0.0.20 release and zero real systems connected.",
      ["rs.release_audit.v0020", "rs.status.v0020", "rs.evaluation.v0020", "rs.git.v0020"],
    ],
  },
  "quest-craft": {
    personalRole: [
      "Product and system designer and release owner directing AI-assisted implementation, evaluation, correction, and approval.",
      ["quest.readme-ai-use", "quest.source-gate"],
    ],
    implementation: [
      "One constrained generation request produces three structured paths while local checks and the adult authority rail remain outside the model step.",
      ["quest.snapshot", "quest.guardrails", "quest.source-gate"],
    ],
    testStrategy: [
      "A fixed release suite of 12 synthetic scenarios, three retained rows each, human-scored cells, local privacy rejections, and corrective reruns.",
      ["quest.results", "quest.attempts", "quest.source-gate"],
    ],
    outcome: [
      "The reviewer snapshot retains 36 rows: 33 model generations, three local privacy rejections, six failed or superseded attempts, and two behavior corrections.",
      ["quest.results", "quest.attempts", "quest.source-gate"],
    ],
    limitations: [
      "A bounded public reviewer snapshot, not the private canonical implementation or a general safety result.",
      ["quest.source-gate", "quest.snapshot"],
    ],
    maturity: [
      "Reviewed prototype represented by a frozen public reviewer snapshot.",
      ["quest.snapshot", "quest.source-gate"],
    ],
  },
  "hierarchical-clustering": {
    problem: [
      "A historical notebook exploration compared HDBSCAN behavior under Jaccard, Euclidean, and Rogers-Tanimoto distance choices.",
      ["hc.snapshot", "hc.archive-gate"],
    ],
    limitations: [
      "Not a current reproducible study; source variants, data identity, environment, outputs, evaluation, authorship, and rights remain bounded or unresolved.",
      ["hc.designed-use-gate", "hc.archive-gate"],
    ],
    maturity: [
      "Historical coursework retained as a link-only archive artifact.",
      ["hc.snapshot", "hc.archive-gate"],
    ],
  },
  "energy-sector-data-governance": {
    problem: [
      "Frame energy-sector data-governance risks and policy choices as a December 2025 writing artifact.",
      ["policy.reader", "policy.archive-gate"],
    ],
    personalRole: [
      "William Baker's bylined research, writing, revision, formatting, and visualization work on a 14-page brief.",
      ["policy.reader", "policy.risk-gate", "policy.archive-gate"],
    ],
    outcome: [
      "A completed, bylined 14-page December 2025 policy-writing sample; no policy impact is claimed.",
      ["policy.reader", "policy.archive-gate"],
    ],
    limitations: [
      "Agency terminology and time-sensitive claims require correction and fresh verification; original stock and Canva imagery cannot be reused.",
      ["policy.risk-gate", "policy.archive-gate"],
    ],
    maturity: [
      "Historical coursework retained as a link-only policy-writing artifact.",
      ["policy.reader", "policy.archive-gate"],
    ],
  },
  "der-dcp": {
    problem: [
      "Explore governance and evaluation planning for a distributed-energy control concept in a historical coursework proposal.",
      ["der.document", "der.archive-gate", "der.owner-decision"],
    ],
    personalRole: [
      "Historical proposal by William Baker for SCLA 521 Societal Impacts of AI, using the exact owner-approved public attribution.",
      ["der.owner-decision", "der.archive-gate"],
    ],
    outcome: [
      "A completed historical proposal artifact; no system result, validation, deployment, or impact is claimed.",
      ["der.document", "der.archive-gate", "der.owner-decision"],
    ],
    limitations: [
      "No system was implemented or evaluated; the 2025 compliance framing is not current guidance; the embedded research log remains excluded.",
      ["der.archive-gate", "der.owner-decision", "release.owner-decision"],
    ],
    maturity: [
      "Historical coursework retained as a link-only proposal.",
      ["der.document", "der.archive-gate", "der.owner-decision"],
    ],
  },
};
const expectedTechnologyItems = {
  "runbook-sentinel": [
    ["Python 3.12+", "Runtime, evaluation harness, verifiers, API and bounded diagnostic-tool server, and packaging"],
    ["SQLite", "Synthetic state, proposals, approvals, idempotency, execution, and audit persistence"],
    ["JSON records and chained event logs", "Contracts, evaluation artifacts, traces, and evidence bindings"],
    ["JSON-RPC over stdio", "Diagnostic and read-only tool surface with no approval or execution tool"],
    ["Python zipapp", "Dependency-free release artifact with exact allowlist and hashes"],
    ["Loopback HTTP and server-rendered HTML", "Local operator, API, and dashboard surfaces"],
  ],
};
const expectedHistoricalMetadata = [
  {
    id: "hierarchical-clustering",
    context: "Historical coursework · Jupyter notebook",
    date: "Repository snapshot · 18 Aug 2025",
    dateTime: "2025-08-18",
    sourceId: "hc.snapshot",
    sourceLabel: "Inspect the frozen repository snapshot",
  },
  {
    id: "energy-sector-data-governance",
    context: "Historical coursework · policy brief",
    date: "December 2025",
    dateTime: "2025-12",
    sourceId: "policy.reader",
    sourceLabel: "Read the public brief",
  },
  {
    id: "der-dcp",
    context: "Historical coursework · distributed-energy control proposal",
    date: "Proposal revision · 13 Nov 2025",
    dateTime: "2025-11-13",
    sourceId: "der.document",
    sourceLabel: "Read the historical proposal",
  },
];

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

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

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

function replaceExactlyOnce(source, current, predecessor, location) {
  assert.equal(countOccurrences(source, current), 1, `${location}: expected one exact reviewed replacement.`);
  return source.replace(current, predecessor);
}

// The current identities do not replace preservation evidence. Reverse only
// the declared editorial/progressive-disclosure delta, then prove every byte
// of the complete accepted NFA-084 page and NFA-073 stylesheet unchanged.
const readerProjectionStart = "// NFA-086 reader-first projection start. Canonical records remain below each summary.\n";
const readerProjectionEnd = "// NFA-086 reader-first projection end.\n\n";
const readerProjection = between(pageSource, readerProjectionStart, readerProjectionEnd, pagePath)
  + readerProjectionEnd;
for (const { status, summary } of Object.values(exactContributionCopy)) {
  requireText(readerProjection, `status: ${JSON.stringify(status)}`, pagePath);
  requireText(readerProjection, `summary: ${JSON.stringify(summary)}`, pagePath);
}
let resumeBeforeContributionIntegration = replaceExactlyOnce(pageSource, readerProjection, "", pagePath);
for (const [current, predecessor] of [
  ['    readerCopy: resumeReaderCopy[projectId],\n', ""],
  ['  const { project, sourceId, tier, readerCopy } = entry;', '  const { project, sourceId, tier } = entry;'],
  ['  const readerSourceIds = [...new Set(fields.flatMap((field) => supported(project.id, field).sourceIds))];\n', ""],
  [`        <small data-resume-project-status={project.id} data-source-ids={maturity.sourceIds.join(" ")}>
          {readerCopy.status}
        </small>`, `        <small
          data-evidence-field="maturity"
          data-evidence-owner={\`\${project.id}.maturity\`}
          data-field-key="maturity"
          data-field-owner="maturity"
          data-source-ids={maturity.sourceIds.join(" ")}
        >
          {resumeReaderFirst(maturity.summary)}
        </small>`],
  [`        <p className={styles.projectIntro} data-resume-contribution={project.id} data-source-ids={readerSourceIds.join(" ")}>
          {readerCopy.summary}
        </p>
        <details className={styles.projectDetails} data-resume-project-details={project.id}>
          <summary>Methods and release details <span className="sr-only">for {project.title}</span></summary>
          <p
            className={styles.fullMaturity}
            data-evidence-field="maturity"
            data-evidence-owner={\`\${project.id}.maturity\`}
            data-field-key="maturity"
            data-field-owner="maturity"
            data-source-ids={maturity.sourceIds.join(" ")}
          >
            {resumeReaderFirst(maturity.summary)}
          </p>
          <ProjectFactLedger
            className={styles.projectFacts}
            data-resume-project-facts={project.id}
            facts={projectFacts}
          />
        </details>`, `        <ProjectFactLedger
          className={styles.projectFacts}
          data-resume-project-facts={project.id}
          facts={projectFacts}
        />`],
  ['<p className={styles.eyebrow}>Résumé / selected work</p>', '<p className={styles.eyebrow}>Public résumé / evidence edition</p>'],
  [exactRoleLine, "Software engineering · Geospatial evidence · Climate-relevant systems"],
  [`                I develop software and explore geospatial questions, from a synthetic Python
                incident-response testbed to satellite heat-exposure maps. I frame the problem,
                make product decisions and work with Codex on implementation and testing.`, `                Software engineer building inspectable systems, deterministic software authorization
                boundaries, and geospatial evidence workflows for high-consequence settings. Public
                projects show bounded model evaluation and release testing; historical coursework
                adds energy-policy context.`],
  [`          <p className={styles.printEvidenceHint} data-resume-details-print-fallback>
            Before printing the full record, expand each project’s methods and release details.
          </p>

`, ""],
  ['<p>What I built and directed</p>', '<p>Hiring order / implemented and evaluated work</p>'],
  ['<h2 id="projects-heading">Selected projects</h2>', '<h2 id="projects-heading">Selected project evidence</h2>'],
  ['Copy review: 15 October 2026', 'Last editorial review: August 2026'],
]) {
  resumeBeforeContributionIntegration = replaceExactlyOnce(resumeBeforeContributionIntegration, current, predecessor, pagePath);
}
assert.equal(Buffer.byteLength(resumeBeforeContributionIntegration), 22_012,
  "NFA-086 must reconstruct the complete accepted NFA-084 résumé page byte length.");
assert.equal(sha256(resumeBeforeContributionIntegration), predecessorTargetHashes[pagePath],
  "NFA-086 must preserve every predecessor résumé source byte outside its declared delta.");
const disclosureStylesStart = "/* NFA-086 reader-first disclosure styles start. */\n";
const disclosureStylesEnd = "/* NFA-086 reader-first disclosure styles end. */\n\n";
const disclosureStyles = between(cssSource, disclosureStylesStart, disclosureStylesEnd, cssPath)
  + disclosureStylesEnd;
const cssBeforeContributionIntegration = replaceExactlyOnce(cssSource, disclosureStyles, "", cssPath);
assert.equal(Buffer.byteLength(cssBeforeContributionIntegration), acceptedNfa073Css.bytes);
assert.equal(sha256(cssBeforeContributionIntegration), acceptedNfa073Css.sha256,
  "NFA-086 must preserve every predecessor stylesheet byte outside its explicit added block.");

function ruleBody(selectorPattern, location) {
  const match = cssSource.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, "s"));
  assert.ok(match, `${location}: required CSS rule is missing.`);
  return match[1];
}

function cssNumber(body, property, location) {
  const match = body.match(new RegExp(`${property}\\s*:\\s*(-?[\\d.]+)(rem|em|px)?\\s*;`));
  assert.ok(match, `${location}: ${property} must use an inspectable numeric value.`);
  return Number.parseFloat(match[1]);
}

// NFA091-BEGIN
// Accepted local NFA091 candidate identities only; not owner/release approval.
// Preserve both historical registries and the entire predecessor U06 guard,
// including all its old checks, before adapting only its page and guard targets.
const acceptedLocalNfa091U06Targets = {
  page: {
    path: "app/work/openclaw-showcase/page.tsx",
    bytes: 19_402,
    sha256: "ef7f2b39a57e4fd227e7621e0c89a13b6c579afad91a32b1ad17a783392d9f5c",
  },
  guard: {
    path: "scripts/verify-openclaw-u06.mjs",
    bytes: 35_866,
    sha256: "bc697c1f2ecd9f9bd621a2dab707b98863cc7fbd531af0a4788346748543481d",
    predecessorBytes: 32_606,
    predecessorSha256: "02c1f086a084a5069cebececfd62cfd0494542aeaaa265df0904da129192197c",
  },
};
const nfa091U06GuardSource = read(acceptedLocalNfa091U06Targets.guard.path);
const nfa091U06BlockStart = "// NFA091-BEGIN\n";
const nfa091U06BlockEnd = "// NFA091-END\n\n";
assert.equal(countOccurrences(nfa091U06GuardSource, nfa091U06BlockStart), 1,
  "The NFA091 U06 migration must have exactly one explicit insertion start.");
assert.equal(countOccurrences(nfa091U06GuardSource, nfa091U06BlockEnd), 1,
  "The NFA091 U06 migration must have exactly one explicit insertion end.");
const nfa091U06Insertion = between(nfa091U06GuardSource, nfa091U06BlockStart,
  nfa091U06BlockEnd, acceptedLocalNfa091U06Targets.guard.path) + nfa091U06BlockEnd;
const nfa091PredecessorU06Guard = replaceExactlyOnce(nfa091U06GuardSource,
  nfa091U06Insertion, "", acceptedLocalNfa091U06Targets.guard.path);
assert.equal(Buffer.byteLength(nfa091PredecessorU06Guard),
  acceptedLocalNfa091U06Targets.guard.predecessorBytes,
  "Removing only the NFA091 insertion must reconstruct the full predecessor U06 guard byte length.");
assert.equal(sha256(nfa091PredecessorU06Guard),
  acceptedLocalNfa091U06Targets.guard.predecessorSha256,
  "Every predecessor U06 guard byte and check must remain unchanged outside the exact NFA091 insertion.");
assert.equal(acceptedU06Targets[acceptedLocalNfa091U06Targets.guard.path],
  acceptedLocalNfa091U06Targets.guard.predecessorSha256,
  "The inherited U06 guard identity must remain recorded in the historical registry.");
assert.equal(acceptedU06Targets[acceptedLocalNfa091U06Targets.page.path],
  "0d84b95d21edf86ae99f1c4f8bff237744e74726d8a3a5d5ff705b6a50a8ee80",
  "The inherited OpenClaw page identity must remain recorded in the historical registry.");
const nfa091InheritedU06Targets = { ...acceptedU06Targets };
for (const target of Object.values(acceptedLocalNfa091U06Targets)) {
  const currentTarget = read(target.path);
  assert.equal(Buffer.byteLength(currentTarget), target.bytes,
    `${target.path}: the exact accepted local NFA091 target byte length drifted.`);
  assert.equal(sha256(currentTarget), target.sha256,
    `${target.path}: the exact accepted local NFA091 target identity drifted.`);
  acceptedU06Targets[target.path] = target.sha256;
}
assert.deepEqual(Object.keys(acceptedU06Targets), Object.keys(nfa091InheritedU06Targets),
  "NFA091 must not expand the inherited U06 target set.");
for (const [targetPath, targetHash] of Object.entries(nfa091InheritedU06Targets)) {
  if (!Object.values(acceptedLocalNfa091U06Targets).some((target) => target.path === targetPath)) {
    assert.equal(acceptedU06Targets[targetPath], targetHash,
      `${targetPath}: NFA091 must not adapt any unrelated U06 target.`);
  }
}
// NFA091-END

for (const [path, expectedHash] of Object.entries({ ...expectedTargetHashes, ...acceptedU06Targets })) {
  assert.equal(sha256(read(path)), expectedHash, `${path}: frozen target identity drifted.`);
}
assert.equal(readFileSync(resolve(root, pagePath)).byteLength, acceptedNfa086Targets.page.bytes);
assert.equal(readFileSync(resolve(root, cssPath)).byteLength, acceptedNfa086Targets.css.bytes,
  `${cssPath}: reviewed NFA-086 disclosure presentation byte length drifted.`);
const projectLinksBlock = between(
  pageSource,
  '<div className={styles.projectLinks}>',
  "</div>",
  `${pagePath} selected-project links`,
);
assert.equal(countOccurrences(projectLinksBlock, "for {project.title}"), 2,
  "Each repeated selected-project link type must include the canonical project title in its accessible name.");
requireText(
  projectLinksBlock,
  '<span className="sr-only">for {project.title} </span>',
  `${pagePath} case-study and field-note link context`,
);
requireText(
  projectLinksBlock,
  "for {project.title} (opens in a new tab)",
  `${pagePath} pinned-evidence link context`,
);
const profileLinksBlock = between(
  pageSource,
  '<nav className={styles.profileLinks} aria-label="Public professional profiles">',
  '<PrintButton className={styles.printButton} />',
  `${pagePath} profile links`,
);
assert.equal(countOccurrences(profileLinksBlock, "target=\"_blank\""), 2,
  "The public-profile block must retain exactly two external links.");
assert.equal(
  countOccurrences(profileLinksBlock, '<span className="sr-only"> (opens in a new tab)</span>'),
  2,
  "Exactly the two public-profile links must expose new-tab notices.",
);
const selectedLearningRender = between(
  pageSource,
  "{selectedLearning.map((item) => (",
  "</ul>",
  `${pagePath} selected-learning render`,
);
assert.equal(
  countOccurrences(
    selectedLearningRender,
    '<span className="sr-only">(opens in a new tab)</span>',
  ),
  1,
  "The linked selected-learning branch must expose one notice that renders for its four linked items only.",
);
requireText(
  selectedLearningRender,
  '{item.title} <span className="sr-only">(opens in a new tab)</span>',
  `${pagePath} selected-learning external-link name`,
);
// NFA-047 changes only BurnLens labels; retain exact predecessor reconstruction.
const burnlensLabelOverride = `  const labels = project.id === "burnlens"
    ? {
        ...resumeFieldLabels,
        personalRole: "Role split",
        implementation: "Release constraint",
        testStrategy: "Reliability lesson",
      }
    : resumeFieldLabels;
`;
requireText(pageSource, burnlensLabelOverride, `${pagePath} BurnLens evidence labels`);
assert.equal(countOccurrences(pageSource, "term: labels[field]"), 2,
  "Both résumé fact branches must consume the project-specific labels.");
const resumeBeforeLabelRepair = resumeBeforeContributionIntegration
  .replace(burnlensLabelOverride, "")
  .replaceAll("term: labels[field]", "term: resumeFieldLabels[field]");
assert.equal(Buffer.byteLength(resumeBeforeLabelRepair), 21_794);
assert.equal(sha256(resumeBeforeLabelRepair),
  "586eb15c01f995419d18700f37cf01af9fcc851ca91eb61bc76417db81c60762",
  "The NFA-047 label correction must preserve all predecessor claims and semantic repairs.");
const resumeBeforeSemanticRepair = resumeBeforeLabelRepair
  .replace('            <span className="sr-only">for {project.title} </span>\n', "")
  .replace(
    `                Inspect pinned evidence{" "}
                <span className="sr-only">
                  for {project.title} (opens in a new tab)
                </span>`,
    '                Inspect pinned evidence <span className="sr-only">(opens in a new tab)</span>',
  )
  .replaceAll('                  <span className="sr-only"> (opens in a new tab)</span>\n', "")
  .replace(
    `                          {item.title} <span className="sr-only">(opens in a new tab)</span>
                          <span aria-hidden="true">↗</span>`,
    '                          {item.title} <span aria-hidden="true">↗</span>',
  );
assert.equal(Buffer.byteLength(resumeBeforeSemanticRepair), acceptedResumeBeforeSemanticRepair.bytes,
  "The semantic repair must reconstruct the exact accepted résumé source byte length.");
assert.equal(sha256(resumeBeforeSemanticRepair), acceptedResumeBeforeSemanticRepair.sha256,
  "The résumé repair must preserve every accepted source byte outside the exact hidden semantic additions.");
const u06Start = 'test("OpenClaw is exactly three documentary movements with canonical ownership"';
const u06End = 'test("historical coursework forms a bounded reading shelf outside the case-study lane"';
const u06BrowserBlock = between(testsSource, u06Start, u06End, testsPath);
assert.equal(Buffer.byteLength(u06BrowserBlock), acceptedU06BrowserBlock.bytes);
assert.equal(sha256(u06BrowserBlock), acceptedU06BrowserBlock.sha256,
  "The accepted OpenClaw V3 browser block drifted during U07.");

assert.deepEqual(targetSurfaceHierarchy.resume, expectedHierarchy);
for (const [projectId, fields] of Object.entries(expectedResumeFields)) {
  const project = getProject(projectId);
  assert.deepEqual(projectSurfacePlan[projectId].fields.resume, fields, `${projectId}: résumé fields drifted.`);
  assert.deepEqual(project.capabilityBoundaries, expectedCapabilities[projectId],
    `${projectId}: capability boundary drifted.`);
  assert.equal(project.capabilityBoundaries.eeEvidence, false, `${projectId}: no EE evidence is established.`);
  for (const field of fields) {
    const evidence = getSupportedEvidence(projectId, field);
    assert.ok(evidence, `${projectId}.${field}: projected résumé evidence must be supported.`);
    const [summary, sourceIds] = expectedEvidence[projectId][field];
    assert.deepEqual(
      { summary: evidence.summary, sourceIds: evidence.sourceIds },
      { summary, sourceIds },
      `${projectId}.${field}: canonical evidence drifted.`,
    );
  }
}
assert.equal(getProject("quest-craft").evidence.stack.state, "missing");
assert.equal(getProject("burnlens").evidence.stack.state, "not_applicable");
assert.equal(getProject("burnlens").evidence.failureDividend.state, "not_applicable");
assert.deepEqual(projectSurfacePlan["openclaw-showcase"].fields.resume, []);

for (const [projectId, items] of Object.entries(expectedTechnologyItems)) {
  const evidence = getSupportedEvidence(projectId, "stack");
  assert.ok(evidence);
  assert.deepEqual(
    evidence.value.map(({ name, purpose }) => [toReaderFirst(name), toReaderFirst(purpose)]),
    items,
    `${projectId}: technology projection drifted.`,
  );
}
for (const expected of expectedHistoricalMetadata) {
  for (const value of [
    `id: ${expected.id === "hierarchical-clustering" ? "hierarchicalClustering" : expected.id === "energy-sector-data-governance" ? "energySectorDataGovernance" : "derDcp"}.id`,
    `context: ${JSON.stringify(expected.context)}`,
    `date: ${JSON.stringify(expected.date)}`,
    `dateTime: ${JSON.stringify(expected.dateTime)}`,
    `sourceHref: getPublicSourceHref(${JSON.stringify(expected.sourceId)})`,
    `sourceLabel: ${JSON.stringify(expected.sourceLabel)}`,
  ]) {
    requireText(compatibilitySource, value, `${compatibilityPath} ${expected.id} approved metadata`);
  }
  assert.equal(getPublicSourceHref(expected.sourceId), getProjectSource(expected.sourceId).href);
  const source = getProjectSource(expected.sourceId);
  assert.equal(source.availability, "public");
  assert.match(source.claimBoundary, /historical|reviewer|not|only|boundary/i);
}

const selectedLearningBlock = between(pageSource, "const selectedLearning = [", "] as const;", pagePath);
assert.equal((selectedLearningBlock.match(/\{\s*title:/g) ?? []).length, 5,
  "Selected learning must contain exactly five entries.");
assert.equal((selectedLearningBlock.match(/href:\s*"https:\/\//g) ?? []).length, 4,
  "Selected learning must contain exactly four credential links.");
assert.equal((selectedLearningBlock.match(/href:\s*null/g) ?? []).length, 1,
  "Selected learning must retain exactly one unlinked study entry.");
reject(pageSource, /Mimo|virtualbadge|309dfe20-7aec-47a8-a208-b4622bb1b74c/i, pagePath,
  "the removed Mimo credential must not remain on the public résumé");

for (const value of [
  'data-resume-surface="public-resume"',
  'data-resume-lane="selected-project-evidence"',
  'data-resume-lane="research-and-writing"',
  "data-resume-project={project.id}",
  "data-resume-hierarchy={tier}",
  "data-resume-project-facts={project.id}",
  "data-resume-history={project.id}",
  "data-resume-history-facts={projectId}",
  "data-field-owner",
  "data-field-key",
  "data-source-ids",
  "data-technology-binding={item.name}",
  'data-capability-boundary="energy-ee"',
  exactRoleLine,
]) {
  requireText(pageSource, value, pagePath);
}
for (const value of [
  "getProject",
  "getPublicSourceHref",
  "getSupportedEvidence",
  "projectSurfacePlan",
  "targetSurfaceHierarchy",
  "toReaderFirst",
  "project.title",
]) {
  requireText(pageSource, value, pagePath);
}
for (const value of [
  'data-resume-project-status={project.id}',
  'data-resume-contribution={project.id} data-source-ids={readerSourceIds.join(" ")}',
  'const readerSourceIds = [...new Set(fields.flatMap((field) => supported(project.id, field).sourceIds))];',
  '<details className={styles.projectDetails} data-resume-project-details={project.id}>',
  '<summary>Methods and release details <span className="sr-only">for {project.title}</span></summary>',
  'data-resume-details-print-fallback',
  'Before printing the full record, expand each project’s methods and release details.',
  'Résumé / selected work',
  'Copy review: 15 October 2026',
  'What I built and directed',
  '<h2 id="projects-heading">Selected projects</h2>',
]) requireText(pageSource, value, pagePath);
const projectDetailsRender = between(pageSource,
  '<details className={styles.projectDetails}', '</details>', `${pagePath} native canonical details`);
requireText(projectDetailsRender, 'data-evidence-owner={`${project.id}.maturity`}', pagePath);
requireText(projectDetailsRender, '<ProjectFactLedger', pagePath);
assert.ok(projectDetailsRender.indexOf('data-evidence-owner') < projectDetailsRender.indexOf('<ProjectFactLedger'),
  'The full canonical maturity owner must remain before the unchanged fact ledger.');
reject(projectDetailsRender, /\bopen(?:\s|=|>)/, pagePath, 'selected project disclosures must start collapsed');
reject(projectDetailsRender, /projectLinks|<EvidenceLink|href=/, pagePath,
  'primary project and pinned-evidence links must remain outside collapsed disclosures');
reject(pageSource, /["']use client["']|\bon(?:Click|Toggle|KeyDown|KeyUp)\s*=/, pagePath,
  'the contribution and native disclosure layer must not add a client runtime');
for (const value of [
  '.page summary:focus-visible',
  '@supports not selector(::details-content)',
  '.projectDetails::details-content',
  'display: block !important;',
  'content-visibility: visible !important;',
]) requireText(disclosureStyles, value, cssPath);
for (const token of exactSummary.split(" ")) requireText(pageSource, token, pagePath);
for (const token of exactEnergyBoundary.split(" ")) requireText(pageSource, token, pagePath);
for (const value of Object.values(exactMetadata)) requireText(pageSource, value, pagePath);
for (const value of [
  "https://github.com/drwbkr1",
  "github.com/drwbkr1",
  "https://www.linkedin.com/in/william-baker-843946162/",
  "linkedin.com/in/william-baker-843946162",
]) {
  requireText(pageSource, value, pagePath);
}

reject(pageSource, /const\s+projectEvidence\b/, pagePath,
  "selected project facts must not be duplicated in a local static array");
reject(pageSource, /openclaw-showcase/i, pagePath,
  "OpenClaw must remain absent from the résumé surface");
for (const term of [
  "ChromaDB", "GeoPandas", "rioxarray", "Google Earth Engine", "Cloud Optimized GeoTIFF",
  "RAG workflows", "embeddings", "API and tool integration", "prompt design",
  "CV-to-GEOINT", "Synthetic safety testbed",
]) {
  reject(pageSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), pagePath,
    `unsupported or stale résumé term ${term} is forbidden`);
}
reject(pageSource, /\bSTAC\b/i, pagePath, "unsupported or stale résumé term STAC is forbidden");
const historyRender = between(pageSource, "{researchAndWriting.map", "</ul>", pagePath);
reject(historyRender, /item\.(?:title|summary|boundary|sourceHref|sourceLabel)\b/, pagePath,
  "compatibility coursework may provide only approved identity, context, and date metadata");
const compatibilityMap = between(pageSource, "const researchAndWriting =", "type EvidenceKey", pagePath);
reject(compatibilityMap, /item\.(?:title|summary|boundary|sourceHref|sourceLabel)\b/, pagePath,
  "compatibility coursework may provide only approved identity, context, and date metadata");
for (const value of ["item.context", "item.dateTime", "item.date"]) {
  requireText(compatibilityMap, value, pagePath);
}
for (const value of ["problem", "personalRole", "outcome", "limitations", "maturity"]) {
  requireText(pageSource, value, `${pagePath} historical canonical-field projection`);
}

reject(cssSource, /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/i, cssPath,
  "route CSS must consume shared palette tokens rather than declare color primitives");
reject(cssSource, /--[a-z][\w-]*\s*:/i, cssPath,
  "route CSS must not redeclare shared primitive or semantic tokens");
reject(cssSource, /\.resume\s*\{[^}]*overflow\s*:\s*(?:hidden|clip)\s*;/s, cssPath,
  "the résumé root must not blanket-clip content or mask responsive failures");
for (const value of [
  "@media (prefers-reduced-motion: reduce)",
  "@media (forced-colors: active)",
  "@media print",
  '[data-resume-hierarchy="supporting-prototype"]',
  '[data-evidence-field="limitations"]',
  "break-inside: avoid",
]) {
  requireText(cssSource, value, cssPath);
}
const focusRule = ruleBody("\\.page a:focus-visible,[\\s\\n]*\\.page button:focus-visible", "résumé focus rule");
assert.match(focusRule, /outline\s*:\s*3px\s+solid\s+var\(--color-focus\)\s*;/);
assert.match(focusRule, /outline-offset\s*:\s*4px\s*;/);
const summaryFocusRule = ruleBody("\\.page summary:focus-visible", "résumé native disclosure focus rule");
assert.match(summaryFocusRule, /outline\s*:\s*3px\s+solid\s+var\(--color-focus\)\s*;/);
assert.match(summaryFocusRule, /outline-offset\s*:\s*4px\s*;/);
const pageRule = ruleBody("\\.page", "résumé page rule");
assert.ok(cssNumber(pageRule, "font-size", "résumé page rule") >= 1);
assert.ok(cssNumber(pageRule, "line-height", "résumé page rule") >= 1.6);
const heroRule = ruleBody("\\.hero h1", "résumé hero title");
assert.ok(cssNumber(heroRule, "line-height", "résumé hero title") >= 0.93,
  "Résumé title line-height must retain the design-system mixed-case floor.");
assert.ok(cssNumber(heroRule, "letter-spacing", "résumé hero title") >= -0.04,
  "Résumé title tracking must retain the design-system mixed-case floor.");
const summaryRule = ruleBody("\\.summary", "résumé lead");
const leadClamp = summaryRule.match(/font-size\s*:\s*clamp\(\s*([\d.]+)rem[^,]*,[^,]*,\s*([\d.]+)rem\s*\)/);
assert.ok(leadClamp, "Résumé lead must use an inspectable clamp.");
assert.ok(Number.parseFloat(leadClamp[1]) >= 1.0625 && Number.parseFloat(leadClamp[2]) <= 1.25,
  "Résumé lead must remain within the canonical 1.0625–1.25rem range.");
assert.ok(cssNumber(summaryRule, "line-height", "résumé lead") >= 1.55);
const technologyRule = ruleBody(
  "\\.projectFacts \\[data-technology-binding\\] strong,[\\s\\n]*\\.projectFacts \\[data-technology-binding\\] span",
  "technology evidence type",
);
assert.ok(cssNumber(technologyRule, "font-size", "technology evidence type") >= 1,
  "Technology evidence is substantive copy and must be at least 1rem.");
assert.ok(cssNumber(technologyRule, "line-height", "technology evidence type") >= 1.6,
  "Technology evidence must retain 1.6 line-height.");
const visibleRemSizes = [...cssSource.matchAll(/font-size\s*:\s*(?!clamp)([\d.]+)rem\s*;/g)]
  .map((match) => Number.parseFloat(match[1]));
assert.ok(visibleRemSizes.length > 0);
assert.ok(Math.min(...visibleRemSizes) >= 0.8125,
  "The résumé route has no redundant provenance tier; all visible rem text must be at least 0.8125rem.");
const printRule = cssSource.slice(cssSource.lastIndexOf("@media print {"));
for (const value of [
  ".profileLinks",
  ".profileLinks a",
  ".printButton",
  "display: none",
  "overflow: visible",
  ".privacyNote",
  ".capabilityBoundary",
]) {
  requireText(printRule, value, `${cssPath} print rules`);
}
for (const value of [
  "--olive: #757f64",
  "--terracotta: #cb7a5c",
  "--sand: #e9e2d8",
  "--sage: #c7cdbf",
  "--teal: #5c757a",
  "--charcoal: #222222",
  "--terracotta-dark: #7a3828",
  "--olive-dark: #48513f",
  "--teal-dark: #314e54",
]) {
  requireText(globalCss, value, "shared palette foundation");
}

assert.equal(
  packageJson.scripts["verify:resume-u07"],
  "node --experimental-strip-types scripts/verify-resume-u07.mjs",
  "package.json must expose the U07 verifier.",
);
assert.match(
  packageJson.scripts.check,
  /verify:openclaw-u06\s+&&\s+npm run verify:media\s+&&\s+npm run verify:resume-u07/,
  "U07 must run after the accepted U06 and media gates.",
);
assert.equal(packageJson.scripts.verify, "npm run check && npm run test:site");
for (const requiredPath of [
  pagePath,
  cssPath,
  compatibilityPath,
  modelPath,
  "scripts/verify-resume-u07.mjs",
  testsPath,
]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from explicit public files.`);
}
assert.ok(publicAllowlist.script_files.includes("scripts/verify-resume-u07.mjs"),
  "The U07 verifier is absent from script_files.");
for (const value of [
  "résumé projects canonical hierarchy, provenance, no-JavaScript, and technology bindings",
  "résumé survives every review width, text zoom, forced colors, reduced motion, and print",
  "résumé metadata, professional profile URLs, and isolated performance remain bounded",
]) {
  requireText(testsSource, value, testsPath);
}
for (const value of [
  "selectedProjectIds", "researchAndWritingProjectIds", "technologyRequiresSupportedStackOrTestSource",
]) {
  requireText(modelSource, value, modelPath);
}
requireText(compatibilitySource,
  "Not a current reproducible study; source variants, data identity, environment, outputs, evaluation, authorship, and rights remain bounded or unresolved.",
  compatibilityPath);

console.log(JSON.stringify({
  status: "pass",
  route: "/resume",
  selected: expectedHierarchy.selectedProjectIds,
  hierarchy: expectedHierarchy.selectedProjectHierarchy,
  researchAndWriting: expectedHierarchy.researchAndWritingProjectIds,
  omittedSelected: expectedHierarchy.omittedSelectedProjectIds,
  targetHashes: expectedTargetHashes,
  predecessorTargetHashes,
  acceptedNfa073Css,
  acceptedNfa086Targets,
  completePredecessorReconstruction: { pageBytes: Buffer.byteLength(resumeBeforeContributionIntegration), cssBytes: Buffer.byteLength(cssBeforeContributionIntegration) },
  acceptedResumeBeforeSemanticRepair,
  acceptedU06Targets,
  predecessorU06Targets,
  acceptedU06BrowserBlock,
}));
