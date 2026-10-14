import type { Metadata } from "next";
import Link from "next/link";
import ListeningComparison from "./listening-comparison";
import { leadFigures } from "./lead-figures";
import { LeadFigure } from "./ribbon-figure";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "After the Tip — a visual and listening experiment",
  description: "Drew Baker's product and sound direction for an NCAA women's basketball comparison: two averaged experiences on one regulation clock, developed with Codex.",
  alternates: { canonical: "/work/after-the-tip" },
  robots: { index: false, follow: false },
};

export default function AfterTheTipPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.opening}>
        <p className={styles.eyebrow}>Current work / Data as an experience</p>
        <div className={styles.hero}>
          <h1>After the Tip<span>One clock.<br /><em>Two ways to listen.</em></span></h1>
          <div className={styles.intro}>
            <p>I wanted to hear how a whole game unfolds—not browse another catalogue of scores.</p>
            <p>I redirected this NCAA women’s basketball project toward two averaged soundtracks: the screened season and Purdue’s games. Compare them at the same point in regulation, with both teams in the picture.</p>
            <a className={styles.textLink} href="#comparison">See and hear the comparison <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <dl className={styles.roleStrip}>
          <div><dt>My contribution</dt><dd>Product and sound direction</dd></div>
          <div><dt>Development</dt><dd>Codex-assisted · SVG / Web Audio</dd></div>
          <div><dt>Status</dt><dd>Local exploratory prototype · not submitted</dd></div>
        </dl>
      </header>

      <section className={styles.comparison} id="comparison" aria-labelledby="comparison-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>The experience / 40 minutes on one shared scale</p><h2 id="comparison-title">Keep the shape of the game.</h2><p>The current prototype separates each side’s lead contribution rather than letting opposite leaders cancel in a single average.</p></header>
        <div className={styles.figures}><LeadFigure cohort="all" /><LeadFigure cohort="purdue" /></div>
        <p className={styles.figureCaption}>Actual 2025–26 aggregate profiles, redrawn for this case study. Purdue’s 30 games are included in the 6,002-game season. Home/Away and Purdue/Opponent are different orientations—not a direct comparison of team strength.</p>
        <ListeningComparison />
        <details className={styles.method}>
          <summary>Understanding the two ribbons</summary>
          <p>At each ten-second snapshot, a side contributes its positive lead when ahead and zero when tied or behind. The total is divided by every game in the cohort. Both ribbons can therefore appear at once: they summarize different games with different leaders. The lower ribbon is drawn below zero to separate the sides; its values are positive contributions, not negative scores.</p>
          <p>These are descriptive averages, not confidence intervals, signed mean margins, measures of excitement or evidence of psychological momentum. Regulation only; no overtime. The source retains 34 nonzero opening-clock margins, and final-score checks do not establish every timestamp’s accuracy.</p>
          <div className={styles.tables}>{(["all", "purdue"] as const).map(cohort => <table key={cohort}><caption>{cohort === "all" ? "Season" : "Purdue games"}: end-of-quarter lead contributions (points/game)</caption><thead><tr><th scope="col">Elapsed</th><th scope="col">{leadFigures.figures[cohort].labels[0]}</th><th scope="col">{leadFigures.figures[cohort].labels[1]}</th></tr></thead><tbody>{leadFigures.figures[cohort].quarters.map((values, index) => <tr key={index}><th scope="row">{(index + 1) * 10} min</th><td>{values[0].toFixed(2)}</td><td>{values[1].toFixed(2)}</td></tr>)}</tbody></table>)}</div>
        </details>
      </section>

      <section className={styles.decisions} aria-labelledby="decisions-title">
        <header className={styles.sectionHeading}><p className={styles.eyebrow}>My decisions / Less catalogue, more comparison</p><h2 id="decisions-title">The question changed the interface.</h2></header>
        <div className={styles.decisionSpread}>
          <p className={styles.largeNote}>“All games” did not mean thousands of things to click. It meant one season-wide experience to compare with Purdue.</p>
          <div><p>An early direction expanded into a game catalogue. I clarified what I actually wanted: two averaged soundtracks. That moved the shared-clock comparison to the front and left individual games as a secondary explorer.</p><p>I also chose to include both teams’ scoring in the Purdue average. A Purdue game is a contest, not an isolated offensive stream. That choice kept the listening question focused on the whole game.</p></div>
        </div>
        <div className={styles.soundIteration}>
          <div><p className={styles.eyebrow}>A separate sound-design iteration</p><h3>Put the gap into the note,<br />not another competing layer.</h3></div>
          <div><p>I found single-game sonification underwhelming and asked to broaden the experience. Later, I paused a separate deficit pulse and explored scoring bops whose pitch rises and falls with the score gap.</p><p>Those newer 15-second Q2 auditions remain separate from the current browser modes and the fixed-pitch lead-voice excerpt above. Whether people can distinguish the teams and understand the comparison by ear still needs listening feedback.</p></div>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <div><p className={styles.eyebrow}>What this work shows</p><h2 id="next-title">I shape the question<br />and the experience.</h2></div>
        <div><p>This project brings together analytical framing, interface direction and sound exploration. My contribution is choosing what the comparison should mean, then refining how someone encounters it through Codex-assisted development.</p><p className={styles.status}>Next: listening feedback, clearer team distinction and a decision about which sound approach belongs in the final experience. This is exploratory work for Purdue’s data-visualization challenge—not a submitted entry, award or proven listener outcome.</p>
          <details className={styles.sources}><summary>Sources and scope</summary><p>The official competition dataset is distributed from SportsDataverse / wehoop ESPN records. The source prototype includes 6,002 of 6,030 listed completed 2025–26 games: 19 lack play-by-play and nine fail scoring checks. All 30 listed Purdue games are included. Coverage is screened, not an independently verified census.</p><p>This page is an excerpt: redrawn lead figures and two existing 40× audio exports. It does not reproduce the full application’s crossfade, scoring-rhythm mode, speed controls, per-game explorer or shareable session state. No underlying game dataset is offered for download.</p><a href="https://www.purdue.edu/idata/lovedata/" target="_blank" rel="noreferrer">Purdue challenge and portfolio guidance <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a></details>
          <nav className={styles.exitLinks} aria-label="Continue exploring"><Link className={styles.textLink} href="/work">All selected work <span aria-hidden="true">→</span></Link><Link className={styles.textLink} href="/work/wildfire-response">Wildfire Response <span aria-hidden="true">→</span></Link></nav>
        </div>
      </section>
    </main>
  );
}
