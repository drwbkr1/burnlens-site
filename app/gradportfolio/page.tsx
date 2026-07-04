const projects = [
  {
    title: "OpenClaw Showcase",
    href: "https://github.com/drwbkr1/openclaw-showcase",
    icon: "◈",
    accent: "bg-[#757F64] text-[#F8F5EE]",
    description:
      "Public-safe showcase for agent workflow design, scoped tasks, run logs, QA review, safety boundaries, and human approval gates.",
    tags: ["AI Ops", "Workflow", "QA"],
  },
  {
    title: "BurnLens",
    href: "https://burnlensproject.org/",
    icon: "▲",
    accent: "bg-[#CB7A5C] text-[#F8F5EE]",
    description:
      "Wildfire planning workflow for GeoAI, remote sensing, public-data screening, and disaster resilience communication.",
    tags: ["GeoAI", "Remote Sensing", "Wildfire"],
  },
  {
    title: "HC Clusterer",
    href: "https://colab.research.google.com/drive/1iw--FYslASbASPbh40ldStJtOB5QKfRe#scrollTo=5Zez04aIzJl6",
    icon: "●",
    accent: "bg-[#C7CDBF] text-[#4B5542]",
    description:
      "Coursework project exploring hierarchical clustering, evaluation choices, and clear explanation of model behavior.",
    tags: ["Clustering", "Python", "Analytics"],
  },
  {
    title: "Data Governance Policy Brief",
    href: "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
    icon: "▤",
    accent: "bg-[#5C757A] text-[#F8F5EE]",
    description:
      "Policy and governance writing sample focused on responsible data use, sharing, stewardship, and technical communication.",
    tags: ["Policy", "Governance", "Writing"],
  },
] as const;

const focusItems = [
  ["Graduate Student", "AI/ML & geospatial systems"],
  ["Research Focus", "GeoAI, remote sensing, disaster resilience"],
  ["Technical Interests", "Python, ML workflows, GIS, evaluation"],
  ["Mission", "Useful, responsible decision-support systems"],
] as const;

export const metadata = {
  title: "William (Drew) Baker | Graduate Portfolio",
  description:
    "Graduate portfolio for William (Drew) Baker: AI operations, GeoAI, remote sensing, BurnLens, OpenClaw Showcase, coursework, writing samples, resume, and contact information.",
};

const Pill = ({ children }: { children: string }) => (
  <span className="rounded-full bg-[#E9E2D8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C757A]">
    {children}
  </span>
);

export default function GraduatePortfolioLinksPage() {
  return (
    <main className="min-h-screen bg-[#E9E2D8] px-4 py-6 text-[#2F3F42] md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#F8F5EE] shadow-[0_30px_90px_rgba(92,117,122,0.22)]">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#C7CDBF]/60 px-6 py-5 md:px-10">
          <a href="/gradportfolio" className="flex items-center gap-4">
            <span className="font-serif text-4xl tracking-tight text-[#757F64]">WB</span>
            <span className="h-10 w-px bg-[#C7CDBF]" />
            <span>
              <span className="block font-serif text-lg font-semibold tracking-wide text-[#36484C]">
                William (Drew) Baker
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#757F64]">
                Graduate Portfolio
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C757A] md:flex">
            <a className="text-[#CB7A5C]" href="/gradportfolio">
              Home
            </a>
            <a className="transition hover:text-[#CB7A5C]" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-[#CB7A5C]" href="#projects">
              Projects
            </a>
            <a className="transition hover:text-[#CB7A5C]" href="/gradportfolio/resume">
              Resume
            </a>
            <a className="transition hover:text-[#CB7A5C]" href="mailto:bake1139@purdue.edu?subject=Graduate%20portfolio%20follow-up">
              Contact
            </a>
          </nav>
        </header>

        <section className="grid gap-10 px-6 py-12 md:px-10 lg:grid-cols-[0.92fr_1.55fr] lg:gap-12 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#5C757A]">
              AI/ML Graduate Student
            </p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-[#757F64] md:text-7xl">
              William (Drew)
              <span className="block italic text-[#4F5D46]">Baker</span>
            </h1>
            <div className="mt-7 h-1 w-16 rounded-full bg-[#CB7A5C]" />
            <p className="mt-7 max-w-xl text-base leading-8 text-[#3E4D50] md:text-lg">
              I build and explain AI-assisted geospatial workflows that connect Earth observation,
              responsible automation, and practical decision-support artifacts.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6B6F66]">
              This portfolio brings together OpenClaw workflow discipline, BurnLens wildfire planning,
              clustering coursework, and policy-oriented technical communication.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/gradportfolio/resume"
                className="inline-flex items-center gap-3 rounded-xl bg-[#CB7A5C] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(203,122,92,0.25)] transition hover:-translate-y-0.5"
              >
                <span>▤</span>
                View resume
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="mailto:bake1139@purdue.edu?subject=Graduate%20portfolio%20follow-up"
                className="inline-flex items-center gap-3 rounded-xl border border-[#757F64] bg-white/55 px-5 py-3 text-sm font-bold text-[#4F5D46] transition hover:-translate-y-0.5 hover:bg-[#C7CDBF]/40"
              >
                <span>✉</span>
                Email me
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <section id="workflow" className="rounded-[2rem] border border-[#C7CDBF]/70 bg-white/60 p-4 shadow-[0_24px_70px_rgba(92,117,122,0.12)] md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#757F64]">
                  Workflow Concept
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#36484C] md:text-3xl">
                  From source data to reviewed artifact
                </h2>
              </div>
              <span className="rounded-full bg-[#C7CDBF]/70 px-4 py-2 text-xs font-semibold text-[#4F5D46]">
                Scalable SVG graphic
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#C7CDBF]/70 bg-[#F8F5EE] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <img
                src="/images/gradportfolio-workflow.svg"
                alt="Workflow diagram showing data sources, processing, analysis and modeling, and outputs and insights."
                className="h-auto w-full"
              />
            </div>
          </section>
        </section>

        <section id="projects" className="px-6 pb-12 md:px-10 md:pb-16">
          <div className="mb-7 flex items-center justify-center gap-4 text-center">
            <span className="h-px w-20 bg-[#C7CDBF]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#5C757A]">Project Highlights</p>
              <p className="mt-1 font-serif text-lg text-[#757F64]">Selected graduate portfolio work</p>
            </div>
            <span className="h-px w-20 bg-[#C7CDBF]" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[18rem] flex-col rounded-[1.5rem] border border-[#C7CDBF]/70 bg-white/78 p-6 shadow-[0_18px_42px_rgba(92,117,122,0.11)] transition hover:-translate-y-1 hover:border-[#CB7A5C]/45"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-full text-xl ${project.accent}`}>
                  {project.icon}
                </span>
                <h3 className="mt-5 font-serif text-2xl font-semibold leading-tight text-[#36484C]">
                  {project.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#5D6768]">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#CB7A5C]">
                  Open project <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-4 bg-[#C7CDBF]/70 px-6 py-6 md:grid-cols-4 md:px-10">
          {focusItems.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/45 bg-white/25 p-4">
              <p className="font-serif text-xl font-semibold text-[#4F5D46]">{title}</p>
              <p className="mt-2 text-xs leading-5 text-[#4F5D46]">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
