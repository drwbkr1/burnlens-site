import type { Metadata } from "next";
import Link from "next/link";

import {
  getProject,
  getProjectSource,
  getPublicSourceHref,
  getSupportedEvidence,
} from "../../../content/project-model";
import styles from "./page.module.css";

const project = getProject("openclaw-showcase");

const problem = getSupportedEvidence("openclaw-showcase", "problem")!;
const decisionSupported = getSupportedEvidence("openclaw-showcase", "decisionSupported")!;
const personalRole = getSupportedEvidence("openclaw-showcase", "personalRole")!;
const implementation = getSupportedEvidence("openclaw-showcase", "implementation")!;
const stack = getSupportedEvidence("openclaw-showcase", "stack")!;
const outcome = getSupportedEvidence("openclaw-showcase", "outcome")!;
const limitations = getSupportedEvidence("openclaw-showcase", "limitations")!;
const maturity = getSupportedEvidence("openclaw-showcase", "maturity")!;

const sourceRoot = getPublicSourceHref("openclaw.snapshot");
const workflowSourceHref = getPublicSourceHref("openclaw.workflow-doc");
const safetySourceHref = getPublicSourceHref("openclaw.safety-doc");
const receiptSourceHref = getPublicSourceHref("openclaw.receipt-doc");

export const metadata: Metadata = {
  title: "OpenClaw Showcase — Documentation without disclosure drift",
  description:
    "A frozen public documentation artifact with a conceptual workflow and sanitized representative receipt; the excluded runtime was not inspected or evaluated.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "OpenClaw Showcase",
    "technical documentation",
    "workflow documentation",
    "traceability",
    "human approval",
    "information boundaries",
  ],
  alternates: { canonical: "/work/openclaw-showcase" },
  openGraph: {
    title: "OpenClaw Showcase — Documentation without disclosure drift",
    description:
      "A public workflow model and disclosure boundary; the excluded runtime was not inspected or evaluated.",
    url: "/work/openclaw-showcase",
    siteName: "Drew Baker — Portfolio",
    type: "article",
    images: [
      {
        url: "/work/openclaw-showcase/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenClaw Showcase public documentation folio; the excluded runtime was not inspected or evaluated",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw Showcase — Documentation without disclosure drift",
    description:
      "A frozen public documentation artifact whose excluded runtime was not inspected or evaluated.",
    images: ["/work/openclaw-showcase/opengraph-image"],
  },
};

const firstScreenLedger = [
  ["Problem", "problem", problem.summary],
  ["Public decision boundary", "decisionSupported", decisionSupported.summary],
  ["My role", "personalRole", personalRole.summary],
  ["Public artifact", "implementation", implementation.summary],
  ["Result", "outcome", outcome.summary],
  ["Limit", "limitations", limitations.summary],
] as const;

const disclosureLayers = [
  {
    id: "public",
    number: "01",
    label: "Public",
    status: "Readable now",
    contentsLabel: "Available in the public source",
    contents: [
      "Workflow and review patterns",
      "Conceptual diagrams",
      "Sanitized representative receipt",
      "Claim and limitation discipline",
    ],
    boundary:
      "The documents explain an intended process. They do not show that the private runtime performed or enforced it.",
  },
  {
    id: "approval-gated",
    number: "02",
    label: "Approval-gated",
    status: "Human decision required",
    contentsLabel: "No item is authorized here",
    contents: [
      "Any private-derived screenshot or example",
      "Any claimed lesson about the excluded runtime",
      "Any capability statement",
      "Any new publication claim",
    ],
    boundary:
      "Nothing enters this layer by implication. Scope, provenance, safety, and publication authority require a separate exact review.",
  },
  {
    id: "private",
    number: "03",
    label: "Private / not inspected",
    status: "Outside this field note",
    contentsLabel: "Excluded from the public source",
    contents: [
      "Runtime code or configuration is not included",
      "Raw logs or exact traces are not included",
      "Credentials or live tool authority are not included",
      "Operational memory or private task history is not included",
    ],
    boundary:
      "This route neither inspects nor reconstructs the private layer. Its absence is not evidence about implementation quality.",
  },
] as const;

const workflowStages = [
  ["01", "Task", "Define the outcome, files, exclusions, risks, and human decision needed."],
  ["02", "Draft", "Prepare a bounded artifact in an isolated work state; polished still means draft."],
  ["03", "Trace", "Record intended inputs, outputs, checks, limits, and unresolved uncertainty."],
  ["04", "QA", "Review artifact quality and workflow quality as separate questions."],
  ["05", "Human decision", "Approve, revise, hold, or decline; release is never the automatic ending."],
] as const;

const receiptFields = [
  ["Identity", "Task type named · private identifier not included · draft status visible"],
  ["Scope", "Intended artifact and exclusions stated before interpretation"],
  ["Trace", "Inputs · intended outputs · checks · limitations"],
  ["Review", "Claim support · disclosure boundary · artifact status"],
  ["Disposition", "Human decision required before any public release"],
] as const;

const sourceFolio = [
  {
    id: "openclaw.snapshot",
    href: sourceRoot,
    label: "Public documentation repository",
    boundary: getProjectSource("openclaw.snapshot").claimBoundary,
  },
  {
    id: "openclaw.workflow-doc",
    href: workflowSourceHref,
    label: "Workflow model",
    boundary: getProjectSource("openclaw.workflow-doc").claimBoundary,
  },
  {
    id: "openclaw.safety-doc",
    href: safetySourceHref,
    label: "Boundary document",
    boundary: getProjectSource("openclaw.safety-doc").claimBoundary,
  },
  {
    id: "openclaw.receipt-doc",
    href: receiptSourceHref,
    label: "Representative receipt",
    boundary: getProjectSource("openclaw.receipt-doc").claimBoundary,
  },
] as const;

export default function OpenClawShowcaseCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article
          data-project-model-id={project.id}
          data-supporting-route="openclaw-showcase"
          data-visual-world="disclosure-folio"
        >
          <section
            className={styles.disclosureMovement}
            id="register"
            data-route-movement="disclosure-layers"
            data-supporting-movement="disclosure-layers"
            aria-labelledby="openclaw-title"
          >
            <header className={styles.hero}>
              <div className={styles.heroCopy}>
                <p className={styles.kicker}>
                  Supporting field note · <span data-project-field="maturity">{maturity.summary}</span>
                </p>
                <h1 id="openclaw-title">
                  OpenClaw Showcase
                  <span>The public record stops at the runtime boundary.</span>
                </h1>
                <p className={styles.dek}>
                  A disclosure-control case about making a private agent-workflow pattern
                  inspectable without pretending the public documents expose or prove its runtime.
                </p>
                <a
                  className={styles.snapshotAction}
                  href={sourceRoot}
                  data-source-id="openclaw.snapshot"
                >
                  Exact public snapshot <span aria-hidden="true">↗</span>
                </a>
              </div>

              <aside className={styles.heroFolio} aria-label="OpenClaw disclosure summary">
                <header>
                  <span>Disclosure folio</span>
                  <strong>Public boundary · frozen snapshot</strong>
                </header>
                <ol className={styles.folioLayers}>
                  <li data-layer="public">
                    <span>01</span>
                    <strong>Public</strong>
                    <small>Workflow · review · limits</small>
                  </li>
                  <li data-layer="gated">
                    <span>02</span>
                    <strong>Approval-gated</strong>
                    <small>Interpretation · claims · release</small>
                  </li>
                  <li data-layer="private">
                    <span>03</span>
                    <strong>Not inspected</strong>
                    <small>Excluded runtime · no capability claim</small>
                  </li>
                </ol>
                <p className={styles.folioResult}>
                  Eight public documents, nine conceptual diagrams, a five-stage workflow model,
                  and one sanitized representative receipt make the disclosure boundary inspectable.
                </p>
              </aside>
            </header>

            <dl className={styles.firstScreenLedger} data-first-screen-ledger="openclaw-showcase">
              {firstScreenLedger.map(([label, field, value]) => (
                <div data-project-field={field} key={field}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.movementLead}>
              <p className={styles.movementLabel}>Movement one · Disclosure layers</p>
              <h2>Three filters prevent disclosure drift.</h2>
              <p>
                Each layer is an independent native disclosure. Open any combination to compare
                the public record, the approval gate, and the material that remains private.
              </p>
            </div>

            <div
              className={styles.layerRegister}
              data-disclosure-register
              data-source-id="openclaw.safety-doc"
            >
              {disclosureLayers.map((layer) => (
                <details
                  data-disclosure-layer={layer.id}
                  open
                  key={layer.id}
                >
                  <summary>
                    <span>{layer.number}</span>
                    <strong>{layer.label}</strong>
                    <em>{layer.status}</em>
                  </summary>
                  <div className={styles.layerBody}>
                    <p className={styles.layerContentsLabel}>{layer.contentsLabel}</p>
                    <ul>
                      {layer.contents.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className={styles.layerBoundary}>{layer.boundary}</p>
                  </div>
                </details>
              ))}
            </div>

          </section>

          <section
            className={styles.workflowMovement}
            id="workflow"
            data-route-movement="workflow-receipt-anatomy"
            data-supporting-movement="workflow-receipt-anatomy"
            aria-labelledby="workflow-title"
          >
            <header className={styles.movementHeader}>
              <div>
                <p className={styles.movementLabel}>Movement two · Workflow and receipt</p>
                <h2 id="workflow-title">The draft never promotes itself.</h2>
              </div>
              <p>
                The public documents describe a five-stage review pattern. Only the final human
                decision may change an artifact&apos;s authority or release state.
              </p>
            </header>

            <p className={styles.formatBoundary} data-project-field="stack">
              {stack.summary}
            </p>

            <div
              className={styles.conceptualWorkflow}
              data-conceptual-workflow
              data-source-id="openclaw.workflow-doc"
            >
              <p className={styles.modelWarning}>
                Conceptual public workflow model · not an execution trace
              </p>
              <ol>
                {workflowStages.map(([number, title, description]) => (
                  <li key={number}>
                    <span>{number}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className={styles.workflowBoundary}>
                This sequence is documentary process design—not a benchmark, production
                architecture, runtime log, or verification of private controls.
              </p>
            </div>

            <div className={styles.receiptAnatomy} id="receipt">
              <header>
                <p className={styles.movementLabel}>Receipt anatomy</p>
                <h3>Traceability without the raw trace.</h3>
                <p>
                  This portfolio-native abstraction paraphrases one public, source-owned example.
                  It does not reproduce source prose or operational detail, and it does not record
                  an actual run.
                </p>
              </header>

              <figure
                className={styles.receiptFigure}
                data-receipt-anatomy
                data-source-id="openclaw.receipt-doc"
              >
                <div className={styles.receiptPaper}>
                  <header>
                    <div>
                      <span>Representative receipt</span>
                      <strong>Public-safe artifact preparation</strong>
                    </div>
                    <em>Sanitized · not raw export</em>
                  </header>
                  <dl>
                    {receiptFields.map(([label, value], index) => (
                      <div key={label}>
                        <dt>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {label}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className={styles.redactionBand}>
                    <span>Operational details are outside the public example</span>
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                  </div>
                </div>

                <aside className={styles.receiptWarnings} aria-label="Representative receipt limits">
                  <strong>Read the receipt as anatomy only.</strong>
                  <dl>
                    <div>
                      <dt>Sanitized</dt>
                      <dd>No identifiers or operational details are included.</dd>
                    </div>
                    <div>
                      <dt>Representative</dt>
                      <dd>The example shows a document pattern, not an actual event.</dd>
                    </div>
                    <div>
                      <dt>Documentary</dt>
                      <dd>The fields do not prove that a runtime produced or enforced them.</dd>
                    </div>
                  </dl>
                </aside>

                <figcaption>
                  Sanitized representative example—not a raw export, actual-run receipt, or proof
                  of runtime behavior.
                </figcaption>
              </figure>
            </div>
          </section>

          <section
            className={styles.boundaryMovement}
            id="limits"
            data-route-movement="boundary-source-folio"
            data-supporting-movement="boundary-source-folio"
            aria-labelledby="boundary-title"
          >
            <header className={styles.movementHeader}>
              <div>
                <p className={styles.movementLabel}>Movement three · Boundary and sources</p>
                <h2 id="boundary-title">A public artifact, with the runtime left out.</h2>
              </div>
              <p>
                The design value is the boundary itself: a reader can inspect what is documented,
                what still requires approval, and what the evidence cannot establish.
              </p>
            </header>

            <div className={styles.boundarySpread}>
              <div className={styles.boundaryPanel} data-source-id="openclaw.safety-doc">
                <p>
                  The private runtime was not inspected or evaluated; this route establishes no
                  runtime quality, capability, failure dividend, or intended user.
                </p>
                <ul>
                  <li>No private runtime, configuration, raw log, or exact trace was inspected.</li>
                  <li>The workflow model does not prove that a real execution followed it.</li>
                  <li>The disclosure layers do not prove technical access enforcement.</li>
                  <li>The representative receipt is not an actual-run record.</li>
                  <li>No autonomy, deployment, reliability, benchmark, security, or production claim is made.</li>
                  <li>Public visibility is not an open-source license or general reuse grant.</li>
                </ul>
                <p className={styles.missingBoundary}>
                  The public snapshot does not establish an intended user, test strategy, failure
                  dividend, or source-bound current next step.
                </p>
              </div>
            </div>

            <div className={styles.sourceSection} id="sources">
              <header>
                <p className={styles.movementLabel}>Exact source folio</p>
                <h3>Four links, one frozen documentary boundary.</h3>
              </header>
              <nav className={styles.sourceFolio} data-source-folio aria-label="OpenClaw public evidence sources">
                {sourceFolio.map((source, index) => (
                  <a href={source.href} data-source-id={source.id} key={source.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{source.label}</strong>
                    <small>{source.boundary}</small>
                  </a>
                ))}
              </nav>
              <p className={styles.rightsNote}>
                This route uses factual paraphrase and original code-native composition under the
                repository owner&apos;s direction. It copies no source-project badge, private-derived
                material, commit email metadata, or third-party asset. The public repository has no
                detected license, so these links provide evidence—not general reuse permission.
              </p>
            </div>

            <footer className={styles.returnLink}>
              <Link href="/work">
                <span aria-hidden="true">←</span>
                Return to all work
              </Link>
            </footer>
          </section>
        </article>
      </main>
    </div>
  );
}
