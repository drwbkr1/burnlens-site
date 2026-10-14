import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  getProject,
  getSupportedEvidence,
  toReaderFirst,
  type ProjectEvidence,
  type ProjectId,
} from "@/content/project-model";
import { historicalCoursework } from "@/content/projects";
import { LeadFigure } from "./after-the-tip/ribbon-figure";

import styles from "./work-index.module.css";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Software systems, environmental GIS, and interactive work from Drew Baker, including Wildfire Response, After the Tip, West Hawaiʻi heat exposure and Nepal Satellite Atlas.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected work | Drew Baker",
    description:
      "Software systems, product decisions, current projects and a historical reading shelf.",
    url: "/work",
    siteName: "Drew Baker Portfolio",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected work | Drew Baker",
    description:
      "Software systems, product decisions, current projects and a historical reading shelf.",
    images: ["/opengraph-image"],
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
          <dt>{project.id === "burnlens" ? "Role split" : "My role"}</dt>
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
        <p className={styles.eyebrow}>Selected work / Systems and experiences</p>
        <h1>Software systems, focused field notes, and work in progress.</h1>
        <p>
          Explore what I built, the decisions that shaped it, and what the work can show.
          BurnLens and Runbook Sentinel remain the two established flagships. Current
          projects bring interactive design and new questions into the collection.
        </p>
        <nav aria-label="Work-index sections">
          <a href="#flagships">Flagships / 01–02</a>
          <a href="#current-projects">Current projects</a>
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
            Each row states the problem, role, supported decision or result, and limits
            before it asks you to open the full evidence narrative.
          </p>
        </header>

        <FlagshipEntry project={flagships[0]} ordinal="01" />
        <FlagshipEntry project={flagships[1]} ordinal="02" />
      </section>

      <section
        className={`shell ${styles.currentProjects}`}
        id="current-projects"
        aria-labelledby="current-projects-title"
      >
        <header className={styles.laneHeading}>
          <div>
            <p className={styles.eyebrow}>Current work / Play, sound and environmental questions</p>
            <h2 id="current-projects-title">Turning questions into experiences.</h2>
          </div>
        </header>
        <article className={styles.currentProject}>
          <div>
            <h3>Wildfire Response</h3>
            <p>A cooperative browser game about protecting a community with limited water, money and crew time.</p>
            <p>My contribution: product direction and playtest feedback, with Codex-assisted development.</p>
            <Link href="/work/wildfire-response">Read Wildfire Response case study <span aria-hidden="true">→</span></Link>
          </div>
          <figure>
            <Image src="/media/projects/wildfire-response/planning-v027.jpg" alt="Wildfire Response terrain map, crew actions and shared resource display." width={1279} height={631} sizes="(max-width: 700px) calc(100vw - 40px), 60vw" />
            <figcaption>v0.27 interface · historical synthetic development fixture · gameplay disabled · AI-assisted terrain art.</figcaption>
          </figure>
        </article>
        <article className={`${styles.currentProject} ${styles.audioProject}`}>
          <div>
            <h3>After the Tip</h3>
            <p>A visual and listening experiment comparing the screened NCAA women’s basketball season with Purdue’s games on one regulation clock.</p>
            <p>My contribution: product and sound direction, with Codex-assisted development. Local exploratory prototype; not submitted.</p>
            <Link href="/work/after-the-tip">Read After the Tip case study <span aria-hidden="true">→</span></Link>
          </div>
          <div><LeadFigure cohort="purdue" compact /><p className={styles.previewNote}>Actual mean positive lead contributions · 30 Purdue games · both sides · regulation only. Not an uncertainty band or team-strength comparison.</p></div>
        </article>
        <article className={`${styles.currentProject} ${styles.reefProject}`}>
          <div>
            <h3>Heat exposure across West Hawaiʻi reefs</h3>
            <p>An environmental GIS study connecting satellite heat stress to historical reef habitat, with a saved comparison that challenges my starting hypothesis.</p>
            <p>My contribution: research framing and guided ArcGIS analysis, with Codex assistance. Logger and forecast analyses remain next steps.</p>
            <Link href="/work/west-hawaii-heat-exposure">Read West Hawaiʻi heat-exposure case study <span aria-hidden="true">→</span></Link>
          </div>
          <figure>
            <div className={styles.reefPreview}>
              <div><span>2015</span><Image src="/media/projects/west-hawaii-heat-exposure/heat-exposure-2015.svg" alt="2015 coastal grid: all assessed habitat cells at 8-or-above annual maximum DHW, with unavailable cells hatched." width={480} height={1160} unoptimized /></div>
              <div><span>2019</span><Image src="/media/projects/west-hawaii-heat-exposure/heat-exposure-2019.svg" alt="2019 coastal grid: a mixture of assessed DHW classes and the same unavailable cells." width={480} height={1160} unoptimized /></div>
            </div>
            <figcaption>Actual saved satellite-exposure classes · same coastal grid · historical reef/hardbottom cells filled. These are heat-exposure maps, not coral-damage observations.</figcaption>
          </figure>
        </article>
        <article className={`${styles.currentProject} ${styles.nepalProject}`}>
          <div>
            <h3>Nepal Satellite Atlas</h3>
            <p>A dated satellite comparison shaped into an editable ArcGIS atlas and a browser companion.</p>
            <p>My contribution: research and product direction, with Codex-assisted GIS and software implementation.</p>
            <Link href="/work/nepal-satellite-atlas">Read Nepal Satellite Atlas case study <span aria-hidden="true">→</span></Link>
          </div>
          <figure>
            <Image src="/media/projects/nepal-satellite-atlas/dated-radar-atlas.png" alt="Actual paired Nepal ArcGIS radar map: 16 and 28 August 2026, shared display scale, exclusions and native legend." width={1560} height={1020} unoptimized />
            <figcaption>Actual public GIS export · unregistered visual experiment, not a mapped landslide result. ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.</figcaption>
          </figure>
        </article>
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
