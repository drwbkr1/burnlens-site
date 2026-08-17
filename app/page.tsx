import type { Metadata } from "next";
import Link from "next/link";

import {
  getProject,
  getProjectSource,
  getPublicSourceHref,
  getSupportedEvidence,
  toReaderFirst,
  type ProjectEvidence,
  type ProjectId,
  type PublicLinkSourceId,
  type SourceId,
} from "@/content/project-model";
import { getSiteOrigin } from "@/lib/site-origin";

import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Drew Baker | Inspectable software systems",
  description:
    "Portfolio of Drew Baker: inspectable software systems, human-directed Codex orchestration, geospatial evidence workflows, and climate-relevant technical work.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Drew Baker | Inspectable software systems",
    description:
      "Inspectable software systems, human-directed Codex orchestration, geospatial evidence workflows, and climate-relevant technical work.",
    url: "/",
    siteName: "Drew Baker Portfolio",
  },
};

const burnlens = getProject("burnlens");
const runbook = getProject("runbook-sentinel");
const quest = getProject("quest-craft");
const openclaw = getProject("openclaw-showcase");

type EvidenceKey = keyof ProjectEvidence<ProjectId>;

function evidenceSummary(projectId: ProjectId, field: EvidenceKey) {
  const evidence = getSupportedEvidence(projectId, field);
  if (!evidence) {
    throw new Error(`Homepage projection requires supported ${projectId}.${field}.`);
  }
  return toReaderFirst(evidence.summary);
}

function featuredFailure(projectId: "runbook-sentinel", evidenceId: string) {
  const supported = getSupportedEvidence(projectId, "failureDividend");
  const evidence = getProject(projectId).evidence.failureDividend;
  if (!supported || evidence.state !== "supported") {
    throw new Error(`Homepage projection requires supported ${projectId} failure evidence.`);
  }

  const failure = evidence.value.find(
    (item) => item.id === evidenceId && "featured" in item && item.featured,
  );
  if (!failure) {
    throw new Error(`Homepage projection could not resolve featured turn ${evidenceId}.`);
  }
  return failure;
}

function firstPublicFailureSource(failure: { sourceIds: readonly SourceId[] }) {
  const sourceId = failure.sourceIds.find((id) => {
    const source = getProjectSource(id);
    return source.availability === "public" && "href" in source;
  });

  if (!sourceId) {
    throw new Error("Featured homepage turns require a public evidence source.");
  }

  return {
    id: sourceId,
    href: getPublicSourceHref(sourceId as PublicLinkSourceId),
  };
}

function readerFirstFailure(canonicalText: string) {
  return toReaderFirst(canonicalText);
}

const runbookTurn = featuredFailure("runbook-sentinel", "RS.F03");
const runbookTurnSource = firstPublicFailureSource(runbookTurn);
const orchestrationBuildHref =
  "https://github.com/drwbkr1/burnlens-deschutes/blob/a741111d82e69689022d2058118ed8f4b9bf3546/records/prompt-build-log/2026-07-27-p6o1-t02.md#L26-L69";
const burnlensReleaseHref = getPublicSourceHref("burnlens-release");

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "William (Drew) Baker",
  alternateName: "Drew Baker",
  url: getSiteOrigin(),
  description:
    "Builder of inspectable software systems, human-directed Codex workflows, and geospatial evidence systems.",
  sameAs: [
    "https://github.com/drwbkr1",
    "https://www.linkedin.com/in/william-baker-843946162/",
  ],
  knowsAbout: [
    "software engineering",
    "Codex orchestration",
    "geospatial evidence",
    "machine learning evaluation",
    "climate-relevant systems",
  ],
};

function FeaturedTurn({
  failure,
  source,
}: {
  failure: typeof runbookTurn;
  source: typeof runbookTurnSource;
}) {
  const conciseSummary =
    "The tested local model produced 9 of 84 outputs that passed the required structure, so the candidate was excluded and fixed-rule control remained.";
  const projectLabel = "Runbook Sentinel";
  const sourceLabel = getProjectSource(source.id).label;

  return (
    <aside
      className={styles.featuredTurn}
      data-featured-turn
      data-evidence-id={failure.id}
      aria-label={`${projectLabel}: failed test that changed the build`}
    >
      <p className={styles.turnLabel}>Failed test / earned progress</p>
      <div className={styles.turnCopy} data-turn-copy>
        <p className={styles.turnSummary}>{conciseSummary}</p>
        <dl>
          <div>
            <dt>What failed</dt>
            <dd>{readerFirstFailure(failure.failure)}</dd>
          </div>
          <div>
            <dt>Build change</dt>
            <dd>{toReaderFirst(failure.buildChange)}</dd>
          </div>
          <div>
            <dt>What that earned</dt>
            <dd>{toReaderFirst(failure.earnedCapability)}</dd>
          </div>
          <div>
            <dt>Still not proven</dt>
            <dd data-turn-boundary>{toReaderFirst(failure.boundary)}</dd>
          </div>
        </dl>
      </div>
      <a
        className={styles.evidenceLink}
        href={source.href}
        target="_blank"
        rel="noreferrer"
        data-source-id={source.id}
      >
        Inspect {sourceLabel} <span className="sr-only">(opens in a new tab)</span>
        <span aria-hidden="true"> ↗</span>
      </a>
    </aside>
  );
}

function AtlasFigure() {
  return (
    <figure className={styles.atlasFigure} aria-labelledby="atlas-caption">
      <div className={styles.atlasGrid} data-atlas-grid>
        <div className={styles.atlasTransect} data-atlas-transect>
          <span>Release intent</span>
          <i aria-hidden="true" />
          <span>Verified release</span>
          <i aria-hidden="true" />
          <span>Later snapshot</span>
        </div>
        <dl className={styles.atlasLegend} data-atlas-legend>
          <div>
            <dt>Release</dt>
            <dd>v0.56.0 / exact public checkpoint</dd>
          </div>
          <div>
            <dt>Snapshot</dt>
            <dd>Four commits after the release</dd>
          </div>
          <div>
            <dt>Boundary</dt>
            <dd>Experimental / non-operational</dd>
          </div>
        </dl>
      </div>
      <figcaption id="atlas-caption">
        A field-atlas reading: the release, later evidence snapshot, and use boundary stay distinct
        on the same sheet.
      </figcaption>
    </figure>
  );
}

function ControlTraceFigure() {
  return (
    <figure className={styles.traceFigure} aria-labelledby="trace-caption">
      <div className={styles.traceField}>
        <ol className={styles.controlRail} data-control-rail aria-label="Reasoning rail">
          <li>
            <span>01</span>
            Read evidence
          </li>
          <li>
            <span>02</span>
            Diagnose
          </li>
          <li>
            <span>03</span>
            Propose only
          </li>
        </ol>

        <div className={styles.authorityBreak} data-authority-break>
          <span>Reasoning stops here</span>
          <strong>Authority is separate</strong>
        </div>

        <ol className={styles.controlRail} data-control-rail aria-label="Authority rail">
          <li>
            <span>A</span>
            Approve once
          </li>
          <li>
            <span>B</span>
            Check policy
          </li>
          <li>
            <span>C</span>
            Mutate synthetic state
          </li>
        </ol>
      </div>
      <figcaption id="trace-caption">
        Two rails meet at an explicit authority break; model output never becomes permission.
      </figcaption>
    </figure>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className={styles.home}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }}
      />

      <section className={`shell ${styles.hero}`} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.identity}>Drew Baker / personal portfolio</p>
          <p className={styles.eyebrow}>
            Software engineering · geospatial evidence · climate-relevant systems
          </p>
          <h1 id="hero-title">
            I build evidence-bound systems <em>for uncertain terrain.</em>
          </h1>
          <p className={styles.deck}>
            I build inspectable data pipelines, deterministic software authorization gates, and
            evidence workflows for climate-relevant and other high-consequence work—and I’m
            interested in applying that practice to energy infrastructure.
          </p>
          <div className={styles.actions} aria-label="Primary actions">
            <a className={styles.primaryAction} href="#selected-work">
              See the evidence <span aria-hidden="true">↓</span>
            </a>
            <Link className={styles.secondaryAction} href="/resume">
              Read the résumé <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className={styles.heroField} aria-label="Evidence hierarchy">
          <p>Working range / current evidence</p>
          <dl>
            <div>
              <dt>01 / Proven</dt>
              <dd>
                Software systems
                <span>Designed, implemented, tested, released.</span>
              </dd>
            </div>
            <div>
              <dt>02 / Applied</dt>
              <dd>
                Climate and geospatial
                <span>Evidence work, not operational authority.</span>
              </dd>
            </div>
            <div>
              <dt>03 / Context</dt>
              <dd>
                Energy governance
                <span>Historical study and prospective interest.</span>
              </dd>
            </div>
          </dl>
          <p className={styles.heroFieldNote}>
            The portfolio says what changed, what passed, and what remains outside the claim.
          </p>
        </div>
      </section>

      <header className={`shell ${styles.workIntro}`} id="selected-work">
        <div className={styles.workIntroHeading}>
          <p className={styles.eyebrow}>Selected work / two flagships</p>
          <h2 id="selected-work-title">Failure is useful when it changes the build.</h2>
        </div>
        <aside
          className={styles.makingLedger}
          data-portfolio-making
          aria-labelledby="portfolio-making-title"
        >
          <div className={styles.makingHeading}>
            <p className={styles.makingKicker}>Portfolio making / bounded orchestration</p>
            <h3 id="portfolio-making-title">How this portfolio was made</h3>
            <p className={styles.makingThesis}>
              I orchestrate Codex through bounded goals, explicit authority, critique,
              verification, and human gates—not as an authorial stand-in.
            </p>
          </div>

          <dl className={styles.makingRoles}>
            <div data-orchestration-marker="D.01">
              <dt>
                <span>D.01</span> Drew / Direction and decision
              </dt>
              <dd>
                Set the audience and use boundaries, make product and presentation decisions, and
                approve the exact public representation when a human gate is required.
              </dd>
            </div>
            <div data-orchestration-marker="C.01">
              <dt>
                <span>C.01</span> Codex / Bounded execution
              </dt>
              <dd>
                Decompose milestones, research approved public sources, implement within exact
                scope, critique the UX, preserve failed attempts, and verify the result.
              </dd>
            </div>
            <div data-orchestration-marker="E.01">
              <dt>
                <span>E.01</span> One concrete turn / BurnLens release surface
              </dt>
              <dd>
                For BurnLens, I bounded the release to one repository and directed it to Codex
                Sites. Codex assembled a canonical reviewer path, rechecked source and claim
                boundaries, and verified the production result. A local preview and two
                social-card attempts failed their gates, so they stayed rejected.
              </dd>
            </div>
            <div data-orchestration-marker="B.01">
              <dt>
                <span>B.01</span> Verified boundary
              </dt>
              <dd>
                The verified v0.56.0 release shipped without a bespoke social image and without
                rewriting the underlying evidence.
              </dd>
            </div>
          </dl>

          <p className={styles.makingBoundary}>
            This demonstrates a bounded human–Codex workflow—not autonomous authorship,
            independent user testing, or universal design superiority.
          </p>
          <nav className={styles.makingLinks} aria-label="Portfolio-making evidence">
            <a
              href={orchestrationBuildHref}
              target="_blank"
              rel="noreferrer"
              data-source-id="burnlens-pinned-tree"
            >
              Inspect public build record <span className="sr-only">(opens in a new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>
            <a
              href={burnlensReleaseHref}
              target="_blank"
              rel="noreferrer"
              data-source-id="burnlens-release"
            >
              Inspect v0.56.0 release <span className="sr-only">(opens in a new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          </nav>
        </aside>
      </header>

      <section data-front-door-flagships aria-labelledby="selected-work-title">
        <article
          className={styles.burnlens}
          data-flagship-teaser="burnlens"
          data-project-model-id={burnlens.id}
          data-visual-world={burnlens.visualWorld}
        >
          <div className={`shell ${styles.teaserInner}`}>
            <div className={styles.teaserCopy}>
              <p className={styles.sequence}>Flagship 01 / release-governance evidence system</p>
              <p className={styles.maturity}>{evidenceSummary("burnlens", "maturity")}</p>
              <h3>{burnlens.title}</h3>
              <p className={styles.problem}>{evidenceSummary("burnlens", "problem")}</p>
              <dl className={styles.projectLedger}>
                <div>
                  <dt>My role</dt>
                  <dd>{evidenceSummary("burnlens", "personalRole")}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd>{evidenceSummary("burnlens", "outcome")}</dd>
                </div>
                <div>
                  <dt>Limit</dt>
                  <dd>{evidenceSummary("burnlens", "limitations")}</dd>
                </div>
              </dl>
              <Link
                className={styles.caseLink}
                href={burnlens.route}
                aria-label="Read BurnLens case study"
              >
                Read BurnLens case study <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AtlasFigure />
          </div>
        </article>

        <article
          className={styles.runbook}
          data-flagship-teaser="runbook-sentinel"
          data-project-model-id={runbook.id}
          data-visual-world={runbook.visualWorld}
        >
          <div className={`shell ${styles.teaserInner}`}>
            <div className={styles.teaserCopy}>
              <p className={styles.sequence}>Flagship 02 / synthetic incident-response testbed</p>
              <p className={styles.maturity}>{evidenceSummary("runbook-sentinel", "maturity")}</p>
              <h3>{runbook.title}</h3>
              <p className={styles.problem}>{evidenceSummary("runbook-sentinel", "problem")}</p>
              <dl className={styles.projectLedger}>
                <div>
                  <dt>My role</dt>
                  <dd>{evidenceSummary("runbook-sentinel", "personalRole")}</dd>
                </div>
                <div>
                  <dt>Decision</dt>
                  <dd>{evidenceSummary("runbook-sentinel", "decisionSupported")}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd>{evidenceSummary("runbook-sentinel", "outcome")}</dd>
                </div>
                <div>
                  <dt>Limit</dt>
                  <dd>{evidenceSummary("runbook-sentinel", "limitations")}</dd>
                </div>
              </dl>
              <FeaturedTurn failure={runbookTurn} source={runbookTurnSource} />
              <Link
                className={styles.caseLink}
                href={runbook.route}
                aria-label="Read Runbook Sentinel case study"
              >
                Read Runbook Sentinel case study <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ControlTraceFigure />
          </div>
        </article>
      </section>

      <section
        className={`shell ${styles.supporting}`}
        data-supporting-notes
        aria-labelledby="supporting-title"
      >
        <header>
          <p className={styles.eyebrow}>Supporting notes / deliberately smaller</p>
          <h2 id="supporting-title">Two focused studies, without borrowed flagship weight.</h2>
          <p>
            These shorter field notes show bounded interaction and documentation work. Each is
            designed only from what its public evidence supports.
          </p>
        </header>

        <div className={styles.supportingList}>
          <article data-project-model-id={quest.id}>
            <p className={styles.noteMaturity}>{evidenceSummary("quest-craft", "maturity")}</p>
            <h3>{quest.title}</h3>
            <p>{evidenceSummary("quest-craft", "problem")}</p>
            <dl>
              <div>
                <dt>For</dt>
                <dd>{evidenceSummary("quest-craft", "intendedUser")}</dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>{evidenceSummary("quest-craft", "personalRole")}</dd>
              </div>
              <div>
                <dt>Authority</dt>
                <dd>{evidenceSummary("quest-craft", "decisionSupported")}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{evidenceSummary("quest-craft", "outcome")}</dd>
              </div>
              <div>
                <dt>Boundary</dt>
                <dd>{evidenceSummary("quest-craft", "limitations")}</dd>
              </div>
            </dl>
            <p className={styles.supportBoundary} data-support-boundary>
              Public reviewer snapshot only. No private stack or general child safety claim is
              established.
            </p>
            <Link href={quest.route} aria-label="Read Quest Craft field note">
              Read Quest Craft field note →
            </Link>
          </article>

          <article data-project-model-id={openclaw.id}>
            <p className={styles.noteMaturity}>
              {evidenceSummary("openclaw-showcase", "maturity")}
            </p>
            <h3>{openclaw.title}</h3>
            <p>{evidenceSummary("openclaw-showcase", "problem")}</p>
            <dl>
              <div>
                <dt>My role</dt>
                <dd>{evidenceSummary("openclaw-showcase", "personalRole")}</dd>
              </div>
              <div>
                <dt>Public boundary</dt>
                <dd>{evidenceSummary("openclaw-showcase", "decisionSupported")}</dd>
              </div>
              <div>
                <dt>Public artifact</dt>
                <dd>{evidenceSummary("openclaw-showcase", "implementation")}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{evidenceSummary("openclaw-showcase", "outcome")}</dd>
              </div>
              <div>
                <dt>Boundary</dt>
                <dd>{evidenceSummary("openclaw-showcase", "limitations")}</dd>
              </div>
            </dl>
            <p className={styles.supportBoundary} data-support-boundary>
              Public documentation artifact only. The private runtime was not inspected or
              evaluated; no runtime capability, intended user, or failure dividend is established.
            </p>
            <Link href={openclaw.route} aria-label="Read OpenClaw Showcase field note">
              Read OpenClaw Showcase field note →
            </Link>
          </article>
        </div>

        <Link className={styles.archiveLink} href="/work#historical-reading">
          Earlier coursework stays on the quiet historical reading shelf <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section
        className={styles.capabilityBoundary}
        data-capability-boundary="energy-ee"
        aria-labelledby="capability-title"
      >
        <div className="shell">
          <p className={styles.eyebrow}>Hiring direction / evidence boundary</p>
          <h2 id="capability-title">Software first. Physical-world problems in view.</h2>
          <div className={styles.boundaryCopy}>
            <p>
              I’m looking for software roles where verification, physical-world context, and clear
              technical communication matter—especially in climate and energy infrastructure.
            </p>
            <p>
              Energy is historical governance context and a direction of interest—not evidence of
              an implemented energy system. The current work does not yet establish electrical
              engineering, controls, embedded, power-systems, or hardware implementation experience.
            </p>
          </div>
        </div>
      </section>

      <section className={`shell ${styles.closing}`} aria-labelledby="closing-title">
        <p className={styles.eyebrow}>Next conversation</p>
        <h2 id="closing-title">Bring me the system whose limits need to be legible.</h2>
        <p>
          The most interesting work is rarely certainty theater. It is the work of making evidence,
          authority, failure, and recovery inspectable enough for someone else to trust the result.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/resume">
            Review the résumé
          </Link>
          <a
            className={styles.secondaryAction}
            href="https://www.linkedin.com/in/william-baker-843946162/"
            target="_blank"
            rel="noreferrer"
          >
            Connect on LinkedIn <span className="sr-only">(opens in a new tab)</span>
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
