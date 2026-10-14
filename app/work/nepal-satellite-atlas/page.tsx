import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Nepal Satellite Atlas",
  description: "Drew Baker's exploratory GIS project: turning dated satellite views into an editable ArcGIS atlas and a browser comparison.",
  alternates: { canonical: "/work/nepal-satellite-atlas" },
  robots: { index: false, follow: false },
};

const imagePath = "/media/projects/nepal-satellite-atlas/dated-radar-atlas.png";
const sourceRoot = "https://github.com/drwbkr1/nepal-2026-before-after-map";
const sourceSnapshot = `${sourceRoot}/blob/89aa2ca1eb11c47b2b4f9b435bf8c35868123e2d`;

export default function NepalSatelliteAtlasPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.opening}>
        <p className={styles.eyebrow}>Environmental GIS / Exploratory work</p>
        <div className={styles.hero}>
          <h1>Nepal<br />Satellite <em>Atlas.</em></h1>
          <div className={styles.intro}>
            <p className={styles.dek}>From satellite scenes<br />to an ArcGIS atlas.</p>
            <p>I wanted a spatial project I could open and export in ArcGIS. That requirement shaped an editable atlas and a browser comparison for exploring two dated satellite views.</p>
            <p>The question began with a Nepal before-and-after study. The useful result is a GIS workspace for looking closely, comparing dates and carrying the maps into further work.</p>
            <a className={styles.textLink} href="#dated-views">See the dated map <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <dl className={styles.roleStrip}>
          <div><dt>My contribution</dt><dd>Research and product direction</dd></div>
          <div><dt>Implementation</dt><dd>Codex-assisted GIS and software</dd></div>
          <div><dt>Working formats</dt><dd>ArcGIS Pro · satellite imagery · browser comparison</dd></div>
        </dl>
      </header>

      <section id="dated-views" className={styles.mapSection} aria-labelledby="map-title">
        <header className={styles.mapHeading}>
          <div><p className={styles.eyebrow}>01 / The actual map</p><h2 id="map-title">Two dates.<br /><em>A shared frame.</em></h2></div>
          <div><p>16 August and 28 August 2026.<br />Sentinel-1D radar · VV gamma0 · ArcGIS export.</p><p className={styles.experiment}>Unverified GIS experiment</p></div>
        </header>
        <figure className={styles.mapFigure} data-nepal-map>
          <Image src={imagePath} alt="Complete paired ArcGIS radar map of the Nepal study area: 16 August 2026 on the left and 28 August on the right, using the same minus 30 to 0 dB scale. Blank regions are excluded data. Dates, legend, north arrows and kilometre scales remain visible." width={1560} height={1020} sizes="(max-width: 600px) calc(100vw - 2rem - 2px), min(calc(100vw - 3rem - 2px), calc(88rem - 2px))" loading="eager" />
          <figcaption>
            <p>Existing dated imagery, arranged on one projected frame. This is an unregistered visual comparison—not a mapped landslide result. Blank regions are exclusions, not proof of no change.</p>
            <a href={imagePath} target="_blank" rel="noreferrer">Open full-size map <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
          </figcaption>
        </figure>
        <p className={styles.credit}>ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.</p>
      </section>

      <section className={styles.decisions} aria-labelledby="decisions-title">
        <header><p className={styles.eyebrow}>02 / What shaped the work</p><h2 id="decisions-title">Build a map<br />I can work with.</h2><p>I set the research direction and the ArcGIS outcome, then guided successive presentation decisions. Codex assisted with the GIS and software implementation.</p></header>
        <div className={styles.decisionList}>
          <article><span aria-hidden="true">01</span><div><h3>Make it a spatial project.</h3><p>The atlas carries projected layers, layouts and source information into ArcGIS. PNG and PDF exports serve the reader; editable maps and layer files serve the next GIS session.</p></div></article>
          <article><span aria-hidden="true">02</span><div><h3>Compare the same place.</h3><p>The public browser companion synchronizes two dated views. A swipe divider and date-only modes make comparison deliberate, while the shared display range keeps the image treatment consistent.</p></div></article>
          <article><span aria-hidden="true">03</span><div><h3>Let the empty areas stay empty.</h3><p>Radar coverage is incomplete. The maps retain those gaps rather than filling them with a convincing-looking result. Dates, scale and source credit travel with the image.</p></div></article>
        </div>
      </section>

      <section className={styles.outcome} aria-labelledby="outcome-title">
        <div><p className={styles.eyebrow}>03 / What came out of it</p><h2 id="outcome-title">An atlas built to be<br /><em>opened, compared<br />and exported.</em></h2></div>
        <div className={styles.outcomeCopy}>
          <p>The current local handoff brings together ten maps, six layouts and eight reusable layer files, with PNG/PDF exports, an ArcGIS package and source/history tables.</p>
          <p>The paired image above and the browser demonstration are already part of the source project’s public presentation. The newer integrated handoff remains local work; this page does not publish that package or the optical pilot.</p>
          <p>What this shows about my work: I can turn an environmental question into a concrete spatial deliverable, define how it should be used, and keep revising the presentation when the first view does not answer the question.</p>
          <p className={styles.lesson}>Before interpreting physical change, I would need independently supported alignment and stronger coverage.</p>
        </div>
      </section>

      <section className={styles.notesSection} aria-labelledby="notes-title">
        <h2 id="notes-title" className="sr-only">Map methods and sources</h2>
        <details className={styles.notes}>
          <summary><span className={styles.summaryLabel}>Read the map methods and limits</span><span className={styles.toggle} aria-hidden="true">+</span></summary>
          <div className={styles.notesBody}>
            <h3>What the imagery displays</h3>
            <p>The two acquisitions are Sentinel-1D, 16 and 28 August 2026, processed with ASF HyP3 radiometric terrain correction. The display uses VV gamma0 in decibels, EPSG:32645 (WGS 84 / UTM zone 45N), and the same −30 to 0 dB black-to-white range. No new processing or image arithmetic was performed for this portfolio page.</p>
            <p>Blank areas exclude layover, radar shadow or NoData. The original image remains intact, including its legend, true-north arrows, projected-distance bars and qualifications. A distance bar or 10 m source posting does not establish positional accuracy.</p>
            <table>
              <caption>Common-valid VV/VH coverage of the full search/review areas</caption>
              <thead><tr><th scope="col">Area</th><th scope="col">Common-valid fraction</th></tr></thead>
              <tbody><tr><th scope="row">Source-area AOI</th><td>54.6721%</td></tr><tr><th scope="row">Upper-corridor AOI</th><td>75.7928%</td></tr></tbody>
            </table>
            <p>These fractions describe common-valid VV/VH coverage; the image displays VV alone. Both original full-area screening dispositions remain deferred. Coverage is not a measure of alignment or change.</p>
            <h3>What it does not establish</h3>
            <p>Registration is unverified. A brighter or darker patch does not by itself establish terrain movement, landslide damage or event attribution. Scientific admission remains unresolved. The ArcGIS package was exercised on the same machine, not accepted as clean-machine or cross-version portability.</p>
            <h3>Sources and processing credit</h3>
            <ul className={styles.sourceList}>
              <li><a href={`${sourceSnapshot}/docs/GIS_DEMONSTRATION.md`} target="_blank" rel="noreferrer">GIS demonstration — imagery, methods and credits<span className="sr-only"> (opens in a new tab)</span> ↗</a></li>
              <li><a href={`${sourceSnapshot}/docs/GIS_SWIPE_VIEWER.md`} target="_blank" rel="noreferrer">Browser comparison — controls and display boundary<span className="sr-only"> (opens in a new tab)</span> ↗</a></li>
              <li><a href="https://doi.org/10.5281/zenodo.3962581" target="_blank" rel="noreferrer">HyP3 processing environment DOI<span className="sr-only"> (opens in a new tab)</span> ↗</a></li>
              <li><a href="https://doi.org/10.5281/zenodo.3962936" target="_blank" rel="noreferrer">HyP3 GAMMA plugin DOI<span className="sr-only"> (opens in a new tab)</span> ↗</a></li>
            </ul>
            <p>No field validation, hazard guidance or agency endorsement is claimed.</p>
          </div>
        </details>
      </section>

      <footer className={styles.caseFooter}>
        <Link href="/work">Back to selected work <span aria-hidden="true">←</span></Link>
        <a href={sourceRoot} target="_blank" rel="noreferrer">Explore the public atlas project <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
      </footer>
    </main>
  );
}
