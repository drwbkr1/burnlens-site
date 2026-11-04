import { ProjectImageReveal } from "./ProjectImageReveal";
import type { ReactNode } from "react";
import { homepageProjects } from "./projects";
import styles from "./homepage.module.css";

/** Biography-first composition; native disclosure owns the image interaction. */
export function PersonalFieldAtlas({ children }: { children?: ReactNode }) {
  return (
    <main className={styles.pfrStudy} id="main-content">
      {children}
      <div className={styles.pfrStudyColumns}>
        <section className={styles.pfrProfile} aria-label="About Drew">
          <p className={styles.pfrEyebrow}>A personal field atlas</p>
          <h1>Drew Baker.</h1>
          <p className={styles.pfrLead}>I turn data and complex ideas into usable software.</p>
          <p className={styles.pfrBio}>My work brings together software, maps and interactive experiences. I shape the question, decide what the result needs to do and refine it through use.</p>
          <div className={styles.pfrBackground}>
            <h2>My background</h2>
            <p>I’m studying artificial intelligence and machine learning at Purdue, with a background in AI evaluation and technical writing.</p>
            <h2>My approach</h2>
            <p>I set the direction, make product decisions and review the result. Development is collaborative and includes Codex assistance.</p>
          </div>
          <nav className={styles.pfrProfileLinks} aria-label="Résumé and contact">
            <a href="/resume">My résumé <span aria-hidden="true">↗</span></a>
            <a href="https://www.linkedin.com/in/william-baker-843946162/">Get in touch <span aria-hidden="true">↗</span></a>
          </nav>
        </section>
        <section className={styles.pfrSelected} aria-label="Selected project previews">
          {homepageProjects.map((project) => <ProjectImageReveal key={project.href} {...project} />)}
        </section>
      </div>
      <nav className={styles.pfrStudyLinks} aria-label="More portfolio work">
        <a href="/work">All projects <span aria-hidden="true">→</span></a>
        <a href="/work/burnlens">BurnLens case <span aria-hidden="true">→</span></a>
        <a href="/dashboard">Workbench <span aria-hidden="true">→</span></a>
      </nav>
    </main>
  );
}
