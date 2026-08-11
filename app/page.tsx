import Image from "next/image";
import Link from "next/link";

import { EvidenceSpine } from "@/components/editorial/EvidenceSpine";
import { HistoricalCourseworkShelf } from "@/components/editorial/HistoricalCourseworkShelf";
import { projects } from "@/content/projects";
import { getSiteOrigin } from "@/lib/site-origin";

const burnlens = projects.burnlens;
const runbook = projects.runbookSentinel;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "William (Drew) Baker",
  url: getSiteOrigin(),
  sameAs: [
    "https://github.com/drwbkr1",
    "https://www.linkedin.com/in/william-baker-843946162/",
  ],
  knowsAbout: [
    "software engineering",
    "geospatial analysis",
    "machine learning evaluation",
    "climate risk",
    "energy data governance",
  ],
};

function HeroPrinciple() {
  return (
    <>
      <p className="plate-label">Field note 00 / working principle</p>
      <EvidenceSpine
        id="01"
        claim="Useful systems should show their work."
        evidence="Two released, inspectable flagships pair implementation with evaluation evidence."
        boundary="No production, operational, or real-world authority claim without proof."
      />
      <p className="spine-note">
        Claim, evidence, and boundary travel together throughout this portfolio.
      </p>
    </>
  );
}

export default function HomePage() {
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }}
      />

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Software systems · geospatial intelligence · energy &amp; risk</p>
          <h1 id="hero-title">
            I build evidence-bound systems <em>for uncertain terrain.</em>
          </h1>
          <p className="hero-deck">
            I design and test software, geospatial workflows, and risk-aware decision tools—from
            wildfire evidence to incident-agent safety and energy policy.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href="#selected-work">
              Explore the work <span aria-hidden="true">↓</span>
            </a>
            <Link className="button button-secondary" href="/resume">
              Read the résumé <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <dl className="audience-ledger" aria-label="Areas of work">
            <div>
              <dt>01 / Build</dt>
              <dd>Software &amp; systems</dd>
            </div>
            <div>
              <dt>02 / Observe</dt>
              <dd>Climate &amp; geospatial</dd>
            </div>
            <div>
              <dt>03 / Govern</dt>
              <dd>Energy &amp; risk</dd>
            </div>
          </dl>
        </div>

        <div className="hero-spine hero-spine-desktop">
          <HeroPrinciple />
        </div>

        <details className="hero-principle-mobile">
          <summary>
            <span>Field note 00</span>
            <strong>Inspect the working principle</strong>
            <span aria-hidden="true">+</span>
          </summary>
          <div className="hero-principle-panel">
            <HeroPrinciple />
          </div>
        </details>
      </section>

      <section className="selected-work" id="selected-work" aria-labelledby="selected-title">
        <div className="shell section-heading">
          <div>
            <p className="eyebrow">Selected work / 2026</p>
            <h2 id="selected-title">Two systems. Different terrain. The same demand for proof.</h2>
          </div>
          <p>
            Each case study begins with the decision and works backward through evidence, tradeoffs,
            and what the result does not establish.
          </p>
        </div>

        <nav className="shell mobile-flagship-index" aria-label="Flagship case studies">
          <Link href={burnlens.href}>
            <span>01</span>
            <strong>{burnlens.title}</strong>
            <small>Baseline retained · model rejected</small>
          </Link>
          <Link href={runbook.href}>
            <span>02</span>
            <strong>{runbook.title}</strong>
            <small>Authority separated · model excluded</small>
          </Link>
        </nav>

        <div className="shell flagship-grid">
          <article className="flagship flagship-burnlens" id="burnlens">
            <Link className="flagship-media" href={burnlens.href} aria-label={`Read ${burnlens.title} case study`}>
              <Image
                src="/media/projects/burnlens/ward-creek-overlay.png"
                alt="BurnLens Ward Creek evidence map with two bounded RBR footprints and official context."
                fill
                sizes="(max-width: 900px) 100vw, 52vw"
              />
              <span className="media-index">PLATE B.01</span>
            </Link>
            <div className="flagship-copy">
              <div className="project-meta">
                <span>Climate · computer vision · GEOINT</span>
                <span>{burnlens.status}</span>
              </div>
              <h3>{burnlens.title}</h3>
              <p className="project-thesis">{burnlens.thesis}</p>
              <dl className="proof-line">
                {burnlens.proof.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="project-links">
                <Link className="text-link" href={burnlens.href}>
                  Read case study <span aria-hidden="true">→</span>
                </Link>
                <a className="quiet-link" href={burnlens.sourceHref} target="_blank" rel="noreferrer">
                  Inspect source <span className="sr-only">(opens in a new tab)</span> ↗
                </a>
              </div>
            </div>
          </article>

          <article className="flagship flagship-runbook" id="runbook-sentinel">
            <Link
              className="flagship-media runbook-media"
              href={runbook.href}
              aria-label={`Read ${runbook.title} case study`}
            >
              <Image
                src="/media/projects/runbook-sentinel/dashboard-baseline-0020.png"
                alt="Runbook Sentinel baseline 0020 dashboard showing evaluation pass, exact coverage metrics, an authenticated external-operator boundary, and disconnected real infrastructure."
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <span className="media-index">TRACE R.20</span>
            </Link>
            <div className="flagship-copy">
              <div className="project-meta">
                <span>Software · SRE safety · evaluation</span>
                <span>{runbook.status}</span>
              </div>
              <h3>{runbook.title}</h3>
              <p className="project-thesis">{runbook.thesis}</p>
              <dl className="proof-line">
                {runbook.proof.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="project-links">
                <Link className="text-link" href={runbook.href}>
                  Read case study <span aria-hidden="true">→</span>
                </Link>
                <a className="quiet-link" href={runbook.sourceHref} target="_blank" rel="noreferrer">
                  Inspect v0.0.20 source <span className="sr-only">(opens in a new tab)</span> ↗
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="method-section shell" aria-labelledby="method-title">
        <div className="method-intro">
          <p className="eyebrow">Working method</p>
          <h2 id="method-title">Source. Bound. Build. Test. Explain.</h2>
          <p>
            I am interested in the part after the demo: what the system can actually support, how it
            fails, and whether another person can inspect the path to the result.
          </p>
        </div>
        <ol className="method-list">
          <li><span>01</span><strong>Source</strong><p>Establish provenance, rights, and the exact question.</p></li>
          <li><span>02</span><strong>Bound</strong><p>Separate evidence, authority, and uncertainty.</p></li>
          <li><span>03</span><strong>Build</strong><p>Prefer inspectable components and deterministic behavior.</p></li>
          <li><span>04</span><strong>Test</strong><p>Keep failures, held-out checks, and release evidence visible.</p></li>
          <li><span>05</span><strong>Explain</strong><p>Design the artifact so technical and public audiences can review it.</p></li>
        </ol>
      </section>

      <section className="secondary-section" aria-labelledby="secondary-title">
        <div className="shell secondary-grid">
          <div className="secondary-intro">
            <p className="eyebrow">Adjacent evidence</p>
            <h2 id="secondary-title">Interaction and governance need evidence too.</h2>
            <p>
              Supporting work stays concise until its authorship, rights, implementation, and
              evaluation can carry a designed case study. These two cleared that bar narrowly.
            </p>
          </div>
          <div className="secondary-list">
            {projects.secondary.map((project, index) => (
              <article className="secondary-item" key={project.title}>
                <span className="item-number">0{index + 1}</span>
                <div>
                  <p className="project-kind">{project.kind}</p>
                  <h3>{project.title}</h3>
                  <p>{project.thesis}</p>
                </div>
                {project.href ? (
                  <Link href={project.href} aria-label={`Read the ${project.title} case study`}>
                    Read <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <a
                    href={project.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${project.title} review evidence in a new tab`}
                  >
                    Inspect <span aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="coursework-shelf-section">
        <HistoricalCourseworkShelf className="shell" />
      </div>

      <section className="closing shell" aria-labelledby="closing-title">
        <p className="plate-label">Next question / collaboration</p>
        <h2 id="closing-title">Need someone who is comfortable making the limits visible?</h2>
        <p>
          I am interested in software, energy, and climate work where reliability and clear technical
          communication matter as much as the first result.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/resume">Review the résumé</Link>
          <a className="button button-secondary" href="https://www.linkedin.com/in/william-baker-843946162/" target="_blank" rel="noreferrer">
            Connect on LinkedIn <span className="sr-only">(opens in a new tab)</span> ↗
          </a>
        </div>
      </section>
    </main>
  );
}
