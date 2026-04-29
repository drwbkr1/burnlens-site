const skills = [
  "Python",
  "Jupyter / Kaggle",
  "Google Cloud Platform",
  "LLMs & RAG",
  "Gemini",
  "Embeddings",
  "Vector stores / ChromaDB",
  "ReAct-style agents",
  "HDBSCAN clustering",
  "Basic supervised ML",
  "Prompt engineering",
  "Energy data governance",
  "Policy analysis",
  "Technical writing",
];

const certifications = [
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
    dates: "April 2024 – Present",
    bullets: [
      "Annotate and evaluate 200–500 AI prompt/response tasks weekly across multiple projects, contributing to RLHF-style training data and model behavior improvement.",
      "Collaborate with a 35+ person distributed team to identify failure modes, refine prompts, and align outputs with client objectives.",
    ],
  },
  {
    role: "Technical Content Writer",
    org: "Independent Contractor",
    location: "Remote",
    dates: "November 2021 – March 2024",
    bullets: [
      "Wrote and edited 300+ articles in technology niches, including first-page ranking solar energy articles for Sunrun and similar providers.",
      "Specialized in translating complex technical topics into accessible content for broad audiences.",
    ],
  },
] as const;

export const metadata = {
  title: "Resume | William (Drew) Baker",
  description: "USGIF resume snapshot for William (Drew) Baker.",
};

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-[#120b08] text-stone-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.15),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.11),transparent_24%),linear-gradient(180deg,#120b08_0%,#1a0f0b_48%,#120b08_100%)]" />
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        <header className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.25)] backdrop-blur-md md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-100">
            USGIF Resume Snapshot
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            William (Drew) Baker
          </h1>
          <p className="mt-4 text-xl text-stone-200">
            Graduate Student – AI/ML for Energy & Power Systems
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-stone-300">
            AI/ML graduate student at Purdue with interests in image recognition, forecasting, distributed control, ethical AI, geospatial AI, remote sensing, disaster-response decision support, and responsible technical communication.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a className="rounded-2xl bg-amber-300 px-5 py-3 font-semibold text-black" href="mailto:bake1139@purdue.edu">
              bake1139@purdue.edu
            </a>
            <a className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white" href="https://www.linkedin.com/in/william-baker-843946162/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </header>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <h2 className="text-2xl font-semibold text-white">Education</h2>
            <div className="mt-5 space-y-5 text-sm leading-7 text-stone-300">
              <div>
                <h3 className="text-lg font-semibold text-white">Purdue University</h3>
                <p>M.S., AI and ML · GPA 4.0</p>
                <p>May 2025 – Present · Expected Fall 2027</p>
                <p className="mt-2">Coursework: Intro to AI, Technical Foundations of AI, AI Ethics, AI Policy.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ball State University</h3>
                <p>B.G.S., Marketing Planning</p>
                <p>August 2011 – August 2017</p>
                <p className="mt-2">Emphasis on digital media planning, content creation, and web development.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <h2 className="text-2xl font-semibold text-white">Skills</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-orange-200/15 bg-orange-200/10 px-3 py-1.5 text-xs font-medium text-orange-50">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <h2 className="text-2xl font-semibold text-white">Certifications</h2>
            <div className="mt-5 space-y-3">
              {certifications.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-white/10 bg-[#1a100c]/90 px-4 py-3 text-sm leading-6 text-stone-200 transition hover:-translate-y-0.5 hover:border-orange-200/30 hover:bg-white/[0.07]"
                >
                  <span className="block font-medium text-stone-100">{item.title}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-orange-100/80 transition group-hover:text-orange-100">
                    View credential
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <h2 className="text-2xl font-semibold text-white">Leadership</h2>
            <div className="mt-5 space-y-3">
              {leadership.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-[#1a100c]/90 px-4 py-3 text-sm leading-6 text-stone-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
          <h2 className="text-2xl font-semibold text-white">Experience</h2>
          <div className="mt-6 space-y-6">
            {experience.map((item) => (
              <article key={item.role} className="rounded-[1.35rem] border border-white/10 bg-[#1a100c]/90 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{item.role}</h3>
                    <p className="mt-1 text-sm text-stone-300">{item.org} · {item.location}</p>
                  </div>
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.16em] text-stone-300">
                    {item.dates}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-300">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-amber-200/15 bg-amber-300/10 p-6">
          <h2 className="text-2xl font-semibold text-white">USGIF positioning</h2>
          <p className="mt-4 text-sm leading-7 text-stone-200">
            Looking for conversations about GeoAI, remote sensing analytics, wildfire planning, data governance, responsible AI, internships, and early-career pathways where AI/ML and geospatial decision support overlap.
          </p>
        </section>
      </section>
    </main>
  );
}
