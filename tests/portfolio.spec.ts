import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const expectedSiteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://burnlensproject.org",
).origin;
const expectedIndexable =
  process.env.PORTFOLIO_DEPLOYMENT_CONTEXT === "production" &&
  process.env.NEXT_PUBLIC_SITE_INDEXING === "allow";

const representativeRoutes = [
  "/",
  "/work",
  "/work/burnlens",
  "/work/runbook-sentinel",
  "/work/quest-craft",
  "/work/openclaw-showcase",
  "/resume",
] as const;

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

test("case-study chapter indexes collapse into keyboard-native mobile disclosures", async ({ page }) => {
  const cases = [
    ["/work/burnlens", "burnlens", "Method", "#method"],
    ["/work/runbook-sentinel", "runbook-sentinel", "Control paths", "#control-paths"],
  ] as const;

  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, project, chapter, hash] of cases) {
    await page.goto(route, { waitUntil: "networkidle" });

    await expect(page.locator(`[data-case-chapter-index="${project}"]`)).toBeHidden();
    const disclosure = page.locator(`[data-case-chapters="${project}"]`);
    const summary = disclosure.locator(":scope > summary");
    await expect(summary).toBeVisible();
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.getByRole("link", { name: /Sources/ })).toBeVisible();
    await expect(disclosure.getByRole("link")).toHaveCount(6);

    await disclosure.getByRole("link", { name: new RegExp(chapter) }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(disclosure).not.toHaveAttribute("open", "");
    await expect(page.locator(hash)).toBeFocused();

    await expect
      .poll(() => page.locator(hash).evaluate((target) => target.getBoundingClientRect().top))
      .toBeLessThan(844);
    const targetTop = await page.locator(hash).evaluate((target) => target.getBoundingClientRect().top);
    expect(targetTop).toBeGreaterThanOrEqual(72);
  }

  await page.setViewportSize({ width: 1280, height: 1000 });
  for (const [route, project] of cases) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator(`[data-case-chapter-index="${project}"]`)).toBeVisible();
    await expect(page.locator(`[data-case-chapters="${project}"]`)).toBeHidden();
  }
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

test("mobile homepage prioritizes real work and keeps editorial labels legible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const priority = await page.evaluate(() => {
    const selectedWork = document.querySelector("#selected-work")?.getBoundingClientRect();
    const burnlensMedia = document.querySelector("#burnlens .flagship-media")?.getBoundingClientRect();
    const runbookIndex = document.querySelector(
      '.mobile-flagship-index a[href="/work/runbook-sentinel"]',
    )?.getBoundingClientRect();
    const labels = [
      ...document.querySelectorAll(
        ".eyebrow, .plate-label, .project-kind, .audience-ledger dt, .proof-line dt, .media-index, .project-meta, .case-study-next, .work-row-meta",
      ),
    ];

    return {
      selectedWorkTop: selectedWork?.top ?? Number.POSITIVE_INFINITY,
      burnlensMediaTop: burnlensMedia?.top ?? Number.POSITIVE_INFINITY,
      runbookIndexTop: runbookIndex?.top ?? Number.POSITIVE_INFINITY,
      minimumLabelSize: Math.min(...labels.map((label) => Number.parseFloat(getComputedStyle(label).fontSize))),
    };
  });

  expect(priority.selectedWorkTop).toBeLessThanOrEqual(844 * 1.5);
  expect(priority.burnlensMediaTop).toBeLessThanOrEqual(844 * 2);
  expect(priority.runbookIndexTop).toBeLessThanOrEqual(844 * 2);
  expect(priority.minimumLabelSize).toBeGreaterThanOrEqual(12);
  await expect(page.locator(".hero-principle-mobile > summary")).toBeVisible();
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(scrollBehavior).toBe("auto");
});

test("BurnLens evidence remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto("/work/burnlens#evidence");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Open the layer that supports the decision." })).toBeVisible();
  await expect(page.locator("#evidence details")).toHaveCount(3);
  await expect(page.locator("#evidence details").first()).toHaveAttribute("open", "");
  await expect(page.getByText("The bounded baseline test", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the full-resolution baseline plate" })).toBeVisible();
  await expect(page.locator('[data-case-chapters="burnlens"] > summary')).toBeVisible();
  await context.close();
});

test("Runbook authority evidence remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto("/work/runbook-sentinel#evidence");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Reasoning and authority travel on different rails." })).toBeVisible();
  await expect(page.getByText("The proposal crosses no boundary by itself.")).toBeVisible();
  await expect(page.locator('[role="img"][aria-label^="Eighty-four local-model outputs"] span')).toHaveCount(84);
  await expect(page.locator("#evidence details")).toHaveCount(4);
  await expect(page.locator("#evidence details").first()).toHaveAttribute("open", "");
  await expect(page.getByText("Every expected path remained exact")).toBeVisible();
  await expect(page.getByRole("link", { name: /Exact repository snapshot/ })).toBeVisible();
  await expect(page.locator('[data-case-chapters="runbook-sentinel"] > summary')).toBeVisible();
  await context.close();
});

test("flagship failure dividends preserve failure, change, claim, and boundary without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const cases = [
    {
      route: "/work/burnlens#limits",
      project: "burnlens",
      heading: "The misses narrowed the route.",
      failure: /all 89 selected test cores as burned/i,
      change: /Reject the U-Net as the analytical winner/i,
      claim: /The corrected rerun rejected all five fixtures/i,
      boundary: /General U-Net inferiority/i,
      source: /Validator test record/,
    },
    {
      route: "/work/runbook-sentinel#evidence",
      project: "runbook-sentinel",
      heading: "A trip is useful only when the circuit changes.",
      failure: /success flag in a 150-event audit trace/i,
      change: /make any missing action-and-test-split combination fail the gate/i,
      claim: /next release covers all 6 action-and-split pairs/i,
      boundary: /Writer authentication, hostile-writer resistance/i,
      source: /Model comparison/,
    },
  ] as const;

  for (const item of cases) {
    const response = await page.goto(item.route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();

    const ledger = page.locator(`[data-failure-dividend="${item.project}"]`);
    const records = ledger.locator("[data-failure-dividend-record]");
    await expect(records).toHaveCount(3);
    await expect(records.locator('[data-stage="failed"]')).toHaveCount(3);
    await expect(records.locator('[data-stage="changed"]')).toHaveCount(3);
    await expect(records.locator('[data-stage="claimable"]')).toHaveCount(3);
    await expect(records.locator("[data-boundary]")).toHaveCount(3);
    await expect(ledger.getByText(item.failure)).toBeVisible();
    await expect(ledger.getByText(item.change)).toBeVisible();
    await expect(ledger.getByText(item.claim)).toBeVisible();
    await expect(ledger.getByText(item.boundary)).toBeVisible();
    await expect(ledger.getByRole("link", { name: item.source })).toBeVisible();
  }

  await context.close();
});

test("Quest Craft agency score and evidence remain complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work/quest-craft#agency-score");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "One structure, repeated across every option." })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(4);
  await expect(page.getByRole("radio", { name: /Honor choice/ })).toBeChecked();
  await expect(page.locator('[data-beat="honor"]')).toHaveCount(3);
  await expect(page.locator("#evaluation table")).toHaveCount(4);
  await expect(page.locator('#evaluation td[data-kind="generated"]')).toHaveCount(33);
  await expect(page.locator('#evaluation td[data-kind="rejected"]')).toHaveCount(3);
  await expect(page.locator("#evaluation dd").filter({ hasText: "360 / 360" })).toBeVisible();
  await expect(page.getByText("Six failed or superseded attempts", { exact: true })).toBeVisible();
  await context.close();
});

test("Quest Craft interaction highlights one structural beat without generating content", async ({ page }) => {
  await page.goto("/work/quest-craft", { waitUntil: "networkidle" });

  const returnAgency = page.getByRole("radio", { name: /Return agency/ });
  await returnAgency.check();
  await expect(returnAgency).toBeChecked();

  const highlighted = await page.locator('[data-beat="return"]').evaluateAll((beats) =>
    beats.map((beat) => getComputedStyle(beat).backgroundColor),
  );
  expect(new Set(highlighted).size).toBe(1);
  expect(highlighted[0]).not.toBe("rgba(0, 0, 0, 0)");

  const minimumEvidenceLabel = await page.evaluate(() => {
    const labels = document.querySelectorAll(
      "#agency-score legend, #agency-score label, #agency-score small, #agency-score em, #evaluation th, #evaluation td, #evaluation dt, #evaluation small, #sources code",
    );
    return Math.min(...[...labels].map((label) => Number.parseFloat(getComputedStyle(label).fontSize)));
  });
  expect(minimumEvidenceLabel).toBeGreaterThanOrEqual(12);

  await expect(page.getByRole("link", { name: "Public reviewer snapshot", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/quest-craft-unexpected-choice-assistant-review/tree/bc14c43840aabb11ca35e94df0c8682672f24f3c",
  );
  await expect(page.getByText(/not proof of production maturity or general child safety/i)).toBeVisible();
  await expect(page.getByText(/36 model runs/i)).toHaveCount(0);
});

test("OpenClaw remains a documentary case with its private runtime out of frame", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("/work/openclaw-showcase#register");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Three filters prevent disclosure drift." })).toBeVisible();
  await expect(page.locator("#register details")).toHaveCount(3);
  await expect(page.locator("#register details").first()).toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { name: "The draft never promotes itself." })).toBeVisible();
  await expect(page.locator("#workflow li")).toHaveCount(5);
  await expect(page.getByText("Human decision", { exact: true })).toBeVisible();
  await expect(page.getByText("Sanitized · not raw export", { exact: true })).toBeVisible();
  await expect(page.locator("#limits li").filter({ hasText: /not an actual-run record/i })).toBeVisible();
  await expect(page.getByText(/No private runtime, configuration, raw log, or exact trace was inspected/i)).toBeVisible();
  await expect(page.getByText(/8 Markdown documents/i)).toBeVisible();
  await expect(page.getByText(/9 conceptual diagrams/i)).toBeVisible();
  await expect(page.getByText(/runtime artifacts shown/i)).toBeVisible();
  await expect(
    page.locator("aside dl > div").filter({ hasText: "Runtime artifacts shown" }).locator("dd"),
  ).toHaveText("0");
  await expect(page.locator("[data-runtime-ui]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Exact public snapshot/ })).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/openclaw-showcase/tree/3695666f6a44c095674049e64d23f0bdace2fb70",
  );
  await context.close();
});

test("historical coursework forms a bounded reading shelf outside the case-study lane", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Read the Quest Craft case study" })).toHaveAttribute(
    "href",
    "/work/quest-craft",
  );
  const homeShelf = page.locator("[data-historical-coursework]");
  await expect(homeShelf.getByRole("heading", { name: "Earlier work, kept in its proper tense." })).toBeVisible();
  await expect(homeShelf.locator("[data-coursework-entry]")).toHaveCount(3);
  await expect(homeShelf.locator("img")).toHaveCount(0);
  await expect(homeShelf.getByText(/not a current reproducible study/i)).toBeVisible();
  await expect(homeShelf.getByText(/not current policy guidance/i)).toBeVisible();
  await expect(homeShelf.getByRole("link", { name: /Inspect the frozen repository snapshot/ })).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/Grad504-Hierarchical-Cluster-Project/tree/21e9b18b37a0e1acd9f2814cca3456b94849c098",
  );
  await expect(homeShelf.getByRole("link", { name: /Read the public brief/ })).toHaveAttribute(
    "href",
    "https://drive.google.com/file/d/18o2vmdDzz_FN9_Xm-xfBLw8TzlLBxqUU/view?usp=sharing",
  );
  const derEntry = homeShelf.locator("[data-coursework-entry]").filter({
    hasText: "DER Distributed Control Planner",
  });
  await expect(derEntry.getByRole("heading", { name: "DER Distributed Control Planner" })).toBeVisible();
  await expect(derEntry).toContainText("William Baker");
  await expect(derEntry).toContainText("SCLA 521 Societal Impacts of AI");
  await expect(derEntry).toContainText("No system was implemented or evaluated");
  await expect(derEntry).toContainText("not current guidance");
  await expect(derEntry).toContainText("embedded research log remains excluded");
  await expect(derEntry.getByRole("link", { name: /Read the historical proposal/ })).toHaveAttribute(
    "href",
    "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
  );
  await expect(page.locator(".secondary-list").getByText("Hierarchical clustering exploration")).toHaveCount(0);
  await expect(page.locator(".secondary-list").getByText("DER Distributed Control Planner")).toHaveCount(0);

  await page.goto("/work", { waitUntil: "networkidle" });
  const questRow = page.getByRole("article").filter({ hasText: "Quest Craft" });
  await expect(questRow.getByRole("link", { name: "Read case study →" })).toHaveAttribute(
    "href",
    "/work/quest-craft",
  );
  const workShelf = page.locator("[data-historical-coursework]");
  await expect(workShelf.locator("[data-coursework-entry]")).toHaveCount(3);
  await expect(page.locator(".work-table").getByText("Hierarchical clustering exploration")).toHaveCount(0);
  const workDerEntry = workShelf.locator("[data-coursework-entry]").filter({
    hasText: "DER Distributed Control Planner",
  });
  await expect(workDerEntry.getByRole("link", { name: /Read the historical proposal/ })).toHaveAttribute(
    "href",
    "https://docs.google.com/document/d/1qOzbX4PMS5vF_WFx7LEY7ls74jDJsI6-SrtdoRcMXZw",
  );
  await expect(page.locator(".work-table").getByText("DER Distributed Control Planner")).toHaveCount(0);

  await page.goto("/resume", { waitUntil: "networkidle" });
  await expect(page.getByText("DER Distributed Control Planner")).toHaveCount(0);
});

test("historical coursework remains complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const shelf = page.locator("[data-historical-coursework]");
  await expect(shelf.locator("[data-coursework-entry]")).toHaveCount(3);
  await expect(shelf.getByText(/GitHub and Colab versions differ/i)).toBeVisible();
  await expect(shelf.getByText(/no Adobe Stock or Canva imagery is reused/i)).toBeVisible();
  const derEntry = shelf.locator("[data-coursework-entry]").filter({
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

test("flagship case studies hand recruiters directly to the adjacent project", async ({ page }) => {
  await page.goto("/work/burnlens", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Open Runbook Sentinel/ })).toHaveAttribute(
    "href",
    "/work/runbook-sentinel",
  );

  await page.goto("/work/runbook-sentinel", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /BurnLens — baseline-first/ })).toHaveAttribute(
    "href",
    "/work/burnlens",
  );
});

test("BurnLens release and evidence identities remain visibly distinct", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('#burnlens a.quiet-link')).toHaveAttribute(
    "href",
    "https://github.com/drwbkr1/burnlens-deschutes/tree/a741111d82e69689022d2058118ed8f4b9bf3546",
  );

  await page.goto("/work/burnlens");
  const ledger = page.locator('[data-source-ledger="burnlens"]');
  await expect(ledger).toContainText("Post-release publication state");
  await expect(ledger).toContainText("a741111d…");
  await expect(ledger).toContainText("v0.56.0 · e2e0b778…");
  await expect(ledger).toContainText("mutable public surface");
  await expect(page.getByText(/four release-lifecycle and publication-sync commits later/i)).toBeVisible();
});

test("selected learning distinguishes linked credentials from unlinked study", async ({ page }) => {
  await page.goto("/resume");
  const learning = page.getByRole("region", { name: "Selected learning" });
  await expect(learning.getByText(/NASA ARSET.*remote sensing fundamentals/i)).toBeVisible();
  await expect(learning.locator('a[href*="nasa.gov"], a[href*="earthdata.nasa.gov"]')).toHaveCount(0);
  await expect(learning.getByRole("link", { name: /Imperial College London.*Linear Algebra/ })).toBeVisible();
  await expect(learning.getByRole("link", { name: /Kaggle.*Intermediate Machine Learning/ })).toBeVisible();
  await expect(learning.getByRole("link", { name: /Mimo.*Python Development/ })).toHaveAttribute(
    "href",
    "https://www.virtualbadge.io/certificate-validator?credential=309dfe20-7aec-47a8-a208-b4622bb1b74c",
  );
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
  await expect(page).toHaveTitle("BurnLens — Baseline-first wildfire evidence | Drew Baker");

  await page.goto("/work/quest-craft");
  await expect(page).toHaveTitle(/Quest Craft — The story branches/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${expectedSiteOrigin}/media/projects/quest-craft/social-preview.jpg`,
  );

  for (const route of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/work/burnlens/opengraph-image", "/work/runbook-sentinel/opengraph-image", "/media/projects/quest-craft/social-preview.jpg", "/icon.svg"]) {
    expect((await request.get(route)).status(), route).toBe(200);
  }

  const robotsBody = await (await request.get("/robots.txt")).text();
  expect(robotsBody).toContain(expectedIndexable ? "Allow: /" : "Disallow: /");
  const sitemapBody = await (await request.get("/sitemap.xml")).text();
  expect(sitemapBody).toContain(`${expectedSiteOrigin}/work/burnlens`);
});

test("legacy routes are permanent and contact intake is disabled", async ({ request }) => {
  const redirects = [
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
