import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://burnlensproject.org").origin;
const expectedIndexable = process.env.PORTFOLIO_DEPLOYMENT_CONTEXT === "production" && process.env.NEXT_PUBLIC_SITE_INDEXING === "allow";
const hero = "I turn data and complex ideas into usable software.";
const nepalCredit = "ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.";
const projects = [
  { id: "wildfire-response", title: /^Wildfire Response$/ },
  { id: "after-the-tip", title: /^After the Tip$/ },
  { id: "west-hawaii-heat-exposure", title: /^Heat exposure across\s*West Hawaiʻi reefs\.$/ },
  { id: "nepal-satellite-atlas", title: /^Nepal Satellite Atlas$/ },
] as const;
const allProjectIds = [...projects.map(project => project.id), "burnlens", "runbook-sentinel"] as const;
type CarouselProjectId = typeof allProjectIds[number];
const exactContributions = [
  "A cooperative browser game about protecting a community with limited resources. I shaped the product direction and used my first playtest to refine the map, controls and consequences.",
  "I redirected a score catalogue into a shared-clock comparison of Purdue’s games and a screened NCAA season, refining the question and sound direction.",
  "I framed an environmental question and worked through GIS choices to compare satellite heat exposure over historical reef habitat. The saved comparison challenged my starting hypothesis.",
  "I defined an ArcGIS atlas I could open, compare and export, then guided its maps and browser presentation.",
  "I set the audience and public story for an experimental computer-vision and geospatial project, then owned the publication decisions.",
  "I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act, and owned its release.",
];

function currentProject(page: Page, id: typeof projects[number]["id"]) {
  return page.locator(`article[data-current-project="${id}"]`);
}
function slide(page: Page, id: CarouselProjectId) {
  return page.locator(`#project-track > article[data-carousel-slide="${id}"]`);
}
function caseLink(page: Page, id: CarouselProjectId) {
  return slide(page, id).locator(`a[href="/work/${id}"]`);
}
function observeExternalRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== testOrigin) requests.push(request.url());
  });
  return requests;
}

// Geometry checks select one whole card before inspecting a media box. The no-JS
// branch uses native scroll only; actual link/keyboard journeys are tested below.
async function selectCard(page: Page, id: CarouselProjectId, nativeOnly = false) {
  const card = slide(page, id);
  await caseLink(page, id).focus();
  await expect(caseLink(page, id)).toBeFocused();
  if (nativeOnly) {
    await card.evaluate(element => {
      const track = element.parentElement!;
      const first = track.querySelector<HTMLElement>("[data-carousel-slide]")!;
      track.scrollTo({ left: (element as HTMLElement).offsetLeft - first.offsetLeft, behavior: "instant" });
    });
  }
  return expectCardSettled(page, id);
}

async function expectCardSettled(page: Page, id: CarouselProjectId) {
  const card = slide(page, id);
  await expect.poll(() => card.evaluate(element => {
    const track = element.parentElement!;
    const first = track.querySelector<HTMLElement>("[data-carousel-slide]")!;
    return Math.abs(track.scrollLeft - ((element as HTMLElement).offsetLeft - first.offsetLeft));
  })).toBeLessThan(1.5);
  await expect(card.getByRole("heading")).toBeVisible();
  await expect(card.locator("[data-contribution]")).toBeVisible();
  await expect.poll(() => card.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.left >= -.5 && box.right <= innerWidth + .5;
  })).toBe(true);
  return card;
}

// Programmatic focus after a pointer click does not establish keyboard modality.
// Use real, bounded Tab navigation for reachability and focus-visible assertions.
async function tabTo(page: Page, target: Locator) {
  for (let count = 0; count < 24; count += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate(element => element === document.activeElement)) {
      await expect(target).toBeFocused();
      await expect.poll(() => target.evaluate(element => element.matches(":focus-visible"))).toBe(true);
      return;
    }
  }
  throw new Error("Keyboard target was not reachable within 24 real Tab presses.");
}

async function keyboardSelectCard(page: Page, id: CarouselProjectId, target = caseLink(page, id)) {
  await page.locator("#project-track").focus();
  await tabTo(page, target);
  return expectCardSettled(page, id);
}

async function expectWholeImage(image: Locator, expectedPath: string) {
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(element => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  })).toBe(true);
  await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
  const dimensions = await image.evaluate(element => {
    const img = element as HTMLImageElement;
    const box = img.getBoundingClientRect();
    const source = new URL(img.currentSrc || img.src, location.href);
    const style = getComputedStyle(img);
    return {
      path: source.pathname === "/_next/image" ? source.searchParams.get("url") : source.pathname,
      declaredWidth: img.getAttribute("width"), declaredHeight: img.getAttribute("height"),
      width: box.width, height: box.height, left: box.left, right: box.right,
      objectFit: style.objectFit, filter: style.filter, clipPath: style.clipPath, viewport: innerWidth,
    };
  });
  expect(dimensions.path).toBe(expectedPath);
  expect(Number(dimensions.declaredWidth)).toBeGreaterThan(0);
  expect(Number(dimensions.declaredHeight)).toBeGreaterThan(0);
  expect(dimensions.objectFit).not.toBe("cover");
  expect(dimensions.filter).toBe("none");
  expect(dimensions.clipPath).toBe("none");
  // A border may add two CSS pixels; preserve the whole source aspect ratio.
  expect(Math.abs(dimensions.width / dimensions.height - Number(dimensions.declaredWidth) / Number(dimensions.declaredHeight))).toBeLessThan(.03);
  expect(dimensions.left).toBeGreaterThanOrEqual(-.5);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport + .5);
}

async function expectActualVisuals(page: Page, nativeOnly = false) {
  await selectCard(page, "wildfire-response", nativeOnly);
  await expectWholeImage(currentProject(page, "wildfire-response").getByRole("img"), "/media/projects/wildfire-response/planning-v027.jpg");
  await selectCard(page, "after-the-tip", nativeOnly);
  const leadFigures = currentProject(page, "after-the-tip").locator("[data-lead-figure]");
  await expect(leadFigures).toHaveCount(2);
  expect(await leadFigures.evaluateAll(figures => figures.map(figure => figure.getAttribute("data-lead-figure")))).toEqual(["purdue", "all"]);
  for (const leadFigure of await leadFigures.all()) {
    await leadFigure.scrollIntoViewIfNeeded();
    await expect(leadFigure.getByRole("img")).toBeVisible();
    await expect(leadFigure.getByRole("img")).toHaveAccessibleName(/mean positive lead contributions across regulation/);
    await expect(leadFigure.locator("svg path")).toHaveCount(2);
    const colors = await leadFigure.locator("svg path").evaluateAll(paths => paths.map(path => ({ fill: getComputedStyle(path).fill, stroke: getComputedStyle(path).stroke })));
    expect(colors).toEqual([{ fill: "rgb(117, 127, 100)", stroke: "rgb(72, 81, 63)" }, { fill: "rgb(92, 117, 122)", stroke: "rgb(49, 78, 84)" }]);
  }
  await selectCard(page, "west-hawaii-heat-exposure", nativeOnly);
  const reefImages = currentProject(page, "west-hawaii-heat-exposure").getByRole("img");
  await expect(reefImages).toHaveCount(2);
  await expectWholeImage(reefImages.nth(0), "/media/projects/west-hawaii-heat-exposure/heat-exposure-2015.svg");
  await expectWholeImage(reefImages.nth(1), "/media/projects/west-hawaii-heat-exposure/heat-exposure-2019.svg");
  await selectCard(page, "nepal-satellite-atlas", nativeOnly);
  await expectWholeImage(currentProject(page, "nepal-satellite-atlas").getByRole("img"), "/media/projects/nepal-satellite-atlas/dated-radar-atlas.png");
  const burnlens = await selectCard(page, "burnlens", nativeOnly);
  await expect(burnlens.locator("[data-atlas-transect]")).toBeVisible();
  await expect(burnlens.locator("[data-atlas-legend]")).toBeVisible();
  await expect(burnlens.locator("[data-control-rail], [data-authority-break]")).toHaveCount(0);
  const runbook = await selectCard(page, "runbook-sentinel", nativeOnly);
  await expect(runbook.locator("[data-control-rail]")).toHaveCount(2);
  for (const rail of await runbook.locator("[data-control-rail]").all()) await expect(rail).toBeVisible();
  await expect(runbook.locator("[data-authority-break]")).toBeVisible();
  await expect(runbook.locator("[data-atlas-grid], [data-atlas-transect]")).toHaveCount(0);
}

async function expectProjectDiscovery(page: Page, nativeOnly = false) {
  await expect(page.locator("main h1")).toHaveText(hero);
  const carousel = page.locator("#selected-work[data-project-carousel]");
  await expect(carousel).toBeVisible();
  await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  await expect(carousel.getByRole("heading", { level: 2 })).toHaveText("Selected projects.");
  await expect(carousel.locator("article[data-carousel-slide]")).toHaveCount(6);
  expect(await carousel.locator("article[data-carousel-slide]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-carousel-slide")))).toEqual(allProjectIds);
  await expect(carousel.locator("article[data-current-project]")).toHaveCount(4);
  expect(await carousel.locator("article[data-current-project]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-current-project")))).toEqual(projects.map(project => project.id));
  await expect(carousel.locator("p[data-contribution]")).toHaveText(exactContributions);
  for (const id of allProjectIds) {
    await selectCard(page, id, nativeOnly);
    await expect(caseLink(page, id)).toHaveCount(1);
    await expect(caseLink(page, id)).toHaveAccessibleName(/^(Explore |Read .+ case study)/);
  }
  for (const project of projects) await expect(currentProject(page, project.id).getByRole("heading", { name: project.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open project dashboard", exact: true })).toHaveAttribute("href", "/dashboard");
  await expect(carousel.getByRole("link", { name: "Browse all work", exact: true })).toHaveAttribute("href", "/work");
}

test("Contribution-first discovery preserves project qualifications, identity and the established flagships", async ({ page }) => {
  await page.goto("/");
  await expectProjectDiscovery(page);
  await expect(page.getByRole("link", { name: "Drew Baker, home", exact: true })).toHaveAttribute("aria-current", "page");
  const wildfire = currentProject(page, "wildfire-response");
  await expect(wildfire.locator("figcaption")).toContainText(/historical v0\.27 synthetic development fixture/i);
  await expect(wildfire.locator("figcaption")).toContainText(/gameplay disabled/i);
  await expect(wildfire.locator("figcaption")).toContainText(/AI-assisted terrain art/i);
  const afterTip = currentProject(page, "after-the-tip");
  for (const qualifier of [/exploratory challenge prototype/i, /not submitted/i, /mean positive lead contribution/i, /points per game/i, /regulation only/i, /descriptive means, not confidence intervals/i, /not a team-strength comparison/i]) await expect(afterTip).toContainText(qualifier);
  await expect(afterTip.locator('[data-lead-figure="purdue"] figcaption')).toContainText(/30 games · both sides/i);
  const reef = currentProject(page, "west-hawaii-heat-exposure");
  await expect(reef.locator("figcaption")).toContainText(/satellite heat exposure over historical habitat/i);
  await expect(reef.locator("figcaption")).toContainText(/not observed reef condition/i);
  const nepal = currentProject(page, "nepal-satellite-atlas");
  await expect(nepal.locator("figcaption")).toContainText(/unregistered visual experiment\s*[—-]\s*not a mapped landslide result/i);
  await expect(nepal.locator("figcaption")).toContainText(nepalCredit);
  const flagships = page.locator("[data-front-door-flagships] [data-flagship-teaser]");
  await expect(flagships).toHaveCount(2);
  expect(await flagships.evaluateAll(nodes => nodes.map(node => node.getAttribute("data-flagship-teaser")))).toEqual(["burnlens", "runbook-sentinel"]);
  await expect(slide(page, "burnlens")).toContainText("Public v0.56.0 research portfolio release");
  await expect(slide(page, "runbook-sentinel")).toContainText("Released synthetic testbed · no real systems connected");
  await expect(page.locator("[data-home-project-details]")).toHaveCount(2);
  await expect(page.locator("[data-featured-turn]")).toHaveCount(0);
  const making = page.locator("[data-portfolio-making]");
  await expect(making.getByRole("heading", { name: "How I work", exact: true })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="hero-title"]')).toContainText(/work with Codex to develop and refine the result/);
  await expect(making).toContainText(/Codex assists with research, implementation and testing/);
  await making.locator("summary").click();
  await expect(making.locator('[data-orchestration-marker="D.01"]')).toBeVisible();
  await expect(making.locator('[data-orchestration-marker="D.01"]')).toContainText(/Drew/);
  await expect(making.locator('[data-orchestration-marker="C.01"]')).toBeVisible();
  await expect(making.locator('[data-orchestration-marker="C.01"]')).toContainText(/Codex/);
  await expect(making.locator("[data-source-id]")).toHaveCount(2);
  expect(await page.evaluate(() => {
    const carousel = document.querySelector("[data-project-carousel]");
    const making = document.querySelector("[data-portfolio-making]");
    return Boolean(carousel && making && (carousel.compareDocumentPosition(making) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);
});

test("Actual homepage visuals decode uncropped and remain contained at four review widths", async ({ page }, testInfo) => {
  // Bound the complete four-width/six-card review and eight screenshots, not each assertion.
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expectProjectDiscovery(page);
    await expectActualVisuals(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) {
      await selectCard(page, "wildfire-response");
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "mobile.png" : "desktop.png"), fullPage: true, animations: "disabled" });
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "hero-mobile.png" : "hero-desktop.png"), animations: "disabled" });
      const currentWork = page.locator("#selected-work[data-project-carousel]");
      await currentWork.evaluate(element => {
        const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
        window.scrollTo(0, Math.max(0, element.getBoundingClientRect().top + scrollY - headerHeight - 16));
      });
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "carousel-mobile.png" : "carousel-desktop.png"), animations: "disabled" });
      // Capture the settled active card using a page clip: locator screenshots can
      // scroll a horizontal track and accidentally capture an intermediate card.
      const box = await slide(page, "wildfire-response").boundingBox();
      expect(box).not.toBeNull();
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "card-mobile.png" : "card-desktop.png"), clip: box!, animations: "disabled" });
    }
  }
  expect(errors).toEqual([]);
});

test("Keyboard journeys reach all six cases and native flagship details without trapping focus", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Previous project", exact: true })).toBeVisible();
  const workAnchor = page.locator('nav[aria-label="Primary actions"] a[href="#selected-work"]');
  await tabTo(page, workAnchor);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/#selected-work$/);
  const track = page.locator("#project-track");
  await tabTo(page, track);
  await page.keyboard.press("Home");
  await expect(page.getByRole("button", { name: "Previous project", exact: true })).toBeDisabled();
  for (const [index, id] of allProjectIds.entries()) {
    if (index > 0) await page.keyboard.press("ArrowRight");
    await expect.poll(() => slide(page, id).evaluate(element => {
      const track = element.parentElement!;
      const first = track.querySelector<HTMLElement>("[data-carousel-slide]")!;
      return Math.abs(track.scrollLeft - ((element as HTMLElement).offsetLeft - first.offsetLeft));
    })).toBeLessThan(1.5);
  }
  await expect(page.getByRole("button", { name: "Next project", exact: true })).toBeDisabled();
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: "Next project", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Previous project", exact: true }).click();
  await expect.poll(() => slide(page, "burnlens").evaluate(element => {
    const track = element.parentElement!;
    const first = track.querySelector<HTMLElement>("[data-carousel-slide]")!;
    return Math.abs(track.scrollLeft - ((element as HTMLElement).offsetLeft - first.offsetLeft));
  })).toBeLessThan(1.5);
  for (const id of allProjectIds) {
    await keyboardSelectCard(page, id);
    const link = caseLink(page, id);
    expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/work/${id}$`));
    await expect(page.locator("main h1")).not.toHaveText(hero);
    await page.getByRole("link", { name: "Drew Baker, home", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${testOrigin}/`);
  }
  for (const id of ["burnlens", "runbook-sentinel"] as const) {
    const details = slide(page, id).locator("[data-home-project-details]");
    const summary = details.locator("summary");
    await keyboardSelectCard(page, id, summary);
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator("dt")).toHaveText(["My role", "Result", "Limit"]);
    await expect(details.locator("dd")).toHaveCount(3);
    expect(await summary.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.screenshot({ path: testInfo.outputPath(`${id}-details-open-mobile.png`), fullPage: true, animations: "disabled" });
    await page.keyboard.press("Enter");
    await expect(details).not.toHaveAttribute("open", "");
  }
  await tabTo(page, page.getByRole("link", { name: "Open project dashboard", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("main h1")).toHaveText("Project dashboard.");
  await page.getByRole("link", { name: "Drew Baker, home", exact: true }).click();
  const mobileMenu = page.locator(".mobile-menu");
  await tabTo(page, mobileMenu.locator("summary"));
  await page.keyboard.press("Enter");
  await expect(mobileMenu).toHaveAttribute("open", "");
  await tabTo(page, mobileMenu.getByRole("link", { name: "Work", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work$/);
  await expect(mobileMenu).not.toHaveAttribute("open", "");
});

test("Core project discovery, media and native details remain usable without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const external = observeExternalRequests(page);
    await page.goto(`${testOrigin}/`);
    await expect(page.getByRole("button", { name: "Next project", exact: true })).toBeHidden();
    await expectProjectDiscovery(page, true);
    await expectActualVisuals(page, true);
    for (const id of allProjectIds) {
      await selectCard(page, id, true);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`/work/${id}$`));
      await expect(page.locator("main h1")).not.toHaveText(hero);
      await page.getByRole("link", { name: "Drew Baker, home", exact: true }).click();
      await expect(page).toHaveURL(`${testOrigin}/`);
    }
    for (const id of ["burnlens", "runbook-sentinel"] as const) {
      await selectCard(page, id, true);
      const details = slide(page, id).locator("[data-home-project-details]");
      await details.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("open", "");
      await expect(details.locator("dt")).toHaveText(["My role", "Result", "Limit"]);
      await expect(details.locator("dd")).toHaveCount(3);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await selectCard(page, "wildfire-response", true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath("no-js-mobile.png"), fullPage: true });
    await page.getByRole("link", { name: "Open project dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator("main h1")).toHaveText("Project dashboard.");
    await expect(page.locator("[data-dashboard-project]")).toHaveCount(5);
    await page.getByRole("link", { name: "Drew Baker, home", exact: true }).click();
    const menu = page.locator(".mobile-menu");
    await menu.locator("summary").click();
    await expect(menu).toHaveAttribute("open", "");
    await menu.getByRole("link", { name: "Résumé", exact: true }).click();
    await expect(page).toHaveURL(/\/resume$/);
    expect(external).toEqual([]);
  } finally { await context.close(); }
});

test("Reduced-motion reading uses local resources, accurate metadata and no autoplay media", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const external = observeExternalRequests(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expectActualVisuals(page);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
  }))).toBe(true);
  const track = page.locator("#project-track");
  const before = await track.evaluate(element => element.scrollLeft);
  await page.waitForTimeout(900);
  expect(await track.evaluate(element => element.scrollLeft)).toBe(before);
  await expect(page.locator("main audio, main video, main canvas, main iframe")).toHaveCount(0);
  await expect(page).toHaveTitle(/Drew Baker/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", siteOrigin);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", expectedIndexable ? /^index, follow$/ : /^noindex, nofollow$/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Drew Baker Portfolio");
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute("content", /software/i);
    await expect(page.locator(selector)).not.toHaveAttribute("content", /inspectable software systems|evidence-bound systems/i);
  }
  const person = await page.locator('main script[type="application/ld+json"]').textContent();
  expect(JSON.parse(person ?? "{}")).toMatchObject({ "@type": "Person", alternateName: "Drew Baker", url: siteOrigin });
  expect(JSON.parse(person ?? "{}")).toHaveProperty("sameAs", ["https://github.com/drwbkr1", "https://www.linkedin.com/in/william-baker-843946162/"]);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("Closed and open homepage journeys have no automated WCAG A or AA violations", async ({ page }, testInfo) => {
  // Eighteen full-page Axe scans retain both widths, all cards and native open states.
  test.setTimeout(90_000);
  const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expectActualVisuals(page);
    for (const id of allProjectIds) {
      await selectCard(page, id);
      const closed = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(closed.violations, `Closed ${id} card at ${width}px`).toEqual([]);
      if (id === "burnlens" || id === "runbook-sentinel") {
        const details = slide(page, id).locator("[data-home-project-details]");
        await details.locator("summary").click();
        await expect(details).toHaveAttribute("open", "");
        const open = await new AxeBuilder({ page }).withTags(tags).analyze();
        expect(open.violations, `Open ${id} details at ${width}px`).toEqual([]);
        await details.locator("summary").click();
      }
    }
    await page.locator("[data-portfolio-making] summary").click();
    if (width === 390) await page.locator(".mobile-menu summary").click();
    const open = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(open.violations, `Open collaboration/menu at ${width}px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(width === 390 ? "accessible-open-mobile.png" : "accessible-open-desktop.png"), fullPage: true, animations: "disabled" });
  }
});
