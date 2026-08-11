import type { Metadata } from "next";
import Link from "next/link";
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

const projectEvidence = [
  {
    label: "Flagship case study",
    title: "BurnLens — baseline-first wildfire evidence",
    status: "Released research workflow",
    description:
      "Built a reproducible CV-to-GEOINT workflow for bounded wildfire-screening research. The recorded evaluation accepted the RBR baseline and rejected the U-Net candidate instead of hiding the weaker result.",
    boundary:
      "Experimental BurnLens CV output. Not official wildfire information. Not emergency guidance. Not evacuation, routing, tactical, or incident-command support. Official sources govern.",
    href: "/work/burnlens",
    linkLabel: "Read the BurnLens case study",
  },
  {
    label: "Flagship case study",
    title: "Runbook Sentinel",
    status: "Synthetic safety testbed",
    description:
      "Built a deterministic incident-agent safety and reliability testbed with retrieval controls, stale-evidence handling, external approval boundaries, retained failures, and a synthetic executor.",
    boundary:
      "Synthetic SRE environment only; it does not connect to real infrastructure or establish production readiness.",
    href: "/work/runbook-sentinel",
    linkLabel: "Read the Runbook Sentinel case study",
  },
  {
    label: "Historical coursework",
    title: "Energy Sector Data Governance",
    status: "Policy brief · December 2025",
    description:
      "A 14-page policy-writing sample by William Baker, retained for its research, risk framing, and documented revision process.",
    boundary:
      "Read as a December 2025 writing artifact—not current policy guidance. Agency terminology and time-sensitive claims require correction and fresh verification; no Adobe Stock or Canva imagery is reused here.",
    href: "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
    linkLabel: "Read the public brief",
  },
  {
    label: "Historical coursework",
    title: "Hierarchical clustering exploration",
    status: "Repository snapshot · 18 Aug 2025",
    description:
      "A public notebook exploration comparing HDBSCAN behavior under Jaccard, Euclidean, and Rogers–Tanimoto distance choices.",
    boundary:
      "Not a current reproducible study. The GitHub and Colab versions differ, the historical data source and environment are not reproducibly pinned, and saved outputs are not treated as verified results.",
    href: "https://github.com/drwbkr1/Grad504-Hierarchical-Cluster-Project/tree/21e9b18b37a0e1acd9f2814cca3456b94849c098",
    linkLabel: "Inspect the frozen repository snapshot",
  },
] as const;

const skillGroups = [
  {
    label: "Software and applied AI",
    text: "Python, model evaluation, LLM and RAG workflows, embeddings, ChromaDB, API and tool integration, prompt design, reproducible evidence.",
  },
  {
    label: "Geospatial and Earth observation",
    text: "GeoPandas, rioxarray, Google Earth Engine, STAC, Cloud Optimized GeoTIFFs, GIS programming, remote-sensing workflows.",
  },
  {
    label: "Communication and governance",
    text: "Technical writing, policy analysis, source review, stakeholder-facing documentation, explicit limitations and decision boundaries.",
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
  {
    title: "Mimo — Python Development",
    href: "https://www.virtualbadge.io/certificate-validator?credential=309dfe20-7aec-47a8-a208-b4622bb1b74c",
  },
] as const;

const leadership = [
  ["2019", "SSI Assistant Scuba Instructor"],
  ["2016", "Founder, Ball State eSports"],
  ["2016", "Promotions Officer, Electronic Gaming League"],
  ["2011", "Eagle Scout Award"],
] as const;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { absolute: "Resume | William Drew Baker" },
  description:
    "Public resume for William Drew Baker: software systems, geospatial evidence, applied AI evaluation, climate work, energy policy, and technical communication.",
  alternates: { canonical: new URL("/resume", siteUrl) },
  openGraph: {
    title: "Resume | William Drew Baker",
    description:
      "Software systems, geospatial evidence, risk-aware decision support, and technical communication.",
    url: new URL("/resume", siteUrl),
    siteName: "William Drew Baker",
    type: "website",
    images: [{ url: new URL("/opengraph-image", siteUrl), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | William Drew Baker",
    description: "Software systems, geospatial evidence, and risk-aware decision support.",
    images: [new URL("/opengraph-image", siteUrl)],
  },
};

export default function ResumePage() {
  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.main}>
        <article className={styles.resume}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Resume / public edition</p>
              <h1>William “Drew” Baker</h1>
              <p className={styles.roleLine}>
                Software development · Geospatial systems · Risk-aware decision support
              </p>
              <p className={styles.summary}>
                I build inspectable software and evidence workflows for uncertain, high-consequence
                settings. My work connects applied AI evaluation, geospatial analysis, reproducible
                testing, climate and energy research, and plain-language technical communication.
              </p>
              <div className={styles.profileLinks} aria-label="Public professional profiles">
                <a
                  href="https://github.com/drwbkr1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/william-baker-843946162/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
                <PrintButton className={styles.printButton} />
              </div>
            </div>

            <aside className={styles.identityLedger} aria-label="Professional focus">
              <div>
                <span>Focus</span>
                <strong>Evidence before claims</strong>
              </div>
              <div>
                <span>Evidence</span>
                <strong>Public work, tests, and limits</strong>
              </div>
              <div>
                <span>Privacy</span>
                <strong>Professional profiles only</strong>
              </div>
            </aside>
          </header>

          <p className={styles.privacyNote}>
            <strong>Contact.</strong> For professional inquiries, use LinkedIn. Direct email, phone,
            and location are intentionally omitted from this public résumé.
          </p>

          <div className={styles.resumeGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.section} aria-labelledby="projects-heading">
                <div className={styles.sectionHeading}>
                  <span>01</span>
                  <h2 id="projects-heading">Selected project evidence</h2>
                </div>
                <div className={styles.projectList}>
                  {projectEvidence.map((project) => {
                    const external = project.href.startsWith("http");

                    return (
                      <article className={styles.project} key={project.title}>
                        <div className={styles.projectIndex}>
                          <span>{project.label}</span>
                          <small>{project.status}</small>
                        </div>
                        <div className={styles.projectCopy}>
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                          <p className={styles.boundary}>
                            <strong>Boundary.</strong> {project.boundary}
                          </p>
                          {external ? (
                            <a href={project.href} target="_blank" rel="noopener noreferrer">
                              {project.linkLabel} <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <Link href={project.href}>
                              {project.linkLabel} <span aria-hidden="true">→</span>
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className={styles.section} aria-labelledby="experience-heading">
                <div className={styles.sectionHeading}>
                  <span>02</span>
                  <h2 id="experience-heading">Experience</h2>
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
                  <h2 id="education-heading">Education</h2>
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

              <section className={styles.section} aria-labelledby="skills-heading">
                <div className={styles.sectionHeading}>
                  <span>04</span>
                  <h2 id="skills-heading">Working disciplines</h2>
                </div>
                <dl className={styles.skillList}>
                  {skillGroups.map((group) => (
                    <div key={group.label}>
                      <dt>{group.label}</dt>
                      <dd>{group.text}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className={styles.section} aria-labelledby="learning-heading">
                <div className={styles.sectionHeading}>
                  <span>05</span>
                  <h2 id="learning-heading">Selected learning</h2>
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
                  <h2 id="leadership-heading">Leadership</h2>
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
            <span>William Drew Baker / public resume</span>
            <span>Last editorial review: August 2026</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
