import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

const sourceCommit = "3695666f6a44c095674049e64d23f0bdace2fb70";
const sourceRoot = `https://github.com/drwbkr1/openclaw-showcase/tree/${sourceCommit}`;

export const metadata: Metadata = {
  title: "OpenClaw Showcase — Documentation without disclosure drift",
  description:
    "A documentary case study about making an agent-workflow pattern inspectable while keeping private runtime authority, configuration, and raw traces out of frame.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "OpenClaw Showcase",
    "technical documentation",
    "AI workflow design",
    "traceability",
    "human approval",
    "information boundaries",
  ],
  alternates: { canonical: "/work/openclaw-showcase" },
  openGraph: {
    title: "OpenClaw Showcase — Documentation without disclosure drift",
    description:
      "Public workflow model. Approval-gated interpretation. Private runtime. The boundary is the case study.",
    url: "/work/openclaw-showcase",
    siteName: "Drew Baker — Portfolio",
    type: "article",
    images: [
      {
        url: "/work/openclaw-showcase/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenClaw Showcase — public documentation, approval-gated interpretation, private runtime",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw Showcase — Documentation without disclosure drift",
    description:
      "A public-boundary case about documenting workflow patterns without pretending to expose or prove the runtime.",
    images: ["/work/openclaw-showcase/opengraph-image"],
  },
};

const chapters = [
  ["01", "Register", "#register"],
  ["02", "Workflow", "#workflow"],
  ["03", "Receipt", "#receipt"],
  ["04", "Limits", "#limits"],
  ["05", "Sources", "#sources"],
] as const;

const boundaryLayers = [
  {
    marker: "01",
    label: "Public",
    status: "Readable now",
    allowed: [
      "Workflow and review patterns",
      "Conceptual diagrams",
      "Sanitized representative receipts",
      "Claim and limitation discipline",
    ],
    boundary:
      "Public documentation explains an intended process. It is not evidence that the private runtime performed or enforced it.",
  },
  {
    marker: "02",
    label: "Approval-gated",
    status: "Human decision required",
    allowed: [
      "New public-facing case studies",
      "Private-derived screenshots or examples",
      "High-level runtime lessons",
      "Any capability or publication claim",
    ],
    boundary:
      "These subjects remain withheld unless an exact review establishes scope, provenance, safety, and publication authority.",
  },
  {
    marker: "03",
    label: "Private",
    status: "Outside the showcase",
    allowed: [
      "Runtime code and configuration",
      "Raw logs and exact traces",
      "Credentials and live tool authority",
      "Operational memory and private task history",
    ],
    boundary:
      "The portfolio route neither inspects nor reconstructs this layer. Absence from view is not evidence about its implementation quality.",
  },
] as const;

const workflow = [
  ["01", "Task", "Define the outcome, files, exclusions, risks, and human decision needed."],
  ["02", "Draft", "Produce a bounded artifact in an isolated work state; polished still means draft."],
  ["03", "Trace", "Record what was attempted, involved, checked, limited, and left uncertain."],
  ["04", "QA", "Review the artifact and the process for scope, support, status, and disclosure risk."],
  ["05", "Human decision", "Approve, revise, hold, or decline; publication is not the default ending."],
] as const;

const receiptNotes = [
  ["01", "Identity", "Names the task type and artifact state without exposing a private task identifier."],
  ["02", "Scope", "Separates intended work from exclusions before a result is interpreted."],
  ["03", "Trace", "Records inputs, intended outputs, checks, and known limits—not raw operational logs."],
  ["04", "Review", "Keeps artifact quality and workflow quality as separate questions."],
  ["05", "Disposition", "Leaves the final state with a human: approve, revise, hold, or decline."],
] as const;

export default function OpenClawShowcaseCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Documentation systems · Supporting case study</p>
              <h1>
                Make the process legible. <em>Keep authority out of frame.</em>
              </h1>
              <p className={styles.dek}>
                OpenClaw Showcase is a public documentation layer for a private agent-harness
                project. It explains how work may move from task to draft, trace, QA, and human
                decision—without publishing runtime code, raw logs, credentials, or live tool
                authority.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#register">
                  Open the transparency register
                </a>
                <a className={styles.secondaryAction} href={sourceRoot}>
                  Exact public snapshot <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className={styles.roleNote}>
                Drew authored and designed the public documentation layer. This case makes no
                claim about authorship, inspection, or performance of the excluded runtime.
              </p>
            </div>

            <aside className={styles.heroFolio} aria-label="OpenClaw disclosure layers">
              <div className={styles.folioHeading}>
                <span>Transparency register</span>
                <strong>Public boundary / exact snapshot</strong>
              </div>
              <div className={styles.folioStack} aria-hidden="true">
                <div data-layer="public">
                  <span>Public</span>
                  <strong>Workflow · review · limits</strong>
                  <i />
                  <i />
                  <i />
                </div>
                <div data-layer="gated">
                  <span>Approval-gated</span>
                  <strong>Interpretation · release · capability</strong>
                  <i />
                  <i />
                  <i />
                </div>
                <div data-layer="private">
                  <span>Private</span>
                  <strong>Runtime · traces · authority</strong>
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <dl className={styles.folioLedger}>
                <div>
                  <dt>Public files</dt>
                  <dd>8 Markdown documents</dd>
                </div>
                <div>
                  <dt>Workflow models</dt>
                  <dd>9 conceptual diagrams</dd>
                </div>
                <div>
                  <dt>Runtime artifacts shown</dt>
                  <dd>0</dd>
                </div>
              </dl>
              <p>
                The documents describe workflow patterns. They do not prove runtime execution,
                reliability, autonomy, deployment, or technical enforcement.
              </p>
            </aside>
          </header>

          <nav className={styles.chapterIndex} aria-label="OpenClaw Showcase case study chapters">
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

          <section className={styles.registerSection} id="register" aria-labelledby="register-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Transparency register · 01</p>
              <h2 id="register-heading">Three filters prevent disclosure drift.</h2>
              <p>
                Open each native disclosure to inspect what the public documents place in that
                layer. The categories are documentation rules, not proof of software-enforced
                access control.
              </p>
            </div>

            <div className={styles.layerRegister}>
              {boundaryLayers.map((layer, index) => (
                <details name="openclaw-boundary" open={index === 0} key={layer.marker}>
                  <summary>
                    <span>{layer.marker}</span>
                    <strong>{layer.label}</strong>
                    <em>{layer.status}</em>
                  </summary>
                  <div className={styles.layerBody}>
                    <div>
                      <span>Contents</span>
                      <ul>
                        {layer.allowed.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <p>{layer.boundary}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.workflowSection} id="workflow" aria-labelledby="workflow-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Public workflow model · 02</p>
              <h2 id="workflow-heading">The draft never promotes itself.</h2>
              <p>
                The public documentation describes a five-stage review pattern. Each handoff
                changes the artifact’s status, but only the final human decision may expand its
                authority or release state.
              </p>
            </div>

            <ol className={styles.workflowStrip}>
              {workflow.map(([number, title, text]) => (
                <li key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <p className={styles.workflowBoundary}>
              Documentary status: conceptual workflow model from the frozen public repository.
              It is not an execution trace, benchmark, production architecture, or verification
              of private-runtime controls.
            </p>
          </section>

          <section className={styles.receiptSection} id="receipt" aria-labelledby="receipt-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Receipt anatomy · 03</p>
              <h2 id="receipt-heading">Traceability without the raw trace.</h2>
              <p>
                The source includes one sanitized representative receipt. This portfolio-native
                abstraction explains its anatomy without repeating its underlying case material
                or pretending it records an actual private run.
              </p>
            </div>

            <figure className={styles.receiptFigure}>
              <article className={styles.receiptPaper} aria-label="Annotated representative receipt anatomy">
                <header>
                  <div>
                    <span>Representative receipt</span>
                    <strong>Public-safe artifact preparation</strong>
                  </div>
                  <em>Sanitized · not raw export</em>
                </header>
                <dl>
                  <div data-note="01">
                    <dt>Identity</dt>
                    <dd>Task type named · private identifier withheld · draft status visible</dd>
                  </div>
                  <div data-note="02">
                    <dt>Scope</dt>
                    <dd>Intended artifact and exclusions stated before interpretation</dd>
                  </div>
                  <div data-note="03">
                    <dt>Trace</dt>
                    <dd>Inputs · intended outputs · checks · limitations</dd>
                  </div>
                  <div data-note="04">
                    <dt>QA</dt>
                    <dd>Claim support · boundary review · status review</dd>
                  </div>
                  <div data-note="05">
                    <dt>Disposition</dt>
                    <dd>Human decision required before public release</dd>
                  </div>
                </dl>
                <div className={styles.redactedFields} aria-label="Private operational fields intentionally omitted">
                  <span>Private operational fields omitted</span>
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                </div>
              </article>

              <ol className={styles.receiptNotes}>
                {receiptNotes.map(([number, title, text]) => (
                  <li key={number}>
                    <span>{number}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <figcaption>
                Sanitized representative example—not a raw export, actual-run receipt, or proof
                of runtime behavior.
              </figcaption>
            </figure>
          </section>

          <section className={styles.boundarySection} id="limits" aria-labelledby="limits-heading">
            <div>
              <p className={styles.sectionIndex}>Claim boundary · 04</p>
              <h2 id="limits-heading">What this documentation cannot establish.</h2>
            </div>
            <ul>
              <li>No private runtime, configuration, raw log, or exact trace was inspected.</li>
              <li>The documented workflow does not prove that a real execution followed it.</li>
              <li>The three disclosure layers are not evidence of technical access enforcement.</li>
              <li>The representative receipt is not an actual-run record.</li>
              <li>No autonomy, deployment, reliability, security, benchmark, or production claim is made.</li>
              <li>The public repository has no detected license; visibility is not a general reuse grant.</li>
            </ul>
          </section>

          <section className={styles.sourceSection} id="sources" aria-labelledby="sources-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Source ledger · 05</p>
              <h2 id="sources-heading">Inspect the documents at their frozen commit.</h2>
              <p>
                Every claim on this page is bounded to the public documentation snapshot. No
                mutable runtime surface or private repository is linked or implied.
              </p>
            </div>

            <div className={styles.sourceLedger}>
              <a href={sourceRoot}>
                <span>S.01 · Exact snapshot</span>
                <strong>Public documentation repository</strong>
                <code>3695666f…</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/openclaw-showcase/blob/${sourceCommit}/docs/agentic-studio-workflow.md`}
              >
                <span>S.02 · Workflow</span>
                <strong>Task through human decision</strong>
                <code>public workflow model</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/openclaw-showcase/blob/${sourceCommit}/docs/safety-boundaries.md`}
              >
                <span>S.03 · Boundaries</span>
                <strong>Public, gated, and private rules</strong>
                <code>documentation policy</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/openclaw-showcase/blob/${sourceCommit}/examples/sanitized-run-receipt.md`}
              >
                <span>S.04 · Example</span>
                <strong>Sanitized representative receipt</strong>
                <code>not an actual-run record</code>
              </a>
            </div>
            <p className={styles.rightsNote}>
              This treatment uses original code-native layouts and factual paraphrase under the
              repository owner’s direction. It copies no badges, private-derived material,
              commit metadata, or third-party assets.
            </p>
          </section>
        </article>
      </main>

      <nav className={styles.caseNavigation} aria-label="Portfolio case study navigation">
        <Link href="/work/quest-craft">
          <span>Previous supporting case</span>
          Quest Craft — agency after the unexpected choice
        </Link>
        <Link href="/work">
          <span>All work</span>
          Return to the project index
        </Link>
      </nav>
    </div>
  );
}
