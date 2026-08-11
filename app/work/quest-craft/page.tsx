import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

const sourceCommit = "bc14c43840aabb11ca35e94df0c8682672f24f3c";
const sourceRoot =
  `https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/tree/${sourceCommit}`;

export const metadata: Metadata = {
  title: "Quest Craft — The story branches. Authority does not.",
  description:
    "A documentary case study of Quest Craft: a bounded story-option prototype evaluated across 12 synthetic scenarios, with corrections and failed attempts retained.",
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
        alt: "Quest Craft — the story branches; authority does not",
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

const chapters = [
  ["01", "Agency score", "#agency-score"],
  ["02", "Evaluation", "#evaluation"],
  ["03", "Errata", "#errata"],
  ["04", "Limits", "#limits"],
  ["05", "Sources", "#sources"],
] as const;

const beats = [
  ["honor", "01", "Honor choice", "The completed player action remains true."],
  ["effect", "02", "Show effect", "Each path makes the immediate result playable."],
  ["return", "03", "Return agency", "A meaningful decision goes back to the players."],
  ["carry", "04", "Carry consequence", "Later pressure stays open and non-punitive."],
] as const;

const evaluationGroups = [
  {
    marker: "A",
    title: "Expected gameplay",
    rows: ["A1", "A2", "A3"],
  },
  {
    marker: "B",
    title: "Agency stress",
    rows: ["B1", "B2", "B3"],
  },
  {
    marker: "C",
    title: "Youth suitability",
    rows: ["C1", "C2", "C3"],
  },
  {
    marker: "D",
    title: "Privacy + facilitator authority",
    rows: ["D1", "D2", "D3"],
  },
] as const;

const retainedAttempts = [
  ["1", "Grounding miss", "Unrelated setting facts appeared; the prompt was narrowed."],
  ["2", "Superseded passes", "Passing rows from the replaced prompt stayed excluded."],
  ["2", "Youth-suitability misses", "Softened mockery still centered a young rival’s embarrassment."],
  ["1", "Service fallback", "No structured output appeared; the attempt was retained and rerun."],
] as const;

export default function QuestCraftCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Interaction design · Supporting case study</p>
              <h1>
                The story branches. <em>Authority does not.</em>
              </h1>
              <p className={styles.dek}>
                Quest Craft helps an adult Game Master turn one unexpected tabletop decision
                into several playable paths for players ages 9–12. The model supplies bounded
                wording. Software validates the exchange. The table keeps the final say.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#agency-score">
                  Read the agency score
                </a>
                <a className={styles.secondaryAction} href={sourceRoot}>
                  Public reviewer snapshot <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className={styles.roleNote}>
                Drew directed product and system design, AI-assisted implementation,
                evaluation, correction, and final release approval.
              </p>
            </div>

            <aside className={styles.heroScore} aria-label="Quest Craft branching outcome score">
              <div className={styles.scoreHeading}>
                <span>Agency score · reading order</span>
                <strong>One request / three paths</strong>
              </div>
              <div className={styles.unexpectedBand}>
                <span>Unexpected choice</span>
                <strong>The players’ action already happened.</strong>
              </div>
              <div className={styles.heroRibbons}>
                <div>
                  <span>A</span>
                  <strong>Honor → effect → decision → consequence</strong>
                </div>
                <div>
                  <span>B</span>
                  <strong>Honor → effect → decision → consequence</strong>
                </div>
                <div>
                  <span>C</span>
                  <strong>Honor → effect → decision → consequence</strong>
                </div>
              </div>
              <div className={styles.authorityRail}>
                <span>Adult GM authority</span>
                <strong>Accept · revise · combine · ignore</strong>
              </div>
              <p>
                One constrained model request per valid generation. No tools, retries, repair
                calls, or final authority in the model step.
              </p>
            </aside>
          </header>

          <nav className={styles.chapterIndex} aria-label="Quest Craft case study chapters">
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
          </nav>

          <section className={styles.agencySection} id="agency-score" aria-labelledby="agency-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Agency score · 01</p>
              <h2 id="agency-heading">One structure, repeated across every option.</h2>
              <p>
                Select a beat to trace it across all three outcome ribbons. The interaction is
                native HTML: the structure remains readable and operable without client-side
                JavaScript.
              </p>
            </div>

            <fieldset className={styles.interactiveScore}>
              <legend>Highlight one structural beat across all three outcomes</legend>
              <div className={styles.beatSelectors}>
                {beats.map(([beat, number, label]) => (
                  <label key={beat}>
                    <input
                      defaultChecked={beat === "honor"}
                      name="quest-beat"
                      type="radio"
                      value={beat}
                    />
                    <span>{number}</span>
                    {label}
                  </label>
                ))}
              </div>

              <div
                className={styles.scoreRibbons}
                role="region"
                aria-label="Three outcome ribbons; scroll horizontally on narrow screens"
                tabIndex={0}
              >
                {["A", "B", "C"].map((ribbon) => (
                  <div className={styles.scoreRibbon} key={ribbon}>
                    <span className={styles.ribbonLabel}>Outcome {ribbon}</span>
                    {beats.map(([beat, number, label, note]) => (
                      <span className={styles.ribbonBeat} data-beat={beat} key={beat}>
                        <small>{number}</small>
                        <strong>{label}</strong>
                        <em>{note}</em>
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.scoreAuthority}>
                <span>Application-owned reminder</span>
                <strong>You may accept, revise, combine, or ignore these suggestions.</strong>
              </div>
            </fieldset>
          </section>

          <section className={styles.evaluationSection} id="evaluation" aria-labelledby="evaluation-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Evaluation ledger · 02</p>
              <h2 id="evaluation-heading">Twelve situations, three retained rows each.</h2>
              <p>
                The fixed synthetic suite covers expected play, agency stress, youth suitability,
                privacy, and facilitator authority. It is a human-reviewed release record—not an
                independent study, adaptive attack set, or general safety proof.
              </p>
            </div>

            <div className={styles.evaluationTables}>
              {evaluationGroups.map((group) => (
                <table key={group.marker}>
                  <caption>
                    <span>{group.marker}</span>
                    {group.title}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Scenario</th>
                      <th scope="col">Run 01</th>
                      <th scope="col">Run 02</th>
                      <th scope="col">Run 03</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((scenario) => {
                      const isLocalRejection = scenario === "D1";
                      return (
                        <tr key={scenario}>
                          <th scope="row">{scenario}</th>
                          {[1, 2, 3].map((run) => (
                            <td data-kind={isLocalRejection ? "rejected" : "generated"} key={run}>
                              {isLocalRejection ? "local reject" : "model"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>

            <dl className={styles.scoreSummary}>
              <div>
                <dt>Retained rows</dt>
                <dd>36</dd>
              </div>
              <div>
                <dt>Model generations</dt>
                <dd>33</dd>
              </div>
              <div data-kind="rejected">
                <dt>Local privacy rejections</dt>
                <dd>
                  3
                  <small>model not called</small>
                </dd>
              </div>
              <div>
                <dt>Human-scored cells</dt>
                <dd>
                  360 / 360
                  <small>passing in the frozen suite</small>
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.errataSection} id="errata" aria-labelledby="errata-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Editorial errata · 03</p>
              <h2 id="errata-heading">Two observed misses rewrote the instructions.</h2>
              <p>
                The final score is inseparable from its corrections. Each erratum links an
                observed behavior to the smallest bounded revision and its corrective rerun.
              </p>
            </div>

            <div className={styles.errataSlips}>
              <article>
                <header>
                  <span>Erratum 01</span>
                  <strong>Setting grounding</strong>
                </header>
                <dl>
                  <div>
                    <dt>Observed</dt>
                    <dd>Unrelated lore appeared in a generic village scenario.</dd>
                  </div>
                  <div>
                    <dt>Revision</dt>
                    <dd>Limit setting facts to the current situation.</dd>
                  </div>
                  <div>
                    <dt>Corrective record</dt>
                    <dd>Three reruns stayed within the supplied context.</dd>
                  </div>
                </dl>
              </article>
              <article>
                <header>
                  <span>Erratum 02</span>
                  <strong>Youth tone</strong>
                </header>
                <dl>
                  <div>
                    <dt>Observed</dt>
                    <dd>Mockery was softened but still targeted a young rival.</dd>
                  </div>
                  <div>
                    <dt>Revision</dt>
                    <dd>Require respectful, non-targeted alternatives.</dd>
                  </div>
                  <div>
                    <dt>Corrective record</dt>
                    <dd>Three reruns removed humiliating wording.</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div className={styles.failureRegister} aria-labelledby="retained-heading">
              <div>
                <span>Retained evidence</span>
                <h3 id="retained-heading">Six failed or superseded attempts</h3>
              </div>
              <dl>
                {retainedAttempts.map(([count, title, note]) => (
                  <div key={title}>
                    <dt>
                      <strong>{count}</strong>
                      {title}
                    </dt>
                    <dd>{note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className={styles.boundarySection} id="limits" aria-labelledby="limits-heading">
            <div>
              <p className={styles.sectionIndex}>Boundary register · 04</p>
              <h2 id="limits-heading">What the evidence does not earn.</h2>
            </div>
            <ul>
              <li>It is not proof of production maturity or general child safety.</li>
              <li>It does not establish universal prompt-injection resistance or security.</li>
              <li>The fixed suite is not a comparative baseline or independent replication.</li>
              <li>The private canonical implementation was not inspected or exposed here.</li>
              <li>The live prototype was observed, but metered generation was not invoked or re-tested.</li>
              <li>“No intentional application persistence” is not “no external processing or cookies.”</li>
            </ul>
          </section>

          <section className={styles.sourceSection} id="sources" aria-labelledby="sources-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Source ledger · 05</p>
              <h2 id="sources-heading">Evidence and prototype are separate surfaces.</h2>
              <p>
                The exact public snapshot carries the review record. The live prototype is
                separately mutable and is not presented as cryptographically bound to it.
              </p>
            </div>

            <div className={styles.sourceLedger}>
              <a href={sourceRoot}>
                <span>S.01 · Frozen evidence</span>
                <strong>Public reviewer snapshot</strong>
                <code>bc14c438…</code>
              </a>
              <a href="https://choice-weaver-aid.lovable.app/">
                <span>S.02 · Mutable surface</span>
                <strong>Live prototype</strong>
                <code>generation not re-tested</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/${sourceCommit}/evals/results.csv`}
              >
                <span>S.03 · Release suite</span>
                <strong>36 retained rows</strong>
                <code>results.csv</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/${sourceCommit}/evals/attempts.csv`}
              >
                <span>S.04 · Iteration</span>
                <strong>Failed + superseded attempts</strong>
                <code>attempts.csv</code>
              </a>
            </div>
            <p className={styles.rightsNote}>
              This page uses original typography and code-native diagrams. It copies no source
              code, hosted artwork, platform marks, or third-party assets. The reviewer mirror
              has no detected license, so public visibility is not a general reuse grant.
            </p>
          </section>
        </article>
      </main>

      <nav className={styles.caseNavigation} aria-label="Portfolio case study navigation">
        <Link href="/work">
          <span>All work</span>
          Return to the project index
        </Link>
        <Link href="/work/runbook-sentinel">
          <span>Flagship case</span>
          Runbook Sentinel — authority outside the model
        </Link>
      </nav>
    </div>
  );
}
