"use client";

import { FormEvent, useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  organization: string;
  message: string;
};

type Status = "idle" | "sending" | "success" | "fallback" | "error";

const initialForm: FormState = {
  name: "",
  email: "",
  organization: "",
  message: "",
};

const workflow = [
  [
    "Frame the geography",
    "Start with one community-and-corridor area where wildfire relevance, access constraints, and planning value are easy to see.",
  ],
  [
    "Layer current context",
    "Combine current satellite imagery, authoritative fire information, and local planning overlays into one bounded screening stack.",
  ],
  [
    "Review access and exposure",
    "Look at routes, facilities, parcels, and constraints together so local partners can discuss the full picture at once.",
  ],
  [
    "Share a usable package",
    "Deliver a map, memo, provenance, and confidence language that can move into a meeting without specialist translation.",
  ],
] as const;

const outputs = [
  "Annotated map for planning review",
  "GIS-ready raster and vector outputs",
  "Plain-language decision-support memo",
  "Metadata and provenance sheet",
  "Confidence and limitations note",
  "Use boundaries and source precedence notes",
];

const timeline = [
  {
    title: "Pre-development",
    timeframe: "Current stage",
    text: "Pilot scoping, reviewer outreach, fiscal sponsor outreach, and grant outreach.",
    current: true,
  },
  {
    title: "Phase 0 setup",
    timeframe: "Weeks 1–2",
    text: "Confirm geography, reviewers, workflow, and output structure.",
  },
  {
    title: "Phase 0 build",
    timeframe: "Weeks 3–6",
    text: "Assemble baseline layers, workflow logic, and the first planning package.",
  },
  {
    title: "Phase 0 refinement",
    timeframe: "Weeks 7–9",
    text: "QA, authoritative comparison, and packaging improvements.",
  },
  {
    title: "Phase 0 review",
    timeframe: "Weeks 10–12",
    text: "External review, feedback, and continuation materials.",
  },
  {
    title: "Continuation gate",
    timeframe: "Decision point",
    text: "Go / no-go decision for Phase 1.",
  },
  {
    title: "Phase 1",
    timeframe: "Next phase",
    text: "Narrow model build, evaluation, and integrated delivery update.",
  },
];

function Topography() {
  const paths = [
    "M-20 118 C 94 72, 194 162, 324 118 S 530 58, 640 124",
    "M-40 206 C 104 152, 224 258, 352 210 S 524 154, 660 224",
    "M-24 300 C 122 244, 226 362, 360 316 S 522 258, 642 322",
    "M-30 402 C 108 346, 212 456, 352 414 S 540 352, 654 424",
    "M-40 506 C 108 436, 242 560, 392 504 S 560 446, 666 524",
  ];

  return (
    <svg
      viewBox="0 0 600 600"
      className="absolute inset-0 h-full w-full opacity-55"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="terrain" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(253, 186, 116, 0.95)" />
          <stop offset="55%" stopColor="rgba(251, 146, 60, 0.42)" />
          <stop offset="100%" stopColor="rgba(248, 113, 113, 0.28)" />
        </linearGradient>
      </defs>
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#terrain)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function HeroMapPreview() {
  return (
    <div className="relative mt-6 overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(27,14,10,0.96),rgba(14,9,7,0.98))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
      <div className="absolute -left-10 top-2 h-44 w-44 rounded-full bg-orange-300/12 blur-3xl" />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-red-300/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="relative h-[25rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(33,17,12,0.95),rgba(14,9,7,0.99))]">
        <Topography />

        <div className="absolute left-5 top-5 rounded-full border border-orange-200/20 bg-orange-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-100">
          Planning bundle preview
        </div>

        <div className="absolute inset-x-12 top-1/2 h-[3px] -translate-y-1/2 rotate-[13deg] rounded-full bg-orange-50/70 shadow-[0_0_18px_rgba(255,237,213,0.4)]" />
        <div className="absolute left-24 top-28 h-28 w-28 rounded-full border border-orange-200/20 bg-orange-300/10 shadow-[0_0_60px_rgba(251,146,60,0.14)]" />
        <div className="absolute left-40 top-36 h-16 w-16 rounded-full border border-red-200/25 bg-red-300/14" />
        <div className="absolute left-72 top-24 h-20 w-20 rounded-full border border-amber-200/25 bg-amber-300/14" />
        <div className="absolute right-24 top-44 h-24 w-24 rounded-full border border-orange-200/20 bg-orange-300/10" />

        <div className="absolute left-6 top-20 max-w-[11rem] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Route context</div>
          <div className="mt-2 text-sm leading-6 text-stone-100">
            View corridor exposure and access constraints in one place.
          </div>
        </div>

        <div className="absolute right-6 top-16 max-w-[12rem] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">What is included</div>
          <div className="mt-2 space-y-2 text-sm leading-6 text-stone-100">
            <div>Current conditions summary</div>
            <div>Key facilities and constraints</div>
            <div>Confidence and limitations notes</div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 rounded-[1.35rem] border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-md">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Exposure", "Smoke, heat, and nearby fire context"],
              ["Access", "Road links and chokepoints"],
              ["Use", "Planning conversations, not emergency direction"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</div>
                <div className="mt-2 text-sm leading-6 text-stone-100">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BurnLensLandingPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Sending...";
    if (status === "success") return "Message sent";
    if (status === "fallback") return "Email draft ready";
    return "Start a conversation";
  }, [status]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const openMailFallback = () => {
    if (!contactEmail || typeof window === "undefined") return false;

    const subject = encodeURIComponent(`BurnLens inquiry from ${form.name || "Website visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${form.name || ""}`,
        `Email: ${form.email || ""}`,
        `Organization: ${form.organization || "Not provided"}`,
        "",
        "Message:",
        form.message || "",
      ].join("\n")
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const normalized = payload.error?.toLowerCase() || "";
        const shouldFallback =
          !!contactEmail &&
          (response.status >= 500 ||
            normalized.includes("not configured") ||
            normalized.includes("provider"));

        if (shouldFallback && openMailFallback()) {
          setStatus("fallback");
          return;
        }

        throw new Error(payload.error || "The form could not be submitted.");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      if (contactEmail && openMailFallback()) {
        setStatus("fallback");
        return;
      }

      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while sending your inquiry."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#120b08] text-stone-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.13),transparent_22%),radial-gradient(circle_at_78%_10%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_50%_82%,rgba(239,68,68,0.09),transparent_22%),linear-gradient(180deg,#120b08_0%,#1a0f0b_48%,#120b08_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.05]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120b08]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3 text-base font-semibold tracking-tight text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-200/20 bg-orange-200/10" />
            BurnLens
          </a>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            {[
              ["Why it matters", "#why"],
              ["How it works", "#how"],
              ["Timeline", "#timeline"],
              ["Pilot", "#pilot"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.02fr_0.98fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
              Wildfire planning support
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl md:leading-[1.02]">
              Clearer wildfire planning for stronger, more connected communities.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-300 md:text-xl">
              BurnLens turns frequently updated satellite imagery and authoritative fire information
              into planning-ready materials that help local partners screen evacuation access,
              understand exposure, and coordinate with more confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black shadow-[0_20px_40px_rgba(251,191,36,0.16)] transition hover:-translate-y-0.5"
              >
                Start a conversation
              </a>
              <a
                href="#pilot"
                className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                See the pilot focus
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Pilot geography", "Deschutes County, Oregon"],
                ["Primary task", "Evacuation-access and exposure screening"],
                ["Delivery style", "File-first package for planning teams"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] text-stone-400">
                    {label}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-6 text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  Landscape-first design
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  A clearer view of routes, exposure, and constraints
                </h2>
              </div>
            </div>
            <HeroMapPreview />
          </div>
        </section>

        <section id="why" className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[0.96fr_1.04fr]">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                  Why it matters
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  Built for the gap between wildfire data and usable local action.
                </h2>
                <p className="mt-6 text-base leading-8 text-stone-300">
                  Public agencies and resilience partners can already access imagery, hazard layers,
                  and fire information. What is often missing is a package that makes those inputs
                  easier to interpret, circulate, and use in real planning conversations.
                </p>
                <p className="mt-4 text-base leading-8 text-stone-300">
                  BurnLens is designed to make wildfire context more legible across people, not just
                  across software. The goal is to help local teams align around a map, a memo, and a
                  bounded understanding of what the product can and cannot support.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[
                  [
                    "See the whole geography",
                    "Access routes, parcels, facilities, and fire context appear together instead of across disconnected layers and tabs.",
                  ],
                  [
                    "Brief with confidence",
                    "The output is designed to move into meetings and planning discussions with provenance and caveats attached.",
                  ],
                  [
                    "Support real coordination",
                    "County, city, and resilience partners get something they can discuss together without bespoke technical translation.",
                  ],
                  [
                    "Stay responsibly bounded",
                    "Every package reinforces fit-for-use limits and defers to authoritative sources where they govern.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.14)]"
                  >
                    <div className="h-10 w-10 rounded-2xl border border-orange-200/20 bg-orange-200/10" />
                    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              A calmer workflow for turning current fire context into something usable.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-4">
            {workflow.map(([title, text], index) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-200/0 via-orange-200/70 to-red-200/0 opacity-80" />
                <div className="text-sm font-semibold text-orange-100">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="timeline" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                Timeline
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Current stage and next steps.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                BurnLens is moving through a bounded Phase 0 process: scoping, workflow assembly,
                review, and a continuation gate before any broader build.
              </p>
            </div>

            <div className="mt-10 rounded-[1.6rem] border border-orange-200/15 bg-orange-300/10 p-5 text-sm leading-7 text-orange-50">
              Current status: Pre-development — pilot scoping, reviewer outreach, fiscal sponsor
              outreach, and grant outreach.
            </div>

            <div className="relative mt-10 pl-8 before:absolute before:bottom-0 before:left-[0.8rem] before:top-0 before:w-px before:bg-gradient-to-b before:from-orange-200/70 before:via-orange-300/30 before:to-red-300/0">
              <div className="space-y-6">
                {timeline.map((item) => (
                  <div key={item.title} className="relative rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
                    <div
                      className={`absolute -left-[1.78rem] top-7 h-4 w-4 rounded-full border ${
                        item.current
                          ? "border-amber-200 bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.55)]"
                          : "border-orange-200/40 bg-[#24130e]"
                      }`}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                        {item.timeframe}
                      </div>
                      {item.current ? (
                        <div className="rounded-full border border-amber-200/20 bg-amber-300/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-100">
                          Current
                        </div>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pilot" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.95fr_1.05fr] md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                Pilot focus
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                One defined geography. One real planning question.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                The Phase 0 pilot is centered on one defined planning geography in Deschutes County,
                Oregon. The goal is to test whether a planning-readable wildfire package improves
                local review of evacuation-route exposure and access constraints enough to support a
                county or city memo, briefing, or planning discussion.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Pilot geography", "Deschutes County, Oregon"],
                ["Primary task", "Evacuation-access and exposure screening"],
                [
                  "Review structure",
                  "Planning or resilience reviewer plus a local fire or wildfire-planning reviewer",
                ],
                [
                  "Current stage",
                  "Pre-development: sponsor readiness, reviewer outreach, and pilot packaging",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.7rem] border border-white/10 bg-[#1a100c]/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] text-stone-400">
                    {label}
                  </div>
                  <div className="mt-3 text-lg font-semibold leading-7 text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#18100d]/90 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                    What partners receive
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    A package built for review and meetings
                  </h3>
                </div>
                <div className="rounded-full border border-orange-200/20 bg-orange-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-orange-50">
                  Reviewable
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {outputs.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-stone-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-200/15 bg-amber-300/10 p-8 shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100/85">
                Guardrails
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Responsible use is part of the product, not a disclaimer added later.
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Not incident command",
                  "Not evacuation orders or emergency direction",
                  "Not parcel-level enforcement",
                  "Not a substitute for authoritative agency products",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-200" />
                    <span className="text-sm leading-6 text-stone-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.92fr_1.08fr] md:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                Contact
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Interested in the pilot, review process, or sponsorship fit?
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                BurnLens welcomes conversations with county and city partners, resilience
                organizations, prospective reviewers, and mission-aligned fiscal sponsors interested
                in practical wildfire planning support.
              </p>
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#1a100c]/95 p-5 text-sm leading-7 text-stone-300">
                The contact form sends directly when configured. If email delivery is not configured
                yet and an address is available, BurnLens will fall back to opening an email draft
                so the conversation does not stall.
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-white/10 bg-[#150d0a]/95 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.24)] md:p-7"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm text-stone-300">
                  Name
                  <input
                    value={form.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm text-stone-300">
                  Email
                  <input
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    required
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]"
                    placeholder="you@example.org"
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm text-stone-300">
                Organization
                <input
                  value={form.organization}
                  onChange={(event) => handleChange("organization", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]"
                  placeholder="County, city, nonprofit, fiscal sponsor, or other"
                />
              </label>
              <label className="mt-5 block text-sm text-stone-300">
                Message
                <textarea
                  value={form.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  required
                  className="mt-2 min-h-40 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]"
                  placeholder="Tell BurnLens what you are interested in exploring."
                />
              </label>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitLabel}
                </button>
                {status === "success" && (
                  <p className="text-sm text-emerald-200">
                    Thanks. Your message was sent to the BurnLens inbox.
                  </p>
                )}
                {status === "fallback" && (
                  <p className="text-sm text-amber-100">
                    Your email app should open with a draft so you can send the message directly.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-sm text-red-200">{errorMessage}</p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-stone-400 md:flex-row md:items-center md:justify-between">
          <div className="font-medium text-stone-200">BurnLens</div>
          <div>Public-interest wildfire planning support for local resilience work.</div>
        </div>
      </footer>
    </div>
  );
}
