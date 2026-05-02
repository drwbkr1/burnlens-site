const certifications = [
  {
    title: "NASA ARSET — Fundamentals of Remote Sensing",
    href: "https://appliedsciences.nasa.gov/what-we-do/capacity-building/arset",
  },
  {
    title: "NASA ARSET — Machine Learning for Earth Science",
    href: "https://appliedsciences.nasa.gov/what-we-do/capacity-building/arset",
  },
  {
    title: "NASA ARSET — Hyperspectral Data",
    href: "https://appliedsciences.nasa.gov/what-we-do/capacity-building/arset",
  },
  {
    title: "Imperial College London — Linear Algebra",
    href: "https://coursera.org/share/dcaf6f3b5422e369abf0c812761dcd2b",
  },
  {
    title: "Imperial College London — Multivariate Calculus",
    href: "https://coursera.org/share/b1d9aee762f9ed5b40dcb4099444472e",
  },
  {
    title: "Kaggle — Intermediate Machine Learning",
    href: "https://www.kaggle.com/learn/certification/drewbaker15/intermediate-machine-learning",
  },
  {
    title: "Kaggle — Feature Engineering",
    href: "https://www.kaggle.com/learn/certification/drewbaker15/feature-engineering",
  },
  {
    title: "MIMO — Python AI Development Professional Certificate",
    href: "https://www.virtualbadge.io/certificate-validator?credential=309dfe20-7aec-47a8-a208-b4622bb1b74c",
  },
] as const;

const leadership = [
  "SSI Assistant Scuba Instructor, 2019",
  "Founder, Ball State eSports, 2016",
  "Promotions Officer, Electronic Gaming League, 2016",
  "Eagle Scout Award, 2011",
] as const;

const experience = [
  {
    role: "Gen AI Associate",
    org: "Innodata",
    location: "Remote",
    dates: "Apr 2024 – Apr 2026",
    bullets: [
      "Annotated and evaluated 200–500 AI prompt/response tasks weekly across multiple projects, contributing to RLHF-style training data and model behavior improvement.",
      "Collaborated with a 35+ person distributed team to identify failure modes, refine prompts, and align outputs with client objectives.",
    ],
  },
  {
    role: "Technical Content Writer",
    org: "Independent Contractor",
    location: "Remote",
    dates: "Nov 2021 – Mar 2024",
    bullets: [
      "Wrote and edited 300+ technology articles, including first-page ranking solar energy content for Sunrun and similar providers.",
      "Translated complex technical and energy topics into accessible content for broad audiences.",
    ],
  },
] as const;

const projects = [
  {
    title: "BurnLens Wildfire GEOINT Planning Workflow",
    bullets: [
      "Developing a public-interest wildfire screening workflow for evacuation-access and exposure planning in Deschutes County, Oregon.",
      "Frames satellite imagery, authoritative fire information, local overlays, provenance, and fit-for-use limits into planning-ready map and memo packages.",
    ],
  },
  {
    title: "LLM-Powered Solar Incentive Assistant",
    label: "Google AI Intensive",
    bullets: [
      "Built a Gemini-based RAG prototype to answer residential solar incentive questions for California and North Carolina.",
      "Implemented document/PDF ingestion, ChromaDB vector storage, embeddings, and agentic tool use with DSIRE, Geocode, and PVWatts APIs.",
    ],
  },
  {
    title: "HDBSCAN Hierarchical Clusterer",
    label: "Purdue GRAD 504",
    bullets: [
      "Built a Python-based HDBSCAN clustering pipeline to explore regional patterning in a small-medium dataset.",
      "Evaluated encoding strategies and distance metrics, then communicated cluster behavior and limitations to non-technical readers.",
    ],
  },
] as const;

const skillGroups = [
  {
    label: "Geospatial / EO",
    text: "GeoPandas, rioxarray, Google Earth Engine, STAC, COG, GIS programming, remote sensing workflows.",
  },
  {
    label: "ML / AI",
    text: "Python, LLMs & RAG, Gemini, embeddings, ChromaDB, ReAct-style agents, HDBSCAN, prompt engineering.",
  },
  {
    label: "Communication",
    text: "Technical writing, policy analysis, stakeholder-facing documentation.",
  },
] as const;

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-lg shadow-[0_10px_22px_rgba(234,88,12,0.22)]">
      {icon}
    </span>
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-tight text-stone-950">
        {title}
      </h2>
      <span className="mt-1 h-px flex-1 bg-orange-600" />
    </div>
  </div>
);

export const metadata = {
  title: "Resume | William (Drew) Baker",
  description: "USGIF resume snapshot for William (Drew) Baker.",
};

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-[#120b08] px-4 py-8 text-stone-950 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <a
            href="/usgif"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            Back to USGIF links
          </a>
          <a
            href="mailto:bake1139@purdue.edu?subject=USGIF%20follow-up"
            className="rounded-full border border-orange-200/20 bg-orange-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-100 transition hover:bg-orange-200/20"
          >
            Contact
          </a>
        </div>

        <article className="mx-auto overflow-hidden rounded-[2rem] bg-[#fffdf8] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] ring-1 ring-black/5 print:rounded-none print:p-6 print:shadow-none md:p-10">
          <header className="grid gap-6 border-b-2 border-orange-600 pb-6 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-stone-950 md:text-6xl">
                William (Drew) Baker
              </h1>
              <p className="mt-3 text-lg font-black uppercase tracking-tight text-orange-600">
                AI/ML Graduate Student <span className="mx-2 text-stone-400">|</span>
                <span className="normal-case tracking-normal">Geospatial AI, Remote Sensing & Disaster Resilience</span>
              </p>
              <div className="mt-5 grid gap-2 text-sm font-medium text-stone-700 sm:grid-cols-3">
                <span>📍 Whiteland, IN</span>
                <span>📞 (317) 847-4670</span>
                <a className="text-stone-700 underline decoration-orange-500/40 underline-offset-4 hover:text-orange-700" href="mailto:bake1139@purdue.edu">
                  ✉️ bake1139@purdue.edu
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-700">
                <a
                  className="text-blue-700 underline decoration-blue-500/30 underline-offset-4 hover:text-blue-900"
                  href="https://www.linkedin.com/in/william-baker-843946162/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn: william-baker-843946162
                </a>
                <a
                  className="text-blue-700 underline decoration-blue-500/30 underline-offset-4 hover:text-blue-900"
                  href="https://burnlensproject.org/usgif"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio: burnlensproject.org/usgif
                </a>
              </div>
            </div>

            <a
              href="https://burnlensproject.org/usgif"
              target="_blank"
              rel="noopener noreferrer"
              className="justify-self-start md:justify-self-end"
              aria-label="Open portfolio and USGIF links"
            >
              <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-stone-300 bg-white p-2 shadow-sm">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fburnlensproject.org%2Fusgif"
                  alt="QR code for Portfolio and USGIF links"
                  className="h-full w-full"
                />
              </div>
              <p className="mt-2 text-center text-xs font-bold text-stone-800">Portfolio / USGIF links</p>
            </a>
          </header>

          <section className="border-b border-stone-300 py-6">
            <SectionTitle icon="●" title="Summary" />
            <p className="max-w-4xl text-base leading-7 text-stone-800">
              AI/ML graduate student focused on geospatial AI, remote sensing, Earth observation workflows, and disaster/energy resilience. Experience spans RLHF-style model evaluation, RAG prototypes, geospatial Python tools, remote sensing data standards, policy analysis, and technical communication for technical and non-technical audiences.
            </p>
          </section>

          <div className="grid gap-8 pt-6 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-9 lg:border-r lg:border-stone-300 lg:pr-8">
              <section>
                <SectionTitle icon="▣" title="Experience" />
                <div className="space-y-6">
                  {experience.map((item) => (
                    <article key={item.role}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-lg font-black text-stone-950">
                          {item.role} <span className="font-semibold text-stone-500">|</span> {item.org} <span className="font-semibold text-stone-500">|</span> {item.location}
                        </h3>
                        <p className="text-sm font-bold italic text-orange-600">{item.dates}</p>
                      </div>
                      <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-stone-800">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="list-disc">{bullet}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle icon="◆" title="Selected Projects" />
                <div className="space-y-6">
                  {projects.map((project) => (
                    <article key={project.title}>
                      <h3 className="text-base font-black text-stone-950">
                        {project.title}
                        {"label" in project && project.label ? (
                          <span className="font-semibold text-stone-600"> ({project.label})</span>
                        ) : null}
                      </h3>
                      <ul className="mt-2 space-y-2 pl-5 text-sm leading-6 text-stone-800">
                        {project.bullets.map((bullet) => (
                          <li key={bullet} className="list-disc">{bullet}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <section>
                <SectionTitle icon="◒" title="Education" />
                <div className="space-y-5 text-sm leading-6 text-stone-800">
                  <div>
                    <h3 className="text-base font-black text-stone-950">Purdue University</h3>
                    <p>M.S., AI and ML | GPA 4.0</p>
                    <p className="font-bold italic text-orange-600">May 2025 – Present | Expected Fall 2027</p>
                    <p className="mt-2"><span className="font-black">Coursework:</span> Intro to AI, Technical Foundations of AI, AI Ethics, AI Policy, GIS Programming.</p>
                  </div>
                  <div className="border-t border-stone-300 pt-4">
                    <h3 className="text-base font-black text-stone-950">Ball State University</h3>
                    <p>B.G.S., Marketing Planning</p>
                    <p className="font-bold italic text-orange-600">Aug 2011 – Aug 2017</p>
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle icon="⚙" title="Skills" />
                <div className="space-y-4 text-sm leading-6 text-stone-800">
                  {skillGroups.map((group) => (
                    <p key={group.label}>
                      <span className="font-black text-orange-600">{group.label}:</span> {group.text}
                    </p>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle icon="◈" title="Certifications" />
                <div className="space-y-2">
                  {certifications.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-stone-200 bg-white/60 px-3 py-2 text-sm font-medium leading-5 text-stone-800 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle icon="◉" title="Leadership" />
                <ul className="space-y-2 pl-5 text-sm leading-6 text-stone-800">
                  {leadership.map((item) => (
                    <li key={item} className="list-disc">{item}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
