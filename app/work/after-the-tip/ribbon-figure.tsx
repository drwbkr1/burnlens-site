import { leadFigures } from "./lead-figures";
import styles from "./page.module.css";

export type Cohort = "all" | "purdue";

export function LeadFigure({ cohort, compact = false }: { cohort: Cohort; compact?: boolean }) {
  const profile = leadFigures.figures[cohort];
  const title = cohort === "all" ? "The screened season" : "Purdue's games";
  return (
    <figure className={styles.ribbonFigure} data-lead-figure={cohort}>
      <figcaption>
        <span>{title}</span>
        <span>{profile.games.toLocaleString("en-US")} games · both sides</span>
      </figcaption>
      <div className={styles.sideLabels}>
        <span className={styles.firstSide}>Above: {profile.labels[0]}</span>
        <span className={styles.secondSide}>Below: {profile.labels[1]}</span>
      </div>
      <div className={styles.plot}>
        <div className={styles.axisValues} aria-hidden="true"><span>{leadFigures.limit}</span><span>0</span><span>{leadFigures.limit}</span></div>
        <svg viewBox="0 0 600 220" preserveAspectRatio="none" role="img" aria-label={`${title}: mean positive lead contributions across regulation, ${profile.labels[0]} above zero and ${profile.labels[1]} below. Shared zero to ${leadFigures.limit} point scale on each side.`}>
          {[150, 300, 450].map(x => <line key={x} x1={x} x2={x} y1="20" y2="200" className={styles.quarterRule} />)}
          <line x1="0" x2="600" y1="110" y2="110" className={styles.zeroRule} />
          <path d={profile.paths[0]} className={styles.firstRibbon} />
          <path d={profile.paths[1]} className={styles.secondRibbon} />
        </svg>
      </div>
      <div className={styles.quarterLabels} aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30</span><span>40 min</span></div>
      {!compact && <p className={styles.figureUnit}>Mean positive lead contribution · points per game</p>}
    </figure>
  );
}
