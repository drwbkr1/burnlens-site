const links = [
  {
    label: "Resume",
    href: "/usgif/resume",
    eyebrow: "PDF",
    description: "Download Drew's USGIF resume.",
  },
  {
    label: "BurnLens",
    href: "https://burnlensproject.org/",
    eyebrow: "Project",
    description: "Public-interest wildfire planning support for local resilience work.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/william-baker-843946162/",
    eyebrow: "Profile",
    description: "Connect after the symposium.",
  },
  {
    label: "HC Clusterer",
    href: "https://colab.research.google.com/drive/1iw--FYslASbASPbh40ldStJtOB5QKfRe#scrollTo=5Zez04aIzJl6",
    eyebrow: "Project",
    description: "Notebook project exploring clustering workflows.",
  },
  {
    label: "Data Governance Policy Brief",
    href: "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
    eyebrow: "Writing",
    description: "Policy and governance writing sample.",
  },
  {
    label: "Email",
    href: "mailto:bake1139@purdue.edu?subject=USGIF%20follow-up",
    eyebrow: "Contact",
    description: "Send a direct follow-up note.",
  },
] as const;

export const metadata = {
  title: "William (Drew) Baker | USGIF Links",
  description:
    "USGIF link hub for William (Drew) Baker: resume, BurnLens, LinkedIn, projects, and contact information.",
};

export default function USGIFLinksPage() {
  return (
    <main className="min-h-screen bg-[#120b08] text-stone-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(249,115,22,0.12),transparent_24%),linear-gradient(180deg,#120b08_0%,#1a0f0b_48%,#120b08_100%)]" />
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="w-full">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            BurnLens
          </a>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.25)] backdrop-blur-md md:p-9">
              <div className="inline-flex rounded-full border border-orange-200/20 bg-orange-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
                USGIF Symposium 2026
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.02]">
                William (Drew) Baker
              </h1>
              <p className="mt-5 text-lg leading-8 text-stone-300">
                AI/ML graduate student focused on geospatial AI, remote sensing, disaster-response decision support, and responsible technical communication.
              </p>

              <div className="mt-8 space-y-3 rounded-[1.5rem] border border-white/10 bg-[#1a100c]/90 p-5 text-sm leading-7 text-stone-300">
                <p>
                  I am using USGIF to connect BurnLens, AI/ML coursework, and geospatial project work with real GEOINT career paths.
                </p>
                <p>
                  Best follow-up topics: GeoAI, remote sensing analytics, wildfire planning, data governance, internships, and early-career technical roles.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/usgif/resume"
                  className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
                >
                  Download resume
                </a>
                <a
                  href="mailto:bake1139@purdue.edu?subject=USGIF%20follow-up"
                  className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Email me
                </a>
              </div>
            </section>

            <section className="grid gap-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-orange-200/30 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-100/80">
                        {link.eyebrow}
                      </div>
                      <h2 className="mt-2 text-xl font-semibold text-white">{link.label}</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-300">{link.description}</p>
                    </div>
                    <span className="mt-1 rounded-full border border-orange-200/20 bg-orange-200/10 px-3 py-1 text-sm text-orange-50 transition group-hover:bg-orange-200/20">
                      Open
                    </span>
                  </div>
                </a>
              ))}
            </section>
          </div>

          <footer className="mt-8 text-center text-xs leading-6 text-stone-500">
            Scan page for USGIF Symposium conversations. Built on burnlensproject.org/usgif.
          </footer>
        </div>
      </section>
    </main>
  );
}
