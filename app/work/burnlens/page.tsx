import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EvidenceSpine } from "../../../components/burnlens/EvidenceSpine";
import { CaseChapterDisclosure } from "../../../components/CaseChapterDisclosure";
import { burnlensEvidenceBinding } from "../../../content/projects";
import styles from "./page.module.css";

const warning =
  "Experimental BurnLens CV output. Not official wildfire information. Not emergency guidance. Not evacuation, routing, tactical, or incident-command support. Official sources govern.";

export const metadata: Metadata = {
  title: "BurnLens — Baseline-first wildfire evidence",
  description:
    "A source-backed case study of BurnLens: a bounded computer-vision-to-GEOINT workflow that retained a deterministic baseline and published a reproducible model rejection.",
  applicationName: "Drew Baker — Portfolio",
  keywords: [
    "BurnLens",
    "computer vision",
    "GEOINT",
    "wildfire screening",
    "geospatial software",
    "model evaluation",
    "evidence systems",
  ],
  alternates: {
    canonical: "/work/burnlens",
  },
  openGraph: {
    title: "BurnLens — Baseline-first wildfire evidence",
    description:
      "A bounded, reproducible wildfire-screening case study where the baseline stayed and the model failure remained visible.",
    url: "/work/burnlens",
    siteName: "Drew Baker — Portfolio",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "BurnLens — Baseline-first wildfire evidence",
    description:
      "A bounded wildfire-screening case study that makes accepted, rejected, and official-context evidence inspectable.",
  },
};

const steps = [
  {
    number: "01",
    title: "Source",
    text: "Version pre- and post-event Sentinel-2 optical evidence and keep official context traceable to its own authority.",
  },
  {
    number: "02",
    title: "Bound",
    text: "Preserve owner-reviewed prototype regions and exclude unknown, invalid, nodata, and non-binary pixels from the loss and metrics.",
  },
  {
    number: "03",
    title: "Compare",
    text: "Freeze a whole-event split, apply train-only normalization, and compare one bounded six-channel U-Net with deterministic RBR thresholding.",
  },
  {
    number: "04",
    title: "Translate",
    text: "Carry the accepted RBR result into native-grid rasters, vectors, overlays, and bounded descriptive context for Ward Creek.",
  },
  {
    number: "05",
    title: "Package",
    text: "Bind claims, checksums, limitations, and replay instructions into immutable evidence packages and a repository-owned review surface.",
  },
];

const burnlensSourceRoot =
  `https://github.com/drwbkr1/burnlens-deschutes/blob/${burnlensEvidenceBinding.snapshotCommit}`;

const failureTransects = [
  {
    id: "BL.F01",
    marker: "Failure 01",
    title: "The model replayed—and still was not useful",
    failed:
      "Training, evaluation, and exact replay passed. The U-Net still predicted all 89 selected test cores as burned; macro Dice was 0.299.",
    changed:
      "Reject the U-Net as the analytical winner. Keep it as diagnostic evidence; use relative burn ratio for the Ward Creek evidence package.",
    claimable:
      "One reproducible candidate was measured and rejected at a sealed selected-core gate. RBR remained the selected bounded method.",
    boundary:
      "General U-Net inferiority, natural-prevalence performance, field validation, complete-scar accuracy, or generalized method superiority.",
    sourceHref: `${burnlensSourceRoot}/samples/runs/phase-four/burnlens-ward-creek-rbr-run-v0.1.0/REPORT.md`,
    sourceLabel: "Model decision report",
  },
  {
    id: "BL.F02",
    marker: "Failure 02",
    title: "Context mismatch",
    failed:
      "One accepted Ward Creek candidate footprint covered 66.76 hectares but had no overlap with the separate federal MTBS fire-perimeter record.",
    changed:
      "Treat the federal record as context, not ground truth. Keep the mismatch visible as a warning about possible false positives.",
    claimable:
      "The review surface exposes disagreement instead of converting an official reference layer into model truth.",
    boundary:
      "That the candidate footprint is definitely wrong or definitely a burn scar, or that the federal layer is independent ground truth for these prototype regions.",
    sourceHref: `${burnlensSourceRoot}/samples/runs/phase-four/burnlens-ward-creek-rbr-run-v0.1.0/REPORT.md`,
    sourceLabel: "Ward Creek report",
  },
  {
    id: "BL.F03",
    marker: "Failure 03",
    title: "The validator passed a broken package",
    failed:
      "The first failure-injection run incorrectly passed a package whose method, route, and run identity were wrong. A partial package also escaped as an uncontrolled missing-file crash.",
    changed:
      "Bind validation to the package manifest and turn missing archive members into controlled diagnoses; rerun all five invalid fixtures without changing canonical bytes.",
    claimable:
      "The corrected rerun rejected all five fixtures with exact diagnoses, created no path escape or accepted output, and revalidated the canonical package after each injection.",
    boundary:
      "Universal archive safety or validation of packages outside this exact package contract.",
    sourceHref: `${burnlensSourceRoot}/records/phase-five/failure-injections/PHASE-FIVE-FAILURE-INJECTION-RECORD-2026-001.json`,
    sourceLabel: "Validator test record",
  },
] as const;

const chapters = [
  ["01", "Decision", "#decision"],
  ["02", "Method", "#method"],
  ["03", "Comparison", "#comparison"],
  ["04", "Evidence", "#evidence"],
  ["05", "Limits", "#limits"],
  ["06", "Sources", "#sources"],
] as const;

function ChapterList() {
  return (
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
  );
}

export default function BurnLensCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content">
        <article>
          <header className={styles.hero}>
            <div className={styles.heroIndex} aria-hidden="true">
              01
            </div>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                Climate systems · Released research prototype
              </p>
              <h1>A baseline earned the right to stay.</h1>
              <p className={styles.dek}>
                BurnLens is a bounded computer-vision-to-GEOINT workflow for
                wildfire screening. It tested one U-Net against deterministic
                relative-burn-ratio thresholding—and published the rejection
                instead of smoothing it away.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#evidence">
                  Inspect the evidence
                </a>
                <a
                  className={styles.secondaryAction}
                  href="https://github.com/drwbkr1/burnlens-deschutes"
                >
                  Open public repository <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <aside className={styles.heroLedger} aria-label="Project scope">
              <div>
                <span>Status</span>
                <strong>Released · v0.56.0</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>
                  End-to-end design, implementation, evaluation, and evidence
                  UX
                </strong>
              </div>
              <div>
                <span>Study area</span>
                <strong>Bounded Deschutes County, Oregon events</strong>
              </div>
              <div>
                <span>Boundary</span>
                <strong>Prototype evidence—not an operational product</strong>
              </div>
            </aside>
          </header>

          <nav
            className={styles.chapterIndex}
            data-case-chapter-index="burnlens"
            aria-label="BurnLens case study chapters"
          >
            <ChapterList />
          </nav>

          <CaseChapterDisclosure
            ariaLabel="BurnLens mobile case study chapters"
            chapters={chapters}
            className={styles.chapterDisclosure}
            projectId="burnlens"
          />

          <section className={styles.spineSection} id="decision" aria-labelledby="decision-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Decision record · 01</p>
              <h2 id="decision-heading">The result and its limit travel together.</h2>
            </div>
            <EvidenceSpine
              index="1"
              claim="The deterministic RBR baseline remained the accepted analytical method."
              evidence="One authorized sealed test opening recorded RBR Dice and IoU of 1.000; the bounded U-Net recorded event-class macro Dice of 0.299 and predicted all 89 selected cores as burned."
              boundary="The labels are owner-approved prototype cores, not independent ground truth. The two-event test does not establish natural prevalence, field validity, or generalization."
            />
          </section>

          <section className={styles.methodSection} id="method" aria-labelledby="method-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>System map · 02</p>
              <h2 id="method-heading">A chain of custody, not a magic model.</h2>
              <p>
                The project’s useful artifact is the evidence path: each
                transformation stays attributable, bounded, and reviewable.
              </p>
            </div>

            <ol className={styles.methodList}>
              {steps.map((step) => (
                <li key={step.number}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.comparisonSection} id="comparison" aria-labelledby="comparison-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Decision plate · 03</p>
              <h2 id="comparison-heading">Accepted, rejected, and official are different states.</h2>
              <p>
                The comparison is deliberately asymmetric. A valid training
                run can still fail its value gate, and official context is not
                recast as model truth.
              </p>
            </div>

            <div
              className={styles.tableScroller}
              role="region"
              aria-label="BurnLens method comparison; scroll horizontally on narrow screens"
              tabIndex={0}
            >
              <table className={styles.comparisonTable}>
                <caption>
                  Bounded v0.56.0 decision record, preserved in the post-release evidence snapshot
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Decision dimension</th>
                    <th scope="col">Accepted RBR</th>
                    <th scope="col">Rejected U-Net</th>
                    <th scope="col">Official context</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Portfolio status</th>
                    <td data-state="accepted">Analytical method</td>
                    <td data-state="rejected">Diagnostic only</td>
                    <td data-state="context">Separate authority</td>
                  </tr>
                  <tr>
                    <th scope="row">Bounded test record</th>
                    <td>Dice / IoU 1.000</td>
                    <td>Macro Dice 0.299; all 89 selected cores predicted burned</td>
                    <td>Not scored as model ground truth</td>
                  </tr>
                  <tr>
                    <th scope="row">Phase Four use</th>
                    <td>Accepted raster and vector evidence</td>
                    <td>Visible failure evidence</td>
                    <td>Reference and descriptive context</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableBoundary}>
              These scores describe one sealed selected-core test—not complete
              burn scars, population performance, or operational fitness.
            </p>
          </section>

          <section
            className={styles.evidenceSection}
            id="evidence"
            aria-labelledby="evidence-heading"
          >
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Evidence cabinet · 04</p>
              <h2 id="evidence-heading">Open the layer that supports the decision.</h2>
              <p>
                These native disclosure controls work without JavaScript. Each
                plate includes a readable summary and a full-resolution source
                so the evidence survives a narrow screen.
              </p>
            </div>

            <div className={styles.evidenceCabinet}>
              <details className={styles.evidenceDrawer} name="burnlens-evidence" open>
                <summary>
                  <span className={styles.drawerMarker}>E.01 · Accepted</span>
                  <span className={styles.drawerTitle}>The bounded baseline test</span>
                  <span className={styles.drawerMetric}>Dice / IoU 1.000</span>
                </summary>
                <div className={styles.drawerBody}>
                  <figure>
                    <div
                      className={styles.imageScroller}
                      role="region"
                      aria-label="Full-width baseline evaluation image; scroll horizontally on narrow screens"
                      tabIndex={0}
                    >
                      <Image
                        className={styles.evidenceImage}
                        src="/media/projects/burnlens/baseline-evaluation.png"
                        alt="BurnLens non-model baseline evaluation plate showing four selected test-core examples and the bounded result: event-class Dice and IoU of 1.000 under one sealed test opening."
                        width={1800}
                        height={1180}
                        sizes="(max-width: 720px) 760px, (max-width: 1200px) 92vw, 1120px"
                      />
                    </div>
                    <figcaption>
                      <span>E.01</span>
                      Four selected-core examples from the exact public
                      baseline plate. Red denotes errors only on prototype
                      cores; gray is excluded. The test includes two events.
                    </figcaption>
                  </figure>
                  <a
                    className={styles.fullResolution}
                    href="/media/projects/burnlens/baseline-evaluation.png"
                  >
                    Open the full-resolution baseline plate
                  </a>
                </div>
              </details>

              <details className={styles.evidenceDrawer} name="burnlens-evidence">
                <summary>
                  <span className={styles.drawerMarker}>E.02 · Rejected</span>
                  <span className={styles.drawerTitle}>The model failure stayed visible</span>
                  <span className={styles.drawerMetric}>Macro Dice 0.299</span>
                </summary>
                <div className={styles.drawerBody}>
                  <figure>
                    <div
                      className={styles.imageScroller}
                      role="region"
                      aria-label="Full-width model decision image; scroll horizontally on narrow screens"
                      tabIndex={0}
                    >
                      <Image
                        className={styles.evidenceImage}
                        src="/media/projects/burnlens/model-decision.png"
                        alt="Phase Three decision plate comparing model Dice 0.299 with relative-burn-ratio Dice 1.000 and recording the decision to reject the model as the analytical winner."
                        width={1800}
                        height={1120}
                        sizes="(max-width: 720px) 760px, (max-width: 1200px) 92vw, 1120px"
                      />
                    </div>
                    <figcaption>
                      <span>E.02</span>
                      Training and exact replay passed. The value gate did not:
                      the U-Net predicted every selected test core as burned,
                      so RBR remained the analytical method.
                    </figcaption>
                  </figure>
                  <a
                    className={styles.fullResolution}
                    href="/media/projects/burnlens/model-decision.png"
                  >
                    Open the full-resolution model decision
                  </a>
                </div>
              </details>

              <details className={styles.evidenceDrawer} name="burnlens-evidence">
                <summary>
                  <span className={styles.drawerMarker}>E.03 · Context</span>
                  <span className={styles.drawerTitle}>The accepted output meets its limits</span>
                  <span className={styles.drawerMetric}>Ward Creek</span>
                </summary>
                <div className={styles.drawerBody}>
                  <figure>
                    <div
                      className={styles.imageScroller}
                      role="region"
                      aria-label="Full-width Ward Creek overlay image; scroll horizontally on narrow screens"
                      tabIndex={0}
                    >
                      <Image
                        className={styles.evidenceImage}
                        src="/media/projects/burnlens/ward-creek-overlay.png"
                        alt="Ward Creek evidence plate mapping two accepted relative-burn-ratio candidate footprints against bounded MTBS, road, facility, and BLM context; the second footprint has no MTBS overlap and remains visible as possible false-positive evidence."
                        width={1600}
                        height={1000}
                        sizes="(max-width: 720px) 760px, (max-width: 1200px) 92vw, 1120px"
                      />
                    </div>
                    <figcaption>
                      <span>E.03</span>
                      The second Ward Creek candidate footprint covers 66.76
                      hectares and has no MTBS overlap. BurnLens keeps that
                      disagreement visible as possible false-positive evidence
                      instead of hiding it.
                    </figcaption>
                  </figure>
                  <a
                    className={styles.fullResolution}
                    href="/media/projects/burnlens/ward-creek-overlay.png"
                  >
                    Open the full-resolution Ward Creek overlay
                  </a>
                </div>
              </details>
            </div>
          </section>

          <section className={styles.failureSection} id="limits" aria-labelledby="failure-heading">
            <div className={styles.failureLead}>
              <p className={styles.sectionIndex}>Boundary register · 05</p>
              <h2 id="failure-heading">The misses narrowed the route.</h2>
              <p>
                A failed test earns space here only when it changes the analytical decision, the
                release control, or the claim itself.
              </p>
            </div>

            <ol className={styles.transectLedger} data-failure-dividend="burnlens">
              {failureTransects.map((record) => (
                <li className={styles.transectRecord} data-failure-dividend-record key={record.id}>
                  <header>
                    <span>{record.marker}</span>
                    <strong>{record.title}</strong>
                    <a href={record.sourceHref}>
                      {record.sourceLabel} <span aria-hidden="true">↗</span>
                    </a>
                  </header>
                  <div className={styles.transectStages}>
                    <div data-stage="failed">
                      <span>01 · What failed</span>
                      <p>{record.failed}</p>
                    </div>
                    <div data-stage="changed">
                      <span>02 · What changed</span>
                      <p>{record.changed}</p>
                    </div>
                    <div data-stage="claimable">
                      <span>03 · What became claimable</span>
                      <p>{record.claimable}</p>
                    </div>
                  </div>
                  <p className={styles.transectBoundary} data-boundary>
                    <strong>Outside this contour</strong>
                    {record.boundary}
                  </p>
                </li>
              ))}
            </ol>

            <div className={styles.limitGrid}>
              <div className={styles.failureBody}>
                <p className={styles.failureStatement}>The bounded result stays bounded.</p>
                <ul>
                  <li>
                    The dataset contains 12 native-grid patches across six events and 287 selected
                    prototype cores.
                  </li>
                  <li>
                    The one sealed test opening covers two events and 89 selected cores; it does not
                    estimate natural prevalence.
                  </li>
                  <li>
                    Owner-approved prototype regions are not independent ground truth or field
                    validation.
                  </li>
                  <li>
                    A perfect selected-core baseline score does not establish complete-scar
                    performance or generalization.
                  </li>
                </ul>
              </div>
              <aside className={styles.warning} aria-label="Mandatory BurnLens warning">
                <span className={styles.warningLabel}>Use boundary</span>
                <p>{warning}</p>
              </aside>
            </div>
          </section>

          <section className={styles.sourceSection} id="sources" aria-labelledby="sources-heading">
            <div className={styles.sectionLead}>
              <p className={styles.sectionIndex}>Source ledger · 06</p>
              <h2 id="sources-heading">Inspect the record, not just the story.</h2>
            </div>

            <div className={styles.sourceLedger} data-source-ledger="burnlens">
              <a
                href={`https://github.com/drwbkr1/burnlens-deschutes/tree/${burnlensEvidenceBinding.snapshotCommit}`}
              >
                <span>S.01 · Evidence snapshot</span>
                <strong>Post-release publication state</strong>
                <code>a741111d…</code>
              </a>
              <a
                href={`https://github.com/drwbkr1/burnlens-deschutes/releases/tag/${burnlensEvidenceBinding.releaseTag}`}
              >
                <span>S.02 · Tagged release</span>
                <strong>Baseline-first portfolio release</strong>
                <code>v0.56.0 · e2e0b778…</code>
              </a>
              <a href="https://burnlens-deschutes.drew-baker-15.chatgpt.site">
                <span>S.03 · Public surface</span>
                <strong>Repository-owned reviewer experience</strong>
                <code>mutable public surface</code>
              </a>
              <a href="/media/projects/burnlens/manifest.json">
                <span>S.04 · Media custody</span>
                <strong>Image provenance and checksums</strong>
                <code>NFA-BURNLENS-MEDIA-2026-001</code>
              </a>
            </div>

            <div className={styles.attribution}>
              <p>
                <strong>Commit binding.</strong> Release v0.56.0 is tagged at{" "}
                <code>e2e0b778…</code>. This case inspects <code>a741111d…</code>, four
                release-lifecycle and publication-sync commits later. The linked Ward Creek report
                and failure-injection record are unchanged across that interval.
              </p>
              <p>
                BurnLens-owned code and documentation: MIT License, Copyright
                © 2026 Drew Baker. Underlying third-party data and derived
                artifacts retain their separate notices and terms.
              </p>
              <ul>
                <li>Contains modified Copernicus Sentinel data 2019.</li>
                <li>
                  Map services and data available from U.S. Geological Survey,
                  National Geospatial Program.
                </li>
                <li>
                  Monitoring Trends in Burn Severity (MTBS), U.S. Geological
                  Survey and USDA Forest Service.
                </li>
              </ul>
            </div>
          </section>
        </article>
      </main>

      <nav className={styles.footer} aria-label="Case study navigation">
        <div>
          <span className={styles.footerIndex}>Next bearing</span>
          <Link className={styles.nextCase} href="/work/runbook-sentinel">
            <strong>Systems that stay bounded when evidence turns adversarial.</strong>
            <span>Open Runbook Sentinel →</span>
          </Link>
        </div>
        <Link href="/work">Return to the work index</Link>
      </nav>
    </div>
  );
}
