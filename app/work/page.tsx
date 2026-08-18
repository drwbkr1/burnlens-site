import type { Metadata } from "next";
import Link from "next/link";

import {
  getProject,
  getSupportedEvidence,
  toReaderFirst,
  type ProjectEvidence,
  type ProjectId,
} from "@/content/project-model";
import { historicalCoursework } from "@/content/projects";

import styles from "./work-index.module.css";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Two evidence-bound software flagships, two supporting field notes, and a dated historical reading shelf from Drew Baker.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected work | Drew Baker",
    description:
      "Two software flagships with inspectable decisions, supporting field notes, and a bounded historical shelf.",
    url: "/work",
    siteName: "Drew Baker Portfolio",
  },
};

const flagships = [getProject("burnlens"), getProject("runbook-sentinel")] as const;
const supportingNotes = [getProject("quest-craft"), getProject("openclaw-showcase")] as const;

type EvidenceKey = keyof ProjectEvidence<ProjectId>;

function supported(projectId: ProjectId, field: EvidenceKey) {
  const evidence = getSupportedEvidence(projectId, field);
  if (!evidence) {
    throw new Error(`Work-index projection requires supported ${projectId}.${field}.`);
  }
  return evidence;
}

function summary(projectId: ProjectId, field: EvidenceKey) {
  return toReaderFirst(supported(projectId, field).summary);
}

function runbookStackItems() {
  const evidence = getProject("runbook-sentinel").evidence.stack;
  if (evidence.state !== "supported") {
    throw new Error("Work-index projection requires supported runbook-sentinel.stack.");
  }
  return evidence.value;
}

function FlagshipEntry({
  project,
  ordinal,
}: {
  project: (typeof flagships)[number];
  ordinal: "01" | "02";
}) {
  return (
    <article
      className={`shell ${styles.flagshipEntry}`}
      data-work-entry
      data-project-model-id={project.id}
      data-visual-world={project.visualWorld}
    >
      <div className={styles.flagshipTitle}>
        <span data-work-ordinal>{ordinal}</span>
        <p data-field-key="maturity">{summary(project.id, "maturity")}</p>
        <h3>{project.title}</h3>
        <Link href={project.route} aria-label={`Read ${project.title} case study`}>
          Read {project.title} case study <span aria-hidden="true">→</span>
        </Link>

        {project.id === "burnlens" ? (
          <div
            className={styles.atlasMark}
            data-atlas-grid
            role="group"
            aria-label="BurnLens release-to-snapshot evidence path"
          >
            <div data-atlas-transect>
              <span>Release</span>
              <i aria-hidden="true" />
              <span>Verify</span>
              <i aria-hidden="true" />
              <span>Snapshot</span>
            </div>
          </div>
        ) : (
          <div
            className={styles.controlMark}
            role="group"
            aria-label="Separate reasoning and authority rails"
          >
            <ol data-control-rail aria-label="Reasoning rail">
              <li>Read</li>
              <li>Reason</li>
              <li>Propose</li>
            </ol>
            <span data-authority-break>Authority break</span>
            <ol data-control-rail aria-label="Authority rail">
              <li>Approve</li>
              <li>Check</li>
              <li>Execute</li>
            </ol>
          </div>
        )}
      </div>

      <dl className={styles.workFacts} data-work-facts>
        <div data-field-key="problem">
          <dt>Problem</dt>
          <dd>{summary(project.id, "problem")}</dd>
        </div>
        <div data-field-key="intendedUser">
          <dt>Intended reviewer</dt>
          <dd>{summary(project.id, "intendedUser")}</dd>
        </div>
        <div data-field-key="personalRole">
          <dt>My role</dt>
          <dd>{summary(project.id, "personalRole")}</dd>
        </div>
        <div data-field-key="decisionSupported">
          <dt>Decision</dt>
          <dd>{summary(project.id, "decisionSupported")}</dd>
        </div>
        {project.id === "runbook-sentinel" ? (
          <div data-field-key="stack">
            <dt>Methods</dt>
            <dd>
              <ul data-method-list>
                {runbookStackItems().map((item) => (
                  <li key={item.name}>
                    <strong>{toReaderFirst(item.name)}</strong>
                    <span>{toReaderFirst(item.purpose)}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div data-field-key="outcome">
          <dt>Result</dt>
          <dd>{summary(project.id, "outcome")}</dd>
        </div>
        <div data-field-key="limitations">
          <dt>Boundary</dt>
          <dd>{summary(project.id, "limitations")}</dd>
        </div>
      </dl>
    </article>
  );
}

function SupportingEntry({ project }: { project: (typeof supportingNotes)[number] }) {
  const isQuest = project.id === "quest-craft";

  return (
    <article className={styles.noteEntry} data-work-entry data-project-model-id={project.id}>
      <div>
        <p data-field-key="maturity">{summary(project.id, "maturity")}</p>
        <h3>{project.title}</h3>
      </div>
      <dl>
        <div data-field-key="problem">
          <dt>Problem</dt>
          <dd>{summary(project.id, "problem")}</dd>
        </div>
        {isQuest ? (
          <div data-field-key="intendedUser">
            <dt>For</dt>
            <dd>{summary(project.id, "intendedUser")}</dd>
          </div>
        ) : null}
        <div data-field-key="personalRole">
          <dt>My role</dt>
          <dd>{summary(project.id, "personalRole")}</dd>
        </div>
        <div data-field-key="decisionSupported">
          <dt>{isQuest ? "Authority" : "Public decision boundary"}</dt>
          <dd>{summary(project.id, "decisionSupported")}</dd>
        </div>
        {isQuest ? (
          <div data-field-key="testStrategy">
            <dt>Evaluation</dt>
            <dd>{summary(project.id, "testStrategy")}</dd>
          </div>
        ) : (
          <>
            <div data-field-key="implementation">
              <dt>Public artifact</dt>
              <dd>{summary(project.id, "implementation")}</dd>
            </div>
            <div data-field-key="stack">
              <dt>Public formats</dt>
              <dd>{summary(project.id, "stack")}</dd>
            </div>
          </>
        )}
        <div data-field-key="outcome">
          <dt>Result</dt>
          <dd>{summary(project.id, "outcome")}</dd>
        </div>
        <div data-field-key="limitations">
          <dt>Boundary</dt>
          <dd>{summary(project.id, "limitations")}</dd>
        </div>
      </dl>
      <p className={styles.supportBoundary} data-support-boundary>
        {isQuest
          ? "Public reviewer snapshot only. No private stack or general child safety claim is established."
          : "Public documentation artifact only. The private runtime was not inspected or evaluated; no runtime capability, intended user, or failure dividend is established."}
      </p>
      <Link href={project.route} aria-label={`Read ${project.title} field note`}>
        Read {project.title} field note
        <span aria-hidden="true"> →</span>
      </Link>
    </article>
  );
}

export default function WorkIndexPage() {
  return (
    <main id="main-content" className={styles.workIndex}>
      <header className={`shell ${styles.hero}`}>
        <p className={styles.eyebrow}>Work index / evidence before volume</p>
        <h1>Two flagships, two focused field notes, and a bounded historical shelf.</h1>
        <p>
          The hierarchy is intentional. Full case studies are reserved for implemented systems
          with verified evidence; supporting notes and dated coursework stay visibly in their own
          lanes.
        </p>
        <nav aria-label="Work-index sections">
          <a href="#flagships">Flagships / 01–02</a>
          <a href="#supporting-notes">Supporting notes</a>
          <a href="#historical-reading">Historical reading</a>
        </nav>
      </header>

      <section
        className={styles.flagshipLane}
        id="flagships"
        data-work-lane="flagships"
        aria-labelledby="flagship-lane-title"
      >
        <header className={`shell ${styles.laneHeading}`}>
          <div>
            <p className={styles.eyebrow}>Primary lane / implemented and verified</p>
            <h2 id="flagship-lane-title">Flagship systems</h2>
          </div>
          <p>
            Each row states the problem, my role, the supported decision or result, and the methods
            before it asks you to open the full evidence narrative.
          </p>
        </header>

        <FlagshipEntry project={flagships[0]} ordinal="01" />
        <FlagshipEntry project={flagships[1]} ordinal="02" />
      </section>

      <section
        className={`shell ${styles.supportingLane}`}
        id="supporting-notes"
        data-work-lane="supporting-notes"
        aria-labelledby="supporting-lane-title"
      >
        <header className={styles.laneHeading}>
          <div>
            <p className={styles.eyebrow}>Supporting lane / unnumbered</p>
            <h2 id="supporting-lane-title">Focused field notes</h2>
          </div>
          <p>
            Useful, bounded work without a flagship costume: one reviewed interaction prototype and
            one public documentation artifact.
          </p>
        </header>

        {supportingNotes.map((project) => (
          <SupportingEntry key={project.id} project={project} />
        ))}
      </section>

      <section
        className={styles.historyLane}
        id="historical-reading"
        data-work-lane="historical-reading-shelf"
        aria-labelledby="historical-lane-title"
      >
        <header className={`shell ${styles.laneHeading}`}>
          <div>
            <p className={styles.eyebrow}>Archive lane / dated and link-only</p>
            <h2 id="historical-lane-title">Historical reading shelf</h2>
          </div>
          <p>
            These artifacts show earlier study and writing, not current engineering readiness. Dates,
            sources, and present limits remain attached.
          </p>
        </header>

        <ul className={`shell ${styles.historyList}`}>
          {historicalCoursework.map((item) => (
            <li key={item.id} data-work-entry data-project-model-id={item.id}>
              <article>
                <div className={styles.historyMeta}>
                  <p>{item.context}</p>
                  <time dateTime={item.dateTime}>{item.date}</time>
                </div>
                <div className={styles.historySummary}>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <p className={styles.historyBoundary}>
                  <span>Present boundary</span>
                  {item.boundary}
                </p>
                <a href={item.sourceHref} target="_blank" rel="noreferrer">
                  {item.sourceLabel} <span className="sr-only">(opens in a new tab)</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section
        className={styles.capabilityBoundary}
        data-capability-boundary="energy-ee"
        aria-labelledby="work-capability-title"
      >
        <div className="shell">
          <p className={styles.eyebrow}>Audience boundary</p>
          <h2 id="work-capability-title">Current evidence is software-centered.</h2>
          <p>
            Climate and geospatial work are applied contexts. Energy is historical governance
            context and a direction of interest—not evidence of an implemented energy system. The
            current work does not yet establish electrical engineering, controls, embedded,
            power-systems, or hardware implementation experience.
          </p>
        </div>
      </section>
    </main>
  );
}
