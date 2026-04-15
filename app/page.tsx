"use client";

import { FormEvent, useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  organization: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  organization: "",
  message: "",
};

export default function BurnLensLandingPage() {
  const workflow = [
    {
      title: "Define the planning geography",
      text: "Start with one named community-and-corridor area where wildfire relevance and access constraints are easy to understand.",
    },
    {
      title: "Assemble current fire context",
      text: "Combine frequently updated satellite imagery, authoritative fire information, and required local overlays into one usable screening bundle.",
    },
    {
      title: "Review access and exposure",
      text: "Bring roads, buildings, parcels, critical facilities, and planning boundaries together so local teams can review the area as a whole.",
    },
    {
      title: "Produce a planning-ready package",
      text: "Deliver an annotated map, GIS-ready outputs, a plain-language memo, provenance, and confidence notes that can be circulated without specialist interpretation.",
    },
  ];

  const outputs = [
    "GIS-ready raster and vector outputs",
    "Annotated map for review and meetings",
    "Plain-language decision-support memo",
    "Metadata and provenance sheet",
    "Confidence and limitations note",
  ];

  const audiences = [
    "County or city planning and resilience practitioners",
    "GIS and emergency planning staff",
    "Community resilience and technical-assistance partners",
  ];

  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
  const fallbackEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@burnlens.org";

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Sending...";
    if (status === "success") return "Inquiry sent";
    return "Send inquiry";
  }, [status]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const payload = {
      ...form,
      source: "BurnLens website",
    };

    try {
      if (contactEndpoint) {
        const response = await fetch(contactEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("The contact endpoint did not accept the submission.");
        }

        setStatus("success");
        setForm(initialForm);
        return;
      }

      const subject = encodeURIComponent("BurnLens website inquiry");
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nOrganization: ${form.organization || "Not provided"}\n\nMessage:\n${form.message}`
      );

      window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while sending your inquiry.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-lg font-semibold tracking-tight text-white">
            BurnLens
          </a>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            <a href="#about" className="transition hover:text-white">
              About
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
            <a href="#pilot" className="transition hover:text-white">
              Pilot
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_26%)]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
            <div className="relative">
              <div className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
                Public-interest wildfire planning support
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Wildfire screening and planning support for evacuation access and community exposure.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
                BurnLens turns frequently updated satellite imagery and authoritative fire information into planning-ready outputs for local resilience work.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contact" className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-stone-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5">
                  Request a conversation
                </a>
                <a href="#pilot" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5">
                  View pilot focus
                </a>
              </div>
              <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-400">Jurisdiction</div>
                  <div className="mt-2 text-sm font-medium text-white">Deschutes County</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-400">Primary task</div>
                  <div className="mt-2 text-sm font-medium text-white">Access and exposure screening</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-400">Delivery mode</div>
                  <div className="mt-2 text-sm font-medium text-white">File-first planning package</div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="text-sm font-medium text-stone-300">First release</div>
              <div className="mt-3 text-2xl font-semibold text-white">Deliberately narrow</div>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-stone-300">
                <li>One pilot jurisdiction: Deschutes County, Oregon</li>
                <li>One primary task: evacuation-access and exposure screening</li>
                <li>One primary user: county or city planning/resilience practitioner</li>
                <li>One file-first delivery bundle for planning and coordination use</li>
              </ul>
              <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-stone-200">
                Built to prove usefulness in one real workflow before making broader claims.
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-400">About</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                A bounded workflow built for local planning use.
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                BurnLens is designed for the gap between abundant wildfire data and usable planning products. Instead of acting like a broad wildfire platform, it packages current fire context into a reviewable workflow that can support briefing, screening, and coordination tasks.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <h3 className="text-lg font-semibold text-white">What users get</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                  {outputs.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <h3 className="text-lg font-semibold text-white">Who it serves first</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                  {audiences.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <h3 className="text-lg font-semibold text-white">What it is not</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                  <li>• Not incident command</li>
                  <li>• Not evacuation orders or emergency direction</li>
                  <li>• Not parcel-level enforcement</li>
                  <li>• Not a utility-grade operational system</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-400">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A simple workflow for turning current fire context into something usable.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm font-medium text-amber-200">0{index + 1}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pilot" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-400">Pilot</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Deschutes County pilot.</h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                The first version is focused on one defined planning geography in Deschutes County, Oregon. The point is to prove usefulness in one real workflow before making broader claims.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <div className="text-sm text-stone-400">Primary task</div>
                <div className="mt-2 text-lg font-semibold text-white">Evacuation-access and exposure screening</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <div className="text-sm text-stone-400">Primary question</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Does the package improve screening of evacuation-route exposure and access constraints enough to support a county or city memo, briefing, or planning discussion?
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6">
                <div className="text-sm text-stone-400">Review structure</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Planning/resilience reviewer + local fire or wildfire-planning reviewer
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-200">Responsible use</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Screening and planning support only.
            </h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-stone-200">
              BurnLens is intended for planning and coordination use. When BurnLens outputs differ from authoritative county,
              fire-service, emergency-management, or official hazard products, the authoritative source governs.
            </p>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-400">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Interested in the pilot, review process, or sponsorship?
              </h2>
              <p className="mt-6 text-base leading-8 text-stone-300">
                This version works with a simple hosted form endpoint on Vercel. If no endpoint is configured yet, it falls back to opening an email draft.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-stone-300">
                Set <span className="font-medium text-white">NEXT_PUBLIC_CONTACT_ENDPOINT</span> to a form handler URL, or set
                <span className="font-medium text-white"> NEXT_PUBLIC_CONTACT_EMAIL</span> to control the email fallback.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm text-stone-300">
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-stone-950 px-4 py-3 text-white outline-none placeholder:text-stone-500"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm text-stone-300">
                  Email
                  <input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-stone-950 px-4 py-3 text-white outline-none placeholder:text-stone-500"
                    placeholder="you@example.org"
                  />
                </label>
              </div>

              <label className="mt-5 block text-sm text-stone-300">
                Organization
                <input
                  value={form.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-stone-950 px-4 py-3 text-white outline-none placeholder:text-stone-500"
                  placeholder="County, city, nonprofit, or other"
                />
              </label>

              <label className="mt-5 block text-sm text-stone-300">
                Message
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  required
                  className="mt-2 min-h-36 w-full rounded-2xl border border-white/10 bg-stone-950 px-4 py-3 text-white outline-none placeholder:text-stone-500"
                  placeholder="Tell us what you're interested in."
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitLabel}
                </button>
                {status === "success" && <p className="text-sm text-emerald-300">Thanks. Your message is ready to send.</p>}
                {status === "error" && <p className="text-sm text-red-300">{errorMessage}</p>}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-stone-400 md:flex-row md:items-center md:justify-between">
          <div>BurnLens</div>
          <div>Public-interest wildfire screening and planning support.</div>
        </div>
      </footer>
    </div>
  );
}
