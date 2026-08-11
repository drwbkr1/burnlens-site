import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CaseChapterDisclosure } from "../../../components/CaseChapterDisclosure";
import { ControlPlane } from "../../../components/runbook/ControlPlane";
import { EvidenceSpine } from "../../../components/runbook/EvidenceSpine";
import styles from "./page.module.css";

const sourceCommit = "f149ac2408f30b504b78844780b8533bed2ebfdc";

export const metadata: Metadata = {
  title: "Runbook Sentinel — The model is not the control plane",
  description:
    "A source-backed case study of Runbook Sentinel: a synthetic-only incident-agent system that keeps model output outside deterministic authority.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "Runbook Sentinel",
    "software engineering",
    "SRE",
    "incident agents",
    "AI safety",
    "deterministic authorization",
    "system evaluation",
  ],
  alternates: {
    canonical: "/work/runbook-sentinel",
  },
  openGraph: {
    title: "Runbook Sentinel — The model is not the control plane",
    description:
      "A synthetic-only incident-agent case study with model output, approval, policy, and execution held on distinct rails.",
    url: "/work/runbook-sentinel",
    siteName: "Drew Baker — Portfolio",
    type: "article",
    images: [
      {
        url: "/work/runbook-sentinel/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Runbook Sentinel — the model is not the control plane",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Runbook Sentinel — The model is not the control plane",
    description:
      "93 frozen synthetic attempts. Exact outcomes. A rejected local-model candidate. Zero real systems connected.",
    images: ["/work/runbook-sentinel/opengraph-image"],
  },
};

const chapters = [
  ["01", "Premise", "#premise"],
  ["02", "Control paths", "#control-paths"],
  ["03", "Evaluation", "#evaluation"],
  ["04", "Model decision", "#model-decision"],
  ["05", "Evidence", "#evidence"],
  ["06", "Sources", "#sources"],
] as const;

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

const modelOutputCells = [
  ...Array.from({ length: 9 }, () => "valid" as const),
  ...Array.from({ length: 67 }, () => "diagnosis" as const),
  ...Array.from({ length: 7 }, () => "arguments" as const),
  "context" as const,
];

const tripRecords = [
  {
    id: "RS.F01",
    marker: "Trip 01",
    title: "A changed trace still looked valid",
    failed:
      "A success flag in a 150-event audit trace could be changed from true to false without breaking parsing, inspection, or the release’s passing status.",
    changed:
      "Freeze ten integrity cases; chain every event to its predecessor, bind the completed evaluation to its final event, and refuse resume when the chain is incomplete.",
    claimable:
      "The selected v0.0.20 companion trace contains 165 contiguous chained events with an exact final anchor.",
    boundary:
      "Writer authentication, hostile-writer resistance, immutable storage, non-repudiation, or digital signatures.",
    sources: [
      [
        "Trace test record",
        `https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/verification/trace-integrity-gap-baseline-0016.json`,
      ],
      [
        "Selected trace",
        `https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/evaluations/runs/baseline-0020-attempt-003.traces.jsonl`,
      ],
    ],
  },
  {
    id: "RS.F02",
    marker: "Trip 02",
    title: "Headline coverage hid an untested action",
    failed:
      "The prior release reported all three action types covered, yet the held-out test set never exercised deployment rollback. Coverage fell from 3/3 at the headline level to 5/6 when action and split were checked together.",
    changed:
      "Add one held-out bad-deployment case and make any missing action-and-test-split combination fail the gate, without changing prior scenarios.",
    claimable:
      "The next release covers all 6 action-and-split pairs. Its 31 cases each passed three trials, including three exact deployment-rollback trials.",
    boundary:
      "Production reliability. Thirty-one scenarios remain below the separate 48-case target.",
    sources: [
      [
        "Coverage test record",
        `https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/verification/action-split-gap-baseline-0020.json`,
      ],
      [
        "Selected evaluation",
        `https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/evaluations/latest.json`,
      ],
    ],
  },
  {
    id: "RS.F03",
    marker: "Trip 03",
    title: "The local model failed the contract",
    failed:
      "The tested 3B local language model produced only 9 valid outputs from 84 attempts. The other 75 referenced invalid diagnoses, arguments, or evidence, and the model was 213.394× slower than the deterministic control.",
    changed:
      "Exclude the model candidate; keep the deterministic system; prevent invalid model output from becoming a proposal or execution authority.",
    claimable:
      "The selection process rejected a candidate that was both less valid and far slower; the deterministic parser and policy gate rejected its invalid outputs.",
    boundary:
      "That the model was useful or safe, or that zero executed attacks proves universal attack resistance.",
    sources: [
      [
        "Model comparison",
        `https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/evaluations/baseline-0018-model-comparison.json`,
      ],
    ],
  },
] as const;

const evidenceDrawers = [
  {
    marker: "E.01 · Frozen evaluation",
    title: "Every expected path remained exact",
    metric: "93 / 93",
    body: (
      <>
        <p>
          The release evaluates 31 frozen synthetic scenarios across three trials. All 36
          expected-action attempts followed the exact bounded trajectory; all 57 expected
          no-action attempts left synthetic state unchanged.
        </p>
        <p className={styles.drawerBoundary}>
          This measures the frozen catalog and deterministic control baseline. It does not
          estimate performance on live incidents.
        </p>
      </>
    ),
  },
  {
    marker: "E.02 · State and trace",
    title: "The outcome was checked beyond the response",
    metric: "1.0 / 165",
    body: (
      <>
        <p>
          Tool-trajectory exactness and terminal-state exactness were both 1.0. The companion
          evaluation trace contains 165 contiguous chained events with an exact final anchor.
        </p>
        <p className={styles.drawerBoundary}>
          The hash chain proves content continuity for this artifact. It is unkeyed and does not
          authenticate the writer or provide immutable storage.
        </p>
      </>
    ),
  },
  {
    marker: "E.03 · Candidate excluded",
    title: "The local model failed the contract",
    metric: "9 / 84 valid",
    body: (
      <>
        <p>
          The llama3.2:3b comparison produced 75 schema-invalid outputs. It generated zero
          accepted action proposals, executed zero actions, and ran at 213.394× the control’s
          median latency. The deterministic control remained selected.
        </p>
        <p className={styles.drawerBoundary}>
          Rejection by a fail-closed parser is not evidence that the model was useful or safe.
          Local hardware and energy cost were not estimated.
        </p>
      </>
    ),
  },
  {
    marker: "E.04 · Operator boundary",
    title: "Approval sits outside the agent",
    metric: "0 real systems",
    body: (
      <>
        <p>
          Approval creation requires a separate per-launch capability at a loopback operator
          surface. The agent, model, and MCP surface never receive that capability or final
          execution authority.
        </p>
        <p className={styles.drawerBoundary}>
          This is project-specific external-operator authentication. It is not proof of human
          presence, OAuth identity, enterprise access control, or production readiness.
        </p>
      </>
    ),
  },
];

export default function RunbookSentinelCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Software systems · Case study 02 · v0.0.20</p>
              <h1>
                The model is not <em>the control plane.</em>
              </h1>
              <p className={styles.dek}>
                Runbook Sentinel is a synthetic SRE incident-agent system designed for the
                uncomfortable part: incomplete, adversarial, conflicting, or stale evidence.
                The agent may reason. Deterministic controls retain authority.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#control-paths">
                  Trace the authority boundary
                </a>
                <a
                  className={styles.secondaryAction}
                  href={`https://github.com/drwbkr1/runbook-sentinel/tree/${sourceCommit}`}
                >
                  Inspect exact source <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <aside className={styles.heroRelay} aria-label="Runbook Sentinel authority summary">
              <div className={styles.relayHeader}>
                <span>Authority isolator</span>
                <strong>OPEN</strong>
              </div>
              <div className={styles.relayDiagram} aria-hidden="true">
                <div>
                  <span>01</span>
                  <strong>Model</strong>
                  <small>signal</small>
                </div>
                <i />
                <div className={styles.openContact}>
                  <span>02</span>
                  <strong>Proposal</strong>
                  <small>no authority</small>
                </div>
                <i />
                <div>
                  <span>03</span>
                  <strong>Gate</strong>
                  <small>control</small>
                </div>
              </div>
              <dl className={styles.heroLedger}>
                <div>
                  <dt>Evaluation</dt>
                  <dd>93 frozen attempts</dd>
                </div>
                <div>
                  <dt>Terminal state</dt>
                  <dd>Exact · 1.0</dd>
                </div>
                <div>
                  <dt>Real systems</dt>
                  <dd>Disconnected · 0</dd>
                </div>
              </dl>
              <p>
                Research-informed public preview. Synthetic state only. No operational
                infrastructure adapter exists.
              </p>
            </aside>
          </header>

          <nav
            className={`${styles.chapterIndex} ${styles.chapterIndexDesktop}`}
            data-case-chapter-index="runbook-sentinel"
            aria-label="Runbook Sentinel case study chapters"
          >
            <ChapterList />
          </nav>

          <CaseChapterDisclosure
            ariaLabel="Runbook Sentinel mobile case study chapters"
            chapters={chapters}
            className={styles.chapterDisclosure}
            projectId="runbook-sentinel"
          />

          <section className={styles.premiseSection} id="premise" aria-labelledby="premise-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Premise · 01</p>
              <h2 id="premise-heading">Useful restraint is a system feature.</h2>
              <p>
                A correct request for evidence or abstention counts as success when action would
                be underdetermined. The design is judged by bounded disposition and exact state,
                not by how decisive the prose sounds.
              </p>
            </div>
            <EvidenceSpine
              claim="A retrieval-grounded incident agent can remain useful without owning approval or execution."
              evidence="Across 31 frozen scenarios × 3 trials, all expected trajectories and terminal states were exact; a weaker local-model candidate was retained as a visible rejection."
              boundary="The environment, actions, approvals, and incidents are synthetic. Zero real systems are connected, and no production-readiness claim is made."
            />
          </section>

          <section
            className={styles.controlSection}
            id="control-paths"
            aria-labelledby="control-heading"
          >
            <div className={styles.controlIntro}>
              <p className={styles.sectionIndex}>Control paths · 02</p>
              <h2 id="control-heading">Reasoning and authority travel on different rails.</h2>
              <p>
                Retrieved prose never controls program flow. The agent produces one bounded
                outcome; any proposal then encounters capability, approval, policy, replay,
                idempotency, precondition, and postcondition checks outside the model.
              </p>
            </div>
            <ControlPlane />
          </section>

          <section
            className={styles.evaluationSection}
            id="evaluation"
            aria-labelledby="evaluation-heading"
          >
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Evaluation switchboard · 03</p>
              <h2 id="evaluation-heading">A response was never the final unit of truth.</h2>
              <p>
                The harness grades the complete path: evidence, disposition, proposal, approval,
                idempotency, execution when expected, audit sequence, trace sequence, and final
                synthetic state.
              </p>
            </div>

            <div className={styles.attemptEquation} aria-label="93 attempts equal 31 scenarios across 3 trials">
              <div className={styles.totalAttempts}>
                <span>Frozen attempts</span>
                <strong>93</strong>
              </div>
              <span className={styles.equals} aria-hidden="true">=</span>
              <div>
                <span>Scenarios</span>
                <strong>31</strong>
              </div>
              <span className={styles.multiply} aria-hidden="true">×</span>
              <div>
                <span>Trials each</span>
                <strong>3</strong>
              </div>
            </div>

            <div className={styles.routeSplit}>
              <article>
                <span>ACTION PATH · A</span>
                <strong>36</strong>
                <h3>Expected-action attempts</h3>
                <p>
                  Every required synthetic action followed the exact bounded trajectory and
                  reached the exact terminal state.
                </p>
              </article>
              <article>
                <span>NO-ACTION PATH · N</span>
                <strong>57</strong>
                <h3>Unchanged attempts</h3>
                <p>
                  Diagnose, request-evidence, and abstain outcomes produced no unexpected state
                  mutation.
                </p>
              </article>
            </div>

            <dl className={styles.exactnessRail}>
              <div>
                <dt>Tool trajectory exactness</dt>
                <dd>1.0</dd>
              </div>
              <div>
                <dt>Terminal-state exactness</dt>
                <dd>1.0</dd>
              </div>
              <div>
                <dt>Chained trace events</dt>
                <dd>165</dd>
              </div>
            </dl>
          </section>

          <section className={styles.surfaceSection} aria-labelledby="surface-heading">
            <div className={styles.surfaceCopy}>
              <p className={styles.sectionIndex}>Rendered checkpoint · 03A</p>
              <h2 id="surface-heading">The boundary appears on the product surface.</h2>
              <p>
                The dashboard exposes the verified checkpoint, exact coverage, operator boundary,
                and disconnected-infrastructure state. It is evidence of a rendered local surface,
                not a live operations console.
              </p>
              <a href="/media/projects/runbook-sentinel/dashboard-baseline-0020.png">
                Open full-resolution checkpoint
              </a>
            </div>
            <figure className={styles.dashboardFigure}>
              <div className={styles.dashboardFrame}>
                <span>LOCAL SURFACE · BASELINE 0020</span>
                <Image
                  src="/media/projects/runbook-sentinel/dashboard-baseline-0020.png"
                  alt="Runbook Sentinel baseline 0020 dashboard showing evaluation pass, exact coverage metrics, an authenticated external-operator boundary, and disconnected real infrastructure."
                  width={1440}
                  height={1000}
                  sizes="(max-width: 900px) 94vw, 58vw"
                />
              </div>
              <figcaption>
                Source-owned dashboard capture from the exact v0.0.20 project snapshot.
              </figcaption>
            </figure>
          </section>

          <section
            className={styles.modelSection}
            id="model-decision"
            aria-labelledby="model-heading"
          >
            <div className={styles.modelLead}>
              <p className={styles.sectionIndex}>Model decision · 04</p>
              <h2 id="model-heading">A local model was measured—and excluded.</h2>
              <p>
                Adding a model was not treated as progress by default. The candidate faced the
                same frozen contract and lost on validity, usefulness, exactness, and latency.
              </p>
            </div>

            <div className={styles.outputMatrixBlock}>
              <div className={styles.matrixIntro}>
                <p className={styles.matrixLabel}>84 frozen outputs / exact parser</p>
                <h3>Only nine crossed the parser.</h3>
                <p>
                  Every rejected output stayed outside proposal and execution authority. The
                  pattern records why the candidate failed; it is not a decorative score wall.
                </p>
                <a
                  className={styles.matrixSource}
                  href={`https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/evaluations/baseline-0018-model-comparison.json`}
                >
                  Inspect the frozen comparison <span aria-hidden="true">↗</span>
                </a>
              </div>

              <div>
                <div
                  className={styles.outputMatrix}
                  role="img"
                  aria-label="Eighty-four local-model outputs: 9 valid, 67 rejected for invalid diagnosis identifiers, 7 rejected for invalid proposal arguments, and 1 rejected for an out-of-context evidence identifier."
                >
                  {modelOutputCells.map((kind, index) => (
                    <span data-kind={kind} aria-hidden="true" key={`${kind}-${index}`} />
                  ))}
                </div>
                <dl className={styles.matrixLegend}>
                  <div data-kind="valid">
                    <dt>Valid</dt>
                    <dd>9</dd>
                  </div>
                  <div data-kind="diagnosis">
                    <dt>Diagnosis ID invalid</dt>
                    <dd>67</dd>
                  </div>
                  <div data-kind="arguments">
                    <dt>Arguments invalid</dt>
                    <dd>7</dd>
                  </div>
                  <div data-kind="context">
                    <dt>Evidence out of context</dt>
                    <dd>1</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div
              className={styles.comparisonScroller}
              role="region"
              aria-label="Deterministic control and local-model candidate comparison; scroll horizontally on narrow screens"
              tabIndex={0}
            >
              <table className={styles.comparisonTable}>
                <caption>Frozen local comparison retained in the v0.0.20 evidence record</caption>
                <thead>
                  <tr>
                    <th scope="col">Decision dimension</th>
                    <th scope="col">Deterministic control</th>
                    <th scope="col">llama3.2:3b candidate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Disposition</th>
                    <td data-state="selected">Selected</td>
                    <td data-state="excluded">Excluded</td>
                  </tr>
                  <tr>
                    <th scope="row">Exact parser</th>
                    <td>Contract-shaped by construction</td>
                    <td>9 of 84 outputs valid; 75 schema-invalid</td>
                  </tr>
                  <tr>
                    <th scope="row">Accepted / executed proposals</th>
                    <td>Expected bounded trajectories complete</td>
                    <td>0 / 0</td>
                  </tr>
                  <tr>
                    <th scope="row">Median latency</th>
                    <td>Reference · 1×</td>
                    <td>213.394× control</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.modelBoundary}>
              Fail-closed enforcement prevented invalid candidate output from becoming authority.
              That is a control result—not evidence of useful model safety.
            </p>
          </section>

          <section className={styles.evidenceSection} id="evidence" aria-labelledby="evidence-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Evidence cabinet · 05</p>
              <h2 id="evidence-heading">Open the claim. Keep its limit attached.</h2>
              <p>
                Each native disclosure contains the result and the reason it should not travel
                farther. The full record remains readable without client-side scripting.
              </p>
            </div>

            <div className={styles.evidenceCabinet}>
              {evidenceDrawers.map((drawer, index) => (
                <details
                  className={styles.evidenceDrawer}
                  name="runbook-evidence"
                  open={index === 0}
                  key={drawer.marker}
                >
                  <summary>
                    <span>{drawer.marker}</span>
                    <strong>{drawer.title}</strong>
                    <em>{drawer.metric}</em>
                  </summary>
                  <div className={styles.drawerBody}>{drawer.body}</div>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.tripSection} aria-labelledby="trip-heading">
            <div className={styles.tripLead}>
              <p className={styles.sectionIndex}>Failure dividend · 05A</p>
              <h2 id="trip-heading">A trip is useful only when the circuit changes.</h2>
              <p>
                These failures altered the evaluator, the integrity boundary, or the selected
                configuration. They are not retrospective badges.
              </p>
            </div>

            <ol className={styles.tripLedger} data-failure-dividend="runbook-sentinel">
              {tripRecords.map((record) => (
                <li className={styles.tripRecord} data-failure-dividend-record key={record.id}>
                  <header>
                    <div>
                      <span>{record.marker}</span>
                      <strong>{record.title}</strong>
                    </div>
                    <nav aria-label={`${record.title} evidence`}>
                      {record.sources.map(([label, href]) => (
                        <a href={href} key={label}>
                          {label} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </nav>
                  </header>
                  <div className={styles.tripRail}>
                    <div data-stage="failed">
                      <span>01 · What failed</span>
                      <p>{record.failed}</p>
                    </div>
                    <div data-stage="changed">
                      <span>02 · What changed</span>
                      <p>{record.changed}</p>
                    </div>
                    <div data-stage="claimable">
                      <span>03 · What became claimable</span>
                      <p>{record.claimable}</p>
                    </div>
                  </div>
                  <p className={styles.tripBoundary} data-boundary>
                    <strong>Boundary stop</strong>
                    {record.boundary}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.boundarySection} aria-labelledby="boundary-heading">
            <div>
              <p className={styles.sectionIndex}>Boundary register · 05A</p>
              <h2 id="boundary-heading">What this project refuses to imply.</h2>
            </div>
            <ul>
              <li>It is not production incident automation or an autonomous remediation service.</li>
              <li>It has no connectors, credentials, arbitrary shell, or real-infrastructure adapter.</li>
              <li>
                Its external-operator capability is not human-presence, OAuth, or enterprise-identity
                proof.
              </li>
              <li>
                An unkeyed trace chain shows continuity, not writer authentication or immutable
                storage.
              </li>
              <li>Thirty-one scenarios do not meet the separate 48-case v0.1.0 target.</li>
            </ul>
          </section>

          <section className={styles.sourceSection} id="sources" aria-labelledby="sources-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Source ledger · 06</p>
              <h2 id="sources-heading">Inspect the frozen record.</h2>
            </div>

            <div className={styles.sourceLedger}>
              <a href={`https://github.com/drwbkr1/runbook-sentinel/tree/${sourceCommit}`}>
                <span>S.01 · Public source</span>
                <strong>Exact repository snapshot</strong>
                <code>f149ac24…</code>
              </a>
              <a href="https://github.com/drwbkr1/runbook-sentinel/releases/tag/v0.0.20">
                <span>S.02 · Release</span>
                <strong>Verified public checkpoint</strong>
                <code>v0.0.20</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/docs/evaluation-report.md`}
              >
                <span>S.03 · Evaluation</span>
                <strong>Full result and retained failures</strong>
                <code>baseline-0020</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/runbook-sentinel/blob/${sourceCommit}/artifacts/verification/dashboard-baseline-0020.png`}
              >
                <span>S.04 · Rendered evidence</span>
                <strong>Source-owned dashboard capture</strong>
                <code>baseline-0020.png</code>
              </a>
            </div>

            <p className={styles.rightsNote}>
              The dashboard image is source-owned and reused here at the owner’s direction. The
              public source repository currently carries no top-level license; public visibility
              is not presented as a general reuse grant.
            </p>
          </section>
        </article>
      </main>

      <nav className={styles.caseNavigation} aria-label="Adjacent portfolio case studies">
        <Link href="/work/burnlens">
          <span>Previous case</span>
          BurnLens — baseline-first wildfire evidence
        </Link>
        <Link href="/work">
          <span>All work</span>
          Return to the project index
        </Link>
      </nav>
    </div>
  );
}
