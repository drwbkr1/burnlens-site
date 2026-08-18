/**
 * Public-safe, recruiter-scale project truth for the Nordic Field Atlas.
 *
 * This module is data-only in the first M008-U01 slice. Internal source IDs are
 * retained for evidence integrity, but their locators and immutable identities
 * are deliberately redacted from this public file.
 */

export const projectIds = [
  "burnlens",
  "runbook-sentinel",
  "quest-craft",
  "openclaw-showcase",
  "hierarchical-clustering",
  "energy-sector-data-governance",
  "der-dcp"
] as const;

export type ProjectId = (typeof projectIds)[number];
export type NonEmpty<T> = readonly [T, ...T[]];
export type ProjectLane = "flagship" | "supporting" | "archive";
export type EvidenceStrength = "verified" | "bounded" | "historical";
export type Maturity =
  | "released-research-prototype"
  | "verified-synthetic-testbed"
  | "reviewed-prototype"
  | "public-documentation-artifact"
  | "historical-coursework";

export type ProjectPlacement =
  | {
      lane: "flagship";
      treatment: "designed-case-study";
      route: `/work/${string}`;
      routeType: "full-case-study";
      visualWorld: "field-atlas" | "control-trace";
    }
  | {
      lane: "supporting";
      treatment: "designed-case-study";
      route: `/work/${string}`;
      routeType: "supporting-field-note";
      visualWorld: "branching-manuscript" | "disclosure-folio";
    }
  | {
      lane: "archive";
      treatment: "link-only-shelf";
      route: null;
      routeType: "external-link-only";
      visualWorld: "historical-reading-shelf";
    };

export type SourceBinding = {
  id: string;
  projectIds: NonEmpty<ProjectId>;
  label: string;
  kind: "git" | "artifact" | "document" | "media" | "local-record" | "gate";
  availability: "public" | "internal-only";
  href?: `https://${string}`;
  repositoryPath?: `public/${string}`;
  immutableIdentity?: string;
  fileSha256?: string;
  observedAt?: string;
  reuse:
    | "linked-evidence-no-copy"
    | "project-owned-licensed"
    | "owner-directed-no-general-license"
    | "link-only"
    | "internal-gate-only";
  claimBoundary: string;
};

export const projectSources = {
  "burnlens-pinned-tree": {
    "id": "burnlens-pinned-tree",
    "projectIds": [
      "burnlens"
    ],
    "label": "BurnLens post-release evidence snapshot",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/burnlens-deschutes/tree/a741111d82e69689022d2058118ed8f4b9bf3546",
    "immutableIdentity": "commit a741111d82e69689022d2058118ed8f4b9bf3546",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports exact project-owned governance, audience, role assignment, publication boundary, lifecycle, lesson, and missing-next-step facts only."
  },
  "burnlens-release": {
    "id": "burnlens-release",
    "projectIds": [
      "burnlens"
    ],
    "label": "BurnLens v0.56.0 tagged release",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/burnlens-deschutes/releases/tag/v0.56.0-baseline-first-portfolio-release",
    "immutableIdentity": "tag v0.56.0-baseline-first-portfolio-release at e2e0b778038b2b5cd55258c784951ef2d1473469",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports release identity, maturity, lifecycle, and non-operational limitation only."
  },
  "der.archive-gate": {
    "id": "der.archive-gate",
    "projectIds": [
      "der-dcp"
    ],
    "label": "DER-DCP exact archive-link gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Allows exact bounded historical-coursework treatment only."
  },
  "der.document": {
    "id": "der.document",
    "projectIds": [
      "der-dcp"
    ],
    "label": "DER-DCP native Google Doc",
    "kind": "document",
    "availability": "public",
    "href": "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
    "immutableIdentity": "file 1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw; observed revision 6173",
    "observedAt": "2026-08-10T21:22:52.646Z",
    "reuse": "link-only",
    "claimBoundary": "Link-only historical proposal; document text, imagery, layout, research log, and raw Drive metadata remain excluded."
  },
  "der.owner-decision": {
    "id": "der.owner-decision",
    "projectIds": [
      "der-dcp"
    ],
    "label": "DER-DCP owner attribution decision",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Supplies public display title, byline, course context, and local archive disposition only."
  },
  "hc.archive-gate": {
    "id": "hc.archive-gate",
    "projectIds": [
      "hierarchical-clustering"
    ],
    "label": "Historical coursework archive-link gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Allows only the frozen link, date, bounded historical summary, and present limitation."
  },
  "hc.designed-use-gate": {
    "id": "hc.designed-use-gate",
    "projectIds": [
      "hierarchical-clustering"
    ],
    "label": "Hierarchical clustering designed-use gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Blocks designed-case, numerical-result, reproducibility, and flagship claims."
  },
  "hc.snapshot": {
    "id": "hc.snapshot",
    "projectIds": [
      "hierarchical-clustering"
    ],
    "label": "Hierarchical clustering frozen repository snapshot",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/Grad504-Hierarchical-Cluster-Project/tree/21e9b18b37a0e1acd9f2814cca3456b94849c098",
    "immutableIdentity": "commit 21e9b18b37a0e1acd9f2814cca3456b94849c098",
    "reuse": "link-only",
    "claimBoundary": "Historical notebook existence and method choices only; saved outputs are not verified results."
  },
  "openclaw.receipt-doc": {
    "id": "openclaw.receipt-doc",
    "projectIds": [
      "openclaw-showcase"
    ],
    "label": "OpenClaw sanitized representative receipt",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/examples/sanitized-run-receipt.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Representative example, not an actual-run receipt or raw trace."
  },
  "openclaw.safety-doc": {
    "id": "openclaw.safety-doc",
    "projectIds": [
      "openclaw-showcase"
    ],
    "label": "OpenClaw public safety-boundary document",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/docs/safety-boundaries.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Documentation boundary only; not software-enforced security proof."
  },
  "openclaw.snapshot": {
    "id": "openclaw.snapshot",
    "projectIds": [
      "openclaw-showcase"
    ],
    "label": "OpenClaw Showcase public snapshot",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/openclaw-showcase/tree/3695666f6a44c095674049e64d23f0bdace2fb70",
    "immutableIdentity": "commit 3695666f6a44c095674049e64d23f0bdace2fb70; tree f7629e844aa1e93be622a0b7a9307afd7b3beab5",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Public documentation snapshot only; excluded runtime remains uninspected."
  },
  "openclaw.source-gate": {
    "id": "openclaw.source-gate",
    "projectIds": [
      "openclaw-showcase"
    ],
    "label": "OpenClaw Showcase source gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Authorizes only a local documentary route without runtime claims."
  },
  "openclaw.workflow-doc": {
    "id": "openclaw.workflow-doc",
    "projectIds": [
      "openclaw-showcase"
    ],
    "label": "OpenClaw public workflow model",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/openclaw-showcase/blob/3695666f6a44c095674049e64d23f0bdace2fb70/docs/agentic-studio-workflow.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Conceptual public workflow model, not evidence of runtime execution or enforcement."
  },
  "policy.archive-gate": {
    "id": "policy.archive-gate",
    "projectIds": [
      "energy-sector-data-governance"
    ],
    "label": "Policy brief archive-link gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Allows only a link, date, bounded process description, and current limitation."
  },
  "policy.reader": {
    "id": "policy.reader",
    "projectIds": [
      "energy-sector-data-governance"
    ],
    "label": "Energy Sector Data Governance public reader",
    "kind": "document",
    "availability": "public",
    "href": "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
    "immutableIdentity": "14-page PDF; William Baker byline; December 2025",
    "observedAt": "2026-08-09T17:21:02Z",
    "reuse": "link-only",
    "claimBoundary": "Historical writing artifact only; no current policy guidance or imagery reuse."
  },
  "policy.risk-gate": {
    "id": "policy.risk-gate",
    "projectIds": [
      "energy-sector-data-governance"
    ],
    "label": "Policy and risk designed-use gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Blocks current-guidance, derivative-route, imagery-reuse, and policy-impact claims."
  },
  "portfolio.blueprint.008": {
    "id": "portfolio.blueprint.008",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Nordic Field Atlas implementation blueprint 008",
    "kind": "local-record",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Internal field-population and art-direction ruling; creates no external authority."
  },
  "portfolio.runbook.lock.m003": {
    "id": "portfolio.runbook.lock.m003",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel portfolio evidence lock",
    "kind": "local-record",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Internal editorial lock bound to frozen project artifacts."
  },
  "quest.attempts": {
    "id": "quest.attempts",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft retained attempts",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/evals/attempts.csv",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports six failed or superseded attempts and two documented corrections."
  },
  "quest.guardrails": {
    "id": "quest.guardrails",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft public guardrails",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/docs/guardrails.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Documents product behavior and authority boundaries; not proof of universal child safety or security."
  },
  "quest.readme-ai-use": {
    "id": "quest.readme-ai-use",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft AI-use and role note",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/README.md#8-ai-use-memo",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports the bounded product/system design and AI-assisted implementation role, not manual authorship of every line."
  },
  "quest.results": {
    "id": "quest.results",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft retained evaluation rows",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/evals/results.csv",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports the fixed 36-row release suite and human-scored cells; not independent or general evaluation."
  },
  "quest.snapshot": {
    "id": "quest.snapshot",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft public reviewer snapshot",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/tree/bc14c43840aabb11ca35e94df0c8682672f24f3c",
    "immutableIdentity": "commit bc14c43840aabb11ca35e94df0c8682672f24f3c; tree 01d7e8a0051d4b226e8e0232b5e4ab8f87105964",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Public reviewer mirror, not the private canonical implementation or proof of current demo behavior."
  },
  "quest.source-gate": {
    "id": "quest.source-gate",
    "projectIds": [
      "quest-craft"
    ],
    "label": "Quest Craft source gate",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Authorizes only the bounded documentary treatment and exact supported claims."
  },
  "release.owner-decision": {
    "id": "release.owner-decision",
    "projectIds": [
      "hierarchical-clustering",
      "energy-sector-data-governance",
      "der-dcp",
      "quest-craft",
      "runbook-sentinel"
    ],
    "label": "Owner release-treatment decision receipt",
    "kind": "gate",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Approves exact candidate treatments and media exceptions; it does not authorize push, preview, or production publication."
  },
  "rs.action_split_gap.0020": {
    "id": "rs.action_split_gap.0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel action/split coverage failure record",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/verification/action-split-gap-baseline-0020.json",
    "immutableIdentity": "sha256 c80e09fdf0b6d34c1bd3f76011d556187f449775b1b781c38c906dbca52c8263",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Retained 5/6 coverage gap and exact held-out rollback correction."
  },
  "rs.architecture.v0020": {
    "id": "rs.architecture.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel architecture",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/docs/architecture.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Pinned synthetic-system architecture; not real-infrastructure design proof."
  },
  "rs.evaluation.v0020": {
    "id": "rs.evaluation.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel selected evaluation",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/evaluations/latest.json",
    "immutableIdentity": "sha256 06817fabc90471d84ac36a38e96208d7554d07355398a5213072c0ae57a19221",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Exact source for the 31-scenario, 93-attempt synthetic result."
  },
  "rs.evaluation_report.v0020": {
    "id": "rs.evaluation_report.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel evaluation report",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/docs/evaluation-report.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Explains the pinned synthetic evaluation; numerical claims remain bound to frozen artifacts."
  },
  "rs.git.v0020": {
    "id": "rs.git.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel v0.0.20 source tree",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/tree/f149ac2408f30b504b78844780b8533bed2ebfdc",
    "immutableIdentity": "commit f149ac2408f30b504b78844780b8533bed2ebfdc; tag v0.0.20",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Pinned public release source; repository has no top-level license and grants no general reuse right."
  },
  "rs.git_history.v0020": {
    "id": "rs.git_history.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel Git history through v0.0.20",
    "kind": "git",
    "availability": "internal-only",
    "reuse": "internal-gate-only",
    "claimBoundary": "Supports repository authorship and release ownership, not unaided or sole authorship."
  },
  "rs.milestone.0020": {
    "id": "rs.milestone.0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel milestone 0020 contract",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/contracts/milestone-0020.json",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Pinned evaluation and release contract; not publication authority for this portfolio."
  },
  "rs.model_comparison.0018": {
    "id": "rs.model_comparison.0018",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel rejected-model comparison",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/evaluations/baseline-0018-model-comparison.json",
    "immutableIdentity": "sha256 c083941704093872600779672b9acef53cefad114567d3de99624b33dd53b0a0",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "One bounded local comparison; not a general model benchmark, safety result, or energy estimate."
  },
  "rs.package_contract.0020": {
    "id": "rs.package_contract.0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel package contract",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/eval/package-contract-0020.json",
    "immutableIdentity": "sha256 5959bd97d38a485fdc69dc337857ba2e4d99b34b23545c3049db9cacfe122df2",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Exact dependency-free package contract for the pinned release."
  },
  "rs.pyproject.v0020": {
    "id": "rs.pyproject.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel Python project configuration",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/pyproject.toml",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Pinned runtime and packaging declaration only."
  },
  "rs.readme.v0020": {
    "id": "rs.readme.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel README at v0.0.20",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/README.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Project scope and public boundary at the pinned release."
  },
  "rs.release_audit.v0020": {
    "id": "rs.release_audit.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel release audit",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/verification/release-audit-baseline-0020.json",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Final pre-publication readiness audit; its live-truth section predates the public v0.0.20 tag and release, so completed closure must also cite the pinned status record."
  },
  "rs.status.v0020": {
    "id": "rs.status.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel release status",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/docs/status.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports the v0.0.20 checkpoint and its declared next threshold, not an unqualified current roadmap."
  },
  "rs.threat_model.v0020": {
    "id": "rs.threat_model.v0020",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel threat model",
    "kind": "git",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/docs/threat-model.md",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Project-specific synthetic threat boundaries; not universal security evidence."
  },
  "rs.trace.0020.attempt003": {
    "id": "rs.trace.0020.attempt003",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel selected chained trace",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/evaluations/runs/baseline-0020-attempt-003.traces.jsonl",
    "immutableIdentity": "sha256 475775862fcc73bd2a603d8c5dbf42bc7b3233ad7b4253be47af5b6c8297d5cb",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Supports exact trace continuity only; no writer authentication or immutable storage."
  },
  "rs.trace_gap.0016": {
    "id": "rs.trace_gap.0016",
    "projectIds": [
      "runbook-sentinel"
    ],
    "label": "Runbook Sentinel trace-integrity failure record",
    "kind": "artifact",
    "availability": "public",
    "href": "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/verification/trace-integrity-gap-baseline-0016.json",
    "immutableIdentity": "sha256 53481206d8817daabc8cf9a638509bcb3a9eb09833f205f75689ff1e86636f2a",
    "reuse": "linked-evidence-no-copy",
    "claimBoundary": "Retained pre-change mutation failure and bounded remediation cause."
  }
} as const satisfies Record<string, SourceBinding>;

export type SourceId = keyof typeof projectSources;
export type PublicLinkSourceId = {
  [K in SourceId]: (typeof projectSources)[K] extends {
    availability: "public";
    href: string;
  } ? K : never;
}[SourceId];
export type SourceIdFor<P extends ProjectId> = {
  [K in SourceId]: P extends (typeof projectSources)[K]["projectIds"][number] ? K : never;
}[SourceId];

export type SupportedEvidence<P extends ProjectId, T = unknown> = {
  state: "supported";
  strength: EvidenceStrength;
  summary: string;
  value?: T;
  sourceIds: NonEmpty<SourceIdFor<P>>;
};

export type MissingEvidence = {
  state: "missing";
  reason: string;
  evidenceNeeded: NonEmpty<string>;
  strength?: never;
  summary?: never;
  value?: never;
  sourceIds?: never;
};

export type NotApplicableEvidence = {
  state: "not_applicable";
  reason: string;
  strength?: never;
  summary?: never;
  value?: never;
  sourceIds?: never;
  evidenceNeeded?: never;
};

export type EvidenceField<P extends ProjectId, T = unknown> =
  | SupportedEvidence<P, T>
  | MissingEvidence
  | NotApplicableEvidence;

export type FailureDividend<P extends ProjectId> = {
  id: string;
  featured?: true;
  failure: string;
  buildChange: string;
  earnedCapability: string;
  boundary: string;
  sourceIds: NonEmpty<SourceIdFor<P>>;
};

export type CapabilityBoundaries = {
  eeEvidence: boolean;
  operational: boolean;
  implementedSystem: boolean;
  evaluatedSystem: boolean;
  productionReady: boolean;
  hardwareImplemented: boolean;
  runtimeInspected: boolean;
  currentGuidance: boolean;
};

export type ProjectEvidence<P extends ProjectId> = {
  problem: EvidenceField<P>;
  intendedUser: EvidenceField<P>;
  decisionSupported: EvidenceField<P>;
  personalRole: EvidenceField<P>;
  implementation: EvidenceField<P>;
  stack: EvidenceField<P>;
  testStrategy: EvidenceField<P>;
  outcome: EvidenceField<P>;
  failureDividend: EvidenceField<P, NonEmpty<FailureDividend<P>>>;
  limitations: EvidenceField<P>;
  nextStep: EvidenceField<P>;
  maturity: EvidenceField<P, Maturity>;
};

type ProjectBase<P extends ProjectId> = {
  id: P;
  title: string;
  audiences: NonEmpty<"software" | "climate" | "energy-context">;
  capabilityBoundaries: CapabilityBoundaries;
  claimsNotAuthorized: NonEmpty<string>;
  evidence: ProjectEvidence<P>;
};

export type ProjectRecord<P extends ProjectId> = ProjectBase<P> & ProjectPlacement;
export type ProjectRecordMap = { [P in ProjectId]: ProjectRecord<P> };

export const projectRecords = {
  "burnlens": {
    "id": "burnlens",
    "title": "BurnLens",
    "lane": "flagship",
    "treatment": "designed-case-study",
    "route": "/work/burnlens",
    "routeType": "full-case-study",
    "visualWorld": "field-atlas",
    "audiences": [
      "software",
      "climate"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": true,
      "evaluatedSystem": true,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": true,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Operational wildfire capability, emergency guidance, or decision support",
      "Autonomous Codex authority or Drew-only end-to-end implementation",
      "Capabilities or outcomes beyond the exact release record and later evidence snapshot",
      "Electrical, power-systems, controls, embedded, firmware, or circuit-design experience",
      "Treating the release commit and later evidence snapshot as one identity",
      "Any future milestone or active roadmap without separate owner approval and source support"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "bounded",
        "summary": "BurnLens asks how one bounded experimental computer-vision-to-GEOINT release can become understandable, inspectable, citable, and responsibly interpretable as a coherent whole.",
        "sourceIds": [
          "burnlens-pinned-tree"
        ]
      },
      "intendedUser": {
        "state": "supported",
        "strength": "bounded",
        "summary": "It is an experimental portfolio project for technical and technical-adjacent reviewers, not an operational wildfire tool.",
        "sourceIds": [
          "burnlens-release",
          "burnlens-pinned-tree"
        ]
      },
      "decisionSupported": {
        "state": "supported",
        "strength": "bounded",
        "summary": "When the story was fragmented across correct artifacts, the project chose one canonical reviewer entry point around them rather than rewriting them.",
        "sourceIds": [
          "burnlens-pinned-tree"
        ]
      },
      "personalRole": {
        "state": "supported",
        "strength": "verified",
        "summary": "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
        "sourceIds": [
          "burnlens-pinned-tree"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "bounded",
        "summary": "The public release had to remain useful while excluding credentials, private owner responses, private logs, and machine-local paths, without implying official or operational capability.",
        "sourceIds": [
          "burnlens-pinned-tree"
        ]
      },
      "stack": {
        "state": "not_applicable",
        "reason": "The selected public story makes no technology-inventory claim."
      },
      "testStrategy": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Reliability includes recognizing when evidence is insufficient and making that stop reproducible.",
        "sourceIds": [
          "burnlens-pinned-tree"
        ]
      },
      "outcome": {
        "state": "supported",
        "strength": "verified",
        "summary": "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
        "sourceIds": [
          "burnlens-release",
          "burnlens-pinned-tree"
        ]
      },
      "failureDividend": {
        "state": "not_applicable",
        "reason": "No failure-dividend claim survives the selected public use."
      },
      "limitations": {
        "state": "supported",
        "strength": "verified",
        "summary": "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
        "sourceIds": [
          "burnlens-release"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "No designated next milestone or active evidence checkpoint exists; a future step requires separate owner approval and source support.",
        "evidenceNeeded": [
          "An owner-approved future milestone",
          "A source-supported active evidence checkpoint"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "verified",
        "summary": "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
        "value": "released-research-prototype",
        "sourceIds": [
          "burnlens-release",
          "burnlens-pinned-tree"
        ]
      }
    }
  },
  "runbook-sentinel": {
    "id": "runbook-sentinel",
    "title": "Runbook Sentinel",
    "lane": "flagship",
    "treatment": "designed-case-study",
    "route": "/work/runbook-sentinel",
    "routeType": "full-case-study",
    "visualWorld": "control-trace",
    "audiences": [
      "software"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": true,
      "evaluatedSystem": true,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": true,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Real users, customers, adoption, field outcomes, incident reduction, uptime gain, or production impact",
      "Autonomous remediation, real-infrastructure authority, arbitrary command execution, or production readiness",
      "Universal prompt-injection resistance, useful stochastic-model safety, or a general model benchmark",
      "OAuth identity, verified human presence, immutable logs, signed traces, or hostile-writer resistance",
      "Electrical, embedded, controls, power-systems, hardware, or climate implementation evidence",
      "Sole, unaided, or assistance-free authorship"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Keep a retrieval-grounded synthetic incident agent bounded when evidence is incomplete, stale, conflicting, or hostile without giving prose or model output execution authority.",
        "sourceIds": [
          "rs.readme.v0020",
          "rs.architecture.v0020",
          "rs.threat_model.v0020"
        ]
      },
      "intendedUser": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Software and reliability reviewers assessing a bounded control architecture before any real-infrastructure connection.",
        "sourceIds": [
          "portfolio.runbook.lock.m003",
          "portfolio.blueprint.008",
          "rs.readme.v0020"
        ]
      },
      "decisionSupported": {
        "state": "supported",
        "strength": "verified",
        "summary": "Retain deterministic control instead of the tested local-model candidate and permit synthetic mutation only after separate approval and policy checks.",
        "sourceIds": [
          "rs.model_comparison.0018",
          "rs.evaluation_report.v0020",
          "rs.architecture.v0020",
          "rs.threat_model.v0020"
        ]
      },
      "personalRole": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Repository author and release owner for the pinned public checkpoint.",
        "value": [
          "Designed the separation among retrieval, reasoning, proposal, approval, policy, execution, persistence, and audit",
          "Implemented the Python runtime and its CLI, loopback HTTP, bounded MCP, SQLite, dashboard, and trace surfaces",
          "Authored frozen evaluation contracts, failure probes, package checks, retained evidence, and release verification"
        ],
        "sourceIds": [
          "rs.git_history.v0020",
          "rs.package_contract.0020",
          "rs.milestone.0020",
          "rs.release_audit.v0020"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "verified",
        "summary": "A dependency-free synthetic control system that separates reasoning, approval, policy, execution, state, and audit.",
        "value": [
          "Frozen synthetic scenario catalog with split-aware expected dispositions and terminal-state contracts",
          "Freshness-priority retrieval and a decision-plane projection that removes stale payload content",
          "Bounded agent outcomes: diagnose, request evidence, propose action, or abstain",
          "Typed proposals, launch-scoped operator capability, one-use approval, policy, replay, precondition, and postcondition checks",
          "Synthetic executor limited to restart_worker, rollback_deployment, and warm_cache",
          "CLI, loopback HTTP, bounded diagnostic/proposal/read MCP surface with no approval or execution tool, SQLite state, chained JSONL traces, and deterministic zipapp"
        ],
        "sourceIds": [
          "rs.architecture.v0020",
          "rs.threat_model.v0020",
          "rs.package_contract.0020",
          "rs.pyproject.v0020"
        ]
      },
      "stack": {
        "state": "supported",
        "strength": "verified",
        "summary": "Pinned standard-library runtime and release primitives.",
        "value": [
          {
            "name": "Python 3.12+",
            "purpose": "Runtime, evaluation harness, verifiers, API, MCP server, and packaging"
          },
          {
            "name": "SQLite",
            "purpose": "Synthetic state, proposals, approvals, idempotency, execution, and audit persistence"
          },
          {
            "name": "JSON and JSONL",
            "purpose": "Contracts, evaluation artifacts, traces, and evidence bindings"
          },
          {
            "name": "JSON-RPC over stdio",
            "purpose": "Diagnostic/read MCP surface with no approval or execution tool"
          },
          {
            "name": "Python zipapp",
            "purpose": "Dependency-free release artifact with exact allowlist and hashes"
          },
          {
            "name": "Loopback HTTP and server-rendered HTML",
            "purpose": "Local operator, API, and dashboard surfaces"
          }
        ],
        "sourceIds": [
          "rs.pyproject.v0020",
          "rs.architecture.v0020",
          "rs.package_contract.0020",
          "rs.release_audit.v0020"
        ]
      },
      "testStrategy": {
        "state": "supported",
        "strength": "verified",
        "summary": "Exact synthetic trajectories and terminal states, split-aware coverage, fail-closed contracts, package parity, and real-surface verification.",
        "value": [
          "31 frozen scenarios across three trials",
          "6 of 6 action-and-split pairs and 16 of 16 topology-and-split pairs",
          "Frozen contracts for model output, approval lifetime, operator capability, idempotency, trace integrity, and live anchors",
          "Source/package parity, CLI/API/MCP/dashboard checks, deterministic dual builds, clean-clone checks, and public-release reconciliation"
        ],
        "sourceIds": [
          "rs.evaluation.v0020",
          "rs.milestone.0020",
          "rs.package_contract.0020",
          "rs.release_audit.v0020"
        ]
      },
      "outcome": {
        "state": "supported",
        "strength": "verified",
        "summary": "The pinned v0.0.20 synthetic release passed its exact deterministic gate and excluded the weaker local-model candidate.",
        "value": [
          "93 of 93 frozen attempts passed: 36 expected-action and 57 no-action attempts",
          "Tool-trajectory and terminal-state exactness were both 1.0",
          "The selected companion trace contains 165 contiguous chained events",
          "Action/split coverage reached 6 of 6",
          "The model candidate produced 9 of 84 valid outputs, was excluded, and executed zero actions",
          "Zero real systems were connected"
        ],
        "sourceIds": [
          "rs.evaluation.v0020",
          "rs.model_comparison.0018",
          "rs.evaluation_report.v0020",
          "rs.release_audit.v0020",
          "rs.status.v0020"
        ]
      },
      "failureDividend": {
        "state": "supported",
        "strength": "verified",
        "summary": "Three retained failures changed trace integrity, coverage gating, or model selection.",
        "value": [
          {
            "id": "RS.F01",
            "failure": "A success value in a 150-event trace could be changed without breaking parsing, inspection, or release status.",
            "buildChange": "Freeze ten integrity cases, chain each event, bind evaluation to the final anchor, and fail closed on incomplete resume.",
            "earnedCapability": "The selected v0.0.20 trace has 165 contiguous chained events and an exact final anchor.",
            "boundary": "No writer authentication, hostile-writer resistance, immutable storage, non-repudiation, or digital signature.",
            "sourceIds": [
              "rs.trace_gap.0016",
              "rs.trace.0020.attempt003",
              "rs.architecture.v0020"
            ]
          },
          {
            "id": "RS.F02",
            "failure": "Headline 3-of-3 action coverage hid that held-out tests never exercised deployment rollback; split-aware coverage was 5 of 6.",
            "buildChange": "Add one frozen held-out rollback case and fail the gate for any missing action-and-split pair.",
            "earnedCapability": "All six action-and-split pairs are covered across 31 cases and three trials.",
            "boundary": "Not production reliability; 31 cases remain below the separate 48-case target.",
            "sourceIds": [
              "rs.action_split_gap.0020",
              "rs.evaluation.v0020",
              "rs.milestone.0020"
            ]
          },
          {
            "id": "RS.F03",
            "featured": true,
            "failure": "The local 3B model produced only 9 valid outputs from 84 attempts; 75 failed schema validation and latency was 213.394 times the control.",
            "buildChange": "Exclude the candidate, retain deterministic control, and keep invalid model output outside proposal and execution authority.",
            "earnedCapability": "The selection process visibly rejects a weaker candidate instead of treating model inclusion as progress.",
            "boundary": "Not evidence that the model was useful or safe, or that zero executed attacks proves universal resistance.",
            "sourceIds": [
              "rs.model_comparison.0018",
              "rs.evaluation_report.v0020"
            ]
          }
        ],
        "sourceIds": [
          "rs.trace_gap.0016",
          "rs.action_split_gap.0020",
          "rs.model_comparison.0018"
        ]
      },
      "limitations": {
        "state": "supported",
        "strength": "verified",
        "summary": "A released synthetic testbed with explicit infrastructure, identity, trace, security, and evaluation limits.",
        "value": [
          "Synthetic fixtures and state only; zero real systems, connectors, arbitrary shell, or operational adapters",
          "No production reliability, adoption, operational impact, or autonomous-remediation claim",
          "The loopback capability does not prove human presence, OAuth identity, or enterprise authorization",
          "The unkeyed trace proves bounded continuity, not writer identity or immutable storage",
          "One local-model comparison is not a general benchmark or safety result",
          "Docker, package-registry, hardware, and energy-cost claims remain excluded"
        ],
        "sourceIds": [
          "rs.readme.v0020",
          "rs.threat_model.v0020",
          "rs.release_audit.v0020",
          "rs.model_comparison.0018"
        ]
      },
      "nextStep": {
        "state": "supported",
        "strength": "bounded",
        "summary": "At this release, the separately declared v0.1.0 threshold required at least 48 frozen scenarios.",
        "sourceIds": [
          "rs.status.v0020",
          "rs.milestone.0020"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "verified",
        "summary": "Verified synthetic testbed with a public v0.0.20 release and zero real systems connected.",
        "value": "verified-synthetic-testbed",
        "sourceIds": [
          "rs.release_audit.v0020",
          "rs.status.v0020",
          "rs.evaluation.v0020",
          "rs.git.v0020"
        ]
      }
    }
  },
  "quest-craft": {
    "id": "quest-craft",
    "title": "Quest Craft",
    "lane": "supporting",
    "treatment": "designed-case-study",
    "route": "/work/quest-craft",
    "routeType": "supporting-field-note",
    "visualWorld": "branching-manuscript",
    "audiences": [
      "software"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": true,
      "evaluatedSystem": true,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": false,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Private canonical implementation, current runtime internals, framework, model provider, hosting, or persistence stack",
      "Manual authorship of every line",
      "General child safety, security, compliance, zero retention, prompt-injection resistance, production maturity, or universal accuracy",
      "General rights to source-project or third-party assets"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Help an adult Game Master turn an unexpected player choice into several playable paths without revoking player agency.",
        "sourceIds": [
          "quest.snapshot",
          "quest.guardrails",
          "quest.source-gate"
        ]
      },
      "intendedUser": {
        "state": "supported",
        "strength": "bounded",
        "summary": "An adult Game Master facilitating players ages 9 to 12; the adult retains final authority.",
        "sourceIds": [
          "quest.snapshot",
          "quest.guardrails",
          "quest.source-gate"
        ]
      },
      "decisionSupported": {
        "state": "supported",
        "strength": "bounded",
        "summary": "The model supplies bounded wording, software validates the exchange, and the Game Master may accept, revise, combine, or ignore the result.",
        "sourceIds": [
          "quest.snapshot",
          "quest.guardrails"
        ]
      },
      "personalRole": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Product and system designer and release owner directing AI-assisted implementation, evaluation, correction, and approval.",
        "sourceIds": [
          "quest.readme-ai-use",
          "quest.source-gate"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "bounded",
        "summary": "One constrained generation request produces three structured paths while local checks and the adult authority rail remain outside the model step.",
        "sourceIds": [
          "quest.snapshot",
          "quest.guardrails",
          "quest.source-gate"
        ]
      },
      "stack": {
        "state": "missing",
        "reason": "The private canonical implementation was not inspected and the public repository is a reviewer mirror.",
        "evidenceNeeded": [
          "Publication-safe canonical implementation manifest",
          "Exact framework, model-provider, hosting, and persistence sources",
          "Rights and private-boundary review"
        ]
      },
      "testStrategy": {
        "state": "supported",
        "strength": "verified",
        "summary": "A fixed release suite of 12 synthetic scenarios, three retained rows each, human-scored cells, local privacy rejections, and corrective reruns.",
        "sourceIds": [
          "quest.results",
          "quest.attempts",
          "quest.source-gate"
        ]
      },
      "outcome": {
        "state": "supported",
        "strength": "bounded",
        "summary": "The reviewer snapshot retains 36 rows: 33 model generations, three local privacy rejections, six failed or superseded attempts, and two behavior corrections.",
        "sourceIds": [
          "quest.results",
          "quest.attempts",
          "quest.source-gate"
        ]
      },
      "failureDividend": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Two observed behavior misses changed the instructions while superseded attempts remained excluded.",
        "value": [
          {
            "id": "QC.F01",
            "featured": true,
            "failure": "Unrelated setting facts appeared in generated paths.",
            "buildChange": "Narrow the grounding instructions and rerun the affected scenario.",
            "earnedCapability": "The corrected release suite retained setting-grounded output under the fixed rubric.",
            "boundary": "One fixed synthetic suite does not establish general grounding reliability.",
            "sourceIds": [
              "quest.attempts",
              "quest.results"
            ]
          },
          {
            "id": "QC.F02",
            "failure": "Softened mockery still centered a young rival's embarrassment.",
            "buildChange": "Tighten youth-suitability instructions and exclude superseded passing rows.",
            "earnedCapability": "The corrected release suite records the revised behavior and preserves the failed attempts.",
            "boundary": "Does not establish general child safety or developmental suitability.",
            "sourceIds": [
              "quest.attempts",
              "quest.results"
            ]
          }
        ],
        "sourceIds": [
          "quest.attempts",
          "quest.results",
          "quest.source-gate"
        ]
      },
      "limitations": {
        "state": "supported",
        "strength": "verified",
        "summary": "A bounded public reviewer snapshot, not the private canonical implementation or a general safety result.",
        "sourceIds": [
          "quest.source-gate",
          "quest.snapshot"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "No source-bound current project roadmap is public.",
        "evidenceNeeded": [
          "Owner-approved next step",
          "Pinned public or controlled roadmap record"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "verified",
        "summary": "Reviewed prototype represented by a frozen public reviewer snapshot.",
        "value": "reviewed-prototype",
        "sourceIds": [
          "quest.snapshot",
          "quest.source-gate"
        ]
      }
    }
  },
  "openclaw-showcase": {
    "id": "openclaw-showcase",
    "title": "OpenClaw Showcase",
    "lane": "supporting",
    "treatment": "designed-case-study",
    "route": "/work/openclaw-showcase",
    "routeType": "supporting-field-note",
    "visualWorld": "disclosure-folio",
    "audiences": [
      "software"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": false,
      "evaluatedSystem": false,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": false,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Inspection, authorship, implementation, or performance of the excluded runtime",
      "Runtime execution, autonomy, deployment, reliability, security enforcement, or production capability",
      "Representative receipt as an actual-run receipt",
      "Open-source licensing or rights to private-derived material"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Explain a private agent-workflow pattern publicly without disclosure drift or pretending to prove the runtime.",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.source-gate",
          "openclaw.safety-doc"
        ]
      },
      "intendedUser": {
        "state": "missing",
        "reason": "The frozen source does not name a project-owned intended user beyond a bounded public-review context.",
        "evidenceNeeded": [
          "Pinned project-owned audience statement",
          "Exact user or reviewer need"
        ]
      },
      "decisionSupported": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Separate public, approval-gated, and private material so only a human decision can expand the public boundary.",
        "sourceIds": [
          "openclaw.workflow-doc",
          "openclaw.safety-doc",
          "openclaw.source-gate"
        ]
      },
      "personalRole": {
        "state": "supported",
        "strength": "verified",
        "summary": "Author and designer of the public documentation layer only.",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.source-gate"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "verified",
        "summary": "Eight Markdown documents, nine conceptual diagrams, a five-stage workflow model, and one sanitized representative receipt.",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.workflow-doc",
          "openclaw.receipt-doc"
        ]
      },
      "stack": {
        "state": "supported",
        "strength": "bounded",
        "summary": "Markdown and Mermaid are the public documentation formats, not evidence of runtime technologies.",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.workflow-doc",
          "openclaw.source-gate"
        ]
      },
      "testStrategy": {
        "state": "missing",
        "reason": "The public snapshot contains no source-bound evaluation of documentation usability or runtime behavior.",
        "evidenceNeeded": [
          "Pinned documentation-review protocol",
          "Reviewer tasks and observed outcomes",
          "Exact retained corrections"
        ]
      },
      "outcome": {
        "state": "supported",
        "strength": "bounded",
        "summary": "A frozen, inspectable public documentation artifact with explicit disclosure boundaries.",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.source-gate"
        ]
      },
      "failureDividend": {
        "state": "missing",
        "reason": "No retained source shows a failure causing a specific documentation or system change.",
        "evidenceNeeded": [
          "Exact failed review or disclosure event",
          "Source-bound change record",
          "Earned claim and remaining boundary"
        ]
      },
      "limitations": {
        "state": "supported",
        "strength": "verified",
        "summary": "The route documents a public workflow model and cannot establish anything about the excluded runtime's quality or capability.",
        "sourceIds": [
          "openclaw.source-gate",
          "openclaw.safety-doc",
          "openclaw.receipt-doc"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "No source-bound current project roadmap is public.",
        "evidenceNeeded": [
          "Owner-approved next step",
          "Pinned public or controlled roadmap record"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "verified",
        "summary": "Public documentation artifact at an exact frozen commit.",
        "value": "public-documentation-artifact",
        "sourceIds": [
          "openclaw.snapshot",
          "openclaw.source-gate"
        ]
      }
    }
  },
  "hierarchical-clustering": {
    "id": "hierarchical-clustering",
    "title": "Hierarchical clustering exploration",
    "lane": "archive",
    "treatment": "link-only-shelf",
    "route": null,
    "routeType": "external-link-only",
    "visualWorld": "historical-reading-shelf",
    "audiences": [
      "software"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": false,
      "evaluatedSystem": false,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": false,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Verified numerical outputs, timings, cluster sizes, regional composition, or dataset identity",
      "Reproducibility, canonical Colab/GitHub equivalence, valid evaluation, stability, performance, ecological conclusions, or flagship quality",
      "Sole authorship, course republication permission, or notebook license",
      "A planned rebuild inferred from the promotion threshold"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "historical",
        "summary": "A historical notebook exploration compared HDBSCAN behavior under Jaccard, Euclidean, and Rogers-Tanimoto distance choices.",
        "sourceIds": [
          "hc.snapshot",
          "hc.archive-gate"
        ]
      },
      "intendedUser": {
        "state": "missing",
        "reason": "The frozen evidence does not establish a named user or reviewer need.",
        "evidenceNeeded": [
          "Authored audience statement",
          "Source-bound decision context"
        ]
      },
      "decisionSupported": {
        "state": "missing",
        "reason": "Parameter rationale and saved outputs are not sufficiently verified to support a decision.",
        "evidenceNeeded": [
          "Canonical reproducible edition",
          "Predeclared question",
          "Valid parameter and evaluation evidence"
        ]
      },
      "personalRole": {
        "state": "missing",
        "reason": "The current gate does not establish a sufficiently bounded authorship and collaborator statement for promotion.",
        "evidenceNeeded": [
          "Visible byline",
          "Role and collaborator statement",
          "Course republication confirmation"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "historical",
        "summary": "A public notebook exploration exists, but the GitHub and Colab variants differ and the historical environment is not pinned.",
        "sourceIds": [
          "hc.snapshot",
          "hc.designed-use-gate",
          "hc.archive-gate"
        ]
      },
      "stack": {
        "state": "supported",
        "strength": "historical",
        "summary": "Jupyter, Python, and HDBSCAN are visible historical choices; versions and environment are unpinned.",
        "sourceIds": [
          "hc.snapshot",
          "hc.designed-use-gate"
        ]
      },
      "testStrategy": {
        "state": "missing",
        "reason": "No valid source-bound evaluation, sensitivity, stability, or clean-run evidence is established.",
        "evidenceNeeded": [
          "Pinned environment",
          "Clean execution",
          "Valid metric and stability evaluation"
        ]
      },
      "outcome": {
        "state": "missing",
        "reason": "Saved outputs are not treated as verified results.",
        "evidenceNeeded": [
          "Checksum-bound canonical data",
          "Clean reproducible output",
          "Reviewed authored figures and evaluation"
        ]
      },
      "failureDividend": {
        "state": "missing",
        "reason": "The audit found evidence defects, but no technical failure-to-build-change sequence exists in a canonical rebuild.",
        "evidenceNeeded": [
          "Retained failed experiment",
          "Exact build change",
          "New verified outcome and boundary"
        ]
      },
      "limitations": {
        "state": "supported",
        "strength": "historical",
        "summary": "Not a current reproducible study; source variants, data identity, environment, outputs, evaluation, authorship, and rights remain bounded or unresolved.",
        "sourceIds": [
          "hc.designed-use-gate",
          "hc.archive-gate"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "The documented rebuild threshold is a promotion gate, not an approved project roadmap.",
        "evidenceNeeded": [
          "Owner-approved rebuild decision",
          "Exact source/data rights",
          "Bounded implementation contract"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "historical",
        "summary": "Historical coursework retained as a link-only archive artifact.",
        "value": "historical-coursework",
        "sourceIds": [
          "hc.snapshot",
          "hc.archive-gate"
        ]
      }
    }
  },
  "energy-sector-data-governance": {
    "id": "energy-sector-data-governance",
    "title": "Energy Sector Data Governance",
    "lane": "archive",
    "treatment": "link-only-shelf",
    "route": null,
    "routeType": "external-link-only",
    "visualWorld": "historical-reading-shelf",
    "audiences": [
      "energy-context"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": false,
      "evaluatedSystem": false,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": false,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Current policy guidance, current regulatory status, error-free agency terminology, compliance, implementation, or policy impact",
      "Reuse, copying, cropping, tracing, rehosting, or derivation from Adobe Stock or Canva imagery",
      "Engineering implementation or an electrical-engineering project",
      "A promised rewrite inferred from promotion prerequisites"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "historical",
        "summary": "Frame energy-sector data-governance risks and policy choices as a December 2025 writing artifact.",
        "sourceIds": [
          "policy.reader",
          "policy.archive-gate"
        ]
      },
      "intendedUser": {
        "state": "missing",
        "reason": "The bounded archive gate does not establish a named current decision-maker or user.",
        "evidenceNeeded": [
          "Source-bound intended audience",
          "Current verified decision context"
        ]
      },
      "decisionSupported": {
        "state": "not_applicable",
        "reason": "The artifact is retained as dated writing evidence, not current policy guidance or an active decision tool."
      },
      "personalRole": {
        "state": "supported",
        "strength": "historical",
        "summary": "William Baker's bylined research, writing, revision, formatting, and visualization work on a 14-page brief.",
        "sourceIds": [
          "policy.reader",
          "policy.risk-gate",
          "policy.archive-gate"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "historical",
        "summary": "Authored and revised a 14-page policy-writing artifact; no engineered system is claimed.",
        "sourceIds": [
          "policy.reader",
          "policy.archive-gate"
        ]
      },
      "stack": {
        "state": "not_applicable",
        "reason": "This archive item is a writing artifact, not a software or engineering implementation."
      },
      "testStrategy": {
        "state": "not_applicable",
        "reason": "No system was under test; the archive treatment does not elevate revision history into engineering evaluation."
      },
      "outcome": {
        "state": "supported",
        "strength": "historical",
        "summary": "A completed, bylined 14-page December 2025 policy-writing sample; no policy impact is claimed.",
        "sourceIds": [
          "policy.reader",
          "policy.archive-gate"
        ]
      },
      "failureDividend": {
        "state": "missing",
        "reason": "No exact before-and-after artifact binds a failed claim or review to a specific revision and earned result.",
        "evidenceNeeded": [
          "Exact retained draft or review finding",
          "Bound revision delta",
          "Supported lesson and remaining boundary"
        ]
      },
      "limitations": {
        "state": "supported",
        "strength": "historical",
        "summary": "Agency terminology and time-sensitive claims require correction and fresh verification; original stock and Canva imagery cannot be reused.",
        "sourceIds": [
          "policy.risk-gate",
          "policy.archive-gate"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "A source refresh and original visuals are promotion prerequisites, not an approved current roadmap.",
        "evidenceNeeded": [
          "Owner-approved revision decision",
          "Fresh source gate",
          "Original-visual rights record"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "historical",
        "summary": "Historical coursework retained as a link-only policy-writing artifact.",
        "value": "historical-coursework",
        "sourceIds": [
          "policy.reader",
          "policy.archive-gate"
        ]
      }
    }
  },
  "der-dcp": {
    "id": "der-dcp",
    "title": "DER Distributed Control Planner",
    "lane": "archive",
    "treatment": "link-only-shelf",
    "route": null,
    "routeType": "external-link-only",
    "visualWorld": "historical-reading-shelf",
    "audiences": [
      "energy-context"
    ],
    "capabilityBoundaries": {
      "eeEvidence": false,
      "operational": false,
      "implementedSystem": false,
      "evaluatedSystem": false,
      "productionReady": false,
      "hardwareImplemented": false,
      "runtimeInspected": false,
      "currentGuidance": false
    },
    "claimsNotAuthorized": [
      "Implemented, evaluated, validated, deployed, safe, compliant, beneficial, or impact-producing system",
      "Current policy or compliance guidance",
      "Flagship, designed case study, resume-selected project, or electrical-engineering build",
      "Copying, exporting, quoting, downloading, adapting, or deriving from document text, imagery, layout, research log, or raw Drive metadata",
      "Sole authorship or broader republication rights beyond the exact owner-supplied public fields"
    ],
    "evidence": {
      "problem": {
        "state": "supported",
        "strength": "historical",
        "summary": "Explore governance and evaluation planning for a distributed-energy control concept in a historical coursework proposal.",
        "sourceIds": [
          "der.document",
          "der.archive-gate",
          "der.owner-decision"
        ]
      },
      "intendedUser": {
        "state": "missing",
        "reason": "The link-only gate does not authorize restating a named system user from the source document.",
        "evidenceNeeded": [
          "Separately authorized public audience statement",
          "Current source verification"
        ]
      },
      "decisionSupported": {
        "state": "not_applicable",
        "reason": "No system was implemented or evaluated, so the proposal supports no engineered decision."
      },
      "personalRole": {
        "state": "supported",
        "strength": "historical",
        "summary": "Historical proposal by William Baker for SCLA 521 Societal Impacts of AI, using the exact owner-approved public attribution.",
        "sourceIds": [
          "der.owner-decision",
          "der.archive-gate"
        ]
      },
      "implementation": {
        "state": "supported",
        "strength": "historical",
        "summary": "Research and proposal drafting only; no software, controls, electrical, or physical system was implemented.",
        "sourceIds": [
          "der.document",
          "der.archive-gate",
          "der.owner-decision"
        ]
      },
      "stack": {
        "state": "not_applicable",
        "reason": "No software, controls, electrical, or hardware system was implemented."
      },
      "testStrategy": {
        "state": "not_applicable",
        "reason": "No system was implemented or evaluated."
      },
      "outcome": {
        "state": "supported",
        "strength": "historical",
        "summary": "A completed historical proposal artifact; no system result, validation, deployment, or impact is claimed.",
        "sourceIds": [
          "der.document",
          "der.archive-gate",
          "der.owner-decision"
        ]
      },
      "failureDividend": {
        "state": "not_applicable",
        "reason": "No implemented system or evaluated build exists from which to derive a technical failure dividend."
      },
      "limitations": {
        "state": "supported",
        "strength": "historical",
        "summary": "No system was implemented or evaluated; the 2025 compliance framing is not current guidance; the embedded research log remains excluded.",
        "sourceIds": [
          "der.archive-gate",
          "der.owner-decision",
          "release.owner-decision"
        ]
      },
      "nextStep": {
        "state": "missing",
        "reason": "No owner-approved current project roadmap is established; promotion is explicitly unauthorized.",
        "evidenceNeeded": [
          "Separate owner decision",
          "New source and rights gate",
          "Implemented and measured project evidence if engineering treatment is sought"
        ]
      },
      "maturity": {
        "state": "supported",
        "strength": "historical",
        "summary": "Historical coursework retained as a link-only proposal.",
        "value": "historical-coursework",
        "sourceIds": [
          "der.document",
          "der.archive-gate",
          "der.owner-decision"
        ]
      }
    }
  }
} as const satisfies ProjectRecordMap;

/** Raw canonical export for independent validators. */
export const projectModel = {
  sources: projectSources,
  projects: projectRecords,
} as const;

export const projectHierarchy = {
  "flagship": [
    "burnlens",
    "runbook-sentinel"
  ],
  "supporting": [
    "quest-craft",
    "openclaw-showcase"
  ],
  "archive": [
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp"
  ]
} as const satisfies Record<
  ProjectLane,
  readonly ProjectId[]
>;

export const targetSurfaceHierarchy = {
  "homepage": {
    "flagshipProjectIds": [
      "burnlens",
      "runbook-sentinel"
    ],
    "supportingProjectIds": [
      "quest-craft",
      "openclaw-showcase"
    ],
    "archiveProjectIds": []
  },
  "workIndex": {
    "flagships": {
      "projectIds": [
        "burnlens",
        "runbook-sentinel"
      ],
      "numbering": "01-02",
      "visualWeight": "primary"
    },
    "supporting-notes": {
      "projectIds": [
        "quest-craft",
        "openclaw-showcase"
      ],
      "numbering": "none",
      "visualWeight": "subordinate"
    },
    "historical-reading-shelf": {
      "projectIds": [
        "hierarchical-clustering",
        "energy-sector-data-governance",
        "der-dcp"
      ],
      "numbering": "none",
      "visualWeight": "quiet-link-only"
    }
  },
  "resume": {
    "selectedProjectIds": [
      "burnlens",
      "runbook-sentinel",
      "quest-craft"
    ],
    "selectedProjectHierarchy": [
      "flagship",
      "flagship",
      "supporting-prototype"
    ],
    "researchAndWritingProjectIds": [
      "hierarchical-clustering",
      "energy-sector-data-governance",
      "der-dcp"
    ],
    "omittedSelectedProjectIds": [
      "openclaw-showcase"
    ]
  }
} as const;
export const projectSurfacePlan = {
  "burnlens": {
    "allowedSurfaces": [
      "homepage",
      "work_index",
      "resume",
      "project_route"
    ],
    "firstScreenLabels": [
      "Problem",
      "Intended reviewer",
      "Role split",
      "Release constraint",
      "Result",
      "Limit"
    ],
    "fields": {
      "homepage": [
        "problem",
        "personalRole",
        "decisionSupported",
        "outcome",
        "limitations",
        "maturity"
      ],
      "workIndex": [
        "problem",
        "intendedUser",
        "personalRole",
        "decisionSupported",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [
        "personalRole",
        "implementation",
        "testStrategy",
        "outcome",
        "limitations",
        "maturity"
      ],
      "projectRoute": [
        "problem",
        "intendedUser",
        "decisionSupported",
        "personalRole",
        "implementation",
        "testStrategy",
        "outcome",
        "limitations",
        "maturity"
      ]
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": []
    },
    "missingFields": [
      "nextStep"
    ],
    "notApplicableFields": [
      "stack",
      "failureDividend"
    ]
  },
  "runbook-sentinel": {
    "allowedSurfaces": [
      "homepage",
      "work_index",
      "resume",
      "project_route"
    ],
    "firstScreenLabels": [
      "Problem",
      "Intended reviewer",
      "My role",
      "Control system",
      "Result",
      "Limit"
    ],
    "fields": {
      "homepage": [
        "problem",
        "personalRole",
        "decisionSupported",
        "outcome",
        "failureDividend",
        "limitations",
        "maturity"
      ],
      "workIndex": [
        "problem",
        "intendedUser",
        "personalRole",
        "decisionSupported",
        "stack",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [
        "personalRole",
        "implementation",
        "stack",
        "testStrategy",
        "outcome",
        "limitations",
        "maturity"
      ],
      "projectRoute": [
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
        "maturity"
      ]
    },
    "featuredFailureIds": {
      "homepage": [
        "RS.F03"
      ],
      "workIndex": [],
      "resume": [],
      "projectRoute": [
        "RS.F03",
        "RS.F02",
        "RS.F01"
      ]
    },
    "missingFields": [],
    "notApplicableFields": []
  },
  "quest-craft": {
    "allowedSurfaces": [
      "homepage",
      "work_index",
      "resume",
      "project_route"
    ],
    "firstScreenLabels": [
      "Problem",
      "Intended user",
      "My role",
      "Interaction built",
      "Result",
      "Limit"
    ],
    "fields": {
      "homepage": [
        "problem",
        "intendedUser",
        "personalRole",
        "decisionSupported",
        "outcome",
        "limitations",
        "maturity"
      ],
      "workIndex": [
        "problem",
        "intendedUser",
        "personalRole",
        "decisionSupported",
        "testStrategy",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [
        "personalRole",
        "implementation",
        "testStrategy",
        "outcome",
        "limitations",
        "maturity"
      ],
      "projectRoute": [
        "problem",
        "intendedUser",
        "decisionSupported",
        "personalRole",
        "implementation",
        "testStrategy",
        "outcome",
        "failureDividend",
        "limitations",
        "maturity"
      ]
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": [
        "QC.F01",
        "QC.F02"
      ]
    },
    "missingFields": [
      "stack",
      "nextStep"
    ],
    "notApplicableFields": []
  },
  "openclaw-showcase": {
    "allowedSurfaces": [
      "homepage",
      "work_index",
      "project_route"
    ],
    "firstScreenLabels": [
      "Problem",
      "Public decision boundary",
      "My role",
      "Public artifact",
      "Result",
      "Limit"
    ],
    "fields": {
      "homepage": [
        "problem",
        "decisionSupported",
        "personalRole",
        "implementation",
        "outcome",
        "limitations",
        "maturity"
      ],
      "workIndex": [
        "problem",
        "decisionSupported",
        "personalRole",
        "implementation",
        "stack",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [],
      "projectRoute": [
        "problem",
        "decisionSupported",
        "personalRole",
        "implementation",
        "stack",
        "outcome",
        "limitations",
        "maturity"
      ]
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": []
    },
    "missingFields": [
      "intendedUser",
      "testStrategy",
      "failureDividend",
      "nextStep"
    ],
    "notApplicableFields": []
  },
  "hierarchical-clustering": {
    "allowedSurfaces": [
      "work_index",
      "resume_research_and_writing"
    ],
    "firstScreenLabels": [],
    "fields": {
      "homepage": [],
      "workIndex": [
        "problem",
        "limitations",
        "maturity"
      ],
      "resume": [
        "problem",
        "limitations",
        "maturity"
      ],
      "projectRoute": []
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": []
    },
    "missingFields": [
      "intendedUser",
      "decisionSupported",
      "personalRole",
      "testStrategy",
      "outcome",
      "failureDividend",
      "nextStep"
    ],
    "notApplicableFields": []
  },
  "energy-sector-data-governance": {
    "allowedSurfaces": [
      "work_index",
      "resume_research_and_writing"
    ],
    "firstScreenLabels": [],
    "fields": {
      "homepage": [],
      "workIndex": [
        "problem",
        "personalRole",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [
        "problem",
        "personalRole",
        "outcome",
        "limitations",
        "maturity"
      ],
      "projectRoute": []
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": []
    },
    "missingFields": [
      "intendedUser",
      "failureDividend",
      "nextStep"
    ],
    "notApplicableFields": [
      "decisionSupported",
      "stack",
      "testStrategy"
    ]
  },
  "der-dcp": {
    "allowedSurfaces": [
      "work_index",
      "resume_research_and_writing"
    ],
    "firstScreenLabels": [],
    "fields": {
      "homepage": [],
      "workIndex": [
        "problem",
        "personalRole",
        "outcome",
        "limitations",
        "maturity"
      ],
      "resume": [
        "problem",
        "personalRole",
        "outcome",
        "limitations",
        "maturity"
      ],
      "projectRoute": []
    },
    "featuredFailureIds": {
      "homepage": [],
      "workIndex": [],
      "resume": [],
      "projectRoute": []
    },
    "missingFields": [
      "intendedUser",
      "nextStep"
    ],
    "notApplicableFields": [
      "decisionSupported",
      "stack",
      "testStrategy",
      "failureDividend"
    ]
  }
} as const;
export const publicProjectionRules = {
  "renderSupportedFieldsOnly": true,
  "renderMissingFieldsAsClaims": false,
  "renderNotApplicableFieldsAsClaims": false,
  "boundedQualifierAdjacentToClaim": true,
  "historicalFieldRequiresDateAndArchiveTreatment": true,
  "plainLanguageBeforeIdentifier": true,
  "sourceIdsPrimaryLabelAllowed": false,
  "capabilityBoundariesSuppressClaims": true,
  "capabilityBooleansVisibleToReader": false,
  "failureDividendShape": [
    "failure",
    "buildChange",
    "earnedCapability",
    "boundary"
  ],
  "emptyFailureStateVisible": false,
  "technologyRequiresSupportedStackOrTestSource": true,
  "archiveCanBeSelectedEngineeringProject": false,
  "supportingCaseCanShareFlagshipVisualShell": false
} as const;
export const plainLanguageGlossary = [
  {
    "token": "TRACE R.20",
    "readerFirst": "Release dashboard · v0.0.20",
    "secondaryDisposition": "Trace R.20 belongs only in the source folio.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "CV / CV-to-GEOINT",
    "readerFirst": "computer-vision and geospatial-evidence workflow",
    "secondaryDisposition": "Use geospatial intelligence (GEOINT) only after expansion. Preserve the mandatory warning verbatim and clarify outside it.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "SRE",
    "readerFirst": "synthetic incident-response testbed",
    "secondaryDisposition": "Site reliability engineering (SRE) may appear after expansion on the technical route.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "MCP",
    "readerFirst": "bounded tool interface for diagnosis, proposals, and reading; it cannot approve or execute",
    "secondaryDisposition": "MCP belongs in technical or source-ledger detail after the readable capability boundary.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "terminal state",
    "readerFirst": "final synthetic system state",
    "secondaryDisposition": "The implementation term may remain in code or detailed protocol evidence.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "action/split pair",
    "readerFirst": "each action covered in both development and held-out cases",
    "secondaryDisposition": "The compact metric 6/6 may follow the explanation.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "JSONL trace",
    "readerFirst": "chained event log",
    "secondaryDisposition": "JSONL may remain as a file-format detail in the proof room.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "HDBSCAN",
    "readerFirst": "a density-based clustering method (HDBSCAN)",
    "secondaryDisposition": "HDBSCAN may remain secondarily; no verified comparative-result claim follows.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "Jaccard / Euclidean / Rogers–Tanimoto",
    "readerFirst": "three distance measures—Jaccard, Euclidean, and Rogers–Tanimoto",
    "secondaryDisposition": "Exact method names may remain after their category label.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "DER Distributed Control Planner",
    "readerFirst": "Distributed-energy control proposal",
    "secondaryDisposition": "Retain the owner-approved public source title separately; do not expand DER to distributed energy resources without a new gate.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "SCLA 521",
    "readerFirst": "Societal Impacts of AI course (SCLA 521)",
    "secondaryDisposition": "The course code may remain as provenance after the course name.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "RS.F## / QC.F##",
    "readerFirst": "Trip 01 / Correction 01",
    "secondaryDisposition": "Registry identifiers are never public primary labels.",
    "rawTokenPrimaryAllowed": false
  },
  {
    "token": "NFA-* / gate IDs / source IDs",
    "readerFirst": "source boundary / owner decision / evidence snapshot",
    "secondaryDisposition": "Exact governance codes remain internal or inside provenance details.",
    "rawTokenPrimaryAllowed": false
  }
] as const;
export const legacySurfaceExceptions = [
  {
    "id": "home-energy-equal-lane",
    "locator": "app/page.tsx:57-64",
    "finding": "Energy and risk currently receive equal implemented-lane weight even though current energy evidence is historical context.",
    "requiredChange": "Use software as proven center, climate as applied context, and energy as dated context plus prospective interest.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "home-supporting-bar-overclaim",
    "locator": "app/page.tsx:232-236",
    "finding": "The introduction says both supporting projects cleared implementation and evaluation, but OpenClaw has no implemented-system or evaluated-system evidence.",
    "requiredChange": "Describe the pair as bounded interaction and documentation field notes, each limited to public evidence.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "work-flat-hierarchy",
    "locator": "app/work/page.tsx:31-59",
    "finding": "A single numbered row sequence makes Quest and OpenClaw read as third and fourth flagships.",
    "requiredChange": "Split the index into flagships, unnumbered supporting notes, and a quiet historical shelf.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "supporting-route-scale",
    "locator": "app/work/quest-craft/page.tsx and app/work/openclaw-showcase/page.tsx",
    "finding": "Both supporting routes use near-flagship hero scale and five-chapter structures.",
    "requiredChange": "Compress Quest to a three-movement branching manuscript and OpenClaw to a two-or-three-part disclosure folio.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "resume-selection-drift",
    "locator": "app/resume/page.tsx:28-74",
    "finding": "Static duplicate content gives policy and clustering selected-project weight while omitting the stronger reviewed Quest prototype.",
    "requiredChange": "Project the two flagships plus subordinate Quest; move coursework to Research and writing and omit OpenClaw from selected engineering projects.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "resume-unregistered-skills",
    "locator": "app/resume/page.tsx:77-90",
    "finding": "Several named technologies are not supported by the project evidence registry.",
    "requiredChange": "Register separate evidence for those skills or remove them from the canonical project-derived skills projection.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "opaque-primary-labels",
    "locator": "app/page.tsx, app/work/page.tsx, app/resume/page.tsx, case-study proof rooms",
    "finding": "TRACE R.20, GEOINT, SRE, and HDBSCAN can precede reader meaning.",
    "requiredChange": "Apply the glossary: readable meaning first, exact codes only as marginalia or source detail.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  },
  {
    "id": "clustering-boundary-drift",
    "locator": "content/projects.ts:94-107",
    "finding": "The shelf boundary omits the registry's unresolved authorship and rights limitations.",
    "requiredChange": "Use the exact historical projection and retain authorship and rights as unresolved.",
    "status": "legacy-parity-only",
    "supportsTruth": false
  }
] as const;

export function getProject<P extends ProjectId>(projectId: P): (typeof projectRecords)[P] {
  return projectRecords[projectId];
}

export function getProjectSource<S extends SourceId>(sourceId: S): (typeof projectSources)[S] {
  return projectSources[sourceId];
}

export function getProjectsInLane(lane: ProjectLane): readonly ProjectRecord<ProjectId>[] {
  return projectHierarchy[lane].map(
    (projectId) => projectRecords[projectId],
  ) as readonly ProjectRecord<ProjectId>[];
}

export function getSupportedEvidence(
  projectId: ProjectId,
  field: keyof ProjectEvidence<ProjectId>,
): SupportedEvidence<ProjectId> | null {
  const evidence = projectRecords[projectId].evidence[field] as EvidenceField<ProjectId>;
  return evidence.state === "supported" ? evidence : null;
}

export function getPublicSourceHref(sourceId: PublicLinkSourceId): `https://${string}` {
  const source = projectSources[sourceId] as SourceBinding;
  if (source.availability !== "public" || !source.href) {
    throw new Error(`Source ${sourceId} is not approved as a public link.`);
  }
  return source.href;
}

/**
 * Translate canonical evidence into front-door language without changing the
 * underlying evidence record. Detailed project routes may retain technical
 * identifiers after introducing them; recruiter-facing summaries should not
 * make the identifier do the explanatory work.
 */
export function toReaderFirst(text: string): string {
  return text
    .replace(/9 of 84 valid outputs/g, "9 of 84 outputs that passed the required structure")
    .replace(/\bJSON and JSONL traces?\b/g, "JSON records and chained event logs")
    .replace(/\bJSON and JSONL\b/g, "JSON records and chained event logs")
    .replace(/\bJSONL traces?\b/g, "chained event logs")
    .replace(/\bJSONL\b/g, "chained event-log format")
    .replace(/\bAPI, MCP server\b/g, "API and bounded diagnostic-tool server")
    .replace(/\bDiagnostic\/read MCP surface\b/g, "Diagnostic and read-only tool surface")
    .replace(/\bMCP\b/g, "bounded tool interface")
    .replace(/\bGEOINT\b/g, "geospatial intelligence")
    .replace(/\bSRE\b/g, "site reliability engineering")
    .replace(/\bterminal states?\b/g, "final synthetic system states");
}
