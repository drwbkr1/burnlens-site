import { historicalCoursework } from "@/content/projects";

type HistoricalCourseworkShelfProps = {
  className?: string;
};

export function HistoricalCourseworkShelf({ className = "" }: HistoricalCourseworkShelfProps) {
  return (
    <section
      className={["coursework-shelf", className].filter(Boolean).join(" ")}
      aria-labelledby="historical-coursework-title"
      data-historical-coursework
    >
      <header className="coursework-heading">
        <div>
          <p className="eyebrow">Historical coursework / reading shelf</p>
          <h2 id="historical-coursework-title">Earlier work, kept in its proper tense.</h2>
        </div>
        <p>
          These artifacts show range, not current engineering readiness. Each stays attached to its
          date, source, and present limitation instead of borrowing the weight of a case study.
        </p>
      </header>

      <ul className="coursework-list">
        {historicalCoursework.map((item) => (
          <li key={item.title}>
            <article className="coursework-entry" data-coursework-entry>
              <div className="coursework-meta">
                <p>{item.context}</p>
                <time dateTime={item.dateTime}>{item.date}</time>
              </div>

              <div className="coursework-summary">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>

              <p className="coursework-boundary">
                <span>Present boundary</span>
                {item.boundary}
              </p>

              <a
                className="coursework-link"
                href={item.sourceHref}
                target="_blank"
                rel="noreferrer"
              >
                {item.sourceLabel} <span className="sr-only">(opens in a new tab)</span>
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
