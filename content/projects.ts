type Proof = { label: string; value: string };

type Flagship = {
  title: string;
  href: string;
  sourceHref: string;
  status: string;
  thesis: string;
  proof: readonly Proof[];
};

type SecondaryProject = {
  title: string;
  kind: string;
  thesis: string;
  href: string | null;
  sourceHref: string;
};

type HistoricalCoursework = {
  title: string;
  context: string;
  date: string;
  dateTime: string;
  summary: string;
  boundary: string;
  sourceHref: string;
  sourceLabel: string;
};

export const burnlensEvidenceBinding = {
  releaseVersion: "v0.56.0",
  releaseTag: "v0.56.0-baseline-first-portfolio-release",
  releaseCommit: "e2e0b778038b2b5cd55258c784951ef2d1473469",
  snapshotCommit: "a741111d82e69689022d2058118ed8f4b9bf3546",
} as const;

export const projects: {
  burnlens: Flagship;
  runbookSentinel: Flagship;
  secondary: readonly SecondaryProject[];
} = {
  burnlens: {
    title: "BurnLens",
    href: "/work/burnlens",
    sourceHref:
      `https://github.com/drwbkr1/burnlens-deschutes/tree/${burnlensEvidenceBinding.snapshotCommit}`,
    status: "Release v0.56.0 · post-release evidence",
    thesis:
      "A baseline-first wildfire evidence system that keeps accepted analysis, a rejected model, official context, and uncertainty visibly separate.",
    proof: [
      { label: "Selected method", value: "RBR baseline" },
      { label: "Model decision", value: "U-Net rejected" },
      { label: "Operating status", value: "Non-operational" },
    ],
  },
  runbookSentinel: {
    title: "Runbook Sentinel",
    href: "/work/runbook-sentinel",
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
      title: "Quest Craft",
      kind: "Designed case · interaction / evaluation",
      thesis:
        "A bounded creative assistant whose public reviewer snapshot preserves the agency loop, 36-row evaluation ledger, corrections, and retained failures.",
      href: "/work/quest-craft",
      sourceHref:
        "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/tree/bc14c43840aabb11ca35e94df0c8682672f24f3c",
    },
    {
      title: "OpenClaw Showcase",
      kind: "Review evidence · agent workflow",
      thesis:
        "A public documentation layer for workflow state, traceability, QA, and human approval—not evidence of the closed runtime itself.",
      href: "/work/openclaw-showcase",
      sourceHref:
        "https://github.com/drwbkr1/openclaw-showcase/tree/3695666f6a44c095674049e64d23f0bdace2fb70",
    },
  ],
} as const;

export const allPublishedWork = [projects.burnlens, projects.runbookSentinel, ...projects.secondary];

export const historicalCoursework: readonly HistoricalCoursework[] = [
  {
    title: "Hierarchical clustering exploration",
    context: "Historical coursework · Jupyter notebook",
    date: "Repository snapshot · 18 Aug 2025",
    dateTime: "2025-08-18",
    summary:
      "A public notebook exploration comparing HDBSCAN behavior under Jaccard, Euclidean, and Rogers–Tanimoto distance choices.",
    boundary:
      "Not a current reproducible study. The GitHub and Colab versions differ, the historical data source and environment are not reproducibly pinned, and saved outputs are not treated as verified results.",
    sourceHref:
      "https://github.com/drwbkr1/Grad504-Hierarchical-Cluster-Project/tree/21e9b18b37a0e1acd9f2814cca3456b94849c098",
    sourceLabel: "Inspect the frozen repository snapshot",
  },
  {
    title: "DER Distributed Control Planner",
    context: "Historical coursework · impact-assessment proposal",
    date: "Proposal revision · 13 Nov 2025",
    dateTime: "2025-11-13",
    summary:
      "A theoretical impact-assessment proposal by William Baker for SCLA 521 Societal Impacts of AI, exploring governance and evaluation planning for a distributed-energy control concept.",
    boundary:
      "No system was implemented or evaluated. Its 2025 compliance framing is not current guidance, and the embedded research log remains excluded.",
    sourceHref:
      "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
    sourceLabel: "Read the historical proposal",
  },
  {
    title: "Energy Sector Data Governance",
    context: "Historical coursework · policy brief",
    date: "December 2025",
    dateTime: "2025-12",
    summary:
      "A 14-page policy-writing sample by William Baker, retained for its research, risk framing, and documented revision process.",
    boundary:
      "Read as a December 2025 writing artifact—not current policy guidance. Agency terminology and time-sensitive claims require correction and fresh verification; no Adobe Stock or Canva imagery is reused here.",
    sourceHref:
      "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
    sourceLabel: "Read the public brief",
  },
] as const;
