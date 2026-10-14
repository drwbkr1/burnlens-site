import type { Metadata } from "next";
import Link from "next/link";
import snapshot from "@/content/dashboard-artifact/data.json";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Project dashboard",
  description: "A dated view of five selected projects: their recorded state, listed checklist tasks and links to the work.",
  alternates: { canonical: "/dashboard" },
  openGraph: { title: "Project dashboard | Drew Baker", url: "/dashboard", description: "Selected project records from Daily Project Recap, dated October 7, 2026." },
};
const reviewed = (value: string) => new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles",
}).format(new Date(value));

export default function DashboardPage() {
  const rows = snapshot.queries.portfolio_projects.rows;
  return <main id="main-content" className={`shell ${styles.dashboard}`}>
    <header className={styles.opening}>
      <p className={styles.eyebrow}>On my workbench</p>
      <h1>Project dashboard.</h1>
      <p>Five selected projects from Daily Project Recap, recorded through October 7, 2026, at 5 PM Pacific. This is a dated snapshot—not live status.</p>
      <a className={styles.explore} href="/dashboard/explore/index.html">Compare the project checklists <span aria-hidden="true">→</span></a>
      <p className={styles.definition}>Counts describe completed tasks out of listed tasks—not hours, effort shares or whole-project acceptance. All five projects remained ongoing at this cutoff.</p>
    </header>
    <section aria-label="Selected project records" data-dashboard-records>
      {rows.map(row => <article key={row.id} data-dashboard-project={row.id} className={styles.record}>
        <div><p className={styles.eyebrow}>{row.category}</p><h2><Link href={row.caseRoute}>{row.title} <span aria-hidden="true">→</span></Link></h2></div>
        <p className={styles.count}><strong>{row.completedTasks}</strong> of {row.plannedTasks}<span>listed tasks completed</span></p>
        <p className={styles.state}>{row.state}</p>
        <p className={styles.date}>Source reviewed <time dateTime={row.sourceReviewedAt}>{reviewed(row.sourceReviewedAt)}</time> (Pacific). {row.completedModules} of {row.plannedModules} listed modules complete.</p>
      </article>)}
    </section>
    <details className={styles.scope}><summary>Snapshot scope</summary>
      <p>Selected portfolio-relevant records, not the full private dashboard. Quiet projects keep their older source-review dates. The portfolio record predates this design update.</p>
      <p>The interactive comparison uses the same five records and offers work-area filtering and source inspection. These records and links remain available without JavaScript.</p>
    </details>
  </main>;
}
