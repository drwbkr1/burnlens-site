import { getProject, getPublicSourceHref, type ProjectId } from "./project-model";

type Proof = { label: string; value: string };

type Flagship = {
  id: ProjectId;
  title: string;
  href: string;
  sourceHref: string;
  status: string;
  thesis: string;
  proof: readonly Proof[];
};

type SecondaryProject = {
  id: ProjectId;
  title: string;
  kind: string;
  thesis: string;
  href: string | null;
  sourceHref: string;
};

type HistoricalCoursework = {
  id: ProjectId;
  title: string;
  context: string;
  date: string;
  dateTime: string;
  summary: string;
  boundary: string;
  sourceHref: string;
  sourceLabel: string;
};

const burnlens = getProject("burnlens");
const runbookSentinel = getProject("runbook-sentinel");
const questCraft = getProject("quest-craft");
const openClawShowcase = getProject("openclaw-showcase");
const hierarchicalClustering = getProject("hierarchical-clustering");
const derDcp = getProject("der-dcp");
const energySectorDataGovernance = getProject("energy-sector-data-governance");

export const projects: {
  burnlens: Flagship;
  runbookSentinel: Flagship;
  secondary: readonly SecondaryProject[];
} = {
  burnlens: {
    id: burnlens.id,
    title: burnlens.title,
    href: burnlens.route,
    sourceHref: getPublicSourceHref("burnlens-pinned-tree"),
    status: "Public Phase Six portfolio release · v0.56.0",
    thesis:
      "BurnLens asks how one bounded experimental computer-vision-to-GEOINT release can become understandable, inspectable, citable, and responsibly interpretable as a coherent whole.",
    proof: [
      {
        label: "Role split",
        value:
          "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
      },
      {
        label: "Release result",
        value:
          "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
      },
      {
        label: "Use boundary",
        value:
          "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
      },
    ],
  },
  runbookSentinel: {
    id: runbookSentinel.id,
    title: runbookSentinel.title,
    href: runbookSentinel.route,
    sourceHref: "https://github.com/drwbkr1/runbook-sentinel/tree/v0.0.20",
    status: "Verified release · v0.0.20",
    thesis:
      "A deterministic SRE incident-agent testbed designed to remain bounded when evidence is stale, conflicting, or hostile.",
    proof: [
      { label: "Evaluation", value: "31 cases × 3 trials" },
      { label: "Action coverage", value: "6 / 6 split pairs" },
      { label: "Real infrastructure", value: "Disconnected" },
    ],
  },
  secondary: [
    {
      id: questCraft.id,
      title: questCraft.title,
      kind: "Designed case · interaction / evaluation",
      thesis:
        "A bounded creative assistant whose public reviewer snapshot preserves the agency loop, 36-row evaluation ledger, corrections, and retained failures.",
      href: questCraft.route,
      sourceHref: getPublicSourceHref("quest.snapshot"),
    },
    {
      id: openClawShowcase.id,
      title: openClawShowcase.title,
      kind: "Review evidence · agent workflow",
      thesis:
        "A public documentation layer for workflow state, traceability, QA, and human approval—not evidence of the closed runtime itself.",
      href: openClawShowcase.route,
      sourceHref: getPublicSourceHref("openclaw.snapshot"),
    },
  ],
} as const;

export const allPublishedWork = [projects.burnlens, projects.runbookSentinel, ...projects.secondary];

export const historicalCoursework: readonly HistoricalCoursework[] = [
  {
    id: hierarchicalClustering.id,
    title: hierarchicalClustering.title,
    context: "Historical coursework · Jupyter notebook",
    date: "Repository snapshot · 18 Aug 2025",
    dateTime: "2025-08-18",
    summary:
      "A public notebook exploration using a density-based clustering method (HDBSCAN) across three distance measures—Jaccard, Euclidean, and Rogers–Tanimoto.",
    boundary:
      "Not a current reproducible study; source variants, data identity, environment, outputs, evaluation, authorship, and rights remain bounded or unresolved.",
    sourceHref: getPublicSourceHref("hc.snapshot"),
    sourceLabel: "Inspect the frozen repository snapshot",
  },
  {
    id: energySectorDataGovernance.id,
    title: energySectorDataGovernance.title,
    context: "Historical coursework · policy brief",
    date: "December 2025",
    dateTime: "2025-12",
    summary:
      "A 14-page policy-writing sample by William Baker, retained for its research, risk framing, and documented revision process.",
    boundary:
      "Read as a December 2025 writing artifact—not current policy guidance. Agency terminology and time-sensitive claims require correction and fresh verification; no Adobe Stock or Canva imagery is reused here.",
    sourceHref: getPublicSourceHref("policy.reader"),
    sourceLabel: "Read the public brief",
  },
  {
    id: derDcp.id,
    title: derDcp.title,
    context: "Historical coursework · distributed-energy control proposal",
    date: "Proposal revision · 13 Nov 2025",
    dateTime: "2025-11-13",
    summary:
      "A theoretical impact-assessment proposal by William Baker for the Societal Impacts of AI course (SCLA 521), exploring governance and evaluation planning for a distributed-energy control concept.",
    boundary:
      "No system was implemented or evaluated. Its 2025 compliance framing is not current guidance, and the embedded research log remains excluded.",
    sourceHref: getPublicSourceHref("der.document"),
    sourceLabel: "Read the historical proposal",
  },
] as const;
