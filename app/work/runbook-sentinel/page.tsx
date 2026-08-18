import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CaseChapterDisclosure } from "@/components/CaseChapterDisclosure";
import { EvidenceLink } from "@/components/editorial/EvidenceLink";
import {
  ProjectFactLedger,
  type ProjectFact,
} from "@/components/editorial/ProjectFactLedger";
import {
  getProject,
  getPublicSourceHref,
  type NonEmpty,
  type PublicLinkSourceId,
} from "@/content/project-model";
import runbookMedia from "@/public/media/projects/runbook-sentinel/sources.json";

import styles from "./page.module.css";

const project = getProject("runbook-sentinel");
const sourceTreeHref = getPublicSourceHref("rs.git.v0020");
const sourceBlobRoot = sourceTreeHref.replace("/tree/", "/blob/");
const dashboardSourceHref = `${sourceBlobRoot}/${runbookMedia.assets[0].source_path}`;
const dashboardManifestHref = "/media/projects/runbook-sentinel/sources.json";

const chapters = [
  ["01", "Authority break", "#authority"],
  ["02", "Candidate rejected", "#candidate"],
  ["03", "Release progression", "#progression"],
  ["04", "Proof room", "#proof"],
] as const;

const firstScreenFacts = [
  {
    id: "problem",
    term: "Problem",
    detail:
      "Keep an evidence-retrieving synthetic incident agent bounded when evidence is unreliable—without letting retrieved text or model output authorize change.",
  },
  {
    id: "reviewer",
    term: "Intended reviewer",
    detail:
      "Software and reliability reviewers assessing a bounded control architecture before any real-infrastructure connection.",
  },
  {
    id: "role",
    term: "My role",
    detail:
      "Repository author and release owner; designed the authority separation, implemented the runtime and surfaces, and authored the evaluation and release checks.",
  },
  {
    id: "system",
    term: "Control system",
    detail:
      "Dependency-free synthetic control system with bounded agent outcomes, structured proposals, separate approval and policy checks, synthetic state, and chained event logs.",
  },
  {
    id: "result",
    term: "Result",
    detail:
      "At pinned v0.0.20, 93 of 93 predefined synthetic attempts matched expected paths and final state; 9 of 84 tested-model outputs passed the required structure, so the candidate was excluded.",
  },
  {
    id: "limit",
    term: "Limit",
    detail:
      "Synthetic fixtures and state only. No real-system connectors, arbitrary shell, production reliability, adoption, or operational-impact claim.",
  },
] as const satisfies NonEmpty<ProjectFact>;

const signalRail = [
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
] as const;

const authorityRail = [
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
] as const;

const modelOutputCells = [
  ...Array.from({ length: 9 }, () => "valid" as const),
  ...Array.from({ length: 67 }, () => "diagnosis" as const),
  ...Array.from({ length: 7 }, () => "arguments" as const),
  "context" as const,
];

type RunbookFailureId = "RS.F03" | "RS.F02" | "RS.F01";

function getRunbookFailure(id: RunbookFailureId) {
  const record = project.evidence.failureDividend.value.find((entry) => entry.id === id);
  if (!record) throw new Error(`Missing canonical Runbook failure record: ${id}`);
  return record;
}

const candidateFailure = getRunbookFailure("RS.F03");
const coverageFailure = getRunbookFailure("RS.F02");
const traceFailure = getRunbookFailure("RS.F01");

const failurePresentation = {
  "RS.F03": {
    marker: "Decision trip",
    title: "The tested model did not earn a place",
    sources: [
      ["Frozen model comparison", "rs.model_comparison.0018"],
      ["Evaluation report", "rs.evaluation_report.v0020"],
    ],
  },
  "RS.F02": {
    marker: "Coverage trip",
    title: "Headline coverage hid a held-out gap",
    sources: [
      ["Coverage-gap record", "rs.action_split_gap.0020"],
      ["Selected evaluation", "rs.evaluation.v0020"],
      ["Release contract", "rs.milestone.0020"],
    ],
  },
  "RS.F01": {
    marker: "Trace trip",
    title: "A passing event trace could be altered",
    sources: [
      ["Trace-gap record", "rs.trace_gap.0016"],
      ["Selected chained trace", "rs.trace.0020.attempt003"],
      ["Architecture record", "rs.architecture.v0020"],
    ],
  },
} as const satisfies Record<
  RunbookFailureId,
  {
    marker: string;
    title: string;
    sources: ReadonlyArray<readonly [string, PublicLinkSourceId]>;
  }
>;

const releaseProgression = [
  {
    marker: "Headline view",
    value: "3 / 3",
    body: "All three permitted actions appeared somewhere in the catalog.",
  },
  {
    marker: "Split-aware review",
    value: "5 / 6",
    body: "Held-out tests never exercised deployment rollback.",
  },
  {
    marker: "Evaluator changed",
    value: "+ 1 case",
    body: "A predefined held-out rollback case was added; any missing development-or-held-out combination now fails the gate.",
  },
  {
    marker: "Earned result",
    value: "6 / 6",
    body: "Each action was covered in both development and held-out cases across 31 fixed cases and three trials.",
  },
] as const;

const sourceFolio = [
  ["Pinned v0.0.20 source", "rs.git.v0020", "f149ac24…"],
  ["Architecture and authority split", "rs.architecture.v0020", "software design"],
  ["Synthetic threat boundaries", "rs.threat_model.v0020", "scope limits"],
  ["Selected 93-attempt evaluation", "rs.evaluation.v0020", "baseline 0020"],
  ["Rejected-model comparison", "rs.model_comparison.0018", "9 / 84 passed structure"],
  ["Coverage-gap record", "rs.action_split_gap.0020", "5 / 6 → 6 / 6"],
  ["Trace-integrity gap", "rs.trace_gap.0016", "mutation probe"],
  ["Release contract", "rs.milestone.0020", "v0.0.20"],
] as const satisfies ReadonlyArray<readonly [string, PublicLinkSourceId, string]>;

export const metadata: Metadata = {
  title: "Runbook Sentinel — The model is not the control plane",
  description:
    "A source-backed case study of a synthetic incident-response testbed that keeps model output outside deterministic software authority.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "Runbook Sentinel",
    "software engineering",
    "incident response",
    "bounded agent systems",
    "fail-closed agent evaluation",
    "deterministic software authorization",
  ],
  alternates: { canonical: "/work/runbook-sentinel" },
  openGraph: {
    title: "Runbook Sentinel — The model is not the control plane",
    description:
      "A tested local model failed the fixed contract. Deterministic control stayed. Zero real systems connected.",
    url: "/work/runbook-sentinel",
    siteName: "Drew Baker — Portfolio",
    type: "article",
    images: [
      {
        url: "/work/runbook-sentinel/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Runbook Sentinel software control trace separating evidence and model output from approval and synthetic execution",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Runbook Sentinel — The model is not the control plane",
    description:
      "93 of 93 predefined synthetic attempts matched expected paths and final state. Tested model: 9 of 84 outputs passed the required structure. No real systems connected.",
    images: ["/work/runbook-sentinel/opengraph-image"],
  },
};

function ChapterList() {
  return (
    <ol>
      {chapters.map(([number, label, href]) => (
        <li key={number}>
          <a href={href}>
            <span>{number}</span>
            {label}
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function RunbookSentinelCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article
          data-control-trace="runbook-sentinel"
          data-project-model-id={project.id}
        >
          <header className={styles.hero}>
            <div className={styles.statusBus}>
              <span>Software flagship</span>
              <span>Verified synthetic testbed · v0.0.20</span>
              <span>Real infrastructure · disconnected</span>
            </div>
            <div className={styles.heroIntro}>
              <div>
                <p className={styles.eyebrow}>Runbook Sentinel · Software control trace</p>
                <h1>The model is not the control plane.</h1>
              </div>
              <div>
                <p className={styles.dek}>
                  I designed and implemented a synthetic incident-response testbed in
                  which retrieved text and model output can inform a structured proposal,
                  while separate approval and fixed software checks retain every
                  state-changing decision.
                </p>
                <EvidenceLink
                  className={styles.sourceAction}
                  data-source-id="rs.git.v0020"
                  provenanceLabel={<code data-provenance-handle>f149ac24…</code>}
                  readerLabel="Inspect the pinned v0.0.20 source"
                  sourceId="rs.git.v0020"
                />
              </div>
            </div>
            <ProjectFactLedger
              className={styles.heroLedger}
              data-first-screen-ledger="runbook-sentinel"
              facts={firstScreenFacts}
            />
            <p className={styles.metaphorBoundary}>
              <strong>Reading boundary.</strong> Software-control metaphor; no
              electrical or hardware implementation is claimed.
            </p>
          </header>

          <nav
            aria-label="Runbook Sentinel case study chapters"
            className={`${styles.chapterIndex} ${styles.chapterIndexDesktop}`}
            data-case-chapter-index="runbook-sentinel"
          >
            <ChapterList />
          </nav>
          <CaseChapterDisclosure
            ariaLabel="Runbook Sentinel mobile case study chapters"
            chapters={chapters}
            className={styles.chapterDisclosure}
            projectId="runbook-sentinel"
          />

          <section
            aria-labelledby="authority-heading"
            className={styles.authoritySection}
            data-authority-trace="runbook-sentinel"
            id="authority"
            tabIndex={-1}
          >
            <div className={styles.sectionLead}>
              <p>Movement I · Authority break</p>
              <h2 id="authority-heading">A proposal has no power by itself.</h2>
              <p>
                Retrieved text is treated as untrusted evidence and cannot directly
                approve or execute an action. Signal and authority travel on separate,
                inspectable software paths.
              </p>
            </div>

            <div className={styles.authorityTrace}>
              <div className={styles.rail} data-authority-rail="signal">
                <header>
                  <span>Signal rail</span>
                  <strong>May inform</strong>
                </header>
                <ol>
                  {signalRail.map((node, index) => (
                    <li key={node.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{node.title}</h3>
                        <p>{node.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={styles.authorityBreak} data-authority-break>
                <span aria-hidden="true" className={styles.openContact} />
                <strong>Proposal alone: no state-change authority.</strong>
              </div>

              <div className={styles.rail} data-authority-rail="authority">
                <header>
                  <span>Authority rail</span>
                  <strong>May authorize synthetic change</strong>
                </header>
                <ol>
                  {authorityRail.map((node, index) => (
                    <li key={node.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{node.title}</h3>
                        <p>{node.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <p className={styles.interfaceNote}>
              The bounded diagnosis, proposal, and read interface has no approval or
              execution tool. Repeating an already consumed request cannot cause a
              second change; state is checked before and after the synthetic action.
            </p>
          </section>

          <div data-failure-dividend="runbook-sentinel">
            <section
              aria-labelledby="candidate-heading"
              className={styles.candidateSection}
              id="candidate"
              tabIndex={-1}
            >
              <div className={styles.sectionLead}>
                <p>Movement II · Candidate rejected</p>
                <h2 id="candidate-heading">
                  The tested model failed the fixed contract.
                </h2>
                <p>
                  In one source-gated local comparison, a tested
                  three-billion-parameter local model produced only 9 valid structured
                  outputs from 84 attempts. A failed component is not a trophy; it is a
                  configuration decision.
                </p>
              </div>

              <article
                aria-labelledby="candidate-heading"
                className={styles.candidateCircuit}
                data-evidence-id="RS.F03"
                data-failure-dividend-record
              >
                <header className={styles.failureMeta}>
                  <p>{failurePresentation["RS.F03"].marker}</p>
                  <nav aria-label="Candidate-rejection evidence">
                    {failurePresentation["RS.F03"].sources.map(([label, sourceId]) => (
                      <EvidenceLink
                        data-source-id={sourceId}
                        key={sourceId}
                        readerLabel={label}
                        sourceId={sourceId}
                      />
                    ))}
                  </nav>
                </header>

                <p className={styles.failureStatement} data-stage="failed">
                  <strong>What failed.</strong> {candidateFailure.failure}
                </p>

                <div className={styles.modelLot}>
                  <div>
                    <p className={styles.lotLabel}>84 fixed local outputs</p>
                    <div
                      aria-label="Eighty-four tested local-model outputs: 9 valid, 67 rejected for invalid diagnosis identifiers, 7 rejected for invalid action arguments, and 1 rejected for evidence outside the permitted context."
                      className={styles.outputMatrix}
                      data-model-output-matrix
                      role="img"
                    >
                      {modelOutputCells.map((kind, index) => (
                        <span aria-hidden="true" data-kind={kind} key={`${kind}-${index}`} />
                      ))}
                    </div>
                  </div>
                  <dl className={styles.matrixLegend} data-model-output-legend>
                    <div data-kind="valid"><dt>Valid structured output</dt><dd>9</dd></div>
                    <div data-kind="diagnosis"><dt>Invalid diagnosis identifier</dt><dd>67</dd></div>
                    <div data-kind="arguments"><dt>Invalid action argument</dt><dd>7</dd></div>
                    <div data-kind="context"><dt>Evidence outside context</dt><dd>1</dd></div>
                    <div><dt>Total inspected</dt><dd>84</dd></div>
                  </dl>
                </div>

                <div className={styles.candidateOutcome}>
                  <div data-stage="changed">
                    <span>System changed</span>
                    <p>{candidateFailure.buildChange}</p>
                  </div>
                  <div data-stage="claimable">
                    <span>What the selection supports</span>
                    <p>{candidateFailure.earnedCapability}</p>
                  </div>
                  <div data-boundary data-stage="boundary">
                    <span>Still not established</span>
                    <p>{candidateFailure.boundary}</p>
                  </div>
                </div>
              </article>
            </section>

            <section
              aria-labelledby="progression-heading"
              className={styles.progressionSection}
              data-release-progression="runbook-sentinel"
              id="progression"
              tabIndex={-1}
            >
              <div className={styles.sectionLead}>
                <p>Movement III · Release progression</p>
                <h2 id="progression-heading">The failures rewrote the gate.</h2>
                <p>
                  Two apparently passing records concealed different weaknesses. One
                  changed what the evaluator requires; the other changed how the event
                  log detects alteration and resumes.
                </p>
              </div>

              <div className={styles.releaseTrips}>
                <article
                  className={styles.coverageCircuit}
                  data-evidence-id="RS.F02"
                  data-failure-dividend-record
                >
                  <header className={styles.failureMeta}>
                    <p>{failurePresentation["RS.F02"].marker}</p>
                    <h3>{failurePresentation["RS.F02"].title}</h3>
                    <nav aria-label="Coverage-gap evidence">
                      {failurePresentation["RS.F02"].sources.map(([label, sourceId]) => (
                        <EvidenceLink
                          data-source-id={sourceId}
                          key={sourceId}
                          readerLabel={label}
                          sourceId={sourceId}
                        />
                      ))}
                    </nav>
                  </header>
                  <p className={styles.failureStatement} data-stage="failed">
                    <strong>What failed.</strong> {coverageFailure.failure}
                  </p>
                  <ol className={styles.progressionRail}>
                    {releaseProgression.map((step, index) => (
                      <li data-progression-stage={index + 1} key={step.marker}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{step.marker}</p>
                        <strong>{step.value}</strong>
                        <small>{step.body}</small>
                      </li>
                    ))}
                  </ol>
                  <div className={styles.coverageOutcome}>
                    <div data-stage="changed">
                      <span>Evaluator changed</span>
                      <p>{coverageFailure.buildChange}</p>
                    </div>
                    <div data-stage="claimable">
                      <span>What the gate now supports</span>
                      <p>{coverageFailure.earnedCapability}</p>
                    </div>
                    <p data-boundary data-stage="boundary">
                      <strong>Still not established.</strong> {coverageFailure.boundary}
                    </p>
                  </div>
                </article>

                <article
                  className={styles.traceCircuit}
                  data-evidence-id="RS.F01"
                  data-failure-dividend-record
                >
                  <header className={styles.failureMeta}>
                    <p>{failurePresentation["RS.F01"].marker}</p>
                    <h3>{failurePresentation["RS.F01"].title}</h3>
                    <nav aria-label="Trace-integrity evidence">
                      {failurePresentation["RS.F01"].sources.map(([label, sourceId]) => (
                        <EvidenceLink
                          data-source-id={sourceId}
                          key={sourceId}
                          readerLabel={label}
                          sourceId={sourceId}
                        />
                      ))}
                    </nav>
                  </header>
                  <p className={styles.failureStatement} data-stage="failed">
                    <strong>What failed.</strong> {traceFailure.failure}
                  </p>
                  <ol aria-label="Trace integrity change" className={styles.traceChange}>
                    <li>150-event trace allowed an undetected value change</li>
                    <li>10 integrity cases</li>
                    <li>preceding-event links + final anchor</li>
                    <li>165 contiguous events</li>
                  </ol>
                  <div className={styles.traceOutcome}>
                    <div data-stage="changed">
                      <span>Event interface changed</span>
                      <p>{traceFailure.buildChange}</p>
                    </div>
                    <div data-stage="claimable">
                      <span>What continuity now supports</span>
                      <p>{traceFailure.earnedCapability}</p>
                    </div>
                    <p data-boundary data-stage="boundary">
                      <strong>Still not established.</strong> {traceFailure.boundary}
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <section
            aria-labelledby="proof-heading"
            className={styles.proofSection}
            data-proof-room="runbook-sentinel"
            id="proof"
            tabIndex={-1}
          >
            <div className={styles.sectionLead}>
              <p>Movement IV · Proof room</p>
              <h2 id="proof-heading">What this release proves—and what it cannot.</h2>
              <p>
                The recruiter-scale story ends here. The exact release receipt,
                rendered checkpoint, source identities, and hard limits remain attached
                for deeper review.
              </p>
            </div>

            <dl className={styles.releaseReceipt}>
              <div><dt>Fixed cases</dt><dd>31 × 3 trials</dd></div>
              <div><dt>Expected paths + final states</dt><dd>93 / 93 matched</dd></div>
              <div><dt>Action / no-action</dt><dd>36 / 57</dd></div>
              <div><dt>Action coverage</dt><dd>6 / 6 across development + held-out</dd></div>
              <div><dt>Selected trace</dt><dd>165 linked events</dd></div>
              <div><dt>Real systems</dt><dd>0 connected</dd></div>
            </dl>

            <figure
              className={styles.dashboardFigure}
              data-governed-figure="runbook-dashboard"
            >
              <div className={styles.dashboardHeading}>
                <div>
                  <p>Rendered checkpoint · supporting evidence</p>
                  <h3>Rendered checkpoint, not a live console.</h3>
                </div>
                <code data-provenance-handle>baseline-0020</code>
              </div>
              <div className={styles.dashboardMount}>
                <Image
                  alt={runbookMedia.assets[0].alt}
                  height={1000}
                  sizes="(max-width: 760px) 100vw, (max-width: 1200px) 78vw, 720px"
                  src={runbookMedia.assets[0].path}
                  width={1440}
                />
              </div>
              <figcaption>
                <div className={styles.dashboardReading}>
                  <p>
                    The frozen dashboard corroborates the selected evaluation, exact
                    test metrics, separate approval boundary, and disconnected real
                    infrastructure. It is not an operations surface.
                  </p>
                </div>
                <aside
                  aria-label="Runbook dashboard source and use conditions"
                  className={styles.mediaConditions}
                  data-media-conditions
                >
                  <p>
                    <strong>Use boundary.</strong> Synthetic state only; real
                    infrastructure disconnected. No production-readiness or operational
                    impact claim.
                  </p>
                  <p>
                    <strong>Terminology.</strong> The screenshot&apos;s operator label
                    means a project-specific launch-scoped loopback credential—not
                    verified human presence, OAuth identity, or enterprise authorization.
                  </p>
                  <p>
                    <strong>Source and rights.</strong> Owner-approved display of this
                    exact hash-bound asset in Drew Baker&apos;s personal portfolio. The
                    source repository has no top-level license; no general reuse right is
                    granted.
                  </p>
                  <a href={dashboardSourceHref}>
                    Inspect the pinned source capture <span aria-hidden="true">↗</span>
                  </a>
                  <a href={dashboardManifestHref}>
                    Verify asset custody and checksum <span aria-hidden="true">→</span>
                  </a>
                </aside>
              </figcaption>
            </figure>

            <div className={styles.proofGrid}>
              <div className={styles.limitRegister}>
                <h3>Limits that travel with the result</h3>
                <ul>
                  {project.evidence.limitations.value.map((limit) => (
                    <li key={limit}>{limit}</li>
                  ))}
                  <li>
                    At v0.0.20, 31 fixed cases remained below the separately declared
                    48-case threshold.
                  </li>
                </ul>
              </div>
              <div className={styles.sourceFolio} data-source-ledger="runbook-sentinel">
                <h3>Inspect the frozen record</h3>
                {sourceFolio.map(([label, sourceId, note]) => (
                  <div key={sourceId}>
                    <EvidenceLink
                      data-source-id={sourceId}
                      readerLabel={label}
                      sourceId={sourceId}
                    />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </article>
      </main>

      <nav className={styles.caseNavigation} aria-label="Adjacent portfolio case studies">
        <Link href="/work/burnlens">
          <span>Previous flagship</span>
          BurnLens
        </Link>
        <Link href="/work">
          <span>Project index</span>
          Return to all work
        </Link>
      </nav>
    </div>
  );
}
