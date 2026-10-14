import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allHabitatHa, assessedHabitatHa, exposureClasses, exposureRows } from "./exposure-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Heat exposure across West Hawaiʻi reefs",
  description: "Drew Baker's environmental GIS study: connecting satellite heat stress to historical reef habitat, with research framing, spatial decisions and a saved two-year comparison.",
  alternates: { canonical: "/work/west-hawaii-heat-exposure" },
  robots: { index: false, follow: false },
};

function Legend() {
  return (
    <ul className={styles.legend} aria-label="Annual maximum DHW classes in degrees Celsius-weeks">
      {exposureClasses.map(item => <li key={item.key}><i aria-hidden="true" className={item.key === "unknown" ? styles.unknown : undefined} style={{ backgroundColor: item.color }} /><span>{item.label}</span></li>)}
    </ul>
  );
}

function HabitatComparison() {
  return (
    <figure className={styles.areaFigure} data-habitat-comparison>
      <figcaption><strong>Share of all mapped reef/hardbottom area</strong><span>Annual maximum DHW class · same {allHabitatHa.toLocaleString("en-US", { maximumFractionDigits: 2 })} ha denominator in each year</span></figcaption>
      {[2015, 2019].map(year => {
        const rows = exposureClasses.flatMap(item => exposureRows.filter(row => row.year === year && row.key === item.key));
        return <div key={year} className={styles.areaYear}>
          <h3>{year}</h3>
          <div>
            <div className={styles.bar} aria-hidden="true">{rows.map(row => <span key={row.key} data-exposure-class={row.key} className={row.key === "unknown" ? styles.unknown : undefined} style={{ width: `${row.all}%`, backgroundColor: exposureClasses.find(item => item.key === row.key)!.color }} />)}</div>
            <ul className={styles.barLabels} aria-label={`${year} mapped habitat shares`}>{rows.map(row => <li key={row.key}><span>{exposureClasses.find(item => item.key === row.key)!.label}</span><strong>{row.all.toFixed(1)}%</strong></li>)}</ul>
          </div>
        </div>;
      })}
      <p>17.0% has no valid DHW in either year. It stays in the denominator and has its own hatched class—it is not treated as low exposure.</p>
    </figure>
  );
}

export default function WestHawaiiHeatExposurePage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.opening}>
        <p className={styles.eyebrow}>Environmental GIS / ASM540 term project</p>
        <div className={styles.hero}>
          <h1>Heat exposure<br />across West<br /><em>Hawaiʻi reefs.</em></h1>
          <div className={styles.intro}>
            <p className={styles.question}>What happens when an ocean-scale signal meets a coastal habitat map?</p>
            <p>I chose to study where satellite heat stress intersects mapped reef and hardbottom habitat—and whether 2019 exposed more area than 2015.</p>
            <p>The work connects a climate question to a spatial comparison, then leaves room for the result to challenge the starting idea.</p>
            <a className={styles.textLink} href="#maps">Explore the two-year comparison <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <dl className={styles.roleStrip}>
          <div><dt>My contribution</dt><dd>Research framing and guided GIS analysis</dd></div>
          <div><dt>Working methods</dt><dd>ArcGIS Pro · satellite data · spatial joins</dd></div>
          <div><dt>Current stage</dt><dd>Regional comparison mapped; logger and forecast analyses next</dd></div>
        </dl>
      </header>

      <section className={styles.decisions} aria-labelledby="decisions-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>01 / The spatial decisions</p><h2 id="decisions-title">Make the comparison<br />mean something.</h2></header>
        <div className={styles.decisionList}>
          <article><span aria-hidden="true">01</span><div><h3>Start with the coast, not the table.</h3><p>I noticed that the first fishnet did not cover the study area. I worked through a longitude correction in a guided ArcGIS workflow, then checked coastal coverage before continuing. Each satellite cell needed to stay tied to a real location.</p></div></article>
          <article><span aria-hidden="true">02</span><div><h3>Compare habitat area, not just cell counts.</h3><p>A cell containing a sliver of mapped habitat should not carry the same habitat weight as one containing much more. The GIS workflow intersects historical reef/hardbottom polygons with the grid, then sums hectares by heat-stress class.</p></div></article>
          <article><span aria-hidden="true">03</span><div><h3>Keep missing heat data visible.</h3><p>Eight of the 51 habitat-containing cells have no valid DHW. I keep their mapped area separate from the low-exposure class so the comparison does not turn missing information into a reassuring result.</p></div></article>
        </div>
      </section>

      <section className={styles.mapSection} id="maps" aria-labelledby="maps-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>02 / The saved regional comparison</p><h2 id="maps-title">Two years.<br /><em>The same coast.</em></h2><p>Both maps use the same cell geometry, extent and class scale. Filled cells contain historical mapped reef/hardbottom; the remaining grid is outline-only context.</p></header>
        <div className={styles.legendHeading}><span>Annual maximum DHW <span className={styles.unit}>(°C-weeks)</span></span><Legend /></div>
        <div className={styles.maps}>
          {([2015, 2019] as const).map(year => <figure key={year} data-reef-map={year}>
            <header><h3>{year}</h3><span>{year === 2015 ? "43" : "34"} habitat cells in the ≥8 class</span></header>
            <Image src={`/media/projects/west-hawaii-heat-exposure/heat-exposure-${year}.svg`} alt={year === 2015 ? "West Hawaiʻi coastal grid in 2015: all 43 assessed habitat cells are in the 8-or-above annual maximum DHW class; eight unavailable cells are hatched." : "Same coastal grid in 2019: 34 habitat cells at 8 or above, four at 4 to below 8, five below 4, and eight unavailable cells hatched."} width={480} height={1160} unoptimized sizes="(max-width: 650px) calc(100vw - 40px), 42vw" />
            <figcaption>{year === 2015 ? "Assessed habitat cells share the highest class." : "The same coast has a mix of assessed classes."} Coarse satellite cells are not individual reef measurements.</figcaption>
          </figure>)}
        </div>
        <p className={styles.mapNote}>Data-only cartography redrawn from the saved ArcGIS layers. NAD83 / UTM zone 5N; arrows indicate grid north. No basemap or inferred coastline. These cell maps show annual peak class, not heat-stress duration.</p>
        <HabitatComparison />
        <details className={styles.method}>
          <summary>Read the values and what the map can tell us</summary>
          <p>DHW (Degree Heating Weeks) accumulates qualifying heat stress over a rolling 12-week period. These classes use each cell’s annual maximum. They describe satellite heat exposure, not observed coral bleaching, mortality or recovery.</p>
          <p>The grid has 330 cells; 51 contain mapped reef/hardbottom. The habitat layer was published in 2007 from 2004–06 imagery, so this is historical mapped habitat—not present coral cover. Cell colours classify heat stress; the bars weight those classes by intersected habitat area, not by coloured map area.</p>
          <p>All mapped habitat: {allHabitatHa.toLocaleString("en-US", { maximumFractionDigits: 2 })} ha. Assessed habitat: {assessedHabitatHa.toLocaleString("en-US", { maximumFractionDigits: 2 })} ha. The assessed percentage excludes the unavailable area; the all-habitat percentage retains it. Values below are rounded independently.</p>
          <div className={styles.tableWrap}>
            <table>
              <caption>Saved habitat-area comparison — annual maximum DHW (°C-weeks)</caption>
              <thead><tr><th scope="col">Year / class</th><th scope="col">Cells</th><th scope="col">Area (ha)</th><th scope="col">All habitat</th><th scope="col">Assessed only</th></tr></thead>
              <tbody>{exposureRows.map(row => <tr key={`${row.year}-${row.key}`}><th scope="row">{row.year} · {exposureClasses.find(item => item.key === row.key)!.label}</th><td>{row.cells}</td><td>{row.ha.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td><td>{row.all.toFixed(2)}%</td><td>{row.assessed === null ? "Not assessed" : `${row.assessed.toFixed(2)}%`}</td></tr>)}</tbody>
            </table>
          </div>
          <p>The figures reproduce the saved comparison; they do not independently reconstruct every source record or validate reef conditions in the field.</p>
        </details>
      </section>

      <section className={styles.finding} aria-labelledby="finding-title">
        <p className={styles.eyebrow}>03 / When the result challenges the question</p>
        <div className={styles.findingSpread}>
          <h2 id="finding-title">The map complicates<br /><em>my starting point.</em></h2>
          <div><p>My original hypothesis was that 2019 would expose more mapped habitat than 2015.</p><p>The saved comparison points the other way: the ≥8 °C-weeks class contains <strong>83.0% of all mapped habitat in 2015</strong> and <strong>63.3% in 2019</strong>. That is a narrower finding about annual peak satellite heat exposure—not evidence that reefs recovered.</p><p>I keep the original hypothesis beside the result. The point of the study is to answer the question, not make the map agree with it.</p></div>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>The next questions / Still to be answered</p><h2 id="next-title">Closer to the reef.<br />Further into the forecast.</h2></header>
        <div className={styles.nextColumns}>
          <article><h3>Satellite versus underwater temperature</h3><p>Next is a site- and depth-aware comparison with nighttime logger measurements. An ocean-surface estimate and a sensor on a reef do not measure the same place or depth.</p></article>
          <article><h3>Compare the forecast with useful baselines</h3><p>The planned seven-day satellite-temperature forecast will be evaluated chronologically against persistence and a training-only seasonal baseline, on the same valid dates. Forecast performance is not yet established.</p></article>
        </div>
        <p className={styles.closing}>This project brings together the work I want to do more of: environmental questions, spatial data and tools that make a complicated comparison understandable.</p>
      </section>

      <footer className={styles.sources}>
        <p className={styles.eyebrow}>Sources and project context</p>
        <p>ASM540 term project in progress. Research direction and guided ArcGIS work by Drew Baker; development assisted by Codex. Portfolio figures are original redraws of saved data, not exported basemap imagery.</p>
        <ul>
          <li><a href="https://coralreefwatch.noaa.gov/product/5km/methodology.php">NOAA Coral Reef Watch — 5 km methodology</a></li>
          <li><a href="https://products.coastalscience.noaa.gov/collections/benthic/e97hawaii/data2007.aspx">NOAA/NCCOS and Analytical Laboratories of Hawaii — historical habitat mapping</a></li>
          <li><a href="/media/projects/west-hawaii-heat-exposure/sources.json">Figure provenance and credits</a></li>
        </ul>
        <Link className={styles.textLink} href="/work">Back to selected work <span aria-hidden="true">→</span></Link>
      </footer>
    </main>
  );
}

