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
    "Define a bounded study area",
    "Document one Deschutes County study area, its intended screening question, and the limits of any future interpretation.",
  ],
  [
    "Record source and processing controls",
    "Track candidate imagery, public geospatial layers, dates, provenance, coordinate handling, and quality limitations before technical execution.",
  ],
  [
    "Compare baseline and future CV methods",
    "Use a non-model baseline as a comparison point for any later experimental segmentation work rather than assuming a model is useful.",
  ],
  [
    "Package evidence with limitations",
    "Connect any future output to its source records, version, run ID, method, warnings, and official-source precedence statement.",
  ],
] as const;

const documentedControls = [
  "Experimental binary semantic-segmentation task definition",
  "Source, AOI, provenance, and run-package planning",
  "Versioning, reproducibility, release, and claim controls",
  "Required use boundaries and official-source precedence",
] as const;

const boundaries = [
  "Not official wildfire information",
  "Not emergency guidance",
  "Not evacuation, routing, tactical, or incident-command support",
  "Not field-validated or agency-endorsed",
] as const;

export default function BurnLensLandingPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Sending...";
    if (status === "success") return "Message sent";
    if (status === "fallback") return "Email draft ready";
    return "Send a message";
  }, [status]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const openMailFallback = () => {
    if (!contactEmail || typeof window === "undefined") return false;

    const subject = encodeURIComponent(
      `BurnLens Deschutes inquiry from ${form.name || "website visitor"}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${form.name || ""}`,
        `Email: ${form.email || ""}`,
        `Organization: ${form.organization || "Not provided"}`,
        "",
        "Message:",
        form.message || "",
      ].join("\n"),
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
        error instanceof Error ? error.message : "Something went wrong while sending your inquiry.",
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
            BurnLens Deschutes
          </a>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            {[
              ["Project", "#project"],
              ["Workflow plan", "#workflow"],
              ["Boundaries", "#boundaries"],
              ["Status", "#status"],
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
        <section id="project" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
              Experimental portfolio project
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-tight text-white md:text-7xl md:leading-[1.02]">
              BurnLens Deschutes
            </h1>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-stone-300 md:text-xl">
              An experimental, portfolio-first computer vision and GEOINT wildfire-screening project for Deschutes County, Oregon. The work documents how a future imagery-to-map workflow could be scoped, traced, reviewed, and communicated with transparent limitations.
            </p>
          </div>

          <div className="mt-10 rounded-[1.8rem] border border-amber-200/20 bg-amber-300/10 p-6 text-amber-50 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">Required use boundary</p>
            <p className="mt-3 text-base leading-8">
              Experimental BurnLens CV/GEOINT portfolio work. Not official wildfire information. Not emergency guidance. Not evacuation, routing, tactical, or incident-command support. Official sources govern.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Study geography", "Deschutes County, Oregon"],
              ["First CV task", "Experimental binary semantic segmentation"],
              ["Current state", "Phase One controls and acceptance review"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{label}</div>
                <div className="mt-2 text-sm font-medium leading-6 text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Documented future workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                A traceable CV-to-GEOINT plan, not a completed operational system.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                BurnLens currently documents controls, task definitions, evidence requirements, and future run packaging. It has not begun Phase Two data work and does not claim completed datasets, trained models, validated outputs, or live wildfire products.
              </p>
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-4">
              {workflow.map(([title, text], index) => (
                <div key={title} className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-200/0 via-orange-200/70 to-red-200/0 opacity-80" />
                  <div className="text-sm font-semibold text-orange-100">0{index + 1}</div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#18100d]/90 p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Current documented controls</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {documentedControls.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-stone-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="boundaries" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Use boundaries</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Technical demonstration with explicit limits.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                Future BurnLens artifacts may support portfolio demonstration, technical review, and planning-style screening examples only when evidence, provenance, warnings, and limitations are complete.
              </p>
              <p className="mt-4 text-base leading-8 text-stone-300">
                For current wildfire, evacuation, road, air-quality, and emergency information, use official county, state, federal, fire-service, emergency-management, transportation, air-quality, and incident sources.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {boundaries.map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-amber-200/15 bg-amber-300/10 p-6 text-sm leading-7 text-amber-50">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="status" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Current repository status</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Phase One is under evidence-based acceptance review.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                The technical repository contains documented controls for scope, source precedence, versioning, provenance, reproducibility, claims, prompt-assisted development, and release review. Phase One has not been accepted or released, and later data work requires its own exact authorization.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.92fr_1.08fr] md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">Contact</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Ask about the portfolio methods or repository documentation.
            </h2>
            <p className="mt-6 text-base leading-8 text-stone-300">
              Messages should concern the documented portfolio project, technical methods, reproducibility, traceability, or transparent limitations. This contact surface does not provide current wildfire or emergency information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-[#150d0a]/95 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.24)] md:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-stone-300">
                Name
                <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]" placeholder="Your name" />
              </label>
              <label className="block text-sm text-stone-300">
                Email
                <input value={form.email} onChange={(event) => handleChange("email", event.target.value)} required type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]" placeholder="you@example.org" />
              </label>
            </div>

            <label className="mt-5 block text-sm text-stone-300">
              Organization <span className="text-stone-500">(optional)</span>
              <input value={form.organization} onChange={(event) => handleChange("organization", event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]" placeholder="Organization" />
            </label>

            <label className="mt-5 block text-sm text-stone-300">
              Message
              <textarea value={form.message} onChange={(event) => handleChange("message", event.target.value)} required rows={6} className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-[#1c120e] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-orange-200/30 focus:bg-[#231610]" placeholder="What would you like to know about the portfolio methods or documentation?" />
            </label>

            <button type="submit" disabled={status === "sending"} className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {submitLabel}
            </button>

            {status === "success" && <p className="mt-4 text-sm text-emerald-200">Your message was sent.</p>}
            {status === "fallback" && <p className="mt-4 text-sm text-amber-100">An email draft was opened because direct delivery was unavailable.</p>}
            {status === "error" && <p className="mt-4 text-sm text-red-200">{errorMessage}</p>}
          </form>
        </section>
      </main>
    </div>
  );
}
