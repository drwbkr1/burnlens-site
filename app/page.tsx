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
  ["Frame the geography", "Pick one community-and-corridor area where wildfire relevance, access constraints, and public-interest value are easy to see."],
  ["Layer current context", "Combine current satellite imagery, authoritative fire information, and local planning overlays into one screening stack."],
  ["Review access and exposure", "Look at routes, facilities, parcels, and constraints together so partners can discuss the whole picture at once."],
  ["Share a usable package", "Deliver a map, memo, provenance, and confidence language that can move into a meeting without specialist translation."],
] as const;

const outputs = [
  "Annotated map for planning review",
  "GIS-ready raster and vector outputs",
  "Plain-language decision-support memo",
  "Metadata and provenance sheet",
  "Confidence and limitations note",
  "Fit-for-use and source precedence language",
];

function Topography() {
  const paths = [
    "M-20 120 C 90 70, 190 160, 320 118 S 530 55, 640 120",
    "M-40 210 C 100 150, 220 260, 350 208 S 520 150, 660 220",
    "M-20 305 C 120 245, 220 365, 355 315 S 520 255, 640 320",
    "M-30 405 C 105 345, 210 455, 350 412 S 540 350, 650 422",
    "M-40 500 C 105 430, 240 560, 390 500 S 560 440, 660 520",
  ];

  return (
    <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="terrain" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(190,242,100,0.9)" />
          <stop offset="55%" stopColor="rgba(74,222,128,0.45)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0.35)" />
        </linearGradient>
      </defs>
      {paths.map((d) => (
        <path key={d} d={d} fill="none" stroke="url(#terrain)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
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
    return "Send inquiry";
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
    const body = encodeURIComponent([
      `Name: ${form.name || ""}`,
      `Email: ${form.email || ""}`,
      `Organization: ${form.organization || "Not provided"}`,
      "",
      "Message:",
      form.message || "",
    ].join("\n"));

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
        const shouldFallback = !!contactEmail && (response.status >= 500 || normalized.includes("not configured") || normalized.includes("provider"));
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
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while sending your inquiry.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07110d] text-stone-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.12),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(52,211,153,0.12),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.10),transparent_22%),linear-gradient(180deg,#07110d_0%,#08150f_48%,#07110d_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.06]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07110d]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3 text-base font-semibold tracking-tight text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-lime-200/20 bg-lime-200/10" />
            BurnLens
          </a>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            {[["Why it matters", "#why"],["How it works", "#how"],["Pilot", "#pilot"],["Contact", "#contact"]].map(([label, href]) => (
              <a key={label} href={href} className="transition hover:text-white">{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-lime-100">Eco-aware wildfire planning support</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl md:leading-[1.02]">Clearer wildfire planning for stronger, more connected communities.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-300 md:text-xl">BurnLens turns frequently updated satellite imagery and authoritative fire information into planning-ready materials that help local partners screen evacuation access, understand exposure, and coordinate with more confidence.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="rounded-2xl bg-lime-200 px-5 py-3 text-sm font-semibold text-[#08120d] shadow-[0_20px_40px_rgba(163,230,53,0.15)] transition hover:-translate-y-0.5">Start a conversation</a>
              <a href="#pilot" className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8">See the pilot focus</a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Pilot geography", "Deschutes County, Oregon"],
                ["Primary task", "Evacuation-access and exposure screening"],
                ["Delivery style", "File-first package for planning teams"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{label}</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="absolute right-0 top-8 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-stone-400">Landscape-first design</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">A warmer public-interest presence</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-stone-200">Community-ready</div>
            </div>
            <div className="relative mt-6 h-80 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,26,18,0.92),rgba(4,14,10,0.98))]">
              <Topography />
              <div className="absolute left-5 top-5 rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-lime-100">BurnLens package preview</div>
              <div className="absolute left-8 top-40 h-32 w-32 rounded-full border border-emerald-200/15 bg-emerald-300/8 shadow-[0_0_80px_rgba(74,222,128,0.12)]" />
              <div className="absolute left-28 top-28 h-24 w-24 rounded-full border border-amber-200/20 bg-amber-300/10" />
              <div className="absolute left-40 top-44 h-20 w-20 rounded-full border border-lime-200/20 bg-lime-300/10" />
              <div className="absolute bottom-12 left-12 right-12 h-[2px] rotate-[12deg] rounded-full bg-white/40 shadow-[0_0_18px_rgba(255,255,255,0.3)]" />
              <div className="absolute right-6 top-14 w-44 rounded-[1.35rem] border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">Included in the bundle</div>
                <div className="mt-3 space-y-3">
                  {["Current conditions summary","Route and corridor exposure observations","Key facilities and constraints","Confidence notes and limitations"].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/15 px-3 py-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-lime-200" />
                      <span className="text-sm leading-6 text-stone-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-5 right-5 rounded-2xl border border-amber-200/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-50">Designed for planning conversations, not emergency direction.</div>
            </div>
          </div>
        </section>

        <section id="why" className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[0.96fr_1.04fr]">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Why it matters</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">Built for the gap between wildfire data and usable local action.</h2>
                <p className="mt-6 text-base leading-8 text-stone-300">Public agencies and resilience partners can already access imagery, hazard layers, and fire information. What is often missing is a package that makes those inputs easier to interpret, circulate, and use in real planning conversations.</p>
                <p className="mt-4 text-base leading-8 text-stone-300">BurnLens is designed to make wildfire context more legible across people, not just across software. The goal is to help local teams align around a map, a memo, and a bounded understanding of what the product can and cannot support.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["See the whole geography", "Access routes, parcels, facilities, and fire context appear together instead of across disconnected layers and tabs."],
                  ["Brief with confidence", "The output is designed to move into meetings and planning discussions with provenance and caveats attached."],
                  ["Support real coordination", "County, city, and resilience partners get something they can discuss together without bespoke technical translation."],
                  ["Stay responsibly bounded", "Every package reinforces fit-for-use limits and defers to authoritative sources where they govern."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.14)]">
                    <div className="h-10 w-10 rounded-2xl border border-lime-200/20 bg-lime-200/10" />
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
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">A calmer workflow for turning current fire context into something usable.</h2>
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-4">
            {workflow.map(([title, text], index) => (
              <div key={title} className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lime-200/0 via-lime-200/60 to-amber-200/0 opacity-70" />
                <div className="text-sm font-semibold text-lime-100">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pilot" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.95fr_1.05fr] md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Pilot focus</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">One defined geography. One real planning question.</h2>
              <p className="mt-6 text-base leading-8 text-stone-300">The Phase 0 pilot is centered on one defined planning geography in Deschutes County, Oregon. The goal is to test whether a planning-readable wildfire package improves local review of evacuation-route exposure and access constraints enough to support a county or city memo, briefing, or planning discussion.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Pilot geography", "Deschutes County, Oregon"],
                ["Primary task", "Evacuation-access and exposure screening"],
                ["Review structure", "Planning or resilience reviewer plus a local fire or wildfire-planning reviewer"],
                ["Current stage", "Pre-development: sponsor readiness, reviewer outreach, and pilot packaging"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.7rem] border border-white/10 bg-[#091a13]/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{label}</div>
                  <div className="mt-3 text-lg font-semibold leading-7 text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#091913]/90 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">What partners receive</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">A package that is made to travel well</h3>
                </div>
                <div className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-50">Reviewable</div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {outputs.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-stone-200">{item}</div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-200/15 bg-amber-300/10 p-8 shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100/85">Guardrails</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Responsible use is part of the product, not a disclaimer added later.</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Not incident command",
                  "Not evacuation orders or emergency direction",
                  "Not parcel-level enforcement",
                  "Not a substitute for authoritative agency products",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
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
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">Interested in the pilot, review process, or sponsorship fit?</h2>
              <p className="mt-6 text-base leading-8 text-stone-300">BurnLens welcomes conversations with county and city partners, resilience organizations, prospective reviewers, and mission-aligned fiscal sponsors interested in practical wildfire planning support.</p>
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#091a13]/95 p-5 text-sm leading-7 text-stone-300">The contact form sends directly when configured. If email delivery is not configured yet and an address is available, BurnLens will fall back to opening an email draft so the conversation does not stall.</div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-[#081610]/95 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.24)] md:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm text-stone-300">Name<input value={form.name} onChange={(event) => handleChange("name", event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-[#04110c] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-200/30 focus:bg-[#07150f]" placeholder="Your name" /></label>
                <label className="block text-sm text-stone-300">Email<input value={form.email} onChange={(event) => handleChange("email", event.target.value)} required type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-[#04110c] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-200/30 focus:bg-[#07150f]" placeholder="you@example.org" /></label>
              </div>
              <label className="mt-5 block text-sm text-stone-300">Organization<input value={form.organization} onChange={(event) => handleChange("organization", event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#04110c] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-200/30 focus:bg-[#07150f]" placeholder="County, city, nonprofit, fiscal sponsor, or other" /></label>
              <label className="mt-5 block text-sm text-stone-300">Message<textarea value={form.message} onChange={(event) => handleChange("message", event.target.value)} required className="mt-2 min-h-40 w-full rounded-2xl border border-white/10 bg-[#04110c] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-200/30 focus:bg-[#07150f]" placeholder="Tell BurnLens what you are interested in exploring." /></label>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button type="submit" disabled={status === "sending"} className="rounded-2xl bg-lime-200 px-5 py-3 text-sm font-semibold text-[#08120d] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">{submitLabel}</button>
                {status === "success" && <p className="text-sm text-emerald-200">Thanks. Your message was sent to the BurnLens inbox.</p>}
                {status === "fallback" && <p className="text-sm text-amber-100">Your email app should open with a draft so you can send the message directly.</p>}
                {status === "error" && <p className="text-sm text-red-200">{errorMessage}</p>}
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
