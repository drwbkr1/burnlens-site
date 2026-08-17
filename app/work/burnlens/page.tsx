import type { Metadata } from "next";
import Link from "next/link";

import { EvidenceLink } from "@/components/editorial/EvidenceLink";
import { getProject, toReaderFirst } from "@/content/project-model";

import styles from "./page.module.css";

const project = getProject("burnlens");

const claimAtoms = {
  problem:
    "BurnLens asks how one bounded experimental computer-vision-to-GEOINT release can become understandable, inspectable, citable, and responsibly interpretable as a coherent whole.",
  audience:
    "It is an experimental portfolio project for technical and technical-adjacent reviewers, not an operational wildfire tool.",
  role:
    "Drew set the portfolio thesis, target audience, use boundaries, owner stop conditions, and publication direction, and owned the human decisions; Codex was assigned technical, product, and reliability direction within that owner-defined envelope.",
  constraint:
    "The public release had to remain useful while excluding credentials, private owner responses, private logs, and machine-local paths, without implying official or operational capability.",
  decision:
    "When the story was fragmented across correct artifacts, the project chose one canonical reviewer entry point around them rather than rewriting them.",
  outcome:
    "BurnLens reached a public, complete Phase Six portfolio release: v0.56.0-baseline-first-portfolio-release at commit e2e0b778; the later evidence snapshot is a741111d, four commits after the release.",
  limitation:
    "BurnLens is experimental portfolio evidence, not official wildfire information, emergency guidance, or operational decision support.",
  lesson:
    "Reliability includes recognizing when evidence is insufficient and making that stop reproducible.",
} as const;

const chapters = [
  ["01", "Frame", "#frame"],
  ["02", "Authority", "#authority"],
  ["03", "Assembly", "#assembly"],
  ["04", "Boundary", "#boundary"],
] as const;

export const metadata: Metadata = {
  title: "BurnLens — Release governance and evidence system",
  description: claimAtoms.audience,
  applicationName: "Drew Baker — Portfolio",
  alternates: {
    canonical: "/work/burnlens",
  },
};

function RecordLabel({ children, number }: { children: string; number: string }) {
  return (
    <p className={styles.recordLabel}>
      <span aria-hidden="true">{number}</span>
      {children}
    </p>
  );
}

export default function BurnLensCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article
          className={styles.atlas}
          data-field-atlas="burnlens"
          data-project-model-id={project.id}
        >
          <header className={styles.hero} data-first-screen="burnlens" id="frame">
            <div className={styles.heroRegister} aria-label="Case-file register">
              <p>Field case / 01</p>
              <p>Release governance / evidence system</p>
            </div>

            <div className={styles.heroTitle}>
              <p className={styles.eyebrow}>BurnLens</p>
              <h1>BurnLens</h1>
            </div>

            <div className={styles.heroClaims}>
              <p className={styles.lede} data-claim-atom="problem">
                {toReaderFirst(claimAtoms.problem)}
              </p>
              <p className={styles.audience} data-claim-atom="audience">
                {claimAtoms.audience}
              </p>
            </div>
          </header>

          <nav
            aria-label="BurnLens case study chapters"
            className={styles.chapterIndex}
            data-case-chapter-index="burnlens"
          >
            <ol>
              {chapters.map(([number, label, href]) => (
                <li key={number}>
                  <a href={href}>
                    <span aria-hidden="true">{number}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section
            aria-labelledby="authority-heading"
            className={styles.authority}
            data-release-governance="authority"
            id="authority"
          >
            <div className={styles.sectionIndex}>
              <RecordLabel number="02">Authority</RecordLabel>
              <h2 id="authority-heading">Authority map</h2>
            </div>

            <div className={styles.authorityLedger}>
              <article>
                <p className={styles.ledgerMark}>D / Human decisions</p>
                <p data-claim-atom="role">{claimAtoms.role}</p>
              </article>
              <article>
                <p className={styles.ledgerMark}>C / Public constraint</p>
                <p data-claim-atom="constraint">{claimAtoms.constraint}</p>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="assembly-heading"
            className={styles.assembly}
            data-release-governance="assembly"
            id="assembly"
          >
            <div className={styles.sectionIndex}>
              <RecordLabel number="03">Assembly</RecordLabel>
              <h2 id="assembly-heading">Reviewer path</h2>
            </div>

            <div className={styles.assemblyBody}>
              <p className={styles.decision} data-claim-atom="decision">
                {claimAtoms.decision}
              </p>

              <div className={styles.releaseRecord}>
                <p className={styles.ledgerMark}>R / Release record</p>
                <p data-claim-atom="outcome">{claimAtoms.outcome}</p>
              </div>

              <nav aria-label="BurnLens public evidence" className={styles.evidenceLinks}>
                <EvidenceLink
                  data-source-id="burnlens-release"
                  readerLabel={
                    <>
                      Inspect v0.56.0 release <span aria-hidden="true">↗</span>
                    </>
                  }
                  sourceId="burnlens-release"
                />
                <EvidenceLink
                  data-source-id="burnlens-pinned-tree"
                  readerLabel={
                    <>
                      Inspect later evidence snapshot <span aria-hidden="true">↗</span>
                    </>
                  }
                  sourceId="burnlens-pinned-tree"
                />
              </nav>
            </div>
          </section>

          <section
            aria-labelledby="boundary-heading"
            className={styles.boundary}
            data-release-governance="boundary"
            id="boundary"
          >
            <div className={styles.sectionIndex}>
              <RecordLabel number="04">Boundary</RecordLabel>
              <h2 id="boundary-heading">Use boundary</h2>
            </div>

            <div className={styles.boundaryBody}>
              <p className={styles.limit} data-claim-atom="limitation">
                {claimAtoms.limitation}
              </p>
              <p className={styles.lesson} data-claim-atom="lesson">
                {claimAtoms.lesson}
              </p>
            </div>
          </section>

          <footer className={styles.caseFooter}>
            <p>Case file / BurnLens / 01</p>
            <Link href="/work">
              Return to selected work <span aria-hidden="true">→</span>
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
