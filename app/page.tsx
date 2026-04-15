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
  ["Current", "Pre-development"],
  ["Weeks 1–2", "Phase 0 setup"],
  ["Weeks 3–6", "Phase 0 build"],
  ["Weeks 7–9", "Refinement"],
  ["Weeks 10–12", "Review"],
  ["Decision", "Continuation gate"],
  ["Next", "Phase 1"],
] as const;

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
          <stop offset="0%" stopColor="rgba(253, 186, 116, 0.92)" />
          <stop offset="55%" stopColor="rgba(251, 146, 60, 0.36)" />
          <stop offset="100%" stopColor="rgba(248, 113, 113, 0.2)" />
        </linearGradient>
      </defs>
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#terrain)"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function HeroMapPreview() {
  const beacons = [
    "left-[22%] top-[38%]",
    "left-[52%] top-[49%]",
    "left-[76%] top-[34%]",
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.95rem] border border-white/10 bg-[linear-gradient(180deg,rgba(33,17,12,0.97),rgba(15,9,7,1))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
      <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-orange-300/10 blur-3xl" />
      <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-red-300/8 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-amber-200/8 blur-3xl" />

      <div className="relative h-[23rem] overflow-hidden rounded-[1.55rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.10),transparent_28%),linear-gradient(180deg,rgba(38,20,13,0.98),rgba(16,10,8,1))]">
        <Topography />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.28)_35%,rgba(8,7,6,0.8)_100%)]" />
        <div className="absolute -left-8 bottom-0 h-40 w-64 rounded-t-[100%] bg-[#20120d] opacity-95" />
        <div className="absolute left-[18%] bottom-0 h-48 w-80 rounded-t-[100%] bg-[#27150f] opacity-95" />
        <div className="absolute right-[12%] bottom-0 h-36 w-60 rounded-t-[100%] bg-[#1c110d] opacity-95" />
        <div className="absolute right-[-8%] bottom-0 h-44 w-72 rounded-t-[100%] bg-[#160d0a] opacity-95" />

        <div className="absolute left-6 top-6 rounded-full border border-orange-200/20 bg-orange-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-100">
          Deschutes pilot landscape
        </div>

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="routeGlow" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(254,243,199,0.95)" />
              <stop offset="100%" stopColor="rgba(251,146,60,0.95)" />
            </linearGradient>
          </defs>
          <path
            d="M10 72 C 24 64, 31 52, 42 53 C 53 54, 58 67, 69 66 C 79 65, 86 47, 95 40"
            fill="none"
            stroke="rgba(255,237,213,0.18)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M10 72 C 24 64, 31 52, 42 53 C 53 54, 58 67, 69 66 C 79 65, 86 47, 95 40"
            fill="none"
            stroke="url(#routeGlow)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {beacons.map((position, index) => (
          <div key={position} className={`absolute ${position}`}>
            <div className="absolute -inset-3 rounded-full bg-orange-300/15 blur-xl" />
            <div className="relative h-4 w-4 rounded-full border border-amber-100/80 bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.6)]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/18" />
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/10" />
            {index === 1 ? (
              <div className="absolute left-6 top-[-0.15rem] rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-300 backdrop-blur-md">
                screening point
              </div>
            ) : null}
          </div>
        ))}

        <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Terrain", "Landscape context"],
              ["Route", "Evacuation corridor"],
              ["Beacons", "Exposure checkpoints"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-200" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</div>
                  <div className="mt-1 text-sm text-stone-100">{value}</div>
                </div>
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

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-5">
            <HeroMapPreview />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="text-sm text-stone-300">Illustrative view of route screening across a wildfire-prone landscape</div>
              <div className="rounded-full border border-orange-200/20 bg-orange-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-orange-100">
                Planning use only
              </div>
            </div>
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
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
                Timeline
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Current stage and next steps.
              </h2>
              <p className="mt-4 text-base leading-8 text-stone-300">
                BurnLens is moving through a bounded Phase 0 process: scoping, build, review, and a continuation gate before any broader phase.
              </p>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-orange-200/15 bg-orange-300/10 px-5 py-4 text-sm leading-7 text-orange-50">
              Current status: Pre-development — pilot scoping, reviewer outreach, fiscal sponsor outreach, and grant outreach.
            </div>

            <div className="mt-8 overflow-x-auto pb-2">
              <div className="relative min-w-[860px] px-2 py-6">
                <div className="absolute left-10 right-10 top-[2.25rem] h-px bg-gradient-to-r from-orange-200/30 via-orange-200/70 to-red-200/30" />
                <div className="grid grid-cols-7 gap-3">
                  {timeline.map(([timeframe, label], index) => (
                    <div key={label} className="relative text-center">
                      <div
                        className={`mx-auto h-4 w-4 rounded-full border ${
                          index === 0
                            ? "border-amber-200 bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.55)]"
                            : "border-orange-200/40 bg-[#24130e]"
                        }`}
                      />
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                          {timeframe}
                        </div>
                        <div className="mt-2 text-sm font-medium leading-6 text-white">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
