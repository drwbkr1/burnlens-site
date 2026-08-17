import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

import {
  getPublicSourceHref,
  getProject,
  getProjectSource,
  getSupportedEvidence,
  projectRecords,
  projectSurfacePlan,
  toReaderFirst,
  type ProjectEvidence,
  type ProjectId,
} from "../content/project-model";

const expectedSiteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://burnlensproject.org",
).origin;
const expectedIndexable =
  process.env.PORTFOLIO_DEPLOYMENT_CONTEXT === "production" &&
  process.env.NEXT_PUBLIC_SITE_INDEXING === "allow";

const frontDoorEnergyBoundary =
  "Energy is historical governance context and a direction of interest—not evidence of an implemented energy system. The current work does not yet establish electrical engineering, controls, embedded, power-systems, or hardware implementation experience.";
const runbookFeaturedTurn =
  "The tested local model produced 9 of 84 outputs that passed the required structure, so the candidate was excluded and fixed-rule control remained.";
const burnlensBuildRecordHref =
  "https://github.com/drwbkr1/burnlens-deschutes/blob/a741111d82e69689022d2058118ed8f4b9bf3546/records/prompt-build-log/2026-07-27-p6o1-t02.md#L26-L69";
const burnlensReleaseHref =
  "https://github.com/drwbkr1/burnlens-deschutes/releases/tag/v0.56.0-baseline-first-portfolio-release";
const burnlensPinnedTreeHref =
  "https://github.com/drwbkr1/burnlens-deschutes/tree/a741111d82e69689022d2058118ed8f4b9bf3546";
const portfolioMaking = {
  headline: "How this portfolio was made",
  thesis:
    "I orchestrate Codex through bounded goals, explicit authority, critique, verification, and human gates—not as an authorial stand-in.",
  roles: [
    ["D.01", "Drew / Direction and decision", "Set the audience and use boundaries, make product and presentation decisions, and approve the exact public representation when a human gate is required."],
    ["C.01", "Codex / Bounded execution", "Decompose milestones, research approved public sources, implement within exact scope, critique the UX, preserve failed attempts, and verify the result."],
    ["E.01", "One concrete turn / BurnLens release surface", "For BurnLens, I bounded the release to one repository and directed it to Codex Sites. Codex assembled a canonical reviewer path, rechecked source and claim boundaries, and verified the production result. A local preview and two social-card attempts failed their gates, so they stayed rejected."],
    ["B.01", "Verified boundary", "The verified v0.56.0 release shipped without a bespoke social image and without rewriting the underlying evidence."],
  ],
  boundary:
    "This demonstrates a bounded human–Codex workflow—not autonomous authorship, independent user testing, or universal design superiority.",
} as const;
const runbookModelComparisonHref =
  "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/evaluations/baseline-0018-model-comparison.json";

const openClawRuntimeCommitment =
  "The private runtime was not inspected or evaluated; this route establishes no runtime quality, capability, failure dividend, or intended user.";
const openClawDisclosureLayers = [
  {
    id: "public",
    number: "01",
    label: "Public",
    status: "Readable now",
    contentsLabel: "Available in the public source",
    contents: [
      "Workflow and review patterns",
      "Conceptual diagrams",
      "Sanitized representative receipt",
      "Claim and limitation discipline",
    ],
    boundary: "The documents explain an intended process. They do not show that the private runtime performed or enforced it.",
  },
  {
    id: "approval-gated",
    number: "02",
    label: "Approval-gated",
    status: "Human decision required",
    contentsLabel: "No item is authorized here",
    contents: [
      "Any private-derived screenshot or example",
      "Any claimed lesson about the excluded runtime",
      "Any capability statement",
      "Any new publication claim",
    ],
    boundary: "Nothing enters this layer by implication. Scope, provenance, safety, and publication authority require a separate exact review.",
  },
  {
    id: "private",
    number: "03",
    label: "Private / not inspected",
    status: "Outside this field note",
    contentsLabel: "Excluded from the public source",
    contents: [
      "Runtime code or configuration is not included",
      "Raw logs or exact traces are not included",
      "Credentials or live tool authority are not included",
      "Operational memory or private task history is not included",
    ],
    boundary: "This route neither inspects nor reconstructs the private layer. Its absence is not evidence about implementation quality.",
  },
] as const;
const openClawWorkflowStages = [
  ["01", "Task", "Define the outcome, files, exclusions, risks, and human decision needed."],
  ["02", "Draft", "Prepare a bounded artifact in an isolated work state; polished still means draft."],
  ["03", "Trace", "Record intended inputs, outputs, checks, limits, and unresolved uncertainty."],
  ["04", "QA", "Review artifact quality and workflow quality as separate questions."],
  ["05", "Human decision", "Approve, revise, hold, or decline; release is never the automatic ending."],
] as const;
const openClawReceiptFields = [
  ["Identity", "Task type named · private identifier not included · draft status visible"],
  ["Scope", "Intended artifact and exclusions stated before interpretation"],
  ["Trace", "Inputs · intended outputs · checks · limitations"],
  ["Review", "Claim support · disclosure boundary · artifact status"],
  ["Disposition", "Human decision required before any public release"],
] as const;
const openClawReceiptWarnings = [
  ["Sanitized", "No identifiers or operational details are included."],
  ["Representative", "The example shows a document pattern, not an actual event."],
  ["Documentary", "The fields do not prove that a runtime produced or enforced them."],
] as const;
const openClawSourceDefinitions = [
  ["openclaw.snapshot", "Public documentation repository"],
  ["openclaw.workflow-doc", "Workflow model"],
  ["openclaw.safety-doc", "Boundary document"],
  ["openclaw.receipt-doc", "Representative receipt"],
] as const;
const openClawSourceFolio = openClawSourceDefinitions.map(([id, label]) => ({
  id,
  href: getPublicSourceHref(id),
  label,
  boundary: getProjectSource(id).claimBoundary,
}));

const resumeSelectedHierarchy = [
  ["burnlens", "flagship"],
  ["runbook-sentinel", "flagship"],
  ["quest-craft", "supporting-prototype"],
] as const;
const resumeHistory = [
  ["hierarchical-clustering", "2025-08-18", "hc.snapshot"],
  ["energy-sector-data-governance", "2025-12", "policy.reader"],
  ["der-dcp", "2025-11-13", "der.document"],
] as const;
const resumeFieldOrder = {
  burnlens: ["maturity", "personalRole", "implementation", "testStrategy", "outcome", "limitations"],
  "runbook-sentinel": ["maturity", "personalRole", "implementation", "stack", "testStrategy", "outcome", "limitations"],
  "quest-craft": ["maturity", "personalRole", "implementation", "testStrategy", "outcome", "limitations"],
  "hierarchical-clustering": ["problem", "limitations", "maturity"],
  "energy-sector-data-governance": ["problem", "personalRole", "outcome", "limitations", "maturity"],
  "der-dcp": ["problem", "personalRole", "outcome", "limitations", "maturity"],
} as const;
const resumeRoleLine = "Software engineering · Geospatial evidence · Climate-relevant systems";
const resumeSummary = "Software engineer building inspectable systems, deterministic software authorization boundaries, and geospatial evidence workflows for high-consequence settings. Public projects show bounded model evaluation and release testing; historical coursework adds energy-policy context.";
const resumeEnergyBoundary =
  "Energy is historical governance context and a direction of interest—not evidence of an implemented energy system. The current work does not yet establish electrical engineering, controls, embedded, power-systems, or hardware implementation experience.";
const resumeDescription =
  "Portfolio of Drew Baker: inspectable software systems, geospatial evidence workflows, bounded model evaluation, and climate-relevant technical work.";
const resumeProfiles = [
  ["GitHub", "https://github.com/drwbkr1", "github.com/drwbkr1"],
  ["LinkedIn", "https://www.linkedin.com/in/william-baker-843946162/", "linkedin.com/in/william-baker-843946162"],
] as const;

function resumeEvidence(projectId: ProjectId, field: keyof ProjectEvidence<ProjectId>) {
  return renderedEvidence(projectId, field);
}

async function readResumeCanonicalSurface(article: Locator) {
  const selected = await article
    .locator('[data-resume-lane="selected-project-evidence"] [data-resume-project]')
    .evaluateAll((nodes) => nodes.map((node) => ({
      id: node.getAttribute("data-project-model-id"),
      hierarchy: node.getAttribute("data-resume-hierarchy"),
      title: node.querySelector("h3")?.textContent?.trim(),
      owners: [...node.querySelectorAll<HTMLElement>("[data-evidence-owner]")].map((owner) => ({
        owner: owner.dataset.evidenceOwner,
        field: owner.dataset.evidenceField,
        sourceIds: owner.dataset.sourceIds?.split(/\s+/).filter(Boolean),
        text: owner.textContent?.replace(/\s+/g, " ").trim(),
      })),
    })));
  const history = await article
    .locator('[data-resume-lane="research-and-writing"] [data-resume-history]')
    .evaluateAll((nodes) => nodes.map((node) => ({
      id: node.getAttribute("data-project-model-id"),
      title: node.querySelector("h3")?.textContent?.trim(),
      dateTime: node.querySelector("time")?.getAttribute("datetime"),
      owners: [...node.querySelectorAll<HTMLElement>("[data-evidence-owner]")].map((owner) => ({
        owner: owner.dataset.evidenceOwner,
        field: owner.dataset.evidenceField,
        sourceIds: owner.dataset.sourceIds?.split(/\s+/).filter(Boolean),
        text: owner.textContent?.replace(/\s+/g, " ").trim(),
      })),
      sourceId: node.querySelector("[data-evidence-source-id]")?.getAttribute("data-evidence-source-id"),
      href: node.querySelector("[data-evidence-source-id]")?.getAttribute("href"),
    })));
  return { selected, history };
}

function renderedEvidence(projectId: ProjectId, field: keyof ProjectEvidence<ProjectId>) {
  const evidence = getSupportedEvidence(projectId, field);
  if (!evidence) throw new Error(`${projectId}.${field}: expected supported evidence.`);
  return toReaderFirst(evidence.summary);
}

async function readOpenClawDecisiveSurface(article: Locator) {
  const disclosures = await article.locator("[data-disclosure-register] > details").evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.getAttribute("data-disclosure-layer"),
      number: node.querySelector(":scope > summary > span")?.textContent?.trim(),
      label: node.querySelector(":scope > summary > strong")?.textContent?.trim(),
      status: node.querySelector(":scope > summary > em")?.textContent?.trim(),
      contentsLabel: node.querySelector(":scope > div > p:first-of-type")?.textContent?.trim(),
      contents: [...node.querySelectorAll(":scope > div > ul > li")]
        .map((item) => item.textContent?.trim()),
      boundary: node.querySelector(":scope > div > p:last-of-type")?.textContent?.replace(/\s+/g, " ").trim(),
    })),
  );
  const workflow = await article.locator("[data-conceptual-workflow] > ol > li").evaluateAll((nodes) =>
    nodes.map((node) => [
      node.querySelector(":scope > span")?.textContent?.trim(),
      node.querySelector("h3")?.textContent?.trim(),
      node.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim(),
    ]),
  );
  const receipt = await article
    .locator("[data-receipt-anatomy] > div:first-of-type > dl > div")
    .evaluateAll((nodes) => nodes.map((node) => [
      node.querySelector("dt")?.textContent?.replace(/^\s*\d+\s*/, "").trim(),
      node.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim(),
    ]));
  const sources = await article.locator("[data-source-folio] > a").evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.getAttribute("data-source-id"),
      href: node.getAttribute("href"),
      label: node.querySelector("strong")?.textContent?.trim(),
      boundary: node.querySelector("small")?.textContent?.replace(/\s+/g, " ").trim(),
    })),
  );
  return { disclosures, workflow, receipt, sources };
}

const representativeRoutes = [
  "/",
  "/work",
  "/work/burnlens",
  "/work/runbook-sentinel",
  "/work/quest-craft",
  "/work/openclaw-showcase",
  "/resume",
] as const;

const letterPdfOptions = {
  format: "Letter" as const,
  printBackground: true,
  displayHeaderFooter: false,
  preferCSSPageSize: false,
  tagged: true,
  outline: true,
};

async function attachLetterPdf(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate((publicOrigin) => {
    const localOrigin = location.origin;
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const url = new URL(anchor.href);
      if (url.origin === localOrigin) {
        anchor.href = `${publicOrigin}${url.pathname}${url.search}${url.hash}`;
      }
    }
  }, expectedSiteOrigin);
  const pdf = await page.pdf(letterPdfOptions);
  const source = pdf.toString("latin1");
  const pages = (source.match(/\/Type\s*\/Page\b/g) ?? []).length;
  await testInfo.attach(`${name}-letter.pdf`, { body: pdf, contentType: "application/pdf" });
  expect(pdf.byteLength, `${name}: meaningful Letter PDF payload`).toBeGreaterThan(100_000);
  expect(pages, `${name}: Letter PDF page objects`).toBeGreaterThan(0);
  expect(source, `${name}: no local development origin in PDF`).not.toMatch(/127\.0\.0\.1|localhost/i);
  return pages;
}

for (const route of representativeRoutes) {
  test(`${route} is semantic, accessible, and contained at mobile width`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);

    const widths = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test("mobile navigation is native, visible, and keyboard-reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".desktop-nav")).toBeHidden();
  const menu = page.locator(".mobile-menu");
  await expect(menu).toBeVisible();
  await menu.locator("summary").focus();
  await expect(menu.locator("summary")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(menu.locator("nav")).toBeVisible();
  await expect(menu.getByRole("link", { name: "Work" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Résumé" })).toBeVisible();
});

test("case-study chapter indexes remain keyboard-native at mobile and desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/burnlens", { waitUntil: "networkidle" });
  const burnlensIndex = page.locator('[data-case-chapter-index="burnlens"]');
  await expect(burnlensIndex).toBeVisible();
  await expect(burnlensIndex.getByRole("link")).toHaveCount(4);
  await expect(burnlensIndex.getByRole("link").allTextContents()).resolves.toEqual([
    "01Frame", "02Authority", "03Assembly", "04Boundary",
  ]);
  const assembly = burnlensIndex.getByRole("link", { name: /Assembly/ });
  await assembly.focus();
  await expect(assembly).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#assembly$/);
  await expect(page.locator("#assembly")).toBeVisible();
  await expect(page.locator('[data-case-chapters="burnlens"]')).toHaveCount(0);

  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await expect(page.locator('[data-case-chapter-index="runbook-sentinel"]')).toBeHidden();
  const disclosure = page.locator('[data-case-chapters="runbook-sentinel"]');
  const summary = disclosure.locator(":scope > summary");
  await expect(summary).toBeVisible();
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.getByRole("link", { name: /Proof room/ })).toBeVisible();
  await expect(disclosure.getByRole("link")).toHaveCount(4);
  await disclosure.getByRole("link", { name: /Authority break/ }).click();
  await expect(page).toHaveURL(/#authority$/);
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(page.locator("#authority")).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/work/burnlens", { waitUntil: "networkidle" });
  await expect(page.locator('[data-case-chapter-index="burnlens"]')).toBeVisible();
  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await expect(page.locator('[data-case-chapter-index="runbook-sentinel"]')).toBeVisible();
  await expect(page.locator('[data-case-chapters="runbook-sentinel"]')).toBeHidden();
});

test("representative routes hold at every required review width", async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    for (const route of [
      "/",
      "/work",
      "/work/burnlens",
      "/work/runbook-sentinel",
      "/work/quest-craft",
      "/work/openclaw-showcase",
    ]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(layout.document, `${route} at ${width}px`).toBeLessThanOrEqual(layout.viewport);
      await expect(page.locator("h1"), `${route} at ${width}px`).toBeVisible();
    }

    if (width <= 880) {
      await expect(page.locator(".mobile-menu"), `mobile menu at ${width}px`).toBeVisible();
      await expect(page.locator(".desktop-nav"), `desktop nav at ${width}px`).toBeHidden();
    } else {
      await expect(page.locator(".desktop-nav"), `desktop nav at ${width}px`).toBeVisible();
    }
  }
});

test("mobile homepage prioritizes the first flagship and keeps evidence labels legible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const priority = await page.evaluate(() => {
    const selectedWork = document.querySelector("#selected-work")?.getBoundingClientRect();
    const burnlensWorld = document.querySelector(
      '[data-flagship-teaser="burnlens"] [data-atlas-grid]',
    )?.getBoundingClientRect();
    const labels = [
      ...document.querySelectorAll(
        "[data-front-door-flagships] dt, [data-front-door-flagships] figcaption, [data-supporting-notes] dt, [data-capability-boundary] p",
      ),
    ].filter((label) => {
      const style = getComputedStyle(label);
      const bounds = label.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    });

    return {
      selectedWorkTop: selectedWork?.top ?? Number.POSITIVE_INFINITY,
      burnlensWorldTop: burnlensWorld?.top ?? Number.POSITIVE_INFINITY,
      burnlensWorldVisible: Boolean(burnlensWorld && burnlensWorld.width > 0 && burnlensWorld.height > 0),
      labelCount: labels.length,
      minimumLabelSize: Math.min(...labels.map((label) => Number.parseFloat(getComputedStyle(label).fontSize))),
    };
  });

  expect(priority.selectedWorkTop).toBeLessThanOrEqual(844 * 1.5);
  expect(priority.burnlensWorldTop).toBeLessThanOrEqual(844 * 4);
  expect(priority.burnlensWorldVisible).toBe(true);
  expect(priority.labelCount).toBeGreaterThan(0);
  expect(priority.minimumLabelSize).toBeGreaterThanOrEqual(12);
  await expect(page.getByText("01 / Proven", { exact: true })).toBeVisible();
  await expect(page.locator("[data-historical-coursework]")).toHaveCount(0);
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(scrollBehavior).toBe("auto");
});

test("homepage projects exactly two source-bound flagships without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "I build evidence-bound systems for uncertain terrain.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Software engineering · geospatial evidence · climate-relevant systems", {
      exact: true,
    }),
  ).toBeVisible();

  const flagships = page.locator("[data-front-door-flagships] > [data-flagship-teaser]");
  await expect(flagships).toHaveCount(2);
  expect(await flagships.evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute("data-flagship-teaser"),
    project: node.getAttribute("data-project-model-id"),
    world: node.getAttribute("data-visual-world"),
  })))).toEqual([
    { id: "burnlens", project: "burnlens", world: "field-atlas" },
    { id: "runbook-sentinel", project: "runbook-sentinel", world: "control-trace" },
  ]);

  const making = page.locator("[data-portfolio-making]");
  await expect(making).toHaveCount(1);
  await expect(making.getByRole("heading", { level: 3, name: portfolioMaking.headline })).toBeVisible();
  await expect(making).toContainText(portfolioMaking.thesis);
  expect(await making.locator("[data-orchestration-marker]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-orchestration-marker")),
  )).toEqual(portfolioMaking.roles.map(([marker]) => marker));
  for (const [marker, label, copy] of portfolioMaking.roles) {
    const row = making.locator(`[data-orchestration-marker="${marker}"]`);
    await expect(row.locator("dt")).toContainText(label);
    await expect(row.locator("dd")).toHaveText(copy);
  }
  await expect(making).toContainText(portfolioMaking.boundary);
  await expect(making.locator('[data-source-id="burnlens-pinned-tree"]')).toHaveAttribute(
    "href",
    burnlensBuildRecordHref,
  );
  await expect(making.locator('[data-source-id="burnlens-release"]')).toHaveAttribute(
    "href",
    burnlensReleaseHref,
  );
  expect(await making.evaluate((ledger) => Boolean(
    ledger.compareDocumentPosition(document.querySelector("[data-front-door-flagships]")!) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ))).toBe(true);

  const burnlens = flagships.nth(0);
  await expect(burnlens.locator("[data-atlas-grid]")).toHaveCount(1);
  await expect(burnlens.locator("[data-atlas-transect]")).toHaveCount(1);
  await expect(burnlens.locator("[data-atlas-legend]")).toHaveCount(1);
  await expect(burnlens.locator("[data-control-rail], [data-authority-break]")).toHaveCount(0);
  await expect(burnlens.locator("[data-featured-turn], [data-source-id]")).toHaveCount(0);
  await expect(burnlens.getByRole("link", { name: "Read BurnLens case study" })).toHaveAttribute(
    "href",
    "/work/burnlens",
  );
  await expect(burnlens).toContainText(renderedEvidence("burnlens", "maturity"));
  await expect(burnlens.locator("dt").filter({ hasText: /^Result$/ })).toHaveCount(1);
  await expect(burnlens.locator("dt").filter({ hasText: /^Limit$/ })).toHaveCount(1);

  const runbook = flagships.nth(1);
  await expect(runbook.locator("[data-control-rail]")).toHaveCount(2);
  await expect(runbook.locator("[data-authority-break]")).toHaveCount(1);
  await expect(runbook.locator("[data-atlas-grid], [data-atlas-transect], [data-atlas-legend]")).toHaveCount(0);
  const runbookTurn = runbook.locator('[data-featured-turn][data-evidence-id="RS.F03"]');
  await expect(runbookTurn).toHaveCount(1);
  await expect(runbookTurn.locator("[data-turn-copy]")).toContainText(runbookFeaturedTurn);
  await expect(runbookTurn.locator("[data-turn-boundary]")).not.toHaveText("");
  await expect(
    runbookTurn.locator('[data-source-id="rs.model_comparison.0018"]'),
  ).toHaveAttribute("href", runbookModelComparisonHref);
  await expect(
    runbook.getByRole("link", { name: "Read Runbook Sentinel case study" }),
  ).toHaveAttribute("href", "/work/runbook-sentinel");
  await expect(
    runbook.getByText(
      "Verified synthetic testbed with a public v0.0.20 release and zero real systems connected.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(runbook.locator("dt").filter({ hasText: /^Result$/ })).toHaveCount(1);
  await expect(runbook.locator("dt").filter({ hasText: /^Limit$/ })).toHaveCount(1);

  const supporting = page.locator("[data-supporting-notes]");
  expect(await supporting.locator(":scope article[data-project-model-id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["quest-craft", "openclaw-showcase"]);
  await expect(
    supporting.getByText(
      "These shorter field notes show bounded interaction and documentation work. Each is designed only from what its public evidence supports.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(supporting.getByRole("link", { name: "Read Quest Craft field note" })).toHaveAttribute(
    "href",
    "/work/quest-craft",
  );
  await expect(
    supporting.getByRole("link", { name: "Read OpenClaw Showcase field note" }),
  ).toHaveAttribute("href", "/work/openclaw-showcase");
  await expect(supporting.locator('[data-project-model-id="quest-craft"] [data-support-boundary]')).toContainText(
    /public reviewer snapshot.*no private stack.*general child[\s-]+safety claim/i,
  );
  await expect(
    supporting.locator('[data-project-model-id="openclaw-showcase"] [data-support-boundary]'),
  ).toContainText(
    /public documentation artifact.*private runtime.*not inspected or evaluated.*no runtime capability.*intended user.*failure dividend/i,
  );

  await expect(page.locator("[data-historical-coursework]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /historical reading shelf/i })).toHaveAttribute(
    "href",
    "/work#historical-reading",
  );
  await expect(page.locator('[data-capability-boundary="energy-ee"]')).toContainText(
    frontDoorEnergyBoundary,
  );
  await context.close();
});

test("work index preserves its three-lane hierarchy without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Two flagships, two focused field notes, and a bounded historical shelf.",
    }),
  ).toBeVisible();
  expect(await page.locator("main > [data-work-lane]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-work-lane")),
  )).toEqual(["flagships", "supporting-notes", "historical-reading-shelf"]);

  const flagshipLane = page.locator('[data-work-lane="flagships"]');
  const flagshipEntries = flagshipLane.locator('[data-work-entry]');
  expect(await flagshipEntries.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["burnlens", "runbook-sentinel"]);
  expect(await flagshipEntries.locator("[data-work-ordinal]").allTextContents()).toEqual(["01", "02"]);

  for (const [index, projectId] of ["burnlens", "runbook-sentinel"].entries()) {
    const entry = flagshipEntries.nth(index);
    const expectedFields = projectSurfacePlan[projectId as "burnlens" | "runbook-sentinel"].fields.workIndex;
    expect((await entry.locator("[data-field-key]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-field-key")).sort(),
    ))).toEqual([...expectedFields].sort());
    const labelledFields = [
      ["problem", "Problem"],
      ["intendedUser", "Intended reviewer"],
      ["personalRole", "My role"],
      ["decisionSupported", "Decision"],
      ...(projectId === "runbook-sentinel" ? [["stack", "Methods"]] as const : []),
      ["outcome", "Result"],
      ["limitations", "Boundary"],
    ] as const;
    for (const [field, label] of labelledFields) {
      const row = entry.locator(`[data-field-key="${field}"]`);
      await expect(row).toHaveCount(1);
      await expect(row.locator("dt")).toHaveText(label);
      if (field !== "stack") {
        await expect(row).toContainText(renderedEvidence(projectId as ProjectId, field));
      }
    }
    await expect(entry.locator('[data-field-key="maturity"]')).toHaveText(
      renderedEvidence(projectId as ProjectId, "maturity"),
    );
    const stack = projectRecords[projectId as "burnlens" | "runbook-sentinel"].evidence.stack;
    const methods = entry.locator("[data-method-list] > li");
    if (stack.state !== "supported") {
      await expect(methods).toHaveCount(0);
    } else {
      expect(await methods.evaluateAll((items) => items.map((item) => ({
        name: item.querySelector("strong")?.textContent?.trim(),
        purpose: item.querySelector("span")?.textContent?.trim(),
      })))).toEqual(stack.value.map((item) => ({
        name: toReaderFirst(item.name),
        purpose: toReaderFirst(item.purpose),
      })));
    }
  }
  await expect(
    flagshipEntries.nth(0).getByRole("link", { name: "Read BurnLens case study" }),
  ).toHaveAttribute("href", "/work/burnlens");
  await expect(
    flagshipEntries.nth(1).getByRole("link", { name: "Read Runbook Sentinel case study" }),
  ).toHaveAttribute("href", "/work/runbook-sentinel");

  const supportingLane = page.locator('[data-work-lane="supporting-notes"]');
  const supportingEntries = supportingLane.locator('[data-work-entry]');
  expect(await supportingEntries.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["quest-craft", "openclaw-showcase"]);
  const supportingFieldLabels = {
    "quest-craft": {
      problem: "Problem",
      intendedUser: "For",
      personalRole: "My role",
      decisionSupported: "Authority",
      testStrategy: "Evaluation",
      outcome: "Result",
      limitations: "Boundary",
    },
    "openclaw-showcase": {
      problem: "Problem",
      decisionSupported: "Public decision boundary",
      personalRole: "My role",
      implementation: "Public artifact",
      stack: "Public formats",
      outcome: "Result",
      limitations: "Boundary",
    },
  } as const;
  for (const [index, projectId] of ["quest-craft", "openclaw-showcase"].entries()) {
    const entry = supportingEntries.nth(index);
    const expectedFields = projectSurfacePlan[projectId as "quest-craft" | "openclaw-showcase"].fields.workIndex;
    expect(await entry.locator("[data-field-key]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-field-key")).sort(),
    )).toEqual([...expectedFields].sort());
    await expect(entry.locator('[data-field-key="maturity"]')).toHaveText(
      renderedEvidence(projectId as ProjectId, "maturity"),
    );
    for (const [field, label] of Object.entries(supportingFieldLabels[projectId as keyof typeof supportingFieldLabels])) {
      const row = entry.locator(`[data-field-key="${field}"]`);
      await expect(row).toHaveCount(1);
      await expect(row.locator("dt")).toHaveText(label);
      await expect(row.locator("dd")).toHaveText(
        renderedEvidence(projectId as ProjectId, field as keyof ProjectEvidence<ProjectId>),
      );
    }
  }
  await expect(supportingLane.locator("[data-work-ordinal], [data-method-list], [data-featured-turn]")).toHaveCount(0);
  await expect(
    supportingLane.getByRole("link", { name: "Read Quest Craft field note" }),
  ).toHaveAttribute("href", "/work/quest-craft");
  await expect(
    supportingLane.getByRole("link", { name: "Read OpenClaw Showcase field note" }),
  ).toHaveAttribute("href", "/work/openclaw-showcase");
  await expect(supportingLane.getByText("Read case study", { exact: false })).toHaveCount(0);

  const historyLane = page.locator('[data-work-lane="historical-reading-shelf"]');
  expect(await historyLane.locator('[data-work-entry]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["hierarchical-clustering", "energy-sector-data-governance", "der-dcp"]);
  await expect(historyLane.locator("[data-work-ordinal], [data-featured-turn]")).toHaveCount(0);
  await expect(page.locator("[data-featured-turn]")).toHaveCount(0);
  await expect(page.locator('[data-capability-boundary="energy-ee"]')).toContainText(
    frontDoorEnergyBoundary,
  );
  await context.close();
});

test("front-door copy explains technical identifiers before using them", async ({ page }) => {
  for (const route of ["/", "/work"] as const) {
    await page.goto(route, { waitUntil: "networkidle" });
    const audit = await page.locator("main").evaluate((main) => {
      const visibleText = (main as HTMLElement).innerText;
      const forbidden = [
        /PLATE B\.01/i,
        /TRACE R\.20/i,
        /WCP-\d+/i,
        /\bR00[12]\b/i,
        /\b(?:BL|RS|QC)\.F\d+\b/i,
        /\bNFA-[A-Z0-9-]+\b/i,
        /\bGEOINT\b/,
        /\bSRE\b/,
        /\bMCP\b/,
        /\bMTBS\b/,
        /\bJSONL\b/,
      ];
      const forbiddenMatches = forbidden.flatMap((pattern) => visibleText.match(pattern) ?? []);
      const tokenRules = [
        { token: "U-Net", before: /(?:segmentation[- ]model|neural[- ]network)[\s\S]*U-Net/i },
        { token: "RBR", before: /relative burn ratio[\s\S]*RBR/i },
        { token: "HDBSCAN", before: /(?:hierarchical )?density-based clustering[\s\S]*HDBSCAN/i },
        { token: "SCLA 521", before: /Societal Impacts of AI(?: course)?[\s\S]*SCLA 521/i },
      ];
      const unexplained: string[] = [];
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const tokenRule = tokenRules.find((rule) => node?.textContent?.includes(rule.token));
        if (tokenRule) {
          const element = node.parentElement?.closest("li, dd, p, article") as HTMLElement | null;
          const blockText = element?.innerText ?? node.textContent ?? "";
          if (!tokenRule.before.test(blockText)) unexplained.push(`${tokenRule.token}: ${blockText}`);
        }
        node = walker.nextNode();
      }
      return { forbiddenMatches, unexplained };
    });

    expect(audit.forbiddenMatches, `${route}: opaque visible identifiers`).toEqual([]);
    expect(audit.unexplained, `${route}: unexplained visible technical identifiers`).toEqual([]);
  }
});

test("front-door visual worlds remain distinct without relying on titles or raster images", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ["/", "/work"] as const) {
    await page.goto(route, { waitUntil: "networkidle" });
    const burnlens = page.locator(
      route === "/"
        ? '[data-flagship-teaser="burnlens"]'
        : '[data-work-lane="flagships"] [data-project-model-id="burnlens"]',
    );
    const runbook = page.locator(
      route === "/"
        ? '[data-flagship-teaser="runbook-sentinel"]'
        : '[data-work-lane="flagships"] [data-project-model-id="runbook-sentinel"]',
    );

    await expect(burnlens).toHaveAttribute("data-visual-world", "field-atlas");
    await expect(runbook).toHaveAttribute("data-visual-world", "control-trace");
    await page.addStyleTag({ content: "main h1, main h2, main h3 { visibility: hidden !important; }" });
    await expect(burnlens.locator("[data-atlas-grid]")).toBeVisible();
    await expect(burnlens.locator("[data-atlas-transect]")).toBeVisible();
    await expect(burnlens.locator("[data-control-rail], [data-authority-break]")).toHaveCount(0);
    await expect(runbook.locator("[data-control-rail]")).toHaveCount(2);
    await expect(runbook.locator("[data-control-rail]").first()).toBeVisible();
    await expect(runbook.locator("[data-control-rail]").last()).toBeVisible();
    await expect(runbook.locator("[data-authority-break]")).toBeVisible();
    await expect(runbook.locator("[data-atlas-grid], [data-atlas-transect]")).toHaveCount(0);
    await expect(burnlens.locator("img, picture, video, canvas")).toHaveCount(0);
    await expect(runbook.locator("img, picture, video, canvas")).toHaveCount(0);

    const tones = await page.evaluate(([burnlensSelector, runbookSelector]) => {
      function luminance(selector: string) {
        const element = document.querySelector(selector);
        if (!element) return -1;
        let current: Element | null = element;
        while (current) {
          const rgb = getComputedStyle(current).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
          if (rgb.length >= 3 && (rgb[3] ?? 1) > 0) return (rgb[0] + rgb[1] + rgb[2]) / 3;
          current = current.parentElement;
        }
        return -1;
      }
      return { burnlens: luminance(burnlensSelector), runbook: luminance(runbookSelector) };
    }, [
      route === "/"
        ? '[data-flagship-teaser="burnlens"] [data-atlas-grid]'
        : '[data-project-model-id="burnlens"] [data-atlas-grid]',
      route === "/"
        ? '[data-flagship-teaser="runbook-sentinel"] [data-control-rail]'
        : '[data-project-model-id="runbook-sentinel"] [data-control-rail]',
    ] as const);
    expect(tones.burnlens, `${route}: BurnLens daylight field`).toBeGreaterThan(150);
    expect(tones.runbook, `${route}: Runbook control field`).toBeLessThan(100);
  }

  for (const route of ["/", "/work"] as const) {
    await page.goto(route, { waitUntil: "networkidle" });
    const flagships = page.locator(
      route === "/" ? "[data-front-door-flagships]" : '[data-work-lane="flagships"]',
    );
    const supporting = page.locator(
      route === "/" ? "[data-supporting-notes]" : '[data-work-lane="supporting-notes"]',
    );
    const typeScale = await page.evaluate(([flagshipSelector, supportingSelector]) => {
      const flagshipTitles = [...document.querySelectorAll(`${flagshipSelector} h3`)]
        .filter((node) => getComputedStyle(node).visibility !== "hidden");
      const supportingTitles = [...document.querySelectorAll(`${supportingSelector} h3`)]
        .filter((node) => getComputedStyle(node).visibility !== "hidden");
      return {
        flagshipCount: flagshipTitles.length,
        supportingCount: supportingTitles.length,
        flagship: Math.min(...flagshipTitles.map((node) => Number.parseFloat(getComputedStyle(node).fontSize))),
        supporting: Math.max(...supportingTitles.map((node) => Number.parseFloat(getComputedStyle(node).fontSize))),
      };
    }, [
      route === "/" ? "[data-front-door-flagships]" : '[data-work-lane="flagships"]',
      route === "/" ? "[data-supporting-notes]" : '[data-work-lane="supporting-notes"]',
    ] as const);
    expect(typeScale.flagshipCount).toBe(2);
    expect(typeScale.supportingCount).toBe(2);
    expect(Number.isFinite(typeScale.flagship) && Number.isFinite(typeScale.supporting)).toBe(true);
    expect(typeScale.supporting, `${route}: supporting-title scale`).toBeLessThan(typeScale.flagship);
    await expect(supporting.locator("img, picture, [data-work-ordinal], [data-featured-turn], [data-atlas-grid], [data-control-rail], [data-authority-break]")).toHaveCount(0);
    await expect(flagships).toBeVisible();
  }
});

test("front-door accessibility holds at mobile and desktop review widths", async ({ page }) => {
  const expectedLinks = [
    ["Read BurnLens case study", "/work/burnlens"],
    ["Read Runbook Sentinel case study", "/work/runbook-sentinel"],
    ["Read Quest Craft field note", "/work/quest-craft"],
    ["Read OpenClaw Showcase field note", "/work/openclaw-showcase"],
  ] as const;

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of ["/", "/work"] as const) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("main h1")).toHaveCount(1);
      const headings = await page.locator("main h1, main h2, main h3, main h4, main h5, main h6")
        .evaluateAll((nodes) => nodes.filter((node) => {
          const style = getComputedStyle(node);
          return style.display !== "none" && style.visibility !== "hidden";
        }).map((node) => Number(node.tagName.slice(1))));
      expect(headings[0], `${route} at ${width}px starts at h1`).toBe(1);
      for (let index = 1; index < headings.length; index += 1) {
        expect(headings[index] - headings[index - 1], `${route}: skipped heading level`).toBeLessThanOrEqual(1);
      }

      const labelled = await page.locator("main [aria-labelledby]").evaluateAll((nodes) => nodes.map((node) => {
        const id = node.getAttribute("aria-labelledby") ?? "";
        const target = document.getElementById(id);
        return { id, matches: id ? document.querySelectorAll(`#${CSS.escape(id)}`).length : 0, text: target?.textContent?.trim() ?? "" };
      }));
      for (const item of labelled) {
        expect(item.id, `${route}: empty aria-labelledby`).not.toBe("");
        expect(item.matches, `${route}: non-unique aria-labelledby target ${item.id}`).toBe(1);
        expect(item.text, `${route}: empty aria-labelledby target ${item.id}`).not.toBe("");
      }

      for (const [name, href] of expectedLinks) {
        await expect(page.getByRole("link", { name, exact: true })).toHaveCount(1);
        await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations, `${route} at ${width}px\n${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
    }
  }
});

test("front-door links expose unobscured high-contrast keyboard focus", async ({ page }) => {
  for (const route of ["/", "/work"] as const) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route, { waitUntil: "networkidle" });
    const links = page.locator("main a[href]");
    expect(await links.count(), `${route}: focusable links`).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await link.scrollIntoViewIfNeeded();
      await link.focus();
      await expect(link).toBeFocused();
      const focus = await link.evaluate((element) => {
        function rgba(value: string) {
          const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
          return { r: channels[0] ?? 0, g: channels[1] ?? 0, b: channels[2] ?? 0, a: channels[3] ?? 1 };
        }
        function luminance(color: { r: number; g: number; b: number }) {
          const channels = [color.r, color.g, color.b].map((value) => {
            const normalized = value / 255;
            return normalized <= 0.03928
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        }
        function effectiveBackground(start: Element) {
          let current: Element | null = start;
          while (current) {
            const color = rgba(getComputedStyle(current).backgroundColor);
            if (color.a > 0.98) return color;
            current = current.parentElement;
          }
          return { r: 255, g: 255, b: 255, a: 1 };
        }
        const style = getComputedStyle(element);
        const outline = rgba(style.outlineColor);
        const background = effectiveBackground(element.parentElement ?? element);
        const light = Math.max(luminance(outline), luminance(background));
        const dark = Math.min(luminance(outline), luminance(background));
        const bounds = element.getBoundingClientRect();
        const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
        return {
          tabIndex: (element as HTMLElement).tabIndex,
          style: style.outlineStyle,
          width: Number.parseFloat(style.outlineWidth),
          offset: Number.parseFloat(style.outlineOffset),
          color: style.outlineColor,
          contrast: (light + 0.05) / (dark + 0.05),
          unobscured: bounds.top >= headerBottom - 1 && bounds.bottom <= window.innerHeight + 1,
        };
      });
      expect(focus.tabIndex).toBeGreaterThanOrEqual(0);
      expect(focus.style).not.toBe("none");
      expect(focus.width).toBeGreaterThanOrEqual(3);
      expect(focus.offset).toBeGreaterThanOrEqual(4);
      expect(focus.contrast).toBeGreaterThanOrEqual(3);
      expect(focus.unobscured).toBe(true);
    }

    for (const selector of route === "/"
      ? [
          '[data-flagship-teaser="runbook-sentinel"] a[href="/work/runbook-sentinel"]',
          '[data-flagship-teaser="runbook-sentinel"] [data-source-id]',
        ]
      : ['[data-work-lane="flagships"] a[href="/work/runbook-sentinel"]']) {
      const darkLink = page.locator(selector);
      await darkLink.focus();
      await expect(darkLink).toBeFocused();
      expect(await darkLink.evaluate((element) => getComputedStyle(element).outlineColor)).toBe(
        "rgb(199, 205, 191)",
      );
    }
  }
});

test("front-door descendants remain contained at every review width", async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    for (const route of ["/", "/work"] as const) {
      await page.goto(route, { waitUntil: "networkidle" });
      const layout = await page.locator("main").evaluate((main) => {
        const tolerance = 1.5;
        const visible = [...main.querySelectorAll<HTMLElement>("*")].filter((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
        });
        const escaping = visible.filter((element) => {
          if (element.getAttribute("aria-hidden") === "true" && getComputedStyle(element).position === "absolute") return false;
          const bounds = element.getBoundingClientRect();
          return bounds.left < -tolerance || bounds.right > window.innerWidth + tolerance;
        }).map((element) => ({
          tag: element.tagName,
          hook: element.getAttribute("data-project-model-id") ?? element.getAttribute("data-work-lane") ?? element.className,
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
        }));
        const scrollers = visible.filter((element) => {
          const style = getComputedStyle(element);
          return element.scrollWidth > element.clientWidth + 1 && /auto|scroll/.test(style.overflowX);
        }).map((element) => element.getAttribute("data-work-lane") ?? element.className ?? element.tagName);
        const essential = visible.filter((element) =>
          element.matches("a, button, dt, figcaption, [data-turn-boundary], [data-support-boundary], [data-capability-boundary] p") &&
          element.innerText.trim() !== "" && !element.classList.contains("sr-only"),
        ).map((element) => ({
          text: element.innerText.trim().slice(0, 80),
          size: Number.parseFloat(getComputedStyle(element).fontSize),
        }));
        return {
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          escaping,
          scrollers,
          essential,
        };
      });
      expect(layout.document, `${route} at ${width}px document width`).toBeLessThanOrEqual(layout.viewport);
      expect(layout.escaping, `${route} at ${width}px escaping descendants`).toEqual([]);
      expect(layout.scrollers, `${route} at ${width}px internal horizontal scrollers`).toEqual([]);
      expect(layout.essential.length).toBeGreaterThan(0);
      for (const item of layout.essential) {
        expect(item.size, `${route} at ${width}px: ${item.text}`).toBeGreaterThanOrEqual(13);
      }
    }
  }
});

test("front-door routes respect reduced motion and preserve decisive print evidence", async ({ page }, testInfo) => {
  for (const route of ["/", "/work"] as const) {
    await page.emulateMedia({ reducedMotion: "reduce", media: "screen" });
    await page.goto(route, { waitUntil: "networkidle" });
    const motion = await page.locator("main").evaluate((main) => {
      function milliseconds(value: string) {
        return value.split(",").map((part) => {
          const token = part.trim();
          return token.endsWith("ms") ? Number.parseFloat(token) : Number.parseFloat(token) * 1000;
        });
      }
      const values = [main, ...main.querySelectorAll<HTMLElement>("*")].flatMap((element) => {
        const style = getComputedStyle(element);
        return [...milliseconds(style.animationDuration), ...milliseconds(style.transitionDuration)];
      });
      return {
        htmlScroll: getComputedStyle(document.documentElement).scrollBehavior,
        bodyScroll: getComputedStyle(document.body).scrollBehavior,
        mainScroll: getComputedStyle(main).scrollBehavior,
        maximumDurationMs: Math.max(...values),
      };
    });
    expect(motion.htmlScroll).toBe("auto");
    expect(motion.bodyScroll).toBe("auto");
    expect(motion.mainScroll).toBe("auto");
    expect(motion.maximumDurationMs).toBeLessThanOrEqual(0.01);

    await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator(".site-footer")).toBeHidden();
    if (route === "/") {
      await expect(page.locator("[data-featured-turn]")).toHaveCount(1);
      for (const turn of await page.locator("[data-featured-turn]").all()) await expect(turn).toBeVisible();
      await expect(page.locator("[data-turn-boundary]")).toHaveCount(1);
      await expect(page.locator("[data-portfolio-making]")).toBeVisible();
      await expect(page.locator("[data-portfolio-making] [data-source-id]")).toHaveCount(2);
      await expect(page.locator("[data-source-id]")).toHaveCount(3);
    } else {
      await expect(page.locator("[data-work-facts]")).toHaveCount(2);
      for (const facts of await page.locator("[data-work-facts]").all()) await expect(facts).toBeVisible();
      const historyEntries = page.locator('[data-work-lane="historical-reading-shelf"] [data-work-entry]');
      await expect(historyEntries).toHaveCount(3);
      for (const entry of await historyEntries.all()) {
        await expect(entry).toBeVisible();
        await expect(entry.locator("a[href]")).toBeVisible();
      }
    }
    await expect(page.locator('[data-capability-boundary="energy-ee"]')).toBeVisible();

    const printLayout = await page.locator("main").evaluate((main, currentRoute) => {
      const visible = [main, ...main.querySelectorAll<HTMLElement>("*")].filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && !element.classList.contains("sr-only")
          && rect.width > 1
          && rect.height > 1;
      });
      const clipping = visible.flatMap((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const overflow = [style.overflow, style.overflowX, style.overflowY];
        const escapes = rect.left < -1 || rect.right > innerWidth + 1;
        const overflowsHorizontally = element.clientWidth > 0
          && element.scrollWidth > element.clientWidth + 1;
        const scrolls = overflowsHorizontally;
        const clips = overflowsHorizontally
          && [style.overflow, style.overflowX]
            .some((value) => /^(?:auto|scroll|hidden|clip)$/.test(value));
        return escapes || scrolls || clips
          ? [{
              node: element.tagName,
              text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
              rect: [rect.left, rect.right],
              overflow,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            }]
          : [];
      });
      const closing = currentRoute === "/"
        ? main.querySelector<HTMLElement>('section[aria-labelledby="closing-title"]')
        : null;
      const closingActions = closing?.querySelector<HTMLElement>("div");
      const primaryAction = currentRoute === "/"
        ? closing?.querySelector<HTMLElement>('a[href="/resume"]') ?? null
        : null;
      const opaqueSurface = (item: HTMLElement) => {
        let current: HTMLElement | null = item;
        while (current) {
          const background = getComputedStyle(current).backgroundColor;
          const channels = background.match(/[\d.]+/g)?.map(Number) ?? [];
          const alpha = channels.length > 3 ? channels[3] : 1;
          if (alpha > 0.98) return background;
          current = current.parentElement;
        }
        return "rgb(255, 255, 255)";
      };
      const workIdentityMarks = currentRoute === "/work"
        ? [...main.querySelectorAll<HTMLElement>("[data-atlas-transect] span, [data-control-rail] li, [data-authority-break]")]
            .map((item) => ({
              text: item.textContent?.replace(/\s+/g, " ").trim(),
              color: getComputedStyle(item).color,
              surface: opaqueSurface(item),
            }))
        : [];
      return {
        clipping,
        closingBreak: closing ? getComputedStyle(closing).breakInside : null,
        closingActionsBreak: closingActions ? getComputedStyle(closingActions).breakInside : null,
        primaryActionBackground: primaryAction ? getComputedStyle(primaryAction).backgroundColor : null,
        workMethods: currentRoute === "/work"
          ? [...main.querySelectorAll<HTMLElement>("[data-work-facts] li")].map((item) => ({
              background: getComputedStyle(item).backgroundColor,
              color: getComputedStyle(item).color,
              breakInside: getComputedStyle(item).breakInside,
            }))
          : [],
        workIdentityMarks,
      };
    }, route);
    expect(printLayout.clipping, `${route}: print clipping/internal scrollers`).toEqual([]);
    if (route === "/") {
      expect(printLayout.closingBreak).toBe("avoid");
      expect(printLayout.closingActionsBreak).toBe("avoid");
      expect(printLayout.primaryActionBackground).not.toBe("rgb(34, 34, 34)");
    } else {
      expect(printLayout.workMethods.length, "/work: method rows sampled").toBeGreaterThan(0);
      for (const method of printLayout.workMethods) {
        expect(method.background, "/work: method tile background").toBe("rgb(255, 255, 255)");
        expect(method.color, "/work: method tile text").toBe("rgb(0, 0, 0)");
        expect(method.breakInside, "/work: method row pagination").toBe("avoid");
      }
      expect(printLayout.workIdentityMarks.length, "/work: identity labels sampled").toBeGreaterThan(0);
      for (const mark of printLayout.workIdentityMarks) {
        expect(mark.color, `/work print identity label: ${mark.text}`).toBe("rgb(0, 0, 0)");
        expect(mark.surface, `/work print identity surface: ${mark.text}`).toBe("rgb(255, 255, 255)");
      }
    }

    const printContrast = await page.locator("main").evaluate((main) => {
      function rgba(value: string) {
        const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
        return { r: channels[0] ?? 0, g: channels[1] ?? 0, b: channels[2] ?? 0, a: channels[3] ?? 1 };
      }
      function luminance(color: { r: number; g: number; b: number }) {
        const values = [color.r, color.g, color.b].map((value) => {
          const channel = value / 255;
          return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      }
      function background(start: Element) {
        let current: Element | null = start;
        while (current) {
          const color = rgba(getComputedStyle(current).backgroundColor);
          if (color.a > 0.98) return color;
          current = current.parentElement;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      }
      const decisive = [...main.querySelectorAll<HTMLElement>(
        "[data-featured-turn] p, [data-featured-turn] dt, [data-featured-turn] dd, [data-featured-turn] a, [data-work-facts] dt, [data-work-facts] dd, [data-work-lane='historical-reading-shelf'] p, [data-work-lane='historical-reading-shelf'] a, [data-capability-boundary] h2, [data-capability-boundary] p",
      )].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.innerText.trim() !== "";
      });
      return decisive.map((element) => {
        const foreground = rgba(getComputedStyle(element).color);
        const surface = background(element.parentElement ?? element);
        const light = Math.max(luminance(foreground), luminance(surface));
        const dark = Math.min(luminance(foreground), luminance(surface));
        return { text: element.innerText.trim().slice(0, 80), ratio: (light + 0.05) / (dark + 0.05) };
      });
    });
    expect(printContrast.length, `${route}: decisive print samples`).toBeGreaterThan(0);
    for (const sample of printContrast) {
      expect(sample.ratio, `${route} print: ${sample.text}`).toBeGreaterThanOrEqual(4.5);
    }

    const pages = await attachLetterPdf(page, testInfo, route === "/" ? "home" : "work");
    expect(pages, `${route}: v1 orphan/blank-page regression budget`).toBeLessThanOrEqual(
      route === "/" ? 6 : 8,
    );
  }

  await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 816, height: 1056 });
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
  const openClawPrintLayout = await page.locator("[data-disclosure-register]").evaluate((register) => {
    const registerRect = register.getBoundingClientRect();
    const details = [...register.querySelectorAll<HTMLElement>(":scope > details")];
    const items = details.flatMap((detail) => [...detail.querySelectorAll<HTMLElement>(":scope > div li")]);
    const boundaryHeader = document.querySelector<HTMLElement>(
      '[data-route-movement="boundary-source-folio"] > header',
    );
    const ledger = document.querySelector<HTMLElement>("[data-first-screen-ledger]");
    const receiptHeader = document.querySelector<HTMLElement>("#receipt > header");
    const receiptPaper = document.querySelector<HTMLElement>("[data-receipt-anatomy] > div:first-child");
    const sourceHeader = document.querySelector<HTMLElement>("#sources > header");
    const firstSource = document.querySelector<HTMLElement>("[data-source-folio] > a:first-child");
    const warningRows = [...document.querySelectorAll<HTMLElement>("[data-receipt-anatomy] aside dl > div")];
    if (
      !boundaryHeader ||
      !ledger ||
      !receiptHeader ||
      !receiptPaper ||
      !sourceHeader ||
      !firstSource ||
      warningRows.length === 0
    ) {
      throw new Error("OpenClaw printable boundary, ledger, or warning surface is missing.");
    }
    return {
      columns: getComputedStyle(register).gridTemplateColumns.split(/\s+/).filter(Boolean),
      registerWidth: registerRect.width,
      boundaryHeaderBreak: getComputedStyle(boundaryHeader).breakInside,
      ledgerColumns: getComputedStyle(ledger).gridTemplateColumns.split(/\s+/).filter(Boolean),
      ledgerBreaks: [...ledger.children].map((child) => getComputedStyle(child).breakInside),
      ledgerBorders: [...ledger.children].map((child) => {
        const style = getComputedStyle(child);
        return { bottom: style.borderBottomWidth, right: style.borderRightWidth };
      }),
      warningRows: warningRows.map((row) => {
        const style = getComputedStyle(row);
        return { left: style.borderLeftWidth, top: style.borderTopWidth };
      }),
      receiptHeaderBreakAfter: getComputedStyle(receiptHeader).breakAfter,
      receiptPaperBreak: getComputedStyle(receiptPaper).breakInside,
      sourceHeaderBreakAfter: getComputedStyle(sourceHeader).breakAfter,
      firstSourceBreak: getComputedStyle(firstSource).breakInside,
      details: details.map((detail) => ({
        width: detail.getBoundingClientRect().width,
        breakInside: getComputedStyle(detail).breakInside,
      })),
      items: items.map((item) => ({
        text: item.textContent?.replace(/\s+/g, " ").trim(),
        wordBreak: getComputedStyle(item).wordBreak,
        overflowWrap: getComputedStyle(item).overflowWrap,
        widthEm: item.getBoundingClientRect().width / Number.parseFloat(getComputedStyle(item).fontSize),
      })),
    };
  });
  expect(openClawPrintLayout.columns).toHaveLength(1);
  expect(openClawPrintLayout.ledgerColumns).toHaveLength(3);
  expect(openClawPrintLayout.ledgerBreaks).toEqual(["avoid", "avoid", "avoid", "avoid", "avoid", "avoid"]);
  expect(openClawPrintLayout.ledgerBorders).toEqual([
    { bottom: "1px", right: "1px" },
    { bottom: "1px", right: "1px" },
    { bottom: "1px", right: "0px" },
    { bottom: "0px", right: "1px" },
    { bottom: "0px", right: "1px" },
    { bottom: "0px", right: "0px" },
  ]);
  expect(openClawPrintLayout.warningRows.every(({ left, top }) => left === "0px" && top === "1px")).toBe(
    true,
  );
  expect(openClawPrintLayout.details).toHaveLength(3);
  for (const detail of openClawPrintLayout.details) {
    expect(detail.width, "OpenClaw print disclosure width").toBeGreaterThanOrEqual(
      openClawPrintLayout.registerWidth * 0.9,
    );
    expect(detail.breakInside, "OpenClaw print disclosure pagination").toBe("avoid");
  }
  expect(openClawPrintLayout.items).toHaveLength(12);
  for (const item of openClawPrintLayout.items) {
    expect(item.wordBreak, `OpenClaw print item word breaking: ${item.text}`).toBe("normal");
    expect(item.overflowWrap, `OpenClaw print item overflow wrapping: ${item.text}`).toBe("normal");
    expect(item.widthEm, `OpenClaw print item line measure: ${item.text}`).toBeGreaterThanOrEqual(30);
  }
  expect(openClawPrintLayout.boundaryHeaderBreak, "OpenClaw movement-three heading pagination").toBe(
    "avoid",
  );
  expect(openClawPrintLayout.receiptHeaderBreakAfter, "OpenClaw receipt-heading pagination").toBe("avoid");
  expect(openClawPrintLayout.receiptPaperBreak, "OpenClaw receipt-paper pagination").toBe("avoid");
  expect(openClawPrintLayout.sourceHeaderBreakAfter, "OpenClaw source-heading pagination").toBe("avoid");
  expect(openClawPrintLayout.firstSourceBreak, "OpenClaw first-source pagination").toBe("avoid");
  const openClawPages = await attachLetterPdf(page, testInfo, "openclaw-showcase");
  expect(openClawPages, "OpenClaw disclosure-folio print page budget").toBeLessThanOrEqual(7);
});

test("BurnLens release-governance story remains readable without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work/burnlens#assembly", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  const article = page.locator('article[data-project-model-id="burnlens"][data-field-atlas="burnlens"]');
  await expect(article).toHaveCount(1);
  await expect(article.locator('[data-first-screen="burnlens"]#frame')).toBeVisible();
  await expect(article.getByRole("heading", { level: 1, name: "BurnLens" })).toBeVisible();

  const chapters = article.locator('[data-case-chapter-index="burnlens"] a');
  expect(await chapters.evaluateAll((nodes) => nodes.map((node) => ({
    text: node.textContent?.replace(/\s+/g, "").trim(),
    href: node.getAttribute("href"),
  })))).toEqual([
    { text: "01Frame", href: "#frame" },
    { text: "02Authority", href: "#authority" },
    { text: "03Assembly", href: "#assembly" },
    { text: "04Boundary", href: "#boundary" },
  ]);

  const claims = [
    ["problem", renderedEvidence("burnlens", "problem")],
    ["audience", renderedEvidence("burnlens", "intendedUser")],
    ["role", renderedEvidence("burnlens", "personalRole")],
    ["constraint", renderedEvidence("burnlens", "implementation")],
    ["decision", renderedEvidence("burnlens", "decisionSupported")],
    ["outcome", renderedEvidence("burnlens", "outcome")],
    ["limitation", renderedEvidence("burnlens", "limitations")],
    ["lesson", renderedEvidence("burnlens", "testStrategy")],
  ] as const;
  await expect(article.locator("[data-claim-atom]")).toHaveCount(8);
  for (const [atom, copy] of claims) {
    await expect(article.locator('[data-claim-atom="' + atom + '"]')).toHaveText(copy);
  }

  expect(await article.locator("[data-release-governance]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-release-governance")),
  )).toEqual(["authority", "assembly", "boundary"]);
  await expect(article.getByRole("heading", { level: 2, name: "Authority map" })).toBeVisible();
  await expect(article.getByRole("heading", { level: 2, name: "Reviewer path" })).toBeVisible();
  await expect(article.getByRole("heading", { level: 2, name: "Use boundary" })).toBeVisible();

  const sources = article.locator('[aria-label="BurnLens public evidence"] [data-source-id]');
  expect(await sources.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-source-id"))))
    .toEqual(["burnlens-release", "burnlens-pinned-tree"]);
  await expect(sources.nth(0)).toHaveAttribute("href", burnlensReleaseHref);
  await expect(sources.nth(1)).toHaveAttribute("href", burnlensPinnedTreeHref);
  await expect(article.locator(
    "[data-governed-figure], [data-media-warning], [data-failure-dividend], img, picture, canvas, video",
  )).toHaveCount(0);
  expect(await article.innerText()).not.toMatch(
    /BL\.F0[1-3]|selected cores|U-Net|\bRBR\b|\bDice\b|\bIoU\b|Ward Creek|Sentinel-2|Copernicus|\bMTBS\b|\bUSGS\b|package-validator/i,
  );

  await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  const printEvidence = await article.locator("[data-claim-atom], [data-source-id]").evaluateAll((nodes) =>
    nodes.map((node) => ({
      text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
      visible: getComputedStyle(node).display !== "none" && getComputedStyle(node).visibility !== "hidden",
      fontSize: Number.parseFloat(getComputedStyle(node).fontSize),
    })),
  );
  expect(printEvidence).toHaveLength(10);
  for (const item of printEvidence) {
    expect(item.visible, `BurnLens print visibility: ${item.text}`).toBe(true);
    expect(item.fontSize, `BurnLens print text size: ${item.text}`).toBeGreaterThanOrEqual(13);
  }
  const burnlensPages = await attachLetterPdf(page, testInfo, "burnlens-release-governance");
  expect(burnlensPages, "BurnLens release-governance print page budget").toBeLessThanOrEqual(4);

  await context.close();
});

test("Runbook authority evidence remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto("/work/runbook-sentinel#authority");

  expect(response?.status()).toBe(200);
  await expect(page.locator('article[data-project-model-id="runbook-sentinel"][data-control-trace="runbook-sentinel"]')).toHaveCount(1);
  const ledger = page.locator('[data-first-screen-ledger="runbook-sentinel"]');
  expect(await ledger.locator("dt").allTextContents()).toEqual([
    "Problem",
    "Intended reviewer",
    "My role",
    "Control system",
    "Result",
    "Limit",
  ]);
  expect(await ledger.locator("dd").allTextContents()).toEqual([
    "Keep an evidence-retrieving synthetic incident agent bounded when evidence is unreliable\u2014without letting retrieved text or model output authorize change.",
    "Software and reliability reviewers assessing a bounded control architecture before any real-infrastructure connection.",
    "Repository author and release owner; designed the authority separation, implemented the runtime and surfaces, and authored the evaluation and release checks.",
    "Dependency-free synthetic control system with bounded agent outcomes, structured proposals, separate approval and policy checks, synthetic state, and chained event logs.",
    "At pinned v0.0.20, 93 of 93 predefined synthetic attempts matched expected paths and final state; 9 of 84 tested-model outputs passed the required structure, so the candidate was excluded.",
    "Synthetic fixtures and state only. No real-system connectors, arbitrary shell, production reliability, adoption, or operational-impact claim.",
  ]);
  await expect(page.getByRole("heading", { name: "A proposal has no power by itself." })).toBeVisible();
  const signalRail = page.locator('[data-authority-rail="signal"]');
  const authorityRail = page.locator('[data-authority-rail="authority"]');
  expect(await signalRail.locator("h3").allTextContents()).toEqual([
    "Untrusted evidence",
    "Bounded agent",
    "Structured proposal",
  ]);
  expect(await signalRail.locator("li p").allTextContents()).toEqual([
    "Fresh content stays distinguishable from stale identity and untrusted guidance.",
    "Diagnose, request evidence, propose one predefined test action, or abstain.",
    "A typed action request with no approval or execution authority.",
  ]);
  expect(await authorityRail.locator("h3").allTextContents()).toEqual([
    "Separate approval",
    "Fixed software checks",
    "Synthetic executor",
  ]);
  expect(await authorityRail.locator("li p").allTextContents()).toEqual([
    "A project-specific launch-scoped loopback credential\u2014not proof of human identity.",
    "Policy, arguments, replay, one-use approval, repeated-request, and state checks.",
    "Only restart worker, roll back deployment, or warm cache in repository-local state.",
  ]);
  expect(
    await page.locator("[data-authority-rail]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-authority-rail")),
    ),
  ).toEqual(["signal", "authority"]);
  await expect(page.getByText("Proposal alone: no state-change authority.")).toBeVisible();
  await expect(page.getByText(/Software-control metaphor; no electrical or hardware implementation is claimed/i)).toBeVisible();
  const matrix = page.locator("[data-model-output-matrix]");
  await expect(matrix).toHaveAttribute(
    "aria-label",
    "Eighty-four tested local-model outputs: 9 valid, 67 rejected for invalid diagnosis identifiers, 7 rejected for invalid action arguments, and 1 rejected for evidence outside the permitted context.",
  );
  await expect(matrix.locator("span")).toHaveCount(84);
  expect(
    await matrix.locator("span").evaluateAll((nodes) =>
      nodes.reduce<Record<string, number>>((counts, node) => {
        const kind = node.getAttribute("data-kind") ?? "missing";
        counts[kind] = (counts[kind] ?? 0) + 1;
        return counts;
      }, {}),
    ),
  ).toEqual({ valid: 9, diagnosis: 67, arguments: 7, context: 1 });
  const matrixLegend = page.locator("[data-model-output-legend]");
  expect(await matrixLegend.locator("dt").allTextContents()).toEqual([
    "Valid structured output",
    "Invalid diagnosis identifier",
    "Invalid action argument",
    "Evidence outside context",
    "Total inspected",
  ]);
  expect(await matrixLegend.locator("dd").allTextContents()).toEqual([
    "9",
    "67",
    "7",
    "1",
    "84",
  ]);

  const failureExpectations = [
    ["RS.F03", ["rs.model_comparison.0018", "rs.evaluation_report.v0020"]],
    ["RS.F02", ["rs.action_split_gap.0020", "rs.evaluation.v0020", "rs.milestone.0020"]],
    ["RS.F01", ["rs.trace_gap.0016", "rs.trace.0020.attempt003", "rs.architecture.v0020"]],
  ] as const;
  for (const [evidenceId, sourceIds] of failureExpectations) {
    const record = page.locator(`[data-failure-dividend-record][data-evidence-id="${evidenceId}"]`);
    await expect(record).toHaveCount(1);
    expect(
      await record.locator("[data-source-id]").evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-source-id")),
      ),
    ).toEqual([...sourceIds]);
    expect(
      await record.locator("[data-stage]").evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-stage")),
      ),
    ).toEqual(["failed", "changed", "claimable", "boundary"]);
    await expect(record.locator("[data-boundary]")).toHaveCount(1);
  }

  const progression = page.locator(
    '[data-release-progression="runbook-sentinel"] [data-progression-stage]',
  );
  expect(
    await progression.evaluateAll((nodes) =>
      nodes.map((node) => ({
        stage: node.getAttribute("data-progression-stage"),
        marker: node.querySelector("p")?.textContent?.trim(),
        value: node.querySelector("strong")?.textContent?.trim(),
        body: node.querySelector("small")?.textContent?.trim(),
      })),
    ),
  ).toEqual([
    {
      stage: "1",
      marker: "Headline view",
      value: "3 / 3",
      body: "All three permitted actions appeared somewhere in the catalog.",
    },
    {
      stage: "2",
      marker: "Split-aware review",
      value: "5 / 6",
      body: "Held-out tests never exercised deployment rollback.",
    },
    {
      stage: "3",
      marker: "Evaluator changed",
      value: "+ 1 case",
      body: "A predefined held-out rollback case was added; any missing development-or-held-out combination now fails the gate.",
    },
    {
      stage: "4",
      marker: "Earned result",
      value: "6 / 6",
      body: "Each action was covered in both development and held-out cases across 31 fixed cases and three trials.",
    },
  ]);

  const proof = page.locator('[data-proof-room="runbook-sentinel"]');
  const receipt = proof.locator("dl").first();
  expect(await receipt.locator("dt").allTextContents()).toEqual([
    "Fixed cases",
    "Expected paths + final states",
    "Action / no-action",
    "Action coverage",
    "Selected trace",
    "Real systems",
  ]);
  expect(await receipt.locator("dd").allTextContents()).toEqual([
    "31 \u00d7 3 trials",
    "93 / 93 matched",
    "36 / 57",
    "6 / 6 across development + held-out",
    "165 linked events",
    "0 connected",
  ]);

  const dashboard = page.locator('[data-governed-figure="runbook-dashboard"]');
  const dashboardImage = dashboard.locator("img");
  await expect(dashboardImage).toHaveAttribute(
    "alt",
    "Runbook Sentinel dashboard screenshot showing the frozen evaluation pass, exact test metrics, a launch-scoped loopback approval boundary, and real infrastructure disconnected.",
  );
  const conditions = dashboard.locator("[data-media-conditions]");
  await expect(conditions).toContainText("Synthetic state only; real infrastructure disconnected.");
  await expect(conditions).toContainText("launch-scoped loopback credential");
  await expect(conditions).toContainText("Owner-approved display of this exact hash-bound asset");
  await expect(conditions).toContainText("no top-level license");
  await expect(conditions).toContainText("no general reuse right is granted");
  await expect(conditions.locator("a").nth(0)).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/runbook-sentinel/blob/f149ac2408f30b504b78844780b8533bed2ebfdc/artifacts/verification/dashboard-baseline-0020.png",
  );
  await expect(conditions.locator("a").nth(1)).toHaveAttribute(
    "href",
    "/media/projects/runbook-sentinel/sources.json",
  );
  await dashboard.evaluate((figure) => figure.scrollIntoView({ block: "center" }));
  await expect(dashboardImage).toHaveAttribute("width", "1440");
  await expect(dashboardImage).toHaveAttribute("height", "1000");
  await expect
    .poll(() =>
      dashboardImage.evaluate((image) =>
        (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
      ),
    )
    .toBe(true);
  const originalPath = await dashboardImage.evaluate((element) => {
    const rendered = element as HTMLImageElement;
    const currentUrl = new URL(rendered.currentSrc || rendered.src, location.href);
    return currentUrl.pathname === "/_next/image"
      ? currentUrl.searchParams.get("url")
      : currentUrl.pathname;
  });
  expect(originalPath).toBe("/media/projects/runbook-sentinel/dashboard-baseline-0020.png");
  const sourceResponse = await context.request.get(originalPath as string);
  expect(sourceResponse.status()).toBe(200);
  const sourceBytes = Buffer.from(await sourceResponse.body());
  expect(sourceBytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(sourceBytes.readUInt32BE(16)).toBe(1440);
  expect(sourceBytes.readUInt32BE(20)).toBe(1000);
  await expect(page.locator('a[href^="/media/"][href$=".png"]')).toHaveCount(0);
  expect(
    await page.locator('[data-source-ledger="runbook-sentinel"] [data-source-id]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-source-id")),
    ),
  ).toEqual([
    "rs.git.v0020",
    "rs.architecture.v0020",
    "rs.threat_model.v0020",
    "rs.evaluation.v0020",
    "rs.model_comparison.0018",
    "rs.action_split_gap.0020",
    "rs.trace_gap.0016",
    "rs.milestone.0020",
  ]);
  await expect(page.locator('[data-case-chapters="runbook-sentinel"] > summary')).toBeVisible();
  await context.close();
});

test("Runbook headings and accessibility hold at mobile and desktop review widths", async ({ page }) => {
  const expectedMovementHeadings = [
    "A proposal has no power by itself.",
    "The tested model failed the fixed contract.",
    "The failures rewrote the gate.",
    "What this release proves\u2014and what it cannot.",
  ];

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
    const article = page.locator('[data-control-trace="runbook-sentinel"]');
    await expect(article.locator("h1")).toHaveText("The model is not the control plane.");
    expect(await article.locator("h2").allTextContents()).toEqual(expectedMovementHeadings);

    const headingAudit = await article.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) => {
      const levels = nodes.map((node) => Number(node.tagName.slice(1)));
      return {
        levels,
        skipped: levels.some((level, index) => index > 0 && level > levels[index - 1] + 1),
        internalLabels: nodes
          .map((node) => node.textContent?.trim() ?? "")
          .filter((text) => /\b(?:RS\.F\d+|WCP-\d+|R\d{3}|[SKEBC]\.\d+)\b/i.test(text)),
      };
    });
    expect(headingAudit.skipped, `${viewport.width}px heading hierarchy`).toBe(false);
    expect(headingAudit.internalLabels, `${viewport.width}px reader-facing headings`).toEqual([]);

    const results = await new AxeBuilder({ page })
      .include('[data-control-trace="runbook-sentinel"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `${viewport.width}px\n${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
  }
});

test("Runbook descendants remain contained and the output matrix keeps its intended columns", async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });

    const layout = await page.evaluate(() => {
      const article = document.querySelector<HTMLElement>('[data-control-trace="runbook-sentinel"]');
      if (!article) throw new Error("Runbook control trace is missing.");
      const visibleDescendants = [article, ...article.querySelectorAll<HTMLElement>("*")]
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        });
      const outsideViewport = visibleDescendants.flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1
          ? [{
              node: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
              text: element.textContent?.trim().slice(0, 80),
              left: rect.left,
              right: rect.right,
            }]
          : [];
      });
      const reviewContainers = [
        article,
        ...article.querySelectorAll<HTMLElement>(
          "header, section, article, figure, dl, ol, [data-authority-rail], [data-model-output-matrix], [data-release-progression], [data-media-conditions], [data-source-ledger]",
        ),
      ];
      const overflowingContainers = reviewContainers.flatMap((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (style.display === "none" || rect.width === 0 || rect.height === 0) return [];
        const horizontalOverflow = style.overflowX;
        const masksOverflow = horizontalOverflow === "hidden" || horizontalOverflow === "clip";
        const exceedsViewport = rect.left < -1 || rect.right > window.innerWidth + 1;
        const clipsDescendants = element.scrollWidth > element.clientWidth + 1;
        return masksOverflow || exceedsViewport || clipsDescendants
          ? [{
              node: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
              overflowX: horizontalOverflow,
              left: rect.left,
              right: rect.right,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            }]
          : [];
      });
      const matrix = article.querySelector<HTMLElement>("[data-model-output-matrix]");
      if (!matrix) throw new Error("Runbook output matrix is missing.");
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        outsideViewport,
        overflowingContainers,
        matrixColumns: getComputedStyle(matrix).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      };
    });

    expect(layout.documentWidth, `${width}px document width`).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.outsideViewport, `${width}px visible descendants`).toEqual([]);
    expect(layout.overflowingContainers, `${width}px review containers`).toEqual([]);
    expect(layout.matrixColumns, `${width}px matrix columns`).toBe(width <= 390 ? 12 : 14);
  }
});

test("Runbook dark surfaces expose a strong keyboard focus indicator", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844, selector: '[data-case-chapters="runbook-sentinel"] > summary' },
    { width: 1440, height: 1000, selector: '[data-case-chapter-index="runbook-sentinel"] a' },
    { width: 1440, height: 1000, selector: '[data-evidence-id="RS.F03"] [data-source-id]' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
    const target = page.locator(viewport.selector).first();
    await target.scrollIntoViewIfNeeded();
    await target.focus();
    await expect(target).toBeFocused();
    const focus = await target.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        color: style.outlineColor,
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        withinViewport:
          rect.top >= -1 && rect.left >= -1 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1,
      };
    });
    expect(focus.style, viewport.selector).not.toBe("none");
    expect(focus.width, viewport.selector).toBeGreaterThanOrEqual(3);
    expect(focus.color, viewport.selector).toBe("rgb(199, 205, 191)");
    expect(focus.withinViewport, viewport.selector).toBe(true);
  }
});

test("Runbook respects reduced motion and prints its evidence in readable contrast", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  const motion = await page.evaluate(() => {
    const article = document.querySelector('[data-control-trace="runbook-sentinel"]');
    if (!article) throw new Error("Runbook control trace is missing.");
    const parseDurations = (value: string) => value.split(",").map((duration) => {
      const trimmed = duration.trim();
      return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
    });
    const active = [...article.querySelectorAll<HTMLElement>("*")].flatMap((element) => {
      const style = getComputedStyle(element);
      const maxAnimation = Math.max(0, ...parseDurations(style.animationDuration));
      const maxTransition = Math.max(0, ...parseDurations(style.transitionDuration));
      return style.animationName !== "none" || maxAnimation > 0.01 || maxTransition > 0.01
        ? [{ tag: element.tagName, animation: style.animationName, maxAnimation, maxTransition }]
        : [];
    });
    return { scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, active };
  });
  expect(motion.scrollBehavior).toBe("auto");
  expect(motion.active).toEqual([]);

  await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 816, height: 1056 });
  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await expect(page.locator('[data-case-chapter-index="runbook-sentinel"]')).toBeHidden();
  await expect(page.locator('[data-case-chapters="runbook-sentinel"]')).toBeHidden();
  await expect(page.locator('nav[aria-label="Adjacent portfolio case studies"]')).toBeHidden();
  await expect(page.locator('[data-evidence-id="RS.F03"] [data-source-id]').first()).toBeVisible();
  await expect(page.locator('[data-proof-room="runbook-sentinel"] [data-media-conditions]')).toBeVisible();
  await expect(page.locator('[data-proof-room="runbook-sentinel"] [data-source-ledger]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Limits that travel with the result" })).toBeVisible();
  const runbookPrintLayout = await page.evaluate(() => {
    const records = [...document.querySelectorAll<HTMLElement>(
      '[data-failure-dividend="runbook-sentinel"] [data-failure-dividend-record]',
    )];
    const leads = [...document.querySelectorAll<HTMLElement>(
      '[data-failure-dividend="runbook-sentinel"] section > div:first-child > p, [data-failure-dividend="runbook-sentinel"] section > div:first-child > h2',
    )].filter((node) => node.textContent?.trim());
    const labels = [...document.querySelectorAll<HTMLElement>(
      '[data-failure-dividend="runbook-sentinel"] [data-stage] > span',
    )];
    const changedSurfaces = [...document.querySelectorAll<HTMLElement>(
      '[data-failure-dividend="runbook-sentinel"] [data-stage="changed"]',
    )];
    const signalRail = document.querySelector<HTMLElement>('[data-authority-rail="signal"]');
    const authorityBreak = document.querySelector<HTMLElement>("[data-authority-break]");
    const authorityTrace = signalRail?.parentElement;
    const matrix = document.querySelector<HTMLElement>("[data-model-output-matrix]");
    const lotLabel = matrix?.previousElementSibling as HTMLElement | null;
    const proof = document.querySelector<HTMLElement>('[data-proof-room="runbook-sentinel"]');
    const proofLead = proof?.firstElementChild as HTMLElement | null;
    const article = document.querySelector<HTMLElement>('[data-control-trace="runbook-sentinel"]');
    const hero = article?.querySelector<HTMLElement>(":scope > header");
    const statusBus = hero?.querySelector<HTMLElement>(":scope > div:first-child");
    const heroLedger = hero?.querySelector<HTMLElement>("[data-first-screen-ledger]");
    const candidateOutcome = document.querySelector<HTMLElement>('[data-evidence-id="RS.F03"] [data-stage="changed"]')
      ?.parentElement;
    const progressionRail = document.querySelector<HTMLElement>("[data-progression-stage]")?.parentElement;
    const coverageOutcome = document.querySelector<HTMLElement>('[data-evidence-id="RS.F02"] [data-stage="changed"]')
      ?.parentElement;
    const traceOutcome = document.querySelector<HTMLElement>('[data-evidence-id="RS.F01"] [data-stage="changed"]')
      ?.parentElement;
    const releaseReceipt = proof?.querySelector<HTMLElement>(":scope > dl");
    const dashboardFigure = proof?.querySelector<HTMLElement>('[data-governed-figure="runbook-dashboard"]');
    const sourceLedger = proof?.querySelector<HTMLElement>('[data-source-ledger="runbook-sentinel"]');
    const proofGrid = sourceLedger?.parentElement;
    const sourceAction = document.querySelector<HTMLElement>("header a[data-source-id='rs.git.v0020']");
    const layoutSurfaces = {
      statusBus,
      heroLedger,
      candidateOutcome,
      progressionRail,
      coverageOutcome,
      traceOutcome,
      releaseReceipt,
      dashboardFigure,
      proofGrid,
    };
    if (
      !authorityTrace ||
      !authorityBreak ||
      !lotLabel ||
      !proofLead ||
      !sourceAction ||
      Object.values(layoutSurfaces).some((surface) => !surface)
    ) {
      throw new Error("Runbook print pagination surfaces are incomplete.");
    }
    const columns = (surface: HTMLElement | null | undefined) =>
      getComputedStyle(surface!).gridTemplateColumns.split(/\s+/).filter(Boolean);
    const borders = (surface: HTMLElement | null | undefined) =>
      [...surface!.children].map((child) => {
        const style = getComputedStyle(child);
        return { left: style.borderLeftWidth, top: style.borderTopWidth };
      });
    return {
      recordBreaks: records.map((record) => getComputedStyle(record).breakInside),
      failureMeta: records.map((record) => {
        const header = record.querySelector<HTMLElement>(":scope > header");
        const nav = header?.querySelector<HTMLElement>("nav");
        if (!header || !nav) throw new Error("Runbook failure metadata is incomplete.");
        return {
          headerDisplay: getComputedStyle(header).display,
          breakInside: getComputedStyle(header).breakInside,
          breakAfter: getComputedStyle(header).breakAfter,
          navDisplay: getComputedStyle(nav).display,
          navFlow: getComputedStyle(nav).gridAutoFlow,
          links: [...nav.querySelectorAll<HTMLElement>("a[href]")].map((link) => ({
            text: link.textContent?.replace(/\s+/g, " ").trim(),
            pseudoDisplay: getComputedStyle(link, "::after").display,
            pseudoContent: getComputedStyle(link, "::after").content,
            pseudoFontSize: Number.parseFloat(getComputedStyle(link, "::after").fontSize),
            href: link.getAttribute("href"),
          })),
        };
      }),
      leadColors: leads.map((node) => ({
        text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
        color: getComputedStyle(node).color,
      })),
      labelColors: labels.map((node) => ({
        text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
        color: getComputedStyle(node).color,
        background: getComputedStyle(node).backgroundColor,
      })),
      changedSurfaces: changedSurfaces.map((node) => ({
        text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
        color: getComputedStyle(node).color,
        background: getComputedStyle(node).backgroundColor,
      })),
      authorityTrace: {
        columns: getComputedStyle(authorityTrace).gridTemplateColumns.split(/\s+/).filter(Boolean),
        breakInside: getComputedStyle(authorityTrace).breakInside,
      },
      authorityBreak: getComputedStyle(authorityBreak).breakInside,
      lotLabelColor: getComputedStyle(lotLabel).color,
      proofLead: {
        paddingTop: Number.parseFloat(getComputedStyle(proofLead).paddingTop),
        breakInside: getComputedStyle(proofLead).breakInside,
        breakAfter: getComputedStyle(proofLead).breakAfter,
      },
      sourceAction: {
        display: getComputedStyle(sourceAction).display,
        breakInside: getComputedStyle(sourceAction).breakInside,
        pseudoDisplay: getComputedStyle(sourceAction, "::after").display,
        pseudoOverflowWrap: getComputedStyle(sourceAction, "::after").overflowWrap,
        pseudoWordBreak: getComputedStyle(sourceAction, "::after").wordBreak,
        pseudoFontSize: Number.parseFloat(getComputedStyle(sourceAction, "::after").fontSize),
      },
      layoutColumns: {
        statusBus: columns(statusBus),
        heroLedger: columns(heroLedger),
        candidateOutcome: columns(candidateOutcome),
        progressionRail: columns(progressionRail),
        coverageOutcome: columns(coverageOutcome),
        traceOutcome: columns(traceOutcome),
        releaseReceipt: columns(releaseReceipt),
        dashboardFigure: columns(dashboardFigure),
        proofGrid: columns(proofGrid),
      },
      childBorders: {
        statusBus: borders(statusBus),
        heroLedger: borders(heroLedger),
        releaseReceipt: borders(releaseReceipt),
        progressionRail: borders(progressionRail),
      },
      atomicLayouts: {
        candidateOutcome: getComputedStyle(candidateOutcome!).breakInside,
        progressionRail: getComputedStyle(progressionRail!).breakInside,
        coverageOutcome: getComputedStyle(coverageOutcome!).breakInside,
        traceOutcome: getComputedStyle(traceOutcome!).breakInside,
        releaseReceipt: getComputedStyle(releaseReceipt!).breakInside,
        dashboardFigure: getComputedStyle(dashboardFigure!).breakInside,
      },
    };
  });
  expect(runbookPrintLayout.recordBreaks).toEqual(["auto", "auto", "auto"]);
  expect(runbookPrintLayout.failureMeta).toHaveLength(3);
  for (const meta of runbookPrintLayout.failureMeta) {
    expect(meta.headerDisplay).toBe("block");
    expect(meta.navDisplay).toBe("grid");
    expect(meta.navFlow).toBe("row");
    expect(meta.links.length).toBeGreaterThan(0);
    for (const link of meta.links) {
      expect(link.pseudoDisplay, `Runbook print URL display: ${link.text}`).toBe("block");
      expect(link.pseudoContent, `Runbook print URL content: ${link.text}`).toContain(link.href);
      expect(link.pseudoFontSize, `Runbook print URL size: ${link.text}`).toBeGreaterThanOrEqual(12);
    }
  }
  expect(runbookPrintLayout.failureMeta.at(-1)?.breakInside).toBe("avoid");
  expect(runbookPrintLayout.failureMeta.at(-1)?.breakAfter).toBe("avoid");
  expect(runbookPrintLayout.leadColors.length).toBeGreaterThan(0);
  for (const lead of runbookPrintLayout.leadColors) {
    const parse = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const channel = (value: number) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (rgb: number[]) =>
      0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    const foreground = luminance(parse(lead.color));
    const background = luminance([255, 255, 255]);
    const ratio = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    expect(ratio, `Runbook print lead: ${lead.text}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(runbookPrintLayout.labelColors.length).toBeGreaterThan(0);
  for (const label of runbookPrintLayout.labelColors) {
    expect(label.color, `Runbook print label: ${label.text}`).toBe("rgb(34, 34, 34)");
    expect(label.background, `Runbook print label background: ${label.text}`).toBe("rgba(0, 0, 0, 0)");
  }
  expect(runbookPrintLayout.changedSurfaces).toHaveLength(3);
  for (const surface of runbookPrintLayout.changedSurfaces) {
    expect(surface.color, `Runbook print changed surface: ${surface.text}`).toBe("rgb(34, 34, 34)");
    expect(surface.background, `Runbook print changed surface: ${surface.text}`).toBe("rgb(255, 255, 255)");
  }
  expect(runbookPrintLayout.authorityTrace.columns).toHaveLength(3);
  expect(runbookPrintLayout.authorityTrace.breakInside).toBe("avoid");
  expect(runbookPrintLayout.authorityBreak).toBe("avoid");
  expect(runbookPrintLayout.lotLabelColor).toBe("rgb(34, 34, 34)");
  expect(runbookPrintLayout.proofLead.paddingTop).toBeGreaterThanOrEqual(24);
  expect(runbookPrintLayout.proofLead.breakInside).toBe("avoid");
  expect(runbookPrintLayout.proofLead.breakAfter).toBe("avoid");
  expect(runbookPrintLayout.sourceAction).toEqual({
    display: "block",
    breakInside: "avoid",
    pseudoDisplay: "block",
    pseudoOverflowWrap: "anywhere",
    pseudoWordBreak: "normal",
    pseudoFontSize: 12,
  });
  expect(runbookPrintLayout.layoutColumns).toEqual({
    statusBus: expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)]),
    heroLedger: expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)]),
    candidateOutcome: expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)]),
    progressionRail: expect.arrayContaining([
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
    ]),
    coverageOutcome: expect.arrayContaining([expect.any(String), expect.any(String)]),
    traceOutcome: expect.arrayContaining([expect.any(String), expect.any(String)]),
    releaseReceipt: expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)]),
    dashboardFigure: expect.arrayContaining([expect.any(String), expect.any(String)]),
    proofGrid: expect.arrayContaining([expect.any(String), expect.any(String)]),
  });
  expect(Object.fromEntries(
    Object.entries(runbookPrintLayout.layoutColumns).map(([name, columns]) => [name, columns.length]),
  )).toEqual({
    statusBus: 3,
    heroLedger: 3,
    candidateOutcome: 3,
    progressionRail: 4,
    coverageOutcome: 2,
    traceOutcome: 2,
    releaseReceipt: 3,
    dashboardFigure: 2,
    proofGrid: 2,
  });
  expect(Object.values(runbookPrintLayout.atomicLayouts)).toEqual([
    "avoid",
    "avoid",
    "avoid",
    "avoid",
    "avoid",
    "avoid",
  ]);
  expect(runbookPrintLayout.childBorders.statusBus).toEqual([
    { left: "0px", top: "0px" },
    { left: "1px", top: "0px" },
    { left: "1px", top: "0px" },
  ]);
  for (const ledgerBorders of [
    runbookPrintLayout.childBorders.heroLedger,
    runbookPrintLayout.childBorders.releaseReceipt,
  ]) {
    expect(ledgerBorders).toEqual([
      { left: "0px", top: "0px" },
      { left: "1px", top: "0px" },
      { left: "1px", top: "0px" },
      { left: "0px", top: "1px" },
      { left: "1px", top: "1px" },
      { left: "1px", top: "1px" },
    ]);
  }
  expect(runbookPrintLayout.childBorders.progressionRail).toEqual([
    { left: "0px", top: "0px" },
    { left: "1px", top: "0px" },
    { left: "1px", top: "0px" },
    { left: "1px", top: "0px" },
  ]);
  const printableEvidence = page.locator(
    '[data-evidence-id="RS.F03"] [data-source-id], [data-proof-room="runbook-sentinel"] [data-media-conditions], [data-proof-room="runbook-sentinel"] [data-source-ledger] a, [data-proof-room="runbook-sentinel"] li',
  );
  await expect(printableEvidence.first()).toBeVisible();
  const printContrast = await page.evaluate(() => {
    const parseRgb = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const channel = (value: number) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (rgb: number[]) =>
      0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    const contrast = (a: number[], b: number[]) => {
      const [first, second] = [luminance(a), luminance(b)];
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    };
    const targets = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-evidence-id="RS.F03"] [data-source-id], [data-proof-room="runbook-sentinel"] [data-media-conditions], [data-proof-room="runbook-sentinel"] [data-source-ledger] a, [data-proof-room="runbook-sentinel"] li',
      ),
    ];
    return targets.map((target) => {
      let background = getComputedStyle(target).backgroundColor;
      let ancestor = target.parentElement;
      while ((background === "rgba(0, 0, 0, 0)" || background === "transparent") && ancestor) {
        background = getComputedStyle(ancestor).backgroundColor;
        ancestor = ancestor.parentElement;
      }
      const foreground = getComputedStyle(target).color;
      return { text: target.textContent?.trim().slice(0, 60), foreground, background, ratio: contrast(parseRgb(foreground), parseRgb(background)) };
    });
  });
  expect(printContrast.length).toBeGreaterThan(0);
  for (const sample of printContrast) {
    expect(sample.ratio, JSON.stringify(sample)).toBeGreaterThanOrEqual(4.5);
  }

  const runbookPages = await attachLetterPdf(page, testInfo, "runbook-sentinel");
  expect(runbookPages, "Runbook transition/orphan regression budget").toBeLessThanOrEqual(8);
});

test("Runbook Open Graph endpoint is an exact 1200 by 630 PNG", async ({ request }) => {
  const response = await request.get("/work/runbook-sentinel/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const bytes = Buffer.from(await response.body());
  expect(bytes.length).toBeGreaterThan(24);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});

test("flagship failure evidence remains only where the selected public story supports it", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  expect(projectRecords.burnlens.evidence.failureDividend.state).toBe("not_applicable");
  expect(projectSurfacePlan.burnlens.featuredFailureIds).toEqual({
    homepage: [],
    workIndex: [],
    resume: [],
    projectRoute: [],
  });
  let response = await page.goto("/work/burnlens", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.locator('article[data-project-model-id="burnlens"]')).toHaveCount(1);
  await expect(page.locator("[data-failure-dividend], [data-failure-dividend-record]")).toHaveCount(0);

  response = await page.goto("/work/runbook-sentinel#candidate", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "The tested model failed the fixed contract." })).toBeVisible();

  const ledger = page.locator('[data-failure-dividend="runbook-sentinel"]');
  const records = ledger.locator("[data-failure-dividend-record]");
  await expect(records).toHaveCount(3);
  expect(await records.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-evidence-id"))))
    .toEqual(["RS.F03", "RS.F02", "RS.F01"]);
  expect(await ledger.locator("[data-source-id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-source-id")),
  )).toEqual([
    "rs.model_comparison.0018",
    "rs.evaluation_report.v0020",
    "rs.action_split_gap.0020",
    "rs.evaluation.v0020",
    "rs.milestone.0020",
    "rs.trace_gap.0016",
    "rs.trace.0020.attempt003",
    "rs.architecture.v0020",
  ]);
  await expect(records.locator('[data-stage="failed"]')).toHaveCount(3);
  await expect(records.locator('[data-stage="changed"]')).toHaveCount(3);
  await expect(records.locator('[data-stage="claimable"]')).toHaveCount(3);
  await expect(records.locator("[data-boundary]")).toHaveCount(3);
  await expect(ledger.getByText(/success value in a 150-event trace/i)).toBeVisible();
  await expect(ledger.getByText(/fail the gate for any missing action-and-split pair/i)).toBeVisible();
  await expect(ledger.getByText(/selection process visibly rejects a weaker candidate/i)).toBeVisible();
  await expect(ledger.getByText(/No writer authentication, hostile-writer resistance/i)).toBeVisible();
  await expect(ledger.getByRole("link", { name: /Frozen model comparison/ })).toBeVisible();

  await context.close();
});

test("Quest Craft is exactly three supporting movements with the canonical route projection", async ({ page }) => {
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });

  const article = page.locator(
    'article[data-project-model-id="quest-craft"][data-supporting-route="quest-craft"][data-visual-world="branching-manuscript"]',
  );
  await expect(article).toHaveCount(1);
  const movements = article.locator(":scope > [data-supporting-movement]");
  await expect(movements).toHaveCount(3);
  expect(await movements.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-supporting-movement")),
  )).toEqual(["agency-score", "evaluation-corrections", "evidence-limits-sources"]);
  await expect(movements.locator(":scope > h2, :scope > header h2, :scope > div h2")).toHaveCount(3);

  const expectedFields = projectSurfacePlan["quest-craft"].fields.projectRoute;
  expect(await article.locator("[data-project-field]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-field")).sort(),
  )).toEqual([...expectedFields].sort());
  for (const field of expectedFields.filter((field) => field !== "failureDividend")) {
    const owner = article.locator(`[data-project-field="${field}"]`);
    await expect(owner).toHaveCount(1);
    await expect(owner).toContainText(renderedEvidence("quest-craft", field));
  }
  const failureField = projectRecords["quest-craft"].evidence.failureDividend;
  if (failureField.state !== "supported") throw new Error("Quest failure dividend must be supported.");
  for (const correction of failureField.value) {
    const record = article.locator(`[data-evidence-id="${correction.id}"]`);
    await expect(record).toContainText(correction.failure);
    await expect(record).toContainText(correction.buildChange);
    await expect(record).toContainText(correction.earnedCapability);
    await expect(record).toContainText(correction.boundary);
  }

  expect(await article.locator("[data-first-screen-ledger] > div").evaluateAll((rows) =>
    rows.map((row) => ({
      label: row.querySelector("dt")?.textContent?.trim(),
      field: row.getAttribute("data-project-field"),
      value: row.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim(),
    })),
  )).toEqual([
    { label: "Problem", field: "problem", value: renderedEvidence("quest-craft", "problem") },
    { label: "Intended user", field: "intendedUser", value: renderedEvidence("quest-craft", "intendedUser") },
    { label: "My role", field: "personalRole", value: renderedEvidence("quest-craft", "personalRole") },
    { label: "Interaction built", field: "implementation", value: renderedEvidence("quest-craft", "implementation") },
    { label: "Result", field: "outcome", value: renderedEvidence("quest-craft", "outcome") },
    { label: "Limit", field: "limitations", value: renderedEvidence("quest-craft", "limitations") },
  ]);
  await expect(article.locator(
    "[data-case-chapter-index], [data-case-chapters], [data-failure-dividend], [data-governed-figure], img, canvas, video",
  )).toHaveCount(0);
  await expect(article.locator('nav[aria-label="Adjacent portfolio case studies"]')).toHaveCount(0);
  await expect(article.getByText(/\bQC\.F0[12]\b/)).toHaveCount(0);
});

test("Quest Craft native agency score changes state without generating or mutating content", async ({ page }) => {
  const runtimeRequests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr", "websocket", "eventsource"].includes(request.resourceType())) {
      runtimeRequests.push(request.url());
    }
  });
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  runtimeRequests.length = 0;

  const baseline = await page.evaluate(() => ({
    text: document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim(),
    nodes: document.querySelector("main")?.querySelectorAll("*").length,
    resources: performance.getEntriesByType("resource").length,
  }));
  const beatValues = ["honor", "effect", "return", "carry"] as const;
  const beatDefinitions = [
    ["honor", "The completed player action remains true."],
    ["effect", "The immediate result becomes playable."],
    ["return", "A meaningful decision goes back to the players."],
    ["carry", "Later pressure stays open and non-punitive."],
  ] as const;
  await expect(page.locator('[data-agency-score] input[type="radio"][name="quest-beat"]')).toHaveCount(4);
  await expect(page.locator('[data-agency-score] [data-beat-definition]')).toHaveCount(4);
  await expect(page.locator('[data-agency-score] [data-path-trace]')).toHaveCount(3);
  await expect(page.locator('[data-agency-score] [data-path-trace] p')).toHaveCount(0);
  expect(await page.locator('[data-agency-score] [data-beat-definition]').evaluateAll((nodes) =>
    nodes.map((node) => [node.getAttribute("data-beat-definition"), node.textContent?.trim()]),
  )).toEqual(beatDefinitions.map(([id, definition]) => [id, definition]));
  for (const [, definition] of beatDefinitions) {
    expect(await page.locator('article[data-supporting-route="quest-craft"]').getByText(definition, { exact: true }).count())
      .toBe(1);
  }
  expect(await page.locator('[data-agency-score] [data-path-trace]').evaluateAll((traces) =>
    traces.map((trace) => ({
      path: trace.getAttribute("data-path-trace"),
      beats: [...trace.querySelectorAll<HTMLElement>("[data-beat]")].map((beat) => ({
        id: beat.getAttribute("data-beat"),
        number: beat.querySelector("span")?.textContent?.trim(),
        label: beat.querySelector("strong")?.textContent?.trim(),
      })),
    })),
  )).toEqual(["A", "B", "C"].map((path) => ({
    path,
    beats: [
      { id: "honor", number: "01", label: "Honor" },
      { id: "effect", number: "02", label: "Effect" },
      { id: "return", number: "03", label: "Return" },
      { id: "carry", number: "04", label: "Carry" },
    ],
  })));

  for (const beat of beatValues) {
    const radio = page.locator(`[data-agency-score] input[value="${beat}"]`);
    await radio.focus();
    await page.keyboard.press("Space");
    await expect(radio).toBeChecked();
    const state = await page.evaluate((selectedBeat) => {
      const selected = [...document.querySelectorAll<HTMLElement>(`[data-beat="${selectedBeat}"]`)];
      const unselected = document.querySelector<HTMLElement>(`[data-beat]:not([data-beat="${selectedBeat}"])`);
      return {
        selected: selected.map((node) => ({
          background: getComputedStyle(node).backgroundColor,
          border: getComputedStyle(node).borderTopColor,
          marker: getComputedStyle(node, "::after").content,
        })),
        unselected: unselected ? {
          background: getComputedStyle(unselected).backgroundColor,
          border: getComputedStyle(unselected).borderTopColor,
          marker: getComputedStyle(unselected, "::after").content,
        } : null,
        labelMarker: getComputedStyle(
          document.querySelector(`input[value="${selectedBeat}"]`)?.closest("label") as Element,
          "::after",
        ).content,
      };
    }, beat);
    expect(state.selected).toHaveLength(3);
    expect(new Set(state.selected.map((item) => JSON.stringify(item))).size).toBe(1);
    expect(state.unselected).not.toBeNull();
    expect(state.selected[0].background).not.toBe(state.unselected?.background);
    expect(state.selected[0].marker).not.toBe("none");
    expect(state.selected[0].marker).not.toBe('""');
    expect(state.labelMarker).toContain("Selected");

    expect(await page.evaluate(() => ({
      text: document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim(),
      nodes: document.querySelector("main")?.querySelectorAll("*").length,
      resources: performance.getEntriesByType("resource").length,
    }))).toEqual(baseline);
  }
  expect(runtimeRequests).toEqual([]);
});

test("Quest Craft remains complete and operable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work/quest-craft", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  const movements = page.locator('article[data-supporting-route="quest-craft"] > [data-supporting-movement]');
  await expect(movements).toHaveCount(3);
  for (const movement of ["agency-score", "evaluation-corrections", "evidence-limits-sources"]) {
    await expect(page.locator(`[data-supporting-movement="${movement}"]`)).toBeVisible();
  }
  const radios = page.locator('[data-agency-score] input[type="radio"]');
  await expect(radios).toHaveCount(4);
  for (const beat of ["honor", "effect", "return", "carry"]) {
    const radio = page.locator(`[data-agency-score] input[value="${beat}"]`);
    await radio.check();
    await expect(radio).toBeChecked();
    const markerState = await page.locator("[data-path-trace]").evaluateAll((traces) => traces.map((trace) =>
      [...trace.querySelectorAll<HTMLElement>("[data-beat]")].map((node) => ({
        id: node.getAttribute("data-beat"),
        marker: getComputedStyle(node, "::after").content,
      })),
    ));
    expect(markerState).toHaveLength(3);
    for (const path of markerState) {
      expect(path.filter(({ marker }) => marker !== "none" && marker !== '""')).toEqual([
        expect.objectContaining({ id: beat }),
      ]);
    }
  }
  expect(await page.locator("[data-evaluation-ledger] tbody tr").count()).toBe(12);
  expect(await page.locator('[data-evaluation-ledger] td[data-kind="generated"]').count()).toBe(33);
  expect(await page.locator('[data-evaluation-ledger] td[data-kind="rejected"]').count()).toBe(3);
  await expect(page.getByText("360 / 360", { exact: false })).toBeVisible();
  await expect(page.getByText("Six failed or superseded attempts", { exact: true })).toBeVisible();
  await expect(page.locator("[data-correction-register] [data-evidence-id]")).toHaveCount(2);
  await expect(page.getByText(/adult Game Master retains final authority/i)).toBeVisible();
  await expect(page.getByText(/not production-ready/i)).toBeVisible();
  await expect(page.locator('[data-supporting-movement="evidence-limits-sources"] li').filter({
    hasText: /does not establish general child safety/i,
  })).toBeVisible();
  await expect(page.locator("[data-source-folio] a")).toHaveCount(5);
  await expect(page.locator('[data-media-record="quest-craft-social-preview"]')).toBeVisible();
  const mutablePrototype = page.getByRole("link", { name: "Mutable Lovable prototype", exact: true });
  await expect(mutablePrototype).toBeVisible();
  await expect(mutablePrototype.locator("..")).toContainText(/generation behavior was not re-tested/i);
  await context.close();
});

test("Quest Craft corrections own exact claims and immutable evidence links", async ({ page }) => {
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  const failureField = projectRecords["quest-craft"].evidence.failureDividend;
  if (failureField.state !== "supported") throw new Error("Quest failure dividend must be supported.");

  for (const correction of failureField.value) {
    const record = page.locator(`[data-correction-register] [data-evidence-id="${correction.id}"]`);
    await expect(record).toHaveCount(1);
    await expect(record).toContainText(correction.failure);
    await expect(record).toContainText(correction.buildChange);
    await expect(record).toContainText(correction.earnedCapability);
    await expect(record).toContainText(correction.boundary);
    expect(await record.locator("[data-source-id]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-source-id")),
    )).toEqual(correction.sourceIds);
    await expect(record.locator('[data-source-id="quest.attempts"]')).toHaveAttribute(
      "href",
      getPublicSourceHref("quest.attempts"),
    );
    await expect(record.locator('[data-source-id="quest.results"]')).toHaveAttribute(
      "href",
      getPublicSourceHref("quest.results"),
    );
  }

  const sourceIds = [
    "quest.snapshot",
    "quest.results",
    "quest.attempts",
    "quest.guardrails",
    "quest.readme-ai-use",
  ] as const;
  const sourceFolio = page.locator("[data-source-folio]");
  expect(await sourceFolio.locator("[data-source-id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-source-id")),
  )).toEqual(sourceIds);
  for (const sourceId of sourceIds) {
    await expect(sourceFolio.locator(`[data-source-id="${sourceId}"]`)).toHaveAttribute(
      "href",
      getPublicSourceHref(sourceId),
    );
  }
  await expect(sourceFolio.locator('[data-source-id="quest.readme-ai-use"]')).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/blob/bc14c43840aabb11ca35e94df0c8682672f24f3c/README.md#8-ai-use-memo",
  );
  await expect(sourceFolio.getByRole("link", { name: /Public reviewer snapshot/i })).toHaveAttribute(
    "href",
    getPublicSourceHref("quest.snapshot"),
  );
  await expect(page.locator("[data-source-folio-heading]")).toContainText("Exact source folio");
  await expect(page.locator("[data-source-folio-heading] h3")).toHaveText(
    "Five public records, each bound to its claim.",
  );
  const mutablePrototype = page.getByRole("link", { name: "Mutable Lovable prototype", exact: true });
  await expect(mutablePrototype).toHaveAttribute(
    "href",
    "https://choice-weaver-aid.lovable.app/",
  );
  await expect(mutablePrototype.locator("..")).toContainText(/generation behavior was not re-tested/i);
});

test("Quest Craft passes targeted accessibility and semantic hierarchy at mobile and desktop", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
    const article = page.locator('article[data-supporting-route="quest-craft"]');
    await expect(article.locator("h1")).toHaveCount(1);
    const headingLevels = await article.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) =>
      nodes.map((node) => Number(node.tagName.slice(1))),
    );
    expect(headingLevels[0]).toBe(1);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(headingLevels[index] - headingLevels[index - 1], `${viewport.width}px heading ${index}`).toBeLessThanOrEqual(1);
    }
    await expect(article.locator("fieldset[data-agency-score]")).toHaveCount(1);
    await expect(article.locator("fieldset[data-agency-score] > legend")).toHaveCount(1);
    await expect(article.locator("fieldset[data-agency-score] label")).toHaveCount(4);
    await expect(article.locator("fieldset[data-agency-score] label input[type=radio]")).toHaveCount(4);
    await expect(article.locator("[data-evaluation-ledger]")).toHaveCount(1);
    await expect(article.locator("[data-evaluation-ledger] thead th")).toHaveCount(4);
    await expect(article.locator("[data-evaluation-ledger] tbody th[scope=row]")).toHaveCount(12);
    await expect(article.locator("[data-evaluation-ledger] tbody td")).toHaveCount(36);

    const targetSizes = await article.locator(
      "[data-agency-score] label, [data-table-scroll], [data-correction-register] footer a, [data-source-folio] a, [data-supporting-movement=\"evidence-limits-sources\"] > footer a, a[href=\"https://choice-weaver-aid.lovable.app/\"], [data-media-record=\"quest-craft-social-preview\"]",
    ).evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { text: node.textContent?.trim().slice(0, 50), width: rect.width, height: rect.height };
    }));
    expect(targetSizes.length).toBeGreaterThan(0);
    for (const target of targetSizes) {
      expect(target.width, JSON.stringify(target)).toBeGreaterThanOrEqual(24);
      expect(target.height, JSON.stringify(target)).toBeGreaterThanOrEqual(24);
    }
    for (const label of targetSizes.slice(0, 4)) {
      expect(label.height, JSON.stringify(label)).toBeGreaterThanOrEqual(44);
    }

    const results = await new AxeBuilder({ page })
      .include('article[data-supporting-route="quest-craft"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `${viewport.width}px\n${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
  }
});

test("Quest Craft contains every review width and only its labeled table scrolls", async ({ page }) => {
  const reflowCases = [
    { label: "320 CSS pixels / 400% reflow from 1280", width: 320, textZoom: 100 },
    { label: "390 CSS pixels", width: 390, textZoom: 100 },
    { label: "768 CSS pixels", width: 768, textZoom: 100 },
    { label: "1280 CSS pixels", width: 1280, textZoom: 100 },
    { label: "1440 CSS pixels", width: 1440, textZoom: 100 },
    { label: "200% text zoom", width: 1280, textZoom: 200 },
  ] as const;

  for (const { label, width, textZoom } of reflowCases) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
    await page.evaluate((percent) => {
      document.documentElement.style.fontSize = `${percent}%`;
    }, textZoom);
    const layout = await page.evaluate(() => {
      const article = document.querySelector<HTMLElement>('article[data-supporting-route="quest-craft"]');
      if (!article) throw new Error("Quest article is missing.");
      const tableScroller = article.querySelector<HTMLElement>("[data-table-scroll]");
      if (!tableScroller) throw new Error("Quest table scroller is missing.");
      const visible = [article, ...article.querySelectorAll<HTMLElement>("*")].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      const outside = visible.flatMap((node) => {
        if (tableScroller.contains(node)) return [];
        const rect = node.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1
          ? [{ node: node.tagName, text: node.textContent?.trim().slice(0, 60), left: rect.left, right: rect.right }]
          : [];
      });
      const pageOutside = [document.body, ...document.body.querySelectorAll<HTMLElement>("*")].flatMap((node) => {
        if (tableScroller.contains(node)) return [];
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        if (style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) return [];
        return rect.left < -1 || rect.right > innerWidth + 1
          ? [{
            node: node.tagName,
            className: node.className,
            text: node.textContent?.trim().slice(0, 60),
            left: rect.left,
            right: rect.right,
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
            overflowX: style.overflowX,
          }]
          : [];
      });
      const horizontalScrollers = visible.flatMap((node) => {
        const overflow = getComputedStyle(node).overflowX;
        const scrollable = node.scrollWidth > node.clientWidth + 1 && ["auto", "scroll"].includes(overflow);
        return scrollable ? [node.hasAttribute("data-table-scroll") ? "table" : node.tagName] : [];
      });
      const ribbons = article.querySelector<HTMLElement>("[data-agency-score]");
      const canExerciseTableScroll = tableScroller.scrollWidth > tableScroller.clientWidth + 1;
      tableScroller.scrollLeft = 24;
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        outside,
        pageOutside,
        horizontalScrollers,
        table: {
          label: tableScroller.getAttribute("aria-label"),
          describedBy: tableScroller.getAttribute("aria-describedby"),
          tabIndex: tableScroller.tabIndex,
          overflowX: getComputedStyle(tableScroller).overflowX,
          canExerciseScroll: canExerciseTableScroll,
          scrollLeft: tableScroller.scrollLeft,
        },
        ribbonsOverflow: ribbons ? ribbons.scrollWidth > ribbons.clientWidth + 1 : true,
      };
    });
    expect(layout.documentWidth, `${label}\n${JSON.stringify(layout, null, 2)}`).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.outside, label).toEqual([]);
    expect(layout.pageOutside, label).toEqual([]);
    expect(layout.horizontalScrollers.every((value) => value === "table"), label).toBe(true);
    expect(layout.table.label).toBe("Quest Craft evaluation ledger");
    expect(layout.table.describedBy).toBe("evaluation-scroll-cue");
    expect(layout.table.tabIndex).toBe(0);
    if (width <= 390) {
      expect(["auto", "scroll"]).toContain(layout.table.overflowX);
      expect(layout.table.canExerciseScroll, `${label} table must genuinely overflow`).toBe(true);
      expect(layout.table.scrollLeft, `${label} table scroll must be exercisable`).toBeGreaterThan(0);
    }
    expect(layout.ribbonsOverflow, `${label} ribbons`).toBe(false);
  }
});

test("Quest Craft focus, reduced motion, and print retain every decisive boundary", async ({ page }, testInfo) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
    const radio = page.locator('[data-agency-score] input[value="return"]');
    await radio.scrollIntoViewIfNeeded();
    await radio.focus();
    await expect(radio).toBeFocused();
    const focus = await radio.evaluate((input) => {
      const label = input.closest("label");
      if (!label) throw new Error("Focused Quest radio has no label.");
      const style = getComputedStyle(label);
      const rect = label.getBoundingClientRect();
      const parse = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (rgb: number[]) =>
        0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
      const ratio = (a: number[], b: number[]) =>
        (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
      let background = style.backgroundColor;
      let ancestor = label.parentElement;
      while ((background === "rgba(0, 0, 0, 0)" || background === "transparent") && ancestor) {
        background = getComputedStyle(ancestor).backgroundColor;
        ancestor = ancestor.parentElement;
      }
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        width: Number.parseFloat(style.outlineWidth),
        offset: Number.parseFloat(style.outlineOffset),
        style: style.outlineStyle,
        contrast: ratio(parse(style.outlineColor), parse(background)),
        withinViewport: rect.top >= -1 && rect.left >= -1 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1,
        unobscured: Boolean(hit && (hit === label || label.contains(hit))),
      };
    });
    expect(focus.style).not.toBe("none");
    expect(focus.width).toBeGreaterThanOrEqual(3);
    expect(focus.offset).toBeGreaterThanOrEqual(4);
    expect(focus.contrast).toBeGreaterThanOrEqual(3);
    expect(focus.withinViewport).toBe(true);
    expect(focus.unobscured).toBe(true);
  }

  await page.emulateMedia({ reducedMotion: "reduce", media: "screen" });
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  const motion = await page.evaluate(() => {
    const article = document.querySelector('article[data-supporting-route="quest-craft"]');
    if (!article) throw new Error("Quest article is missing.");
    const milliseconds = (value: string) => value.split(",").map((duration) => {
      const trimmed = duration.trim();
      return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
    });
    const active = [...article.querySelectorAll<HTMLElement>("*")].flatMap((node) => {
      const style = getComputedStyle(node);
      const animation = Math.max(0, ...milliseconds(style.animationDuration));
      const transition = Math.max(0, ...milliseconds(style.transitionDuration));
      return style.animationName !== "none" || animation > 0.01 || transition > 0.01
        ? [{ node: node.tagName, animation: style.animationName, transition }]
        : [];
    });
    return { scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, active };
  });
  expect(motion.scrollBehavior).toBe("auto");
  expect(motion.active).toEqual([]);

  await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 816, height: 1056 });
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator('[data-supporting-movement="evidence-limits-sources"] > footer')).toBeHidden();
  await expect(page.locator("[data-supporting-movement]")).toHaveCount(3);
  await expect(page.locator("[data-evaluation-ledger]")).toBeVisible();
  await expect(page.locator("[data-correction-register] [data-evidence-id]")).toHaveCount(2);
  await expect(page.getByText(/not production-ready/i)).toBeVisible();
  await expect(page.locator('[data-supporting-movement="evidence-limits-sources"] li').filter({
    hasText: /does not establish general child safety/i,
  })).toBeVisible();
  await expect(page.locator("[data-media-rights]")).toBeVisible();
  const printLayout = await page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>("[data-table-scroll]");
    const table = document.querySelector<HTMLElement>("[data-evaluation-ledger]");
    if (!scroller || !table) throw new Error("Printable Quest evaluation table is missing.");
    return {
      scrollerOverflow: getComputedStyle(scroller).overflowX,
      tableMinWidth: getComputedStyle(table).minWidth,
      tableRight: table.getBoundingClientRect().right,
      viewportWidth: innerWidth,
    };
  });
  expect(printLayout.scrollerOverflow).toBe("visible");
  expect(printLayout.tableMinWidth).toBe("0px");
  expect(printLayout.tableRight).toBeLessThanOrEqual(printLayout.viewportWidth + 1);
  const pathPrintLayout = await page.locator("[data-path-trace]").evaluateAll((traces) =>
    traces.map((trace) => {
      const path = trace.parentElement as HTMLElement | null;
      if (!path) throw new Error("Printable Quest path is missing its owner.");
      return {
        path: path.querySelector(":scope > p")?.textContent?.trim(),
        breakInside: getComputedStyle(path).breakInside,
        beatColumns: getComputedStyle(trace).gridTemplateColumns.split(/\s+/).filter(Boolean),
        beats: [...trace.children].map((beat) => {
          const style = getComputedStyle(beat);
          return { left: style.borderLeftWidth, topColor: style.borderTopColor };
        }),
      };
    }),
  );
  expect(pathPrintLayout).toHaveLength(3);
  for (const path of pathPrintLayout) {
    expect(path.breakInside, `Quest print path pagination: ${path.path}`).toBe("avoid");
    expect(path.beatColumns, `Quest print path columns: ${path.path}`).toHaveLength(4);
    expect(path.beats.map(({ left }) => left), `Quest print beat borders: ${path.path}`).toEqual([
      "0px",
      "1px",
      "1px",
      "1px",
    ]);
    expect(path.beats.slice(2).map(({ topColor }) => topColor), `Quest print beat rows: ${path.path}`).toEqual([
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0)",
    ]);
  }
  const correctionPrintLayout = await page.locator("[data-correction-register]").evaluate((register) => {
    const introduction = register.querySelector<HTMLElement>(":scope > div:first-child");
    const corrections = register.querySelector<HTMLElement>(":scope > div:last-child");
    if (!introduction || !corrections) throw new Error("Printable Quest corrections are missing.");
    const articles = [...corrections.querySelectorAll<HTMLElement>(":scope > article")];
    return {
      columns: getComputedStyle(corrections).gridTemplateColumns.split(/\s+/).filter(Boolean),
      introductionBreakAfter: getComputedStyle(introduction).breakAfter,
      articleWidths: articles.map((article) => article.getBoundingClientRect().width),
      articleBreaks: articles.map((article) => getComputedStyle(article).breakInside),
      footerColumns: articles.map((article) => {
        const footer = article.querySelector<HTMLElement>("footer");
        if (!footer) throw new Error("Printable Quest correction footer is missing.");
        return getComputedStyle(footer).gridTemplateColumns.split(/\s+/).filter(Boolean);
      }),
      urls: articles.flatMap((article) => [...article.querySelectorAll<HTMLElement>("footer a[href]")].map((link) => {
        const pseudo = getComputedStyle(link, "::after");
        return {
          href: link.getAttribute("href"),
          display: pseudo.display,
          overflowWrap: pseudo.overflowWrap,
          pseudoWidth: pseudo.width,
          linkWidth: link.getBoundingClientRect().width,
          articleWidth: article.getBoundingClientRect().width,
        };
      })),
    };
  });
  expect(correctionPrintLayout.columns).toHaveLength(1);
  expect(correctionPrintLayout.introductionBreakAfter).toBe("avoid");
  expect(correctionPrintLayout.articleWidths).toHaveLength(2);
  expect(correctionPrintLayout.articleBreaks).toEqual(["avoid", "avoid"]);
  expect(correctionPrintLayout.footerColumns).toEqual([[expect.any(String)], [expect.any(String)]]);
  for (const url of correctionPrintLayout.urls) {
    expect(url.display, `Quest printed URL display: ${url.href}`).toBe("inline");
    expect(url.overflowWrap, `Quest printed URL wrapping: ${url.href}`).toBe("anywhere");
    expect(url.pseudoWidth, `Quest printed URL width: ${url.href}`).toBe("auto");
    expect(url.linkWidth, `Quest printed link containment: ${url.href}`).toBeLessThanOrEqual(url.articleWidth + 1);
  }
  const sourceFolioPrint = await page.locator("[data-source-register]").evaluate((register) => {
    const heading = register.querySelector<HTMLElement>("[data-source-folio-heading]");
    const folio = register.querySelector<HTMLElement>("[data-source-folio]");
    const firstRow = folio?.querySelector<HTMLElement>(":scope > a:first-child");
    if (!heading || !folio || !firstRow) throw new Error("Printable Quest source folio is incomplete.");
    return {
      headingText: heading.textContent?.replace(/\s+/g, " ").trim(),
      headingBreakAfter: getComputedStyle(heading).breakAfter,
      breakInside: getComputedStyle(folio).breakInside,
      links: folio.querySelectorAll("a[href]").length,
      firstRowText: firstRow.textContent?.replace(/\s+/g, " ").trim(),
      rowBreaks: [...folio.querySelectorAll<HTMLElement>(":scope > a")].map((row) => getComputedStyle(row).breakInside),
    };
  });
  expect(sourceFolioPrint.headingText).toContain("Exact source folio");
  expect(sourceFolioPrint.headingText).toContain("Five public records, each bound to its claim.");
  expect(sourceFolioPrint.headingBreakAfter).toBe("avoid");
  expect(sourceFolioPrint.links).toBe(5);
  expect(sourceFolioPrint.breakInside).toBe("auto");
  expect(sourceFolioPrint.firstRowText).toContain("01Public reviewer snapshot");
  expect(sourceFolioPrint.firstRowText).toContain("Frozen publication boundary");
  expect(sourceFolioPrint.rowBreaks).toEqual(["avoid", "avoid", "avoid", "avoid", "avoid"]);
  const printSources = page.locator('article[data-supporting-route="quest-craft"] a:not([href="/work"])');
  for (const link of await printSources.all()) {
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    expect(await link.evaluate((node) => getComputedStyle(node, "::after").content)).toContain(href);
  }

  const questPages = await attachLetterPdf(page, testInfo, "quest-craft");
  expect(questPages, "Quest Craft print-portability page budget").toBeLessThanOrEqual(8);
});

test("Quest Craft keeps a coherent reading order and branching identity without titles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  const readingOrder = await page.locator(
    'article[data-supporting-route="quest-craft"] [data-supporting-movement], article[data-supporting-route="quest-craft"] [data-agency-score], article[data-supporting-route="quest-craft"] [data-evaluation-ledger], article[data-supporting-route="quest-craft"] [data-correction-register], article[data-supporting-route="quest-craft"] [data-source-folio]',
  ).evaluateAll((nodes) => nodes.map((node) => {
    if (node.hasAttribute("data-supporting-movement")) return `movement:${node.getAttribute("data-supporting-movement")}`;
    if (node.hasAttribute("data-agency-score")) return "agency-score";
    if (node.hasAttribute("data-evaluation-ledger")) return "evaluation-ledger";
    if (node.hasAttribute("data-correction-register")) return "correction-register";
    return "source-folio";
  }));
  expect(readingOrder).toEqual([
    "movement:agency-score",
    "agency-score",
    "movement:evaluation-corrections",
    "evaluation-ledger",
    "correction-register",
    "movement:evidence-limits-sources",
    "source-folio",
  ]);
  await page.addStyleTag({ content: "h1, h2, h3, h4 { visibility: hidden !important; }" });
  await expect(page.locator('[data-agency-score] legend')).toHaveText(/Trace one structural beat/i);
  await expect(page.locator('[data-agency-score] [data-beat-definition]')).toHaveCount(4);
  await expect(page.locator('[data-agency-score] [data-path-trace]')).toHaveCount(3);
  await expect(page.locator('[data-agency-score] [data-beat]')).toHaveCount(12);
  await expect(page.locator('[data-agency-score] p').filter({ hasText: /Adult Game Master authority/i })).toBeVisible();
  await expect(page.locator('[data-evaluation-ledger]')).toBeVisible();
  await expect(page.locator('[data-correction-register] [data-evidence-id]')).toHaveCount(2);
  await expect(page.locator('[data-source-folio]')).toBeVisible();
});

test("Quest Craft preserves native control meaning in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  const radio = page.locator('[data-agency-score] input[value="carry"]');
  await radio.check();
  await expect(radio).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(radio).toBeFocused();
  const state = await page.evaluate(() => {
    const label = document.querySelector<HTMLInputElement>('input[value="carry"]')?.closest("label");
    if (!label) throw new Error("Forced-colors Quest label is missing.");
    return {
      checkedMarker: getComputedStyle(label, "::after").content,
      focusStyle: getComputedStyle(label).outlineStyle,
      focusWidth: Number.parseFloat(getComputedStyle(label).outlineWidth),
      pathMarkers: [...document.querySelectorAll<HTMLElement>("[data-path-trace]")].map((trace) =>
        [...trace.querySelectorAll<HTMLElement>("[data-beat]")].map((node) => ({
          id: node.getAttribute("data-beat"),
          marker: getComputedStyle(node, "::after").content,
        })),
      ),
    };
  });
  expect(state.checkedMarker).toContain("Selected");
  expect(state.focusStyle).not.toBe("none");
  expect(state.focusWidth).toBeGreaterThanOrEqual(3);
  expect(state.pathMarkers).toHaveLength(3);
  for (const path of state.pathMarkers) {
    expect(path.filter(({ marker }) => marker !== "none" && marker !== '\"\"')).toEqual([
      expect.objectContaining({ id: "carry" }),
    ]);
  }
});

test("Quest Craft metadata and governed social media remain exact", async ({ page, request }) => {
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  await expect(page).toHaveTitle("Quest Craft — The story branches. Authority does not. | Drew Baker");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${expectedSiteOrigin}/work/quest-craft`,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A documentary case study of Quest Craft: a bounded story-option prototype evaluated across 12 synthetic scenarios, with corrections and failed or superseded attempts retained.",
  );
  const socialPath = `${expectedSiteOrigin}/media/projects/quest-craft/social-preview.jpg`;
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", socialPath);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  const expectedAlt = "Quest Craft editorial social card: one slate-teal input branches into three paper ribbons above a separate olive authority rail, with the line The story branches. Authority does not.";
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", expectedAlt);

  const manifestResponse = await request.get("/media/projects/quest-craft/sources.json");
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest.source_boundary).toEqual(expect.objectContaining({
    review_snapshot_commit: "bc14c43840aabb11ca35e94df0c8682672f24f3c",
    review_snapshot_tree: "01d7e8a0051d4b226e8e0232b5e4ab8f87105964",
  }));
  expect(manifest.assets).toEqual([expect.objectContaining({
    path: "/media/projects/quest-craft/social-preview.jpg",
    sha256: "1ca659804462c6d4036408061f7c0e1ccbe32da4246085c44c958c48ccc23f5a",
    bytes: 146283,
    width: 1200,
    height: 630,
    status: "approved_for_public_personal_portfolio",
    alt: expectedAlt,
  })]);
  const imageResponse = await request.get("/media/projects/quest-craft/social-preview.jpg");
  expect(imageResponse.status()).toBe(200);
  expect((await imageResponse.body()).byteLength).toBe(146283);
  await expect(page.locator('article[data-supporting-route="quest-craft"] img')).toHaveCount(0);
});

test("OpenClaw is exactly three documentary movements with canonical ownership", async ({ page }) => {
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });

  const article = page.locator(
    'article[data-project-model-id="openclaw-showcase"][data-supporting-route="openclaw-showcase"][data-visual-world="disclosure-folio"]',
  );
  await expect(article).toHaveCount(1);
  const movements = article.locator(":scope > [data-supporting-movement]");
  await expect(movements).toHaveCount(3);
  expect(await movements.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-supporting-movement")),
  )).toEqual(["disclosure-layers", "workflow-receipt-anatomy", "boundary-source-folio"]);
  expect(await movements.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-route-movement")),
  )).toEqual(["disclosure-layers", "workflow-receipt-anatomy", "boundary-source-folio"]);

  const expectedFields = projectSurfacePlan["openclaw-showcase"].fields.projectRoute;
  expect(await article.locator("[data-project-field]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-field")).sort(),
  )).toEqual([...expectedFields].sort());
  const ledgerFields = new Set(["problem", "decisionSupported", "personalRole", "implementation", "outcome", "limitations"]);
  for (const field of expectedFields) {
    const owner = article.locator(`[data-project-field="${field}"]`);
    await expect(owner).toHaveCount(1);
    await expect(ledgerFields.has(field) ? owner.locator("dd") : owner).toHaveText(
      renderedEvidence("openclaw-showcase", field),
    );
  }
  await expect(article.locator('[data-project-field="maturity"]')).toHaveText(
    "Public documentation artifact at an exact frozen commit.",
  );
  await expect(
    article.locator('[data-supporting-movement="workflow-receipt-anatomy"] [data-project-field="stack"]'),
  ).toHaveText("Markdown and Mermaid are the public documentation formats, not evidence of runtime technologies.");
  expect(await article.locator("[data-first-screen-ledger] > div").evaluateAll((rows) =>
    rows.map((row) => ({
      label: row.querySelector("dt")?.textContent?.trim(),
      field: row.getAttribute("data-project-field"),
      value: row.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim(),
    })),
  )).toEqual([
    { label: "Problem", field: "problem", value: renderedEvidence("openclaw-showcase", "problem") },
    { label: "Public decision boundary", field: "decisionSupported", value: renderedEvidence("openclaw-showcase", "decisionSupported") },
    { label: "My role", field: "personalRole", value: renderedEvidence("openclaw-showcase", "personalRole") },
    { label: "Public artifact", field: "implementation", value: renderedEvidence("openclaw-showcase", "implementation") },
    { label: "Result", field: "outcome", value: renderedEvidence("openclaw-showcase", "outcome") },
    { label: "Limit", field: "limitations", value: renderedEvidence("openclaw-showcase", "limitations") },
  ]);

  const details = article.locator("[data-disclosure-register] > details");
  await expect(details).toHaveCount(3);
  expect(await details.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("name"))))
    .toEqual([null, null, null]);
  const receipt = article.locator('figure[data-receipt-anatomy][data-source-id="openclaw.receipt-doc"]');
  await expect(receipt).toHaveCount(1);
  await expect(receipt.locator("figcaption")).toContainText(/Sanitized representative example.*not a raw export, actual-run receipt, or proof of runtime behavior/i);

  const decisiveSurface = await readOpenClawDecisiveSurface(article);
  expect(decisiveSurface.disclosures).toEqual(openClawDisclosureLayers);
  expect(decisiveSurface.disclosures.flatMap(({ contents }) => contents)).toHaveLength(12);
  expect(decisiveSurface.workflow).toEqual(openClawWorkflowStages);
  expect(decisiveSurface.receipt).toEqual(openClawReceiptFields);
  expect(decisiveSurface.sources).toEqual(openClawSourceFolio);
  await expect(article.getByText(openClawRuntimeCommitment, { exact: true })).toBeVisible();
  await expect(article.getByText(/no detected license.*evidence.*not general reuse permission/i)).toBeVisible();
  await expect(article.locator(
    "[data-runtime-ui], [data-evidence-id], [data-failure-dividend], [data-case-chapter-index], [data-case-chapters], form, input, button, select, textarea, canvas, video, audio, img, iframe, object, embed",
  )).toHaveCount(0);
  for (const role of ["application", "log", "status", "progressbar"] as const) {
    await expect(article.getByRole(role)).toHaveCount(0);
  }
  await expect(article.locator('nav[aria-label="Adjacent portfolio case studies"]')).toHaveCount(0);
});

test("OpenClaw native disclosure layers remain independent without runtime requests", async ({ page }) => {
  const runtimeRequests: Array<{ type: string; method: string; url: string }> = [];
  page.on("request", (request) => {
    if (["fetch", "xhr", "websocket", "eventsource"].includes(request.resourceType())) {
      runtimeRequests.push({ type: request.resourceType(), method: request.method(), url: request.url() });
    }
  });
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });

  const details = page.locator("[data-disclosure-register] > details");
  const openState = () => details.evaluateAll((nodes) => nodes.map((node) => (node as HTMLDetailsElement).open));
  expect(await openState()).toEqual([true, true, true]);
  await details.nth(0).locator("summary").click();
  expect(await openState()).toEqual([false, true, true]);
  await details.nth(0).locator("summary").click();
  expect(await openState()).toEqual([true, true, true]);
  await details.nth(1).locator("summary").click();
  expect(await openState()).toEqual([true, false, true]);
  await details.nth(1).locator("summary").click();
  await details.nth(2).locator("summary").click();
  expect(await openState()).toEqual([true, true, false]);
  await details.nth(2).locator("summary").click();
  expect(await openState()).toEqual([true, true, true]);
  for (const index of [0, 1, 2]) {
    await details.nth(index).locator("summary").focus();
    await expect(details.nth(index).locator("summary")).toBeFocused();
  }
  const routeOrigin = new URL(page.url()).origin;
  const frameworkPrefetchPaths = new Set(["/", "/work", "/resume"]);
  expect(runtimeRequests.filter((request) => {
    const url = new URL(request.url);
    return !(
      request.type === "fetch" &&
      request.method === "GET" &&
      url.origin === routeOrigin &&
      frameworkPrefetchPaths.has(url.pathname) &&
      url.searchParams.has("_rsc") &&
      [...url.searchParams.keys()].every((key) => key === "_rsc")
    );
  }), `unexpected OpenClaw runtime requests: ${JSON.stringify(runtimeRequests, null, 2)}`).toEqual([]);
});

test("OpenClaw documentary evidence and independent disclosures survive without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work/openclaw-showcase", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  const article = page.locator('article[data-supporting-route="openclaw-showcase"]');
  await expect(article.locator(":scope > [data-supporting-movement]")).toHaveCount(3);
  await expect(article.locator("[data-project-field]")).toHaveCount(8);
  await expect(article.locator("[data-conceptual-workflow] > ol > li")).toHaveCount(5);
  await expect(article.locator("[data-receipt-anatomy] > div:first-of-type > dl > div")).toHaveCount(5);
  await expect(article.locator("[data-source-folio] a")).toHaveCount(4);

  const details = article.locator("[data-disclosure-register] > details");
  await expect(details).toHaveCount(3);
  expect(await details.evaluateAll((nodes) => nodes.map((node) => (node as HTMLDetailsElement).open)))
    .toEqual([true, true, true]);
  for (const detail of await details.all()) {
    await expect(detail.locator(":scope > div")).toBeVisible();
  }
  await details.first().locator("summary").click();
  expect(await details.evaluateAll((nodes) => nodes.map((node) => (node as HTMLDetailsElement).open)))
    .toEqual([false, true, true]);
  const decisiveSurface = await readOpenClawDecisiveSurface(article);
  expect(decisiveSurface.disclosures).toEqual(openClawDisclosureLayers);
  expect(decisiveSurface.disclosures.flatMap(({ contents }) => contents)).toHaveLength(12);
  expect(decisiveSurface.workflow).toEqual(openClawWorkflowStages);
  expect(decisiveSurface.receipt).toEqual(openClawReceiptFields);
  expect(decisiveSurface.sources).toEqual(openClawSourceFolio);
  expect(await article.locator("[data-first-screen-ledger] > div").evaluateAll((rows) =>
    rows.map((row) => ({
      label: row.querySelector("dt")?.textContent?.trim(),
      field: row.getAttribute("data-project-field"),
      value: row.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim(),
    })),
  )).toEqual([
    { label: "Problem", field: "problem", value: renderedEvidence("openclaw-showcase", "problem") },
    { label: "Public decision boundary", field: "decisionSupported", value: renderedEvidence("openclaw-showcase", "decisionSupported") },
    { label: "My role", field: "personalRole", value: renderedEvidence("openclaw-showcase", "personalRole") },
    { label: "Public artifact", field: "implementation", value: renderedEvidence("openclaw-showcase", "implementation") },
    { label: "Result", field: "outcome", value: renderedEvidence("openclaw-showcase", "outcome") },
    { label: "Limit", field: "limitations", value: renderedEvidence("openclaw-showcase", "limitations") },
  ]);
  await expect(article.getByText(openClawRuntimeCommitment, { exact: true })).toBeVisible();
  await expect(article.getByText(/No private runtime, configuration, raw log, or exact trace was inspected/i)).toBeVisible();
  await expect(article.getByText(/does not establish an intended user, test strategy, failure dividend/i)).toBeVisible();
  await context.close();
});

test("OpenClaw passes targeted Axe, focus, and target-size gates", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .include('article[data-supporting-route="openclaw-showcase"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    const decisiveSelector =
      '[data-disclosure-register] summary, a[data-source-id="openclaw.snapshot"], [data-source-folio] a, [data-supporting-movement="boundary-source-folio"] > footer a';
    const decisive = page.locator(decisiveSelector);
    const decisiveCount = await decisive.count();
    const traversed = new Map<number, {
      width: number;
      offset: number;
      style: string;
      contrast: number;
      targetWidth: number;
      targetHeight: number;
      withinViewport: boolean;
      sticky: boolean;
      unobscured: boolean;
    }>();
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      scrollTo(0, 0);
    });
    for (let press = 0; press < 40 && traversed.size < decisiveCount; press += 1) {
      await page.keyboard.press("Tab");
      await page.locator(":focus").scrollIntoViewIfNeeded();
      const focused = await page.evaluate((selector) => {
        const candidates = [...document.querySelectorAll<HTMLElement>(selector)];
        const node = document.activeElement as HTMLElement | null;
        const index = node ? candidates.indexOf(node) : -1;
        if (!node || index < 0) return null;
        const parse = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
        const channel = (value: number) => {
          const normalized = value / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        };
        const luminance = (rgb: number[]) =>
          0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
        const ratio = (a: number[], b: number[]) =>
          (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
        const style = getComputedStyle(node);
        let background = node.parentElement ? getComputedStyle(node.parentElement).backgroundColor : "transparent";
        let ancestor = node.parentElement?.parentElement ?? null;
        while ((background === "rgba(0, 0, 0, 0)" || background === "transparent") && ancestor) {
          background = getComputedStyle(ancestor).backgroundColor;
          ancestor = ancestor.parentElement;
        }
        const rect = node.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          index,
          width: Number.parseFloat(style.outlineWidth),
          offset: Number.parseFloat(style.outlineOffset),
          style: style.outlineStyle,
          contrast: ratio(parse(style.outlineColor), parse(background)),
          targetWidth: rect.width,
          targetHeight: rect.height,
          withinViewport: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
          sticky: style.position === "sticky" || style.position === "fixed",
          unobscured: Boolean(hit && (hit === node || node.contains(hit))),
        };
      }, decisiveSelector);
      if (focused) traversed.set(focused.index, focused);
    }
    expect([...traversed.keys()], `${viewport.width}px keyboard focus order`).toEqual(
      Array.from({ length: decisiveCount }, (_, index) => index),
    );
    for (const [index, focus] of traversed) {
      expect(focus.style, `focus ${index} at ${viewport.width}px`).not.toBe("none");
      expect(focus.width, `focus ${index} at ${viewport.width}px`).toBeGreaterThanOrEqual(3);
      expect(focus.offset, `focus ${index} at ${viewport.width}px`).toBeGreaterThanOrEqual(4);
      expect(focus.contrast, `focus ${index} at ${viewport.width}px`).toBeGreaterThanOrEqual(3);
      expect(focus.targetWidth, `focus ${index} at ${viewport.width}px`).toBeGreaterThanOrEqual(24);
      expect(focus.targetHeight, `focus ${index} at ${viewport.width}px`).toBeGreaterThanOrEqual(24);
      expect(focus.withinViewport, `focus ${index} at ${viewport.width}px`).toBe(true);
      expect(focus.sticky, `focus ${index} at ${viewport.width}px`).toBe(false);
      expect(focus.unobscured, `focus ${index} at ${viewport.width}px`).toBe(true);
    }
  }
});

test("OpenClaw contains every required width, 200 percent text, and 400 percent reflow", async ({ page }) => {
  const cases = [
    { label: "320 CSS pixels / 400% reflow from 1280", width: 320, textZoom: 100 },
    { label: "390 CSS pixels", width: 390, textZoom: 100 },
    { label: "768 CSS pixels", width: 768, textZoom: 100 },
    { label: "1280 CSS pixels", width: 1280, textZoom: 100 },
    { label: "1440 CSS pixels", width: 1440, textZoom: 100 },
    { label: "200% text zoom", width: 1280, textZoom: 200 },
  ] as const;

  for (const { label, width, textZoom } of cases) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
    await page.evaluate((percent) => {
      document.documentElement.style.fontSize = `${percent}%`;
    }, textZoom);
    const layout = await page.evaluate(() => {
      const internals = [
        document.querySelector<HTMLElement>("[data-disclosure-register]"),
        document.querySelector<HTMLElement>("[data-conceptual-workflow] > ol"),
        document.querySelector<HTMLElement>("[data-receipt-anatomy]"),
        document.querySelector<HTMLElement>("[data-source-folio]"),
      ].filter((node): node is HTMLElement => Boolean(node));
      const measures = [...document.querySelectorAll<HTMLElement>(
        'article[data-supporting-route="openclaw-showcase"] p, article[data-supporting-route="openclaw-showcase"] dd',
      )].map((node) => ({
        text: node.textContent?.trim().slice(0, 60),
        em: node.getBoundingClientRect().width / Number.parseFloat(getComputedStyle(node).fontSize),
        className: node.className,
      })).sort((a, b) => b.em - a.em);
      const lead = document.querySelector<HTMLElement>('article[data-supporting-route="openclaw-showcase"] header p:nth-of-type(2)');
      const article = document.querySelector<HTMLElement>('article[data-supporting-route="openclaw-showcase"]');
      if (!article) throw new Error("OpenClaw article is missing.");
      const visible = [...article.querySelectorAll<HTMLElement>("*")].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      const offViewport = visible.flatMap((node) => {
        const rect = node.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1
          ? [{
              node: node.tagName,
              text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
              left: rect.left,
              right: rect.right,
            }]
          : [];
      });
      const forbiddenOverflow = visible.flatMap((node) => {
        const style = getComputedStyle(node);
        const values = [style.overflow, style.overflowX, style.overflowY];
        return values.some((value) => /^(?:auto|scroll|hidden|clip)$/.test(value))
          ? [{
              node: node.tagName,
              text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
              overflow: values,
            }]
          : [];
      });
      return {
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        internals: internals.map((node) => ({
          name: node.getAttribute("data-disclosure-register") !== null
            ? "disclosure"
            : node.parentElement?.hasAttribute("data-conceptual-workflow")
              ? "workflow"
              : node.getAttribute("data-receipt-anatomy") !== null
                ? "receipt"
                : "sources",
          client: node.clientWidth,
          scroll: node.scrollWidth,
        })),
        maxProse: measures[0],
        leadEm: lead ? lead.getBoundingClientRect().width / Number.parseFloat(getComputedStyle(lead).fontSize) : 0,
        offViewport,
        forbiddenOverflow,
      };
    });
    expect(layout.document, label).toBeLessThanOrEqual(layout.viewport);
    for (const internal of layout.internals) {
      expect(internal.scroll, `${label}: ${internal.name} internal scroller`).toBeLessThanOrEqual(internal.client + 1);
    }
    expect(layout.offViewport, `${label}: visible descendants outside the viewport`).toEqual([]);
    expect(layout.forbiddenOverflow, `${label}: visible clipping or scrolling descendants`).toEqual([]);
    expect(layout.maxProse.em, `${label}: prose measure ${JSON.stringify(layout.maxProse)}`).toBeLessThanOrEqual(68);
    expect(layout.leadEm, `${label}: lead measure`).toBeLessThanOrEqual(54);
    await expect(page.locator("h1"), label).toBeVisible();
    await expect(page.locator("[data-source-folio]"), label).toBeVisible();
  }
});

test("OpenClaw preserves disclosure meaning in forced colors, reduced motion, and print", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce", media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
  const details = page.locator("[data-disclosure-register] > details");
  for (const detail of await details.all()) await expect(detail.locator(":scope > div")).toBeVisible();
  await details.nth(2).locator("summary").focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(details.nth(2).locator("summary")).toBeFocused();
  const forced = await details.nth(2).locator("summary").evaluate((summary) => ({
    outlineStyle: getComputedStyle(summary).outlineStyle,
    outlineWidth: Number.parseFloat(getComputedStyle(summary).outlineWidth),
    marker: getComputedStyle(summary, "::marker").content,
    border: getComputedStyle(summary.parentElement as HTMLElement).borderTopStyle,
  }));
  expect(forced.outlineStyle).not.toBe("none");
  expect(forced.outlineWidth).toBeGreaterThanOrEqual(3);
  expect(forced.border).not.toBe("none");
  expect(forced.marker).not.toBe("none");
  expect(forced.marker).not.toBe("");
  expect(await details.evaluateAll((nodes) => nodes.map((node) => ({
    label: node.querySelector("summary strong")?.textContent?.trim(),
    status: node.querySelector("summary em")?.textContent?.trim(),
  })))).toEqual(openClawDisclosureLayers.map(({ label, status }) => ({ label, status })));

  const motion = await page.evaluate(() => {
    const article = document.querySelector('article[data-supporting-route="openclaw-showcase"]');
    if (!article) throw new Error("OpenClaw article is missing.");
    const milliseconds = (value: string) => value.split(",").map((duration) => {
      const trimmed = duration.trim();
      return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
    });
    return [...article.querySelectorAll<HTMLElement>("*")].flatMap((node) => {
      const style = getComputedStyle(node);
      const animation = Math.max(0, ...milliseconds(style.animationDuration));
      const transition = Math.max(0, ...milliseconds(style.transitionDuration));
      return style.animationName !== "none" || animation > 0.01 || transition > 0.01
        ? [{ node: node.tagName, animation: style.animationName, transition }]
        : [];
    });
  });
  expect(motion).toEqual([]);

  await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference", media: "print" });
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
  await page.locator("[data-disclosure-register] > details").evaluateAll((nodes) => {
    for (const node of nodes) node.removeAttribute("open");
  });
  await expect(page.locator("[data-disclosure-register] > details[open]")).toHaveCount(0);
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator('[data-supporting-movement="boundary-source-folio"] > footer')).toBeHidden();
  await expect(page.locator("[data-project-field]")).toHaveCount(8);
  await expect(page.locator("[data-conceptual-workflow] > ol > li")).toHaveCount(5);
  await expect(page.locator("[data-receipt-anatomy] > div:first-of-type > dl > div")).toHaveCount(5);
  await expect(page.locator("[data-disclosure-register] > details > div")).toHaveCount(3);
  for (const body of await page.locator("[data-disclosure-register] > details > div").all()) {
    await expect(body).toBeVisible();
  }
  const printArticle = page.locator('article[data-supporting-route="openclaw-showcase"]');
  const printSurface = await readOpenClawDecisiveSurface(printArticle);
  expect(printSurface.disclosures).toEqual(openClawDisclosureLayers);
  expect(printSurface.disclosures.flatMap(({ contents }) => contents)).toHaveLength(12);
  expect(printSurface.disclosures.map(({ boundary }) => boundary)).toHaveLength(3);
  expect(printSurface.workflow).toEqual(openClawWorkflowStages);
  expect(printSurface.receipt).toEqual(openClawReceiptFields);
  expect(printSurface.sources).toEqual(openClawSourceFolio);
  expect(await page.locator("[data-receipt-anatomy] aside dl > div").evaluateAll((rows) =>
    rows.map((row) => [
      row.querySelector("dt")?.textContent?.trim(),
      row.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim(),
    ]),
  )).toEqual(openClawReceiptWarnings);
  await expect(page.locator("[data-receipt-anatomy] figcaption")).toHaveText(
    "Sanitized representative example—not a raw export, actual-run receipt, or proof of runtime behavior.",
  );
  await expect(page.getByText(openClawRuntimeCommitment, { exact: true })).toBeVisible();
  await expect(page.locator('[class*="rightsNote"]')).toHaveText(
    "This route uses factual paraphrase and original code-native composition under the repository owner's direction. It copies no source-project badge, private-derived material, commit email metadata, or third-party asset. The public repository has no detected license, so these links provide evidence—not general reuse permission.",
  );
  await expect(page.getByText(/No private runtime, configuration, raw log, or exact trace was inspected/i)).toBeVisible();
  await expect(page.getByText(/no detected license.*not general reuse permission/i)).toBeVisible();
  const printSources = page.locator("[data-source-folio] a");
  await expect(printSources).toHaveCount(4);
  for (const link of await printSources.all()) {
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    expect(await link.evaluate((node) => getComputedStyle(node, "::after").content)).toContain(href);
  }
  const printAudit = await printArticle.evaluate((article) => {
    const parse = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const channel = (value: number) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (rgb: number[]) =>
      0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    const ratio = (a: number[], b: number[]) =>
      (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    const visible = [...article.querySelectorAll<HTMLElement>("*")].filter((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
    const decisive = [
      ...article.querySelectorAll<HTMLElement>(
        '[class*="layerBoundary"], [class*="workflowBoundary"], [class*="receiptWarnings"] dd, [data-receipt-anatomy] figcaption, [class*="boundaryPanel"] > p, [class*="boundaryPanel"] li, [class*="rightsNote"], [data-source-folio] small',
      ),
    ];
    const contrast = decisive.map((node) => {
      let background = getComputedStyle(node).backgroundColor;
      let ancestor = node.parentElement;
      while ((background === "rgba(0, 0, 0, 0)" || background === "transparent") && ancestor) {
        background = getComputedStyle(ancestor).backgroundColor;
        ancestor = ancestor.parentElement;
      }
      const foreground = getComputedStyle(node).color;
      return {
        text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
        foreground,
        background,
        ratio: ratio(parse(foreground), parse(background)),
        missingBoundary: node.getAttribute("class")?.includes("missingBoundary") ?? false,
      };
    });
    const clipping = visible.flatMap((node) => {
      const style = getComputedStyle(node);
      const values = [style.overflow, style.overflowX, style.overflowY];
      const forbidden = values.some((value) => /^(?:auto|scroll|hidden|clip)$/.test(value));
      const overflows = node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1;
      return forbidden || overflows
        ? [{
            node: node.tagName,
            text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
            overflow: values,
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
          }]
        : [];
    });
    return { contrast, clipping };
  });
  expect(printAudit.contrast.length).toBeGreaterThan(0);
  expect(printAudit.contrast.filter(({ missingBoundary }) => missingBoundary)).toHaveLength(1);
  for (const sample of printAudit.contrast) {
    expect(sample.ratio, `OpenClaw print contrast: ${JSON.stringify(sample)}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(printAudit.clipping, "OpenClaw print clipping/internal scrollers").toEqual([]);
});

test("OpenClaw metadata, social image, and title-hidden folio identity remain exact", async ({ page, request }) => {
  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
  await expect(page).toHaveTitle("OpenClaw Showcase — Documentation without disclosure drift | Drew Baker");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${expectedSiteOrigin}/work/openclaw-showcase`,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A frozen public documentation artifact with a conceptual workflow and sanitized representative receipt; the excluded runtime was not inspected or evaluated.",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "A public workflow model and disclosure boundary; the excluded runtime was not inspected or evaluated.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "OpenClaw Showcase — Documentation without disclosure drift",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    `${expectedSiteOrigin}/work/openclaw-showcase`,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Drew Baker — Portfolio");
  const socialPath = `${expectedSiteOrigin}/work/openclaw-showcase/opengraph-image`;
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", socialPath);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "OpenClaw Showcase public documentation folio; the excluded runtime was not inspected or evaluated",
  );
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
    "content",
    "A frozen public documentation artifact whose excluded runtime was not inspected or evaluated.",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "OpenClaw Showcase — Documentation without disclosure drift",
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", socialPath);
  const headText = await page.locator("head").evaluate((head) => head.innerHTML);
  expect(headText).not.toMatch(/runtime (?:execution|autonomy|deployment|reliability|security enforcement|production capability)(?![^<]*\bnot\b)/i);
  expect(headText).not.toMatch(/\b(?:autonomous|deployed|production-ready|benchmarked|runtime execution|security enforcement)\b/i);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const source of jsonLd) {
    const parsed = JSON.parse(source);
    const serialized = JSON.stringify(parsed);
    expect(serialized).not.toMatch(/SoftwareApplication/i);
    expect(serialized).not.toMatch(/runtime (?:execution|autonomy|deployment|reliability|security enforcement|production capability)/i);
    const types: string[] = [];
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {
        for (const item of value) visit(item);
      } else if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record["@type"] === "string") types.push(record["@type"]);
        for (const child of Object.values(record)) visit(child);
      }
    };
    visit(parsed);
    expect(types.length).toBeGreaterThan(0);
    expect(types.every((type) => type === "Article" || type === "CreativeWork")).toBe(true);
  }

  const response = await request.get("/work/openclaw-showcase/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const image = await response.body();
  expect(image.byteLength, "OpenClaw social image must contain a meaningful rendered payload").toBeGreaterThan(20_000);
  expect([...image.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(image.toString("ascii", 12, 16)).toBe("IHDR");
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);

  await page.addStyleTag({ content: "h1, h2, h3 { visibility: hidden !important; }" });
  await expect(page.locator("[data-disclosure-register] > details")).toHaveCount(3);
  await expect(page.locator("[data-conceptual-workflow]")).toBeVisible();
  await expect(page.locator("[data-receipt-anatomy]")).toBeVisible();
  await expect(page.locator("[data-source-folio]")).toBeVisible();
  await expect(page.getByText("Public", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Approval-gated", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Not inspected", { exact: true })).toBeVisible();
  await expect(page.locator('article[data-supporting-route="openclaw-showcase"] img')).toHaveCount(0);
});

test("OpenClaw stays inside its isolated local supporting-route budget", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.goto("/work/openclaw-showcase", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const measured = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (predicate: (resource: PerformanceResourceTiming) => boolean) =>
      resources.filter(predicate).reduce(
        (total, resource) => total + (resource.transferSize || resource.encodedBodySize),
        0,
      );
    return {
      metrics: (window as typeof window & {
        __portfolioMetrics: { cls: number; lcp: number; tbt: number };
      }).__portfolioMetrics,
      staticBytes: bytes((resource) => new URL(resource.name).pathname.includes("/_next/static/")),
      imageBytes: bytes((resource) => resource.initiatorType === "img"),
      measuredResources: resources.filter(
        (resource) => (resource.transferSize || resource.encodedBodySize) > 0,
      ).length,
      hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
    };
  });
  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeGreaterThan(0);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBe(0);
  expect(measured.measuredResources).toBeGreaterThan(0);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  console.log(`OPENCLAW_LOCAL_LAB_METRICS ${JSON.stringify(measured)}`);
  await context.close();
});

test("historical coursework forms a bounded reading shelf outside the case-study lane", async ({ page }) => {
  await page.goto("/work", { waitUntil: "networkidle" });
  const shelf = page.locator('[data-work-lane="historical-reading-shelf"]');
  expect(await shelf.locator("[data-work-entry]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["hierarchical-clustering", "energy-sector-data-governance", "der-dcp"]);
  await expect(page.locator('[data-work-lane="flagships"], [data-work-lane="supporting-notes"]')
    .locator('[data-project-model-id="hierarchical-clustering"], [data-project-model-id="energy-sector-data-governance"], [data-project-model-id="der-dcp"]'))
    .toHaveCount(0);
});

test("résumé projects canonical hierarchy, provenance, no-JavaScript, and technology bindings", async ({
  browser,
  page,
}) => {
  await page.goto("/resume", { waitUntil: "networkidle" });
  const article = page.locator('article[data-resume-surface="public-resume"]');
  await expect(article).toHaveCount(1);
  await expect(article.getByText(resumeRoleLine, { exact: true })).toBeVisible();
  await expect(article.getByText(resumeSummary, { exact: true })).toBeVisible();

  const surface = await readResumeCanonicalSurface(article);
  expect(surface.selected.map(({ id, hierarchy }) => [id, hierarchy])).toEqual(resumeSelectedHierarchy);
  expect(surface.selected.map(({ title }) => title)).toEqual(
    resumeSelectedHierarchy.map(([id]) => getProject(id).title),
  );
  for (const selected of surface.selected) {
    const projectId = selected.id as "burnlens" | "runbook-sentinel" | "quest-craft";
    const expectedFields = resumeFieldOrder[projectId];
    expect(selected.owners.map(({ field }) => field), `${projectId}: field order`).toEqual(expectedFields);
    expect(selected.owners.map(({ owner }) => owner), `${projectId}: unique field ownership`).toEqual(
      expectedFields.map((field) => `${projectId}.${field}`),
    );
    for (const owner of selected.owners) {
      const evidence = getSupportedEvidence(projectId, owner.field as keyof ProjectEvidence<ProjectId>);
      expect(evidence, `${owner.owner}: supported evidence`).not.toBeNull();
      expect(owner.sourceIds, `${owner.owner}: source binding`).toEqual(evidence?.sourceIds);
      expect(owner.text, `${owner.owner}: exact reader-first summary`).toContain(
        toReaderFirst(evidence?.summary ?? ""),
      );
    }
  }
  const selectedLane = article.locator('[data-resume-lane="selected-project-evidence"]');
  await expect(selectedLane.locator('[data-project-model-id="openclaw-showcase"]')).toHaveCount(0);
  await expect(selectedLane.locator('[data-resume-history]')).toHaveCount(0);
  await expect(article.locator('[data-project-model-id="openclaw-showcase"]')).toHaveCount(0);

  expect(surface.history.map(({ id, dateTime, sourceId }) => [id, dateTime, sourceId])).toEqual(resumeHistory);
  for (const historical of surface.history) {
    const projectId = historical.id as (typeof resumeHistory)[number][0];
    const expectedFields = resumeFieldOrder[projectId];
    expect(historical.owners.map(({ field }) => field), `${projectId}: historical field order`).toEqual(
      expectedFields,
    );
    expect(historical.owners.map(({ owner }) => owner), `${projectId}: historical ownership`).toEqual(
      expectedFields.map((field) => `${projectId}.${field}`),
    );
    for (const owner of historical.owners) {
      const evidence = getSupportedEvidence(projectId, owner.field as keyof ProjectEvidence<ProjectId>);
      expect(evidence, `${owner.owner}: historical supported evidence`).not.toBeNull();
      expect(owner.sourceIds, `${owner.owner}: historical sources`).toEqual(evidence?.sourceIds);
      const expectedText = projectId === "hierarchical-clustering"
        ? toReaderFirst(evidence?.summary ?? "").replace(/HDBSCAN/g, "density-based clustering (HDBSCAN)")
        : projectId === "der-dcp"
          ? toReaderFirst(evidence?.summary ?? "").replace(
              /SCLA 521 Societal Impacts of AI/g,
              "Societal Impacts of AI course (SCLA 521)",
            )
          : toReaderFirst(evidence?.summary ?? "");
      expect(owner.text, `${owner.owner}: historical reader-first summary`).toBe(expectedText);
    }
    const sourceId = resumeHistory.find(([id]) => id === projectId)?.[2];
    expect(historical.href).toBe(getPublicSourceHref(sourceId!));
    expect(historical.title).toBe(getProject(projectId).title);
  }
  await expect(article.locator('[data-capability-boundary="energy-ee"]')).toHaveText(
    `Audience boundary. ${resumeEnergyBoundary}`,
  );

  await expect(selectedLane.locator('[data-resume-project="burnlens"] [data-technology-binding]'))
    .toHaveCount(0);
  for (const projectId of ["runbook-sentinel"] as const) {
    const stack = getSupportedEvidence(projectId, "stack");
    if (!stack) throw new Error(`${projectId}.stack must be supported.`);
    const stackItems = stack.value as readonly { name: string; purpose: string }[];
    const technology = selectedLane.locator(
      `[data-resume-project="${projectId}"] [data-technology-binding]`,
    );
    expect(await technology.evaluateAll((nodes) => nodes.map((node) => ({
      name: node.querySelector("strong")?.textContent?.trim(),
      purpose: node.querySelector("span")?.textContent?.replace(/\s+/g, " ").trim(),
      projectId: node.getAttribute("data-project-model-id"),
      field: node.getAttribute("data-evidence-field"),
      sourceIds: node.getAttribute("data-source-ids")?.split(/\s+/),
    })))).toEqual(stackItems.map(({ name, purpose }) => ({
      name: toReaderFirst(name),
      purpose: toReaderFirst(purpose),
      projectId,
      field: "stack",
      sourceIds: stack.sourceIds,
    })));
  }
  await expect(selectedLane.locator('[data-resume-project="quest-craft"] [data-technology-binding]'))
    .toHaveCount(0);
  await expect(article).not.toContainText(/ChromaDB|GeoPandas|rioxarray|Google Earth Engine|Cloud Optimized GeoTIFF|\bSTAC\b|RAG workflows|API and tool integration|prompt design/i);

  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noScriptPage = await noScript.newPage();
  await noScriptPage.goto("/resume", { waitUntil: "domcontentloaded" });
  const noScriptArticle = noScriptPage.locator('article[data-resume-surface="public-resume"]');
  const noScriptSurface = await readResumeCanonicalSurface(noScriptArticle);
  expect(noScriptSurface).toEqual(surface);
  await expect(noScriptArticle.locator('[data-capability-boundary="energy-ee"]')).toHaveText(
    `Audience boundary. ${resumeEnergyBoundary}`,
  );
  const noScriptProfiles = noScriptArticle.getByRole("navigation", {
    name: "Public professional profiles",
  });
  for (const [label, href, visibleHref] of resumeProfiles) {
    const link = noScriptProfiles.getByRole("link", { name: new RegExp(label) });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toContainText(visibleHref);
  }
  await noScript.close();
});

test("résumé survives every review width, text zoom, forced colors, reduced motion, and print", async ({
  page,
}) => {
  const cases = [
    [320, 100],
    [390, 100],
    [768, 100],
    [1280, 100],
    [1440, 100],
    [1280, 200],
  ] as const;
  for (const [width, textZoom] of cases) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto("/resume", { waitUntil: "networkidle" });
    await page.evaluate((percent) => { document.documentElement.style.fontSize = `${percent}%`; }, textZoom);
    const layout = await page.locator('article[data-resume-surface="public-resume"]').evaluate((article) => {
      const visible = [article, ...article.querySelectorAll<HTMLElement>("*")].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && !node.classList.contains("sr-only")
          && rect.width > 1
          && rect.height > 1;
      });
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        offViewport: visible.flatMap((node) => {
          const rect = node.getBoundingClientRect();
          return rect.left < -1 || rect.right > innerWidth + 1
            ? [{ node: node.tagName, text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80), left: rect.left, right: rect.right }]
            : [];
        }),
        forbiddenOverflow: visible.flatMap((node) => {
          const style = getComputedStyle(node);
          const values = [style.overflow, style.overflowX, style.overflowY];
          return values.some((value) => /^(?:auto|scroll|hidden|clip)$/.test(value))
            ? [{ node: node.tagName, text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80), values }]
            : [];
        }),
        proseTooWide: visible.filter((node) => node.matches("p, dd")).flatMap((node) => {
          const hasDirectText = [...node.childNodes].some(
            (child) => child.nodeType === Node.TEXT_NODE && Boolean(child.textContent?.trim()),
          );
          const textCarrier = !hasDirectText && node.children.length === 1
            ? node.firstElementChild as HTMLElement
            : node;
          const widthEm = textCarrier.getBoundingClientRect().width
            / Number.parseFloat(getComputedStyle(textCarrier).fontSize);
          return widthEm > 68.01
            ? [{
                node: textCarrier.tagName,
                className: textCarrier.className,
                text: textCarrier.textContent?.replace(/\s+/g, " ").trim().slice(0, 160),
                widthEm,
              }]
            : [];
        }),
      };
    });
    expect(layout.documentWidth, `${width}px/${textZoom}% document width`).toBeLessThanOrEqual(layout.viewport);
    expect(layout.offViewport, `${width}px/${textZoom}% escaping descendants`).toEqual([]);
    expect(layout.forbiddenOverflow, `${width}px/${textZoom}% clipped/scrolled descendants`).toEqual([]);
    expect(layout.proseTooWide, `${width}px/${textZoom}% prose measure`).toEqual([]);
    await expect(page.locator('[data-resume-project="quest-craft"]')).toBeVisible();
    await expect(page.locator('[data-resume-history="der-dcp"]')).toBeVisible();
    await expect(page.locator('[data-capability-boundary="energy-ee"]')).toHaveText(
      `Audience boundary. ${resumeEnergyBoundary}`,
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/resume", { waitUntil: "networkidle" });
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
  const tabStops = page.locator('article[data-resume-surface="public-resume"] a[href], article[data-resume-surface="public-resume"] button');
  for (let index = 0; index < await tabStops.count(); index += 1) {
    const target = tabStops.nth(index);
    await target.scrollIntoViewIfNeeded();
    await target.focus();
    const focus = await target.evaluate((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        identity: `${node.tagName} ${node.getAttribute("href") ?? node.textContent?.replace(/\s+/g, " ").trim()}`,
        outline: Number.parseFloat(style.outlineWidth),
        offset: Number.parseFloat(style.outlineOffset),
        height: rect.height,
        inside: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
        unobscured: center === node || Boolean(center && node.contains(center)),
        center: center ? `${center.tagName}.${center.className}` : null,
        rect: [rect.left, rect.top, rect.right, rect.bottom],
      };
    });
    expect(focus.outline, focus.identity).toBeGreaterThanOrEqual(3);
    expect(focus.offset, focus.identity).toBeGreaterThanOrEqual(4);
    expect(focus.height, focus.identity).toBeGreaterThanOrEqual(24);
    expect(focus.inside, `${focus.identity} ${JSON.stringify(focus.rect)}`).toBe(true);
    expect(focus.unobscured, `${focus.identity} center=${focus.center}`).toBe(true);
  }

  await page.emulateMedia({ reducedMotion: "reduce", media: "screen" });
  await page.goto("/resume", { waitUntil: "networkidle" });
  const motion = await page.locator('article[data-resume-surface="public-resume"]').evaluate((article) => {
    const duration = (value: string) => value.split(",").map((part) => {
      const token = part.trim();
      return token.endsWith("ms") ? Number.parseFloat(token) : Number.parseFloat(token) * 1000;
    });
    const values = [article, ...article.querySelectorAll<HTMLElement>("*")].flatMap((node) => {
      const style = getComputedStyle(node);
      return [...duration(style.animationDuration), ...duration(style.transitionDuration)];
    });
    return { max: Math.max(...values), scroll: getComputedStyle(document.documentElement).scrollBehavior };
  });
  expect(motion.max).toBeLessThanOrEqual(0.01);
  expect(motion.scroll).toBe("auto");

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "no-preference", media: "screen" });
  await page.goto("/resume", { waitUntil: "networkidle" });
  await expect(page.getByText("Supporting implementation", { exact: true })).toBeVisible();
  await expect(page.getByText("Audience boundary.", { exact: true })).toBeVisible();
  const forced = await page.locator('[data-resume-project="quest-craft"]').evaluate((node) => ({
    borderLeft: getComputedStyle(node).borderLeftStyle,
    label: node.querySelector("[data-evidence-field='maturity']")?.textContent?.trim(),
  }));
  expect(forced.borderLeft).not.toBe("none");
  expect(forced.label).toBe(resumeEvidence("quest-craft", "maturity"));

  await page.emulateMedia({ forcedColors: "none", media: "print" });
  await page.goto("/resume", { waitUntil: "networkidle" });
  const printArticle = page.locator('article[data-resume-surface="public-resume"]');
  for (const chrome of await page.locator(".site-header, .site-footer").all()) {
    await expect(chrome).toBeHidden();
  }
  await expect(printArticle.getByRole("button", { name: /Print from browser/i })).toBeHidden();
  for (const [, href, visibleHref] of resumeProfiles) {
    const link = printArticle.locator(`a[href="${href}"]`);
    await expect(link).toBeVisible();
    await expect(link).toContainText(visibleHref);
  }
  await expect(printArticle.locator("[data-resume-project]")).toHaveCount(3);
  await expect(printArticle.locator("[data-resume-history]")).toHaveCount(3);
  await expect(printArticle.locator("[data-evidence-owner]")).toHaveCount(32);
  await expect(printArticle.locator("[data-technology-binding]")).toHaveCount(6);
  await expect(printArticle.locator('[data-capability-boundary="energy-ee"]')).toHaveText(
    `Audience boundary. ${resumeEnergyBoundary}`,
  );
  const printAudit = await printArticle.evaluate((article) => {
    const visible = [article, ...article.querySelectorAll<HTMLElement>("*")].filter((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none"
        && style.visibility !== "hidden"
        && !node.classList.contains("sr-only")
        && rect.width > 1
        && rect.height > 1;
    });
    return {
      clipping: visible.flatMap((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const overflow = [style.overflow, style.overflowX, style.overflowY];
        return rect.left < -1 || rect.right > innerWidth + 1 || overflow.some((value) => /^(?:auto|scroll|hidden|clip)$/.test(value))
          ? [{ node: node.tagName, text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 80), rect: [rect.left, rect.right], overflow }]
          : [];
      }),
      hrefs: [...article.querySelectorAll<HTMLAnchorElement>("a[href]")].map((node) => node.href),
    };
  });
  expect(printAudit.clipping).toEqual([]);
  for (const sourceId of resumeHistory.map(([, , sourceId]) => sourceId)) {
    expect(printAudit.hrefs).toContain(getPublicSourceHref(sourceId));
  }

  const printPdf = await page.pdf({
    format: "Letter",
    margin: { top: "0.42in", right: "0.42in", bottom: "0.42in", left: "0.42in" },
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });
  const pdfSource = printPdf.toString("latin1");
  expect(printPdf.byteLength).toBeGreaterThan(200_000);
  expect((pdfSource.match(/\/Type\s*\/Page\b/g) ?? []).length).toBe(5);
  expect(pdfSource).not.toMatch(/127\.0\.0\.1|localhost/i);
});

test("résumé metadata, professional profile URLs, and isolated performance remain bounded", async ({
  browser,
  page,
  request,
}) => {
  await page.goto("/resume", { waitUntil: "networkidle" });
  await expect(page).toHaveTitle("Resume | William Drew Baker");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${expectedSiteOrigin}/resume`);
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute("content", resumeDescription);
  }
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Resume | William Drew Baker");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${expectedSiteOrigin}/resume`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "William Drew Baker");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Resume | William Drew Baker");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${expectedSiteOrigin}/opengraph-image`);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", `${expectedSiteOrigin}/opengraph-image`);
  const metadataText = await page.locator("head").textContent();
  expect(metadataText).not.toMatch(/electrical engineer|controls engineer|power-systems engineer|embedded-systems engineer|implemented energy system|SoftwareApplication/i);
  const jsonLd = page.locator('script[type="application/ld+json"]');
  for (const node of await jsonLd.all()) {
    expect(await node.textContent()).not.toMatch(/SoftwareApplication|runtime capability|electrical engineer|controls engineer/i);
  }
  const profileNavigation = page.locator(
    'article[data-resume-surface="public-resume"] nav[aria-label="Public professional profiles"]',
  );
  for (const [label, href, visibleHref] of resumeProfiles) {
    const link = profileNavigation.getByRole("link", { name: new RegExp(label) });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toContainText(visibleHref);
  }
  const social = await request.get("/opengraph-image");
  expect(social.status()).toBe(200);
  expect(social.headers()["content-type"]).toContain("image/png");
  expect((await social.body()).byteLength).toBeGreaterThan(20_000);

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const perfPage = await context.newPage();
  await perfPage.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__resumeMetrics", { value: metrics, writable: false });
    new PerformanceObserver((list) => list.getEntries().forEach((entry) => {
      const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
    })).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => list.getEntries().forEach((entry) => {
      metrics.tbt += Math.max(0, entry.duration - 50);
    })).observe({ type: "longtask", buffered: true });
  });
  await perfPage.goto("/resume", { waitUntil: "networkidle" });
  await perfPage.waitForTimeout(500);
  const measured = await perfPage.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (predicate: (resource: PerformanceResourceTiming) => boolean) => resources
      .filter(predicate).reduce((sum, item) => sum + (item.transferSize || item.encodedBodySize), 0);
    return {
      metrics: (window as typeof window & { __resumeMetrics: { cls: number; lcp: number; tbt: number } }).__resumeMetrics,
      staticBytes: bytes((item) => new URL(item.name).pathname.includes("/_next/static/")),
      imageBytes: bytes((item) => item.initiatorType === "img"),
      hosts: [...new Set(resources.map((item) => new URL(item.name).host))],
    };
  });
  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeGreaterThan(0);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBe(0);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  await context.close();
});

test("historical coursework and résumé lanes retain their exact source-bound separation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  expect(
    await page.locator("[data-project-model-id]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-project-model-id")),
    ),
  ).toEqual(["burnlens", "runbook-sentinel", "quest-craft", "openclaw-showcase"]);
  await expect(page.getByRole("link", { name: "Read Quest Craft field note" })).toHaveAttribute(
    "href",
    "/work/quest-craft",
  );
  await expect(page.locator("[data-historical-coursework]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /historical reading shelf/i })).toHaveAttribute(
    "href",
    "/work#historical-reading",
  );
  await expect(page.getByText("Hierarchical clustering exploration")).toHaveCount(0);
  await expect(page.getByText("DER Distributed Control Planner")).toHaveCount(0);

  await page.goto("/work", { waitUntil: "networkidle" });
  expect(
    await page.locator("[data-project-model-id]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-project-model-id")),
    ),
  ).toEqual([
    "burnlens",
    "runbook-sentinel",
    "quest-craft",
    "openclaw-showcase",
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp",
  ]);
  const questRow = page.locator('[data-work-entry][data-project-model-id="quest-craft"]');
  await expect(questRow.getByRole("link", { name: "Read Quest Craft field note" })).toHaveAttribute(
    "href",
    "/work/quest-craft",
  );
  const workShelf = page.locator('[data-work-lane="historical-reading-shelf"]');
  await expect(workShelf.locator("[data-work-entry]")).toHaveCount(3);
  for (const [projectId, sourceId] of [
    ["hierarchical-clustering", "hc.snapshot"],
    ["energy-sector-data-governance", "policy.reader"],
    ["der-dcp", "der.document"],
  ] as const) {
    await expect(
      workShelf.locator(`[data-project-model-id="${projectId}"] a[href]`),
    ).toHaveAttribute("href", getPublicSourceHref(sourceId));
  }
  await expect(page.locator('[data-work-lane="flagships"], [data-work-lane="supporting-notes"]')
    .getByText("Hierarchical clustering exploration")).toHaveCount(0);
  const workDerEntry = workShelf.locator("[data-work-entry]").filter({
    hasText: "DER Distributed Control Planner",
  });
  await expect(workDerEntry.getByRole("link", { name: /Read the historical proposal/ })).toHaveAttribute(
    "href",
    "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
  );
  await expect(page.locator('[data-work-lane="flagships"], [data-work-lane="supporting-notes"]')
    .getByText("DER Distributed Control Planner")).toHaveCount(0);

  await page.goto("/resume", { waitUntil: "networkidle" });
  expect(await page.locator("[data-resume-project]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["burnlens", "runbook-sentinel", "quest-craft"]);
  expect(await page.locator("[data-resume-history]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-project-model-id")),
  )).toEqual(["hierarchical-clustering", "energy-sector-data-governance", "der-dcp"]);
});

test("historical coursework remains complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/work#historical-reading", { waitUntil: "domcontentloaded" });

  const shelf = page.locator('[data-work-lane="historical-reading-shelf"]');
  await expect(shelf.locator("[data-work-entry]")).toHaveCount(3);
  for (const [projectId, sourceId] of [
    ["hierarchical-clustering", "hc.snapshot"],
    ["energy-sector-data-governance", "policy.reader"],
    ["der-dcp", "der.document"],
  ] as const) {
    await expect(shelf.locator(`[data-project-model-id="${projectId}"] a[href]`)).toHaveAttribute(
      "href",
      getPublicSourceHref(sourceId),
    );
  }
  await expect(shelf.getByText(/source variants, data identity, environment, outputs, evaluation, authorship, and rights remain bounded or unresolved/i)).toBeVisible();
  await expect(shelf.getByText(/no Adobe Stock or Canva imagery is reused/i)).toBeVisible();
  const derEntry = shelf.locator("[data-work-entry]").filter({
    hasText: "DER Distributed Control Planner",
  });
  await expect(derEntry).toBeVisible();
  await expect(derEntry.getByText(/No system was implemented or evaluated/i)).toBeVisible();
  await expect(derEntry.getByRole("link", { name: /Read the historical proposal/ })).toHaveAttribute(
    "href",
    "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
  );
  await expect(shelf.locator("img")).toHaveCount(0);

  await context.close();
});

test("flagship case studies preserve a clear next portfolio destination", async ({ page }) => {
  await page.goto("/work/burnlens", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Return to selected work/ })).toHaveAttribute("href", "/work");

  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /BurnLens/ })).toHaveAttribute(
    "href",
    "/work/burnlens",
  );
});

test("BurnLens release and evidence identities remain visibly distinct", async ({ page }) => {
  await page.goto("/");
  const making = page.locator("[data-portfolio-making]");
  await expect(making.locator('[data-source-id="burnlens-release"]')).toHaveAttribute("href", burnlensReleaseHref);
  await expect(making.locator('[data-source-id="burnlens-pinned-tree"]')).toHaveAttribute("href", burnlensBuildRecordHref);
  await expect(page.locator('[data-flagship-teaser="burnlens"] [data-featured-turn]')).toHaveCount(0);

  await page.goto("/work/burnlens");
  const article = page.locator('article[data-project-model-id="burnlens"]');
  await expect(article.locator('[data-claim-atom="outcome"]')).toContainText("e2e0b778");
  await expect(article.locator('[data-claim-atom="outcome"]')).toContainText("a741111d");
  const evidence = article.locator('[aria-label="BurnLens public evidence"]');
  expect(await evidence.locator("[data-source-id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-source-id")),
  )).toEqual([
    "burnlens-release",
    "burnlens-pinned-tree",
  ]);
  await expect(evidence.locator('[data-source-id="burnlens-release"]')).toHaveAttribute("href", burnlensReleaseHref);
  await expect(evidence.locator('[data-source-id="burnlens-pinned-tree"]')).toHaveAttribute("href", burnlensPinnedTreeHref);
  await expect(article.locator("img, picture, [data-governed-figure], [data-media-warning]")).toHaveCount(0);
});

test("selected learning distinguishes linked credentials from unlinked study", async ({ page }) => {
  await page.goto("/resume");
  const learning = page.getByRole("region", { name: "Selected learning" });
  await expect(learning.getByText(/NASA ARSET.*remote sensing fundamentals/i)).toBeVisible();
  await expect(learning.locator('a[href*="nasa.gov"], a[href*="earthdata.nasa.gov"]')).toHaveCount(0);
  await expect(learning.locator("li")).toHaveCount(5);
  await expect(learning.locator("a[href]")).toHaveCount(4);
  await expect(learning.getByRole("link", { name: /Imperial College London.*Linear Algebra/ })).toBeVisible();
  await expect(learning.getByRole("link", { name: /Kaggle.*Intermediate Machine Learning/ })).toBeVisible();
  await expect(learning.getByText(/Mimo|Python Development/i)).toHaveCount(0);
  await expect(learning.locator('a[href*="virtualbadge"]')).toHaveCount(0);
});

test("metadata and discovery surfaces identify the personal site", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Drew Baker/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", expectedSiteOrigin);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Drew Baker Portfolio");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    expectedIndexable ? /index, follow/i : /noindex, nofollow/i,
  );
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1);

  await page.goto("/work/burnlens");
  await expect(page).toHaveTitle("BurnLens — Release governance and evidence system | Drew Baker");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${expectedSiteOrigin}/work/burnlens`,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new RegExp(`^${expectedSiteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/opengraph-image`),
  );

  await page.goto("/work/quest-craft");
  await expect(page).toHaveTitle(/Quest Craft — The story branches/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${expectedSiteOrigin}/media/projects/quest-craft/social-preview.jpg`,
  );

  for (const route of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/work/runbook-sentinel/opengraph-image", "/media/projects/quest-craft/social-preview.jpg", "/icon.svg"]) {
    expect((await request.get(route)).status(), route).toBe(200);
  }
  expect((await request.get("/work/burnlens/opengraph-image")).status()).toBe(404);

  const robotsBody = await (await request.get("/robots.txt")).text();
  expect(robotsBody).toContain(expectedIndexable ? "Allow: /" : "Disallow: /");
  const sitemapBody = await (await request.get("/sitemap.xml")).text();
  expect(sitemapBody).toContain(`${expectedSiteOrigin}/work/burnlens`);
  expect(sitemapBody).not.toContain(`<loc>${expectedSiteOrigin}/burnlens</loc>`);
});

test("shared chrome keeps one opaque, readable, high-contrast system across every route", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of representativeRoutes) {
      await page.goto(route, { waitUntil: "networkidle" });

      const chrome = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        const brand = document.querySelector<HTMLElement>(".brand-mark");
        const menu = document.querySelector<HTMLElement>(".mobile-menu summary");
        const footerLinks = [...document.querySelectorAll<HTMLElement>(".footer-links a")];
        if (!header || !brand || !menu || footerLinks.length === 0) throw new Error("Shared chrome is incomplete.");
        const headerStyle = getComputedStyle(header);
        return {
          backdrop: headerStyle.backdropFilter,
          background: headerStyle.backgroundColor,
          headerHeight: header.getBoundingClientRect().height,
          scrollPadding: Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
          brandSize: Number.parseFloat(getComputedStyle(brand).fontSize),
          menuSize: Number.parseFloat(getComputedStyle(menu).fontSize),
          footerSizes: footerLinks.map((link) => Number.parseFloat(getComputedStyle(link).fontSize)),
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
        };
      });

      expect(chrome.backdrop, `${route} at ${width}px backdrop`).toBe("none");
      expect(chrome.background, `${route} at ${width}px header surface`).toBe("rgb(233, 226, 216)");
      expect(chrome.headerHeight, `${route} at ${width}px header height`).toBeGreaterThanOrEqual(80);
      expect(chrome.headerHeight, `${route} at ${width}px header height`).toBeLessThanOrEqual(81);
      expect(chrome.scrollPadding, `${route} at ${width}px scroll padding`).toBe(80);
      expect(chrome.brandSize, `${route} at ${width}px brand text`).toBeGreaterThanOrEqual(13);
      expect(chrome.menuSize, `${route} at ${width}px menu action`).toBeGreaterThanOrEqual(13);
      for (const size of chrome.footerSizes) {
        expect(size, `${route} at ${width}px footer action`).toBeGreaterThanOrEqual(13);
      }
      expect(chrome.documentWidth, `${route} at ${width}px unclipped document`).toBeLessThanOrEqual(
        chrome.viewportWidth,
      );

      const footerLink = page.locator(".footer-links a").first();
      await footerLink.scrollIntoViewIfNeeded();
      await footerLink.focus();
      await expect(footerLink).toBeFocused();
      const focus = await footerLink.evaluate((link) => {
        const style = getComputedStyle(link);
        const rect = link.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          color: style.outlineColor,
          width: Number.parseFloat(style.outlineWidth),
          offset: Number.parseFloat(style.outlineOffset),
          hit: hit === link || Boolean(hit && link.contains(hit)),
        };
      });
      expect(focus.color).toBe("rgb(199, 205, 191)");
      expect(focus.width).toBeGreaterThanOrEqual(3);
      expect(focus.offset).toBeGreaterThanOrEqual(4);
      expect(focus.hit).toBe(true);
    }
  }
});

test("root Open Graph endpoint is an exact meaningful 1200 by 630 PNG", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const expectedImagePath = `${expectedSiteOrigin}/opengraph-image`;
  const socialImages = await Promise.all([
    page.locator('meta[property="og:image"]').getAttribute("content"),
    page.locator('meta[name="twitter:image"]').getAttribute("content"),
  ]);
  expect(socialImages[0]).toBeTruthy();
  expect(socialImages[1]).toBeTruthy();
  for (const value of socialImages) {
    const socialImageUrl = new URL(value!);
    expect(`${socialImageUrl.origin}${socialImageUrl.pathname}`).toBe(expectedImagePath);
    expect(socialImageUrl.hash).toBe("");
    if (socialImageUrl.search) {
      expect(socialImageUrl.search).toMatch(/^\?[0-9a-f]{16}$/);
    }
  }

  const response = await request.get("/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const bytes = Buffer.from(await response.body());
  expect(bytes.byteLength).toBeGreaterThan(20_000);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(bytes.toString("ascii", 12, 16)).toBe("IHDR");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});

test("convenience and legacy routes are permanent and contact intake is disabled", async ({ request }) => {
  const redirects = [
    ["/burnlens", "/work/burnlens"],
    ["/gradportfolio", "/"],
    ["/gradportfolio/resume", "/resume"],
    ["/usgif", "/"],
    ["/usgif/resume", "/resume"],
  ] as const;

  for (const [source, destination] of redirects) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), source).toBe(308);
    expect(response.headers().location, source).toBe(destination);
  }

  const contact = await request.post("/api/contact", {
    data: { name: "test", email: "test@example.com", message: "must not send" },
  });
  expect(contact.status()).toBe(410);
});

test("security and privacy defaults are present", async ({ page, request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");

  await page.goto("/resume");
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('img[src^="http:"] , img[src^="https:"]')).toHaveCount(0);
});

test("homepage and work index independently stay inside conservative local lab budgets", async ({ browser }) => {
  for (const route of ["/", "/work"] as const) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const metrics = { cls: 0, lcp: 0, tbt: 0 };
      Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) metrics.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const measured = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const bytes = (predicate: (resource: PerformanceResourceTiming) => boolean) =>
        resources.filter(predicate).reduce(
          (total, resource) => total + (resource.transferSize || resource.encodedBodySize),
          0,
        );
      return {
        metrics: (window as typeof window & {
          __portfolioMetrics: { cls: number; lcp: number; tbt: number };
        }).__portfolioMetrics,
        staticBytes: bytes((resource) => new URL(resource.name).pathname.includes("/_next/static/")),
        imageBytes: bytes((resource) => resource.initiatorType === "img"),
        measuredResources: resources.filter(
          (resource) => (resource.transferSize || resource.encodedBodySize) > 0,
        ).length,
        hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
      };
    });
    expect(measured.metrics.lcp, `${route}: LCP`).toBeGreaterThan(0);
    expect(measured.metrics.lcp, `${route}: LCP`).toBeLessThanOrEqual(2_500);
    expect(measured.metrics.cls, `${route}: CLS`).toBeLessThanOrEqual(0.1);
    expect(measured.metrics.tbt, `${route}: TBT proxy`).toBeLessThanOrEqual(200);
    expect(measured.staticBytes, `${route}: static bytes`).toBeGreaterThan(0);
    expect(measured.staticBytes, `${route}: static bytes`).toBeLessThanOrEqual(300_000);
    expect(measured.imageBytes, `${route}: image bytes`).toBeLessThanOrEqual(250_000);
    expect(measured.measuredResources, `${route}: measured resources`).toBeGreaterThan(0);
    const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
    expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
    console.log(`FRONT_DOOR_LOCAL_LAB_METRICS ${route} ${JSON.stringify(measured)}`);
    await context.close();
  }
});

test("homepage stays inside conservative local lab budgets", async ({ page }) => {
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const measured = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (suffix: string) =>
      resources.filter((resource) => new URL(resource.name).pathname.includes(suffix))
        .reduce((total, resource) => total + resource.transferSize, 0);
    return {
      metrics: (window as typeof window & { __portfolioMetrics: { cls: number; lcp: number; tbt: number } }).__portfolioMetrics,
      staticBytes: bytes("/_next/static/"),
      imageBytes: resources
        .filter((resource) => resource.initiatorType === "img")
        .reduce((total, resource) => total + resource.transferSize, 0),
      hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
    };
  });

  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBeLessThanOrEqual(250_000);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  console.log(`LOCAL_LAB_METRICS ${JSON.stringify(measured)}`);
});

test("BurnLens stays inside conservative local lab budgets", async ({ page }) => {
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/burnlens", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const measured = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const transferred = (predicate: (resource: PerformanceResourceTiming) => boolean) =>
      resources.filter(predicate).reduce((total, resource) => total + resource.transferSize, 0);
    return {
      metrics: (window as typeof window & { __portfolioMetrics: { cls: number; lcp: number; tbt: number } }).__portfolioMetrics,
      staticBytes: transferred((resource) => new URL(resource.name).pathname.includes("/_next/static/")),
      scriptBytes: transferred((resource) => /\.js$/.test(new URL(resource.name).pathname)),
      styleBytes: transferred((resource) => /\.css$/.test(new URL(resource.name).pathname)),
      fontBytes: transferred((resource) => /\.woff2$/.test(new URL(resource.name).pathname)),
      imageBytes: transferred((resource) => resource.initiatorType === "img"),
      hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
    };
  });

  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBeLessThanOrEqual(250_000);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  console.log(`BURNLENS_LOCAL_LAB_METRICS ${JSON.stringify(measured)}`);
});

test("Runbook Sentinel stays inside conservative local lab budgets", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await page.locator('[data-governed-figure="runbook-dashboard"] img').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const measured = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (predicate: (resource: PerformanceResourceTiming) => boolean) =>
      resources.filter(predicate).reduce(
        (total, resource) => total + (resource.transferSize || resource.encodedBodySize),
        0,
      );
    return {
      metrics: (window as typeof window & {
        __portfolioMetrics: { cls: number; lcp: number; tbt: number };
      }).__portfolioMetrics,
      staticBytes: bytes((resource) => new URL(resource.name).pathname.includes("/_next/static/")),
      imageBytes: bytes((resource) => resource.initiatorType === "img"),
      measuredResources: resources.filter(
        (resource) => (resource.transferSize || resource.encodedBodySize) > 0,
      ).length,
      hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
    };
  });

  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeGreaterThan(0);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBeGreaterThan(0);
  expect(measured.imageBytes).toBeLessThanOrEqual(250_000);
  expect(measured.measuredResources).toBeGreaterThan(0);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  console.log(`RUNBOOK_LOCAL_LAB_METRICS ${JSON.stringify(measured)}`);
  await context.close();
});

test("Quest Craft stays inside its isolated local supporting-route budget", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, tbt: 0 };
    Object.defineProperty(window, "__portfolioMetrics", { value: metrics, writable: false });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const measured = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (predicate: (resource: PerformanceResourceTiming) => boolean) =>
      resources.filter(predicate).reduce(
        (total, resource) => total + (resource.transferSize || resource.encodedBodySize),
        0,
      );
    return {
      metrics: (window as typeof window & {
        __portfolioMetrics: { cls: number; lcp: number; tbt: number };
      }).__portfolioMetrics,
      staticBytes: bytes((resource) => new URL(resource.name).pathname.includes("/_next/static/")),
      imageBytes: bytes((resource) => resource.initiatorType === "img"),
      measuredResources: resources.filter(
        (resource) => (resource.transferSize || resource.encodedBodySize) > 0,
      ).length,
      hosts: [...new Set(resources.map((resource) => new URL(resource.name).host))],
    };
  });
  expect(measured.metrics.lcp).toBeGreaterThan(0);
  expect(measured.metrics.lcp).toBeLessThanOrEqual(2_500);
  expect(measured.metrics.cls).toBeLessThanOrEqual(0.1);
  expect(measured.metrics.tbt).toBeLessThanOrEqual(200);
  expect(measured.staticBytes).toBeGreaterThan(0);
  expect(measured.staticBytes).toBeLessThanOrEqual(300_000);
  expect(measured.imageBytes).toBe(0);
  expect(measured.measuredResources).toBeGreaterThan(0);
  const testPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
  expect(measured.hosts.every((host) => host === `127.0.0.1:${testPort}`)).toBe(true);
  console.log(`QUEST_LOCAL_LAB_METRICS ${JSON.stringify(measured)}`);
  await context.close();
});
