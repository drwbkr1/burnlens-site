import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getProject, getPublicSourceHref, getSupportedEvidence, toReaderFirst, type ProjectEvidence, type ProjectId } from "@/content/project-model";
import { getSiteOrigin } from "@/lib/site-origin";
import { ProjectCarousel } from "@/components/ProjectCarousel";
import { LeadFigure } from "./work/after-the-tip/ribbon-figure";
import styles from "./home.module.css";

const title = "Drew Baker | Software, maps & interactive experiences";
const description = "Drew Baker turns data and complex ideas into usable software, maps and interactive experiences through product direction, research and Codex-assisted development.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: "Drew Baker Portfolio", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { title, description, card: "summary_large_image", images: ["/opengraph-image"] },
};

const burnlens = getProject("burnlens");
const runbook = getProject("runbook-sentinel");
function evidenceSummary(projectId: ProjectId, field: keyof ProjectEvidence<ProjectId>) {
  const evidence = getSupportedEvidence(projectId, field);
  if (!evidence) throw new Error(`Homepage projection requires supported ${projectId}.${field}.`);
  return toReaderFirst(evidence.summary);
}
const orchestrationBuildHref = "https://github.com/drwbkr1/burnlens-deschutes/blob/a741111d82e69689022d2058118ed8f4b9bf3546/records/prompt-build-log/2026-07-27-p6o1-t02.md#L26-L69";
const burnlensReleaseHref = getPublicSourceHref("burnlens-release");
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "William (Drew) Baker",
  alternateName: "Drew Baker",
  url: getSiteOrigin(),
  description,
  sameAs: ["https://github.com/drwbkr1", "https://www.linkedin.com/in/william-baker-843946162/"],
  knowsAbout: ["software development", "product direction", "geospatial analysis", "data visualization", "interactive experiences"],
};

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


function ReleaseDetails({ projectId }: { projectId: "burnlens" | "runbook-sentinel" }) {
  return <details className={styles.releaseDetails} data-home-project-details>
    <summary>Release details</summary>
    <p>{evidenceSummary(projectId, "maturity")}</p>
    <dl className={styles.projectLedger}>
      <div><dt>My role</dt><dd>{evidenceSummary(projectId, "personalRole")}</dd></div>
      <div><dt>Result</dt><dd>{evidenceSummary(projectId, "outcome")}</dd></div>
      <div><dt>Limit</dt><dd>{evidenceSummary(projectId, "limitations")}</dd></div>
    </dl>
  </details>;
}

const projectNames = ["Wildfire Response", "After the Tip", "West Hawaiʻi heat exposure", "Nepal Satellite Atlas", "BurnLens", "Runbook Sentinel"] as const;

export default function HomePage() {
  return (
    <main id="main-content" className={styles.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }} />
      <section className={`shell ${styles.hero}`} aria-labelledby="hero-title">
        <svg className={styles.contours} viewBox="0 0 1200 900" aria-hidden="true" focusable="false" fill="none">
          <path d="M80 890C-60 640 110 515 250 395S305 150 525 75 755 130 835-55" /><path d="M170 900C20 660 190 540 325 410S385 205 570 140 800 185 900-25" />
          <path d="M275 925C100 730 260 595 415 465S455 265 640 210 870 240 970 20" /><path d="M365 940C190 770 355 635 485 515S565 350 700 290 950 345 1040 65" />
          <path d="M445 945C290 830 435 695 580 565S625 425 775 375 1020 400 1110 125" /><path d="M525 940C395 865 520 750 650 635S715 505 850 460 1080 480 1190 195" />
        </svg>
        <div className={styles.heroCopy}>
          <p className={styles.identity}>Drew Baker / personal portfolio</p>
          <p className={styles.eyebrow}>Software · maps · interactive experiences</p>
          <h1 id="hero-title">I turn data and complex ideas into <em>usable software.</em></h1>
          <p className={styles.deck}>My work brings together software, maps and interactive experiences. I set the direction, make product decisions and work with Codex to develop and refine the result.</p>
          <nav className={styles.actions} aria-label="Primary actions">
            <a className={styles.primaryAction} href="#selected-work">Explore the work <span aria-hidden="true">↓</span></a>
            <Link className={styles.secondaryAction} href="/resume">Read the résumé <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </section>

      <ProjectCarousel projectNames={projectNames}>
        <article className={styles.projectSlide} data-carousel-slide="wildfire-response" data-current-project="wildfire-response" aria-roledescription="slide" aria-label="1 of 6 · Wildfire Response">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Cooperative game / Handshake</p><h3>Wildfire Response</h3>
            <p className={styles.projectSummary} data-contribution>A cooperative browser game about protecting a community with limited resources. I shaped the product direction and used my first playtest to refine the map, controls and consequences.</p>
            <p className={styles.projectStatus}>Playable prototype · evolving</p>
            <Link className={styles.caseLink} href="/work/wildfire-response">Explore Wildfire Response <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}>
            <figure className={styles.gameFigure}>
              <Image src="/media/projects/wildfire-response/planning-v027.jpg" alt="Historical Wildfire Response planning screen with a terrain map, community sites and resource controls." width={1279} height={631} unoptimized />
              <figcaption>Historical v0.27 synthetic development fixture · gameplay disabled · AI-assisted terrain art.</figcaption>
            </figure>
          </div>
        </article>
        <article className={styles.projectSlide} data-carousel-slide="after-the-tip" data-current-project="after-the-tip" aria-roledescription="slide" aria-label="2 of 6 · After the Tip">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Data + sound / NCAA challenge exploration</p><h3>After the Tip</h3>
            <p className={styles.projectSummary} data-contribution>I redirected a score catalogue into a shared-clock comparison of Purdue’s games and a screened NCAA season, refining the question and sound direction.</p>
            <p className={styles.projectStatus}>Exploratory challenge prototype · not submitted</p>
            <Link className={styles.caseLink} href="/work/after-the-tip">Explore After the Tip <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}>
            <div className={styles.basketballFigures}><LeadFigure cohort="purdue" compact /><LeadFigure cohort="all" compact /></div>
            <p className={styles.visualNote}>Mean positive lead contribution · points per game · regulation only. Descriptive means, not confidence intervals. Purdue’s games are included in the season; the above/below orientations differ, not a team-strength comparison.</p>
          </div>
        </article>
        <article className={styles.projectSlide} data-carousel-slide="west-hawaii-heat-exposure" data-current-project="west-hawaii-heat-exposure" aria-roledescription="slide" aria-label="3 of 6 · West Hawaiʻi heat exposure">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Environmental GIS / ASM540 term project</p><h3>Heat exposure across<br /><em>West Hawaiʻi reefs.</em></h3>
            <p className={styles.projectSummary} data-contribution>I framed an environmental question and worked through GIS choices to compare satellite heat exposure over historical reef habitat. The saved comparison challenged my starting hypothesis.</p>
            <p className={styles.projectStatus}>Regional comparison mapped · research in progress</p>
            <Link className={styles.caseLink} href="/work/west-hawaii-heat-exposure">Explore West Hawaiʻi heat exposure <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}>
            <figure className={styles.reefFigure}>
              <div className={styles.reefMaps}>
                <div><span>2015</span><Image src="/media/projects/west-hawaii-heat-exposure/heat-exposure-2015.svg" alt="2015 saved coastal grid: assessed habitat cells share the highest annual peak heat-stress class; unavailable cells are hatched." width={480} height={1160} unoptimized /></div>
                <div><span>2019</span><Image src="/media/projects/west-hawaii-heat-exposure/heat-exposure-2019.svg" alt="2019 saved coastal grid: the same historical habitat has a mix of annual peak heat-stress classes; unavailable cells are hatched." width={480} height={1160} unoptimized /></div>
              </div>
              <figcaption>Saved data-only redraws · annual peak satellite heat exposure over historical habitat—not observed reef condition. Read the full maps and NOAA source credits in the case study.</figcaption>
            </figure>
          </div>
        </article>
        <article className={styles.projectSlide} data-carousel-slide="nepal-satellite-atlas" data-current-project="nepal-satellite-atlas" aria-roledescription="slide" aria-label="4 of 6 · Nepal Satellite Atlas">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Satellite data / editable ArcGIS atlas</p><h3>Nepal Satellite Atlas</h3>
            <p className={styles.projectSummary} data-contribution>I defined an ArcGIS atlas I could open, compare and export, then guided its maps and browser presentation.</p>
            <p className={styles.projectStatus}>Exploratory GIS · local atlas and maps</p>
            <Link className={styles.caseLink} href="/work/nepal-satellite-atlas">Explore Nepal Satellite Atlas <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}>
            <figure className={styles.nepalFigure}>
              <Image src="/media/projects/nepal-satellite-atlas/dated-radar-atlas.png" alt="Full paired radar atlas for 16 and 28 August 2026, with a shared display scale, dates, partial coverage and source credits." width={1560} height={1020} unoptimized />
              <figcaption>Unregistered visual experiment—not a mapped landslide result.<br />ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.</figcaption>
            </figure>
          </div>
        </article>
        <article className={styles.projectSlide} data-carousel-slide="burnlens" data-flagship-teaser="burnlens" data-project-model-id={burnlens.id} data-visual-world={burnlens.visualWorld} aria-roledescription="slide" aria-label="5 of 6 · BurnLens">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Flagship 01 / experimental research portfolio</p><h3>{burnlens.title}</h3>
            <p className={styles.problem}>Making a research release readable.</p>
            <p className={styles.projectSummary} data-contribution>I set the audience and public story for an experimental computer-vision and geospatial project, then owned the publication decisions.</p>
            <p className={styles.projectStatus}>Public v0.56.0 research portfolio release</p>
            <ReleaseDetails projectId="burnlens" />
            <Link className={styles.caseLink} href={burnlens.route} aria-label="Read BurnLens case study">Read BurnLens case study <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}><AtlasFigure /></div>
        </article>
        <article className={styles.projectSlide} data-carousel-slide="runbook-sentinel" data-flagship-teaser="runbook-sentinel" data-project-model-id={runbook.id} data-visual-world={runbook.visualWorld} aria-roledescription="slide" aria-label="6 of 6 · Runbook Sentinel">
          <div className={styles.projectCopy}>
            <p className={styles.eyebrow}>Flagship 02 / synthetic software testbed</p><h3>{runbook.title}</h3>
            <p className={styles.problem}>Making incident response easier to inspect.</p>
            <p className={styles.projectSummary} data-contribution>I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act, and owned its release.</p>
            <p className={styles.projectStatus}>Released synthetic testbed · no real systems connected</p>
            <ReleaseDetails projectId="runbook-sentinel" />
            <Link className={styles.caseLink} href={runbook.route} aria-label="Read Runbook Sentinel case study">Read Runbook Sentinel case study <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.projectMedia}><ControlTraceFigure /></div>
        </article>
      </ProjectCarousel>

      <section className={`shell ${styles.dashboardEntry}`} aria-labelledby="dashboard-title">
        <div><p className={styles.eyebrow}>On my workbench</p><h2 id="dashboard-title">Follow the work.</h2><p>A selected, dated view of five projects: what is recorded, what is taking shape and what is still open. Checklist counts describe listed tasks, not effort or whole-project completion.</p></div>
        <Link className={styles.dashboardLink} href="/dashboard">Open project dashboard <span aria-hidden="true">→</span></Link>
      </section>
      <section className={`shell ${styles.makingLedger}`} data-portfolio-making aria-labelledby="portfolio-making-title">
        <h2 id="portfolio-making-title">How I work</h2>
        <p className={styles.makingThesis}>I shape the question, decide what the result needs to do and refine it through use. Codex assists with research, implementation and testing; my contribution is direction, product decisions and review.</p>
        <details className={styles.makingDetails}>
          <summary>Direction + development</summary>
          <dl className={styles.makingRoles}>
            <div data-orchestration-marker="D.01"><dt>Drew / Direction and decisions</dt><dd>Choose the problem, set the audience, critique the experience and own decisions about what to share.</dd></div>
            <div data-orchestration-marker="C.01"><dt>Codex / Development assistance</dt><dd>Help research, build and test the work within the direction I set. The case studies describe that collaboration rather than imply sole manual implementation.</dd></div>
          </dl>
          <nav className={styles.makingLinks} aria-label="Portfolio-making evidence"><a href={orchestrationBuildHref} target="_blank" rel="noreferrer" data-source-id="burnlens-pinned-tree">BurnLens public build record <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a><a href={burnlensReleaseHref} target="_blank" rel="noreferrer" data-source-id="burnlens-release">v0.56.0 release <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a></nav>
        </details>
      </section>
    </main>
  );
}
