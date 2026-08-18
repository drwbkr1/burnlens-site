import type { Metadata } from "next";
import Link from "next/link";

import { EvidenceLink } from "@/components/editorial/EvidenceLink";
import {
  ProjectFactLedger,
  type ProjectFact,
} from "@/components/editorial/ProjectFactLedger";
import {
  getProject,
  getPublicSourceHref,
  getSupportedEvidence,
  projectSurfacePlan,
  targetSurfaceHierarchy,
  toReaderFirst,
  type NonEmpty,
  type ProjectEvidence,
  type ProjectId,
  type PublicLinkSourceId,
} from "@/content/project-model";
import { historicalCoursework } from "@/content/projects";
import { getSiteUrl } from "@/lib/site-origin";

import { PrintButton } from "./print-button";
import styles from "./resume.module.css";

const experience = [
  {
    role: "Gen AI Associate",
    organization: "Innodata",
    dates: "Apr 2024 – Apr 2026",
    bullets: [
      "Annotated and evaluated 200–500 AI prompt-and-response tasks weekly across multiple projects for model-training and evaluation workflows.",
      "Worked with a distributed team of more than 35 people to identify failure modes, refine prompts, and align outputs with project requirements.",
    ],
  },
  {
    role: "Technical Content Writer",
    organization: "Independent contractor",
    dates: "Nov 2021 – Mar 2024",
    bullets: [
      "Wrote and edited more than 300 technology articles, including energy and residential-solar explainers.",
      "Translated technical and energy topics into accessible material for broad, non-specialist audiences.",
    ],
  },
] as const;

const selectedLearning = [
  {
    title:
      "NASA ARSET — remote sensing fundamentals, Earth-science machine learning, and hyperspectral data",
    href: null,
  },
  {
    title: "Imperial College London — Linear Algebra",
    href: "https://coursera.org/share/dcaf6f3b5422e369abf0c812761dcd2b",
  },
  {
    title: "Imperial College London — Multivariate Calculus",
    href: "https://coursera.org/share/b1d9aee762f9ed5b40dcb4099444472e",
  },
  {
    title: "Kaggle — Intermediate Machine Learning",
    href: "https://www.kaggle.com/learn/certification/drewbaker15/intermediate-machine-learning",
  },
  {
    title: "Kaggle — Feature Engineering",
    href: "https://www.kaggle.com/learn/certification/drewbaker15/feature-engineering",
  },
] as const;

const leadership = [
  ["2019", "SSI Assistant Scuba Instructor"],
  ["2016", "Founder, Ball State eSports"],
  ["2016", "Promotions Officer, Electronic Gaming League"],
  ["2011", "Eagle Scout Award"],
] as const;

const selectedProjectIds = targetSurfaceHierarchy.resume.selectedProjectIds;
const selectedProjectHierarchy = targetSurfaceHierarchy.resume.selectedProjectHierarchy;

const selectedSourceIds = {
  burnlens: "burnlens-pinned-tree",
  "runbook-sentinel": "rs.git.v0020",
  "quest-craft": "quest.snapshot",
} as const satisfies Record<(typeof selectedProjectIds)[number], PublicLinkSourceId>;

const selectedProjects = selectedProjectIds.map((projectId, index) => {
  const tier = selectedProjectHierarchy[index];
  if (!tier) throw new Error(`Missing resume hierarchy tier for ${projectId}.`);

  return {
    project: getProject(projectId),
    sourceId: selectedSourceIds[projectId],
    tier,
  };
});

const researchSourceIds = {
  "hierarchical-clustering": "hc.snapshot",
  "energy-sector-data-governance": "policy.reader",
  "der-dcp": "der.document",
} as const satisfies Record<
  (typeof targetSurfaceHierarchy.resume.researchAndWritingProjectIds)[number],
  PublicLinkSourceId
>;

const researchLinkLabels = {
  "hierarchical-clustering": "Inspect the frozen repository snapshot",
  "energy-sector-data-governance": "Read the dated policy-writing sample",
  "der-dcp": "Read the historical proposal",
} as const satisfies Record<
  (typeof targetSurfaceHierarchy.resume.researchAndWritingProjectIds)[number],
  string
>;

const researchAndWriting = targetSurfaceHierarchy.resume.researchAndWritingProjectIds.map(
  (projectId) => {
    const item = historicalCoursework.find((candidate) => candidate.id === projectId);
    if (!item) throw new Error(`Missing historical resume projection for ${projectId}.`);

    const sourceId = researchSourceIds[projectId];
    return {
      context: item.context,
      date: item.date,
      dateTime: item.dateTime,
      linkLabel: researchLinkLabels[projectId],
      project: getProject(projectId),
      sourceHref: getPublicSourceHref(sourceId),
      sourceId,
    };
  },
);

type EvidenceKey = keyof ProjectEvidence<ProjectId>;
type ResumeField =
  | "personalRole"
  | "implementation"
  | "stack"
  | "testStrategy"
  | "outcome"
  | "limitations"
  | "maturity";

const resumeFieldLabels: Record<Exclude<ResumeField, "maturity">, string> = {
  personalRole: "My role",
  implementation: "What I built",
  stack: "Methods and technologies",
  testStrategy: "How I tested it",
  outcome: "Result",
  limitations: "Current boundary",
};

type ResearchResumeField = "problem" | "personalRole" | "outcome" | "limitations" | "maturity";

const researchFieldLabels: Record<ResearchResumeField, string> = {
  problem: "Artifact",
  personalRole: "My role",
  outcome: "Retained result",
  limitations: "Present boundary",
  maturity: "Status",
};

function supported(projectId: ProjectId, field: EvidenceKey) {
  const evidence = getSupportedEvidence(projectId, field);
  if (!evidence) throw new Error(`Resume projection requires supported ${projectId}.${field}.`);
  return evidence;
}

function resumeReaderFirst(text: string) {
  return toReaderFirst(text)
    .replace(/HDBSCAN/g, "density-based clustering (HDBSCAN)")
    .replace(/SCLA 521 Societal Impacts of AI/g, "Societal Impacts of AI course (SCLA 521)");
}

function EvidenceValue({
  field,
  projectId,
}: {
  field: Exclude<ResumeField, "stack">;
  projectId: ProjectId;
}) {
  const evidence = supported(projectId, field);
  return (
    <span
      data-evidence-field={field}
      data-evidence-owner={`${projectId}.${field}`}
      data-field-key={field}
      data-field-owner={field}
      data-source-ids={evidence.sourceIds.join(" ")}
    >
      {resumeReaderFirst(evidence.summary)}
    </span>
  );
}

function TechnologyEvidence({ projectId }: { projectId: "burnlens" | "runbook-sentinel" }) {
  const evidence = getProject(projectId).evidence.stack;
  if (evidence.state !== "supported") {
    throw new Error(`Resume technology projection requires supported ${projectId}.stack.`);
  }

  return (
    <div
      data-evidence-field="stack"
      data-evidence-owner={`${projectId}.stack`}
      data-field-key="stack"
      data-field-owner="stack"
      data-source-ids={evidence.sourceIds.join(" ")}
    >
      <p>{resumeReaderFirst(evidence.summary)}</p>
      <ul
        data-project-model-id={projectId}
        data-source-ids={evidence.sourceIds.join(" ")}
        data-technology-register={projectId}
      >
        {evidence.value.map((item) => (
          <li
            data-evidence-field="stack"
            data-project-model-id={projectId}
            data-source-ids={evidence.sourceIds.join(" ")}
            data-technology-binding={item.name}
            key={item.name}
          >
            <strong>{resumeReaderFirst(item.name)}</strong>
            <span>{resumeReaderFirst(item.purpose)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResumeProject({
  entry,
  index,
}: {
  entry: (typeof selectedProjects)[number];
  index: number;
}) {
  const { project, sourceId, tier } = entry;
  const fields = projectSurfacePlan[project.id].fields.resume as readonly ResumeField[];
  const maturity = supported(project.id, "maturity");
  const factFields = fields.filter((field) => field !== "maturity") as readonly Exclude<
    ResumeField,
    "maturity"
  >[];
  const facts = factFields.map((field): ProjectFact => {
    if (field === "stack") {
      if (project.id === "quest-craft") {
        throw new Error("Quest Craft has no public stack evidence and cannot own a resume stack field.");
      }
      return {
        id: field,
        term: resumeFieldLabels[field],
        detail: <TechnologyEvidence projectId={project.id} />,
      };
    }

    return {
      id: field,
      term: resumeFieldLabels[field],
      detail: <EvidenceValue field={field} projectId={project.id} />,
    };
  });

  const [firstFact, ...remainingFacts] = facts;
  if (!firstFact) throw new Error(`Resume fact ledger is empty for ${project.id}.`);
  const projectFacts: NonEmpty<ProjectFact> = [firstFact, ...remainingFacts];

  const tierLabel = tier === "flagship" ? `Flagship ${String(index + 1).padStart(2, "0")}` : "Supporting implementation";

  return (
    <article
      className={styles.project}
      data-project-model-id={project.id}
      data-resume-project={project.id}
      data-resume-hierarchy={tier}
    >
      <div className={styles.projectIndex}>
        <span>{tierLabel}</span>
        <small
          data-evidence-field="maturity"
          data-evidence-owner={`${project.id}.maturity`}
          data-field-key="maturity"
          data-field-owner="maturity"
          data-source-ids={maturity.sourceIds.join(" ")}
        >
          {resumeReaderFirst(maturity.summary)}
        </small>
      </div>

      <div className={styles.projectCopy}>
        <h3>{project.title}</h3>
        <ProjectFactLedger
          className={styles.projectFacts}
          data-resume-project-facts={project.id}
          facts={projectFacts}
        />
        <div className={styles.projectLinks}>
          <Link href={project.route}>
            Read the {tier === "flagship" ? "case study" : "field note"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
          <EvidenceLink
            sourceId={sourceId}
            readerLabel={
              <>
                Inspect pinned evidence <span className="sr-only">(opens in a new tab)</span>
                <span aria-hidden="true">↗</span>
              </>
            }
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>
      </div>
    </article>
  );
}

function ResearchEvidence({
  projectId,
}: {
  projectId: (typeof targetSurfaceHierarchy.resume.researchAndWritingProjectIds)[number];
}) {
  const fields = projectSurfacePlan[projectId].fields.resume as readonly ResearchResumeField[];

  return (
    <dl className={styles.researchFacts} data-resume-history-facts={projectId}>
      {fields.map((field) => {
        const evidence = supported(projectId, field);
        return (
          <div key={field}>
            <dt>{researchFieldLabels[field]}</dt>
            <dd
              data-evidence-field={field}
              data-evidence-owner={`${projectId}.${field}`}
              data-source-ids={evidence.sourceIds.join(" ")}
            >
              {resumeReaderFirst(evidence.summary)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

const siteUrl = getSiteUrl();
const metadataDescription =
  "Portfolio of Drew Baker: inspectable software systems, geospatial evidence workflows, bounded model evaluation, and climate-relevant technical work.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { absolute: "Resume | William Drew Baker" },
  description: metadataDescription,
  alternates: { canonical: new URL("/resume", siteUrl) },
  openGraph: {
    title: "Resume | William Drew Baker",
    description: metadataDescription,
    url: new URL("/resume", siteUrl),
    siteName: "William Drew Baker",
    type: "website",
    images: [{ url: new URL("/opengraph-image", siteUrl), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | William Drew Baker",
    description: metadataDescription,
    images: [new URL("/opengraph-image", siteUrl)],
  },
};

export default function ResumePage() {
  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.main}>
        <article className={styles.resume} data-resume-surface="public-resume">
          <header className={styles.hero}>
            <div className={styles.heroIdentity}>
              <p className={styles.eyebrow}>Public résumé / evidence edition</p>
              <h1>William “Drew” Baker</h1>
              <p className={styles.roleLine}>
                Software engineering · Geospatial evidence · Climate-relevant systems
              </p>
            </div>

            <div className={styles.heroBrief}>
              <p className={styles.summary}>
                Software engineer building inspectable systems, deterministic software authorization
                boundaries, and geospatial evidence workflows for high-consequence settings. Public
                projects show bounded model evaluation and release testing; historical coursework
                adds energy-policy context.
              </p>
              <nav className={styles.profileLinks} aria-label="Public professional profiles">
                <a
                  href="https://github.com/drwbkr1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>GitHub</strong>
                  <span>github.com/drwbkr1</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/william-baker-843946162/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>LinkedIn</strong>
                  <span>linkedin.com/in/william-baker-843946162</span>
                </a>
                <PrintButton className={styles.printButton} />
              </nav>
            </div>
          </header>

          <p className={styles.privacyNote}>
            <span>
              <strong>Contact.</strong> For professional inquiries, use LinkedIn. Direct email,
              phone, and location are intentionally omitted from this public résumé.
            </span>
          </p>

          <div className={styles.resumeGrid}>
            <div className={styles.primaryColumn}>
              <section
                className={styles.section}
                aria-labelledby="projects-heading"
                data-resume-lane="selected-project-evidence"
              >
                <div className={styles.sectionHeading}>
                  <span>01</span>
                  <div>
                    <p>Hiring order / implemented and evaluated work</p>
                    <h2 id="projects-heading">Selected project evidence</h2>
                  </div>
                </div>
                <div className={styles.projectList}>
                  {selectedProjects.map((entry, index) => (
                    <ResumeProject entry={entry} index={index} key={entry.project.id} />
                  ))}
                </div>
              </section>

              <section className={styles.section} aria-labelledby="experience-heading">
                <div className={styles.sectionHeading}>
                  <span>02</span>
                  <div>
                    <p>Professional record</p>
                    <h2 id="experience-heading">Experience</h2>
                  </div>
                </div>
                <div className={styles.timeline}>
                  {experience.map((item) => (
                    <article className={styles.timelineItem} key={item.role}>
                      <p className={styles.dates}>{item.dates}</p>
                      <div>
                        <h3>{item.role}</h3>
                        <p className={styles.organization}>{item.organization}</p>
                        <ul>
                          {item.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.secondaryColumn}>
              <section className={styles.section} aria-labelledby="education-heading">
                <div className={styles.sectionHeading}>
                  <span>03</span>
                  <div>
                    <p>Formal study</p>
                    <h2 id="education-heading">Education</h2>
                  </div>
                </div>
                <article className={styles.educationItem}>
                  <h3>Purdue University</h3>
                  <p>M.S., Artificial Intelligence and Machine Learning</p>
                  <p className={styles.dates}>May 2025 – expected Fall 2027 · GPA 4.0</p>
                  <p>
                    Coursework includes artificial-intelligence foundations, AI ethics and policy,
                    and GIS programming.
                  </p>
                </article>
                <article className={styles.educationItem}>
                  <h3>Ball State University</h3>
                  <p>B.G.S., Marketing Planning</p>
                  <p className={styles.dates}>Aug 2011 – Aug 2017</p>
                </article>
              </section>

              <section
                className={styles.section}
                aria-labelledby="research-heading"
                data-resume-lane="research-and-writing"
              >
                <div className={styles.sectionHeading}>
                  <span>04</span>
                  <div>
                    <p>Dated / historical coursework</p>
                    <h2 id="research-heading">Research &amp; writing</h2>
                  </div>
                </div>
                <ul className={styles.researchList}>
                  {researchAndWriting.map(
                    ({ context, date, dateTime, linkLabel, project, sourceHref, sourceId }) => (
                      <li
                        data-project-model-id={project.id}
                        data-resume-history={project.id}
                        key={project.id}
                      >
                        <article>
                          <div className={styles.researchMeta}>
                            <span>{context}</span>
                            <time dateTime={dateTime}>{date}</time>
                          </div>
                          <h3>{project.title}</h3>
                          <ResearchEvidence projectId={project.id} />
                          <a
                            data-evidence-source-id={sourceId}
                            href={sourceHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {linkLabel} <span className="sr-only">(opens in a new tab)</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        </article>
                      </li>
                    ),
                  )}
                </ul>
                <p className={styles.capabilityBoundary} data-capability-boundary="energy-ee">
                  <strong>Audience boundary.</strong> Energy is historical governance context and a
                  direction of interest—not evidence of an implemented energy system. The current
                  work does not yet establish electrical engineering, controls, embedded,
                  power-systems, or hardware implementation experience.
                </p>
              </section>

              <section className={styles.section} aria-labelledby="learning-heading">
                <div className={styles.sectionHeading}>
                  <span>05</span>
                  <div>
                    <p>Additional study</p>
                    <h2 id="learning-heading">Selected learning</h2>
                  </div>
                </div>
                <ul className={styles.linkList}>
                  {selectedLearning.map((item) => (
                    <li key={item.title}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          {item.title} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className={styles.learningLabel}>{item.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.section} aria-labelledby="leadership-heading">
                <div className={styles.sectionHeading}>
                  <span>06</span>
                  <div>
                    <p>Earlier record</p>
                    <h2 id="leadership-heading">Leadership</h2>
                  </div>
                </div>
                <dl className={styles.leadershipList}>
                  {leadership.map(([year, item]) => (
                    <div key={item}>
                      <dt>{year}</dt>
                      <dd>{item}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </aside>
          </div>

          <footer className={styles.resumeFooter}>
            <span>William Drew Baker / public résumé</span>
            <span>Last editorial review: August 2026</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
