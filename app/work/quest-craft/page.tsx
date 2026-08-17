import type { Metadata } from "next";
import Link from "next/link";

import {
  getProject,
  getPublicSourceHref,
  getSupportedEvidence,
} from "../../../content/project-model";
import styles from "./page.module.css";

const project = getProject("quest-craft");

const problem = getSupportedEvidence("quest-craft", "problem")!;
const intendedUser = getSupportedEvidence("quest-craft", "intendedUser")!;
const decisionSupported = getSupportedEvidence("quest-craft", "decisionSupported")!;
const personalRole = getSupportedEvidence("quest-craft", "personalRole")!;
const implementation = getSupportedEvidence("quest-craft", "implementation")!;
const testStrategy = getSupportedEvidence("quest-craft", "testStrategy")!;
const outcome = getSupportedEvidence("quest-craft", "outcome")!;
const limitations = getSupportedEvidence("quest-craft", "limitations")!;
const maturity = getSupportedEvidence("quest-craft", "maturity")!;
const corrections = project.evidence.failureDividend.value;

const snapshotHref = getPublicSourceHref("quest.snapshot");
const resultsHref = getPublicSourceHref("quest.results");
const attemptsHref = getPublicSourceHref("quest.attempts");
const guardrailsHref = getPublicSourceHref("quest.guardrails");
const aiUseHref = getPublicSourceHref("quest.readme-ai-use");

export const metadata: Metadata = {
  title: "Quest Craft — The story branches. Authority does not.",
  description:
    "A documentary case study of Quest Craft: a bounded story-option prototype evaluated across 12 synthetic scenarios, with corrections and failed or superseded attempts retained.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "Quest Craft",
    "product design",
    "interaction design",
    "AI evaluation",
    "human-centered AI",
    "software engineering",
  ],
  alternates: { canonical: "/work/quest-craft" },
  openGraph: {
    title: "Quest Craft — The story branches. Authority does not.",
    description:
      "12 synthetic scenarios. 36 retained rows. Two behavior corrections. The adult Game Master keeps the final say.",
    url: "/work/quest-craft",
    siteName: "Drew Baker — Portfolio",
    type: "article",
    images: [
      {
        url: "/media/projects/quest-craft/social-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Quest Craft editorial social card: one slate-teal input branches into three paper ribbons above a separate olive authority rail, with the line The story branches. Authority does not.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quest Craft — The story branches. Authority does not.",
    description:
      "A bounded story-option prototype whose corrections and retained failures remain part of the record.",
    images: ["/media/projects/quest-craft/social-preview.jpg"],
  },
};

const firstScreenLedger = [
  ["Problem", "problem", problem.summary],
  ["Intended user", "intendedUser", intendedUser.summary],
  ["My role", "personalRole", personalRole.summary],
  ["Interaction built", "implementation", implementation.summary],
  ["Result", "outcome", outcome.summary],
  ["Limit", "limitations", limitations.summary],
] as const;

const beats = [
  ["honor", "01", "Honor the choice", "Honor", "The completed player action remains true."],
  ["effect", "02", "Show the effect", "Effect", "The immediate result becomes playable."],
  ["return", "03", "Return agency", "Return", "A meaningful decision goes back to the players."],
  ["carry", "04", "Carry consequence", "Carry", "Later pressure stays open and non-punitive."],
] as const;

const evaluationRows = [
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
] as const;

const sourceFolio = [
  ["quest.snapshot", snapshotHref, "Public reviewer snapshot", "Frozen publication boundary"],
  ["quest.results", resultsHref, "Evaluation results", "36 retained rows"],
  ["quest.attempts", attemptsHref, "Attempt register", "Failed and superseded work"],
  ["quest.guardrails", guardrailsHref, "Guardrails", "Adult authority and bounded use"],
  ["quest.readme-ai-use", aiUseHref, "AI-use note", "Authorship disclosure"],
] as const;

export default function QuestCraftCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article
          data-project-model-id={project.id}
          data-supporting-route="quest-craft"
          data-visual-world="branching-manuscript"
        >
          <section
            className={styles.openingMovement}
            data-route-movement="agency-score"
            data-supporting-movement="agency-score"
            aria-labelledby="quest-craft-title"
          >
            <header className={styles.hero}>
              <div className={styles.heroHeading}>
                <p className={styles.kicker} data-project-field="maturity">
                  Supporting field note · {maturity.summary}
                </p>
                <h1 id="quest-craft-title">
                  Quest Craft
                  <span>The story branches. Authority does not.</span>
                </h1>
              </div>
              <div className={styles.heroIntroduction}>
                <p>{problem.summary}</p>
                <p
                  className={styles.authorityStatement}
                  data-project-field="decisionSupported"
                >
                  {decisionSupported.summary}
                </p>
              </div>
            </header>

            <dl className={styles.firstScreenLedger} data-first-screen-ledger>
              {firstScreenLedger.map(([label, field, value]) => (
                <div data-project-field={field} key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.manuscriptLead}>
              <p className={styles.movementLabel}>Movement one · Agency score</p>
              <h2>A choice becomes three paths, each returning the table to the players.</h2>
              <p>
                Select one editorial beat to trace it across the manuscript. All four beats and
                all three paths remain readable without client-side JavaScript.
              </p>
            </div>

            <fieldset className={styles.agencyScore} data-agency-score>
              <legend>Trace one structural beat across all three paths</legend>
              <div className={styles.beatControls}>
                {beats.map(([beat, number, label, , note]) => (
                  <label key={beat}>
                    <input
                      defaultChecked={beat === "honor"}
                      name="quest-beat"
                      type="radio"
                      value={beat}
                    />
                    <span aria-hidden="true">{number}</span>
                    <strong>{label}</strong>
                    <small data-beat-definition={beat}>{note}</small>
                  </label>
                ))}
              </div>

              <div className={styles.branchingManuscript}>
                {["A", "B", "C"].map((path) => (
                  <div className={styles.path} key={path}>
                    <p className={styles.pathLabel}>Path {path}</p>
                    <div
                      aria-label={`Path ${path}: four-beat structural trace`}
                      className={styles.pathBeats}
                      data-path-trace={path}
                    >
                      {beats.map(([beat, number, , shortLabel]) => (
                        <div className={styles.pathBeat} data-beat={beat} key={beat}>
                          <span>{number}</span>
                          <strong>{shortLabel}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className={styles.authorityRail}>
                <span>Adult Game Master authority</span>
                <strong>Accept · revise · combine · ignore</strong>
              </p>
            </fieldset>
          </section>

          <section
            className={styles.evidenceMovement}
            data-route-movement="evaluation-corrections"
            data-supporting-movement="evaluation-corrections"
            aria-labelledby="evaluation-title"
          >
            <header className={styles.movementHeader}>
              <div>
                <p className={styles.movementLabel}>Movement two · Evaluation</p>
                <h2 id="evaluation-title">A small fixed suite, with its edits left in the margins.</h2>
              </div>
              <p data-project-field="testStrategy">{testStrategy.summary}</p>
            </header>

            <p className={styles.scrollCue} id="evaluation-scroll-cue">
              Evaluation ledger · scroll horizontally on narrow screens <span aria-hidden="true">→</span>
            </p>
            <div
              className={styles.tableScroll}
              data-table-scroll
              role="region"
              aria-label="Quest Craft evaluation ledger"
              aria-describedby="evaluation-scroll-cue"
              tabIndex={0}
            >
              <table className={styles.evaluationLedger} data-evaluation-ledger>
                <caption>Fixed synthetic release suite</caption>
                <thead>
                  <tr>
                    <th scope="col">Synthetic scenario</th>
                    <th scope="col">Run 01</th>
                    <th scope="col">Run 02</th>
                    <th scope="col">Run 03</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluationRows.map(([scenario, readerLabel]) => {
                    const isLocalRejection = scenario === "D1";
                    return (
                      <tr key={scenario}>
                        <th scope="row">{readerLabel} · scenario {scenario}</th>
                        {[1, 2, 3].map((run) => (
                          <td data-kind={isLocalRejection ? "rejected" : "generated"} key={run}>
                            {isLocalRejection
                              ? "Local reject — model not called"
                              : "Model generation"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className={styles.evaluationSummary}>
              Twelve scenarios yielded 36 retained rows: 33 model generations and three local
              rejections where the model was not called. Human review recorded 360 / 360 passing
              cells in this bounded frozen suite.
            </p>

            <div
              className={styles.correctionRegister}
              data-correction-register
              data-project-field="failureDividend"
            >
              <div className={styles.registerIntroduction}>
                <p className={styles.movementLabel}>Correction proofmarks</p>
                <h3>Observed misses changed the instructions.</h3>
                <p>
                  The frozen result is inseparable from these revisions. The proofmark indicates
                  a corrected rerun inside this suite, not a general reliability claim.
                </p>
              </div>

              <div className={styles.corrections}>
                {corrections.map((correction, index) => (
                  <article data-evidence-id={correction.id} key={correction.id}>
                    <header>
                      <span className={styles.proofmark} aria-hidden="true">✦</span>
                      <p>Correction {index === 0 ? "one" : "two"}</p>
                      <h4>{index === 0
                        ? "Keep the path inside the supplied setting."
                        : "Remove humiliation, not merely soften it."}</h4>
                    </header>
                    <dl>
                      <div>
                        <dt>Failure</dt>
                        <dd>{correction.failure}</dd>
                      </div>
                      <div>
                        <dt>Changed</dt>
                        <dd>{correction.buildChange}</dd>
                      </div>
                      <div>
                        <dt>Earned here</dt>
                        <dd>{correction.earnedCapability}</dd>
                      </div>
                      <div>
                        <dt>Boundary</dt>
                        <dd>{correction.boundary}</dd>
                      </div>
                    </dl>
                    <footer>
                      <a href={attemptsHref} data-source-id="quest.attempts">Attempt record</a>
                      <a href={resultsHref} data-source-id="quest.results">Corrective results</a>
                    </footer>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.attemptRegister}>
              <header>
                <p className={styles.movementLabel}>Retained margin notes</p>
                <h3>Six failed or superseded attempts</h3>
              </header>
              <p className={styles.attemptSummary}>
                <a href={attemptsHref} data-source-id="quest.attempts">
                  The retained register contains one grounding miss, two youth-suitability misses
                  involving softened humiliation, one invalid service or fallback rerun, and two
                  passes excluded for a superseded prompt.
                </a>
              </p>
            </div>
          </section>

          <section
            className={styles.boundaryMovement}
            data-route-movement="evidence-limits-sources"
            data-supporting-movement="evidence-limits-sources"
            aria-labelledby="boundary-title"
          >
            <header className={styles.movementHeader}>
              <div>
                <p className={styles.movementLabel}>Movement three · Reviewer boundary</p>
                <h2 id="boundary-title">A frozen folio, not a claim about the live world.</h2>
              </div>
              <p>{limitations.summary}</p>
            </header>

            <div className={styles.boundarySpread}>
              <div className={styles.boundaryNotes}>
                <p>{outcome.summary}</p>
                <ul>
                  <li>This reviewed prototype is not production-ready and is not proof of production maturity.</li>
                  <li>The fixed synthetic suite is not independent replication or a general safety result.</li>
                  <li>The private canonical implementation was not inspected; no stack or current runtime is inferred.</li>
                  <li>No source-bound current project next step is public.</li>
                  <li>The adult Game Master retains final authority; this does not establish general child safety.</li>
                  <li>The frozen reviewer snapshot is not equivalent to a live demo.</li>
                  <li>Implementation was AI-assisted; this page does not claim manual authorship of every line.</li>
                </ul>
                <p className={styles.mediaRecord}>
                  <a href="https://choice-weaver-aid.lovable.app/">Mutable Lovable prototype</a>
                  Its generation behavior was not re-tested. This mutable surface is not
                  presented as matching the frozen reviewer snapshot.
                </p>
                <p
                  className={styles.mediaRecord}
                  data-media-rights="portfolio-native-social-only"
                >
                  <a
                    href="/media/projects/quest-craft/sources.json"
                    data-media-record="quest-craft-social-preview"
                  >
                    Public media record
                  </a>
                  Approval covers this portfolio-native social image only; the reviewer mirror has
                  no detected license and provides no general reuse grant. The image remains
                  metadata-only on this route.
                </p>
              </div>

              <section className={styles.sourceRegister} data-source-register>
                <header className={styles.sourceFolioHeader} data-source-folio-heading>
                  <p className={styles.movementLabel}>Exact source folio</p>
                  <h3 id="quest-source-folio-title">Five public records, each bound to its claim.</h3>
                </header>
                <nav
                  className={styles.sourceFolio}
                  data-source-folio
                  aria-labelledby="quest-source-folio-title"
                >
                  {sourceFolio.map(([sourceId, href, label, note], index) => (
                    <a href={href} data-source-id={sourceId} key={sourceId}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{label}</strong>
                      <p>{note}</p>
                    </a>
                  ))}
                </nav>
              </section>
            </div>

            <footer className={styles.returnLink}>
              <Link href="/work">
                <span aria-hidden="true">←</span>
                Return to all work
              </Link>
            </footer>
          </section>
        </article>
      </main>
    </div>
  );
}
