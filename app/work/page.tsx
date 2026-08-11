import type { Metadata } from "next";
import Link from "next/link";

import { HistoricalCourseworkShelf } from "@/components/editorial/HistoricalCourseworkShelf";
import { allPublishedWork, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Selected software, geospatial, climate, interaction-design, and risk-aware systems work by Drew Baker.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected work | Drew Baker",
    description: "Inspect the claim, evidence, and boundary behind each selected project.",
    url: "/work",
  },
};

export default function WorkIndexPage() {
  return (
    <main id="main-content" className="work-index shell">
      <header>
        <p className="eyebrow">Work index / selected evidence</p>
        <h1>Projects with enough proof to inspect.</h1>
        <p>
          The flagships receive full case studies. Supporting work stays deliberately compact until
          its implementation, authorship, rights, and evaluation earn more space.
        </p>
      </header>

      <div className="work-table">
        {allPublishedWork.map((project, index) => {
          const isBurnLens = project === projects.burnlens;
          const isRunbook = project === projects.runbookSentinel;
          const isFlagship = isBurnLens || isRunbook;
          const secondaryHref = "href" in project ? project.href : null;
          const isDesignedCase = isFlagship || Boolean(secondaryHref);
          const href = isFlagship ? project.href : secondaryHref ?? project.sourceHref;
          const kind = "kind" in project
            ? project.kind
            : isBurnLens
              ? "Flagship · climate / CV / GEOINT"
              : "Flagship · software / SRE safety";

          return (
            <article className="work-row" key={project.title}>
              <span className="item-number">{String(index + 1).padStart(2, "0")}</span>
              <h2>{project.title}</h2>
              <p>{project.thesis}</p>
              <div className="work-row-meta">
                <p>{kind}</p>
                {isDesignedCase ? (
                  <Link className="text-link" href={href}>Read case study →</Link>
                ) : (
                  <a className="text-link" href={href} target="_blank" rel="noreferrer">
                    Inspect review evidence <span className="sr-only">(opens in a new tab)</span> ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <HistoricalCourseworkShelf className="coursework-shelf-index" />
    </main>
  );
}
