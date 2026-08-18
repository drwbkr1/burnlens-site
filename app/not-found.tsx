import type { Metadata } from "next";
import Link from "next/link";
import styles from "./resume/resume.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content" className={styles.notFound}>
      <div className={styles.notFoundMark} aria-hidden="true">
        404 / FIELD NOTE
      </div>
      <p className={styles.eyebrow}>Outside the mapped extent</p>
      <h1>This page is not in the atlas.</h1>
      <p>
        The address may be old, incomplete, or moved into a project case study. The work index is
        the quickest route back to known ground.
      </p>
      <nav className={styles.notFoundActions} aria-label="Page not found options">
        <Link className={styles.primaryAction} href="/work">
          Explore the work
        </Link>
        <Link className={styles.textAction} href="/">
          Return home
        </Link>
      </nav>
    </main>
  );
}
