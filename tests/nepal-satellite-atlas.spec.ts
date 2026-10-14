import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const casePath = "/work/nepal-satellite-atlas";
const caseLink = "Read Nepal Satellite Atlas case study";
const imagePath = "/media/projects/nepal-satellite-atlas/dated-radar-atlas.png";
const detailsLabel = "Read the map methods and limits";
const credit = "ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.";
const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;
const sourceSnapshot = "https://github.com/drwbkr1/nepal-2026-before-after-map/blob/89aa2ca1eb11c47b2b4f9b435bf8c35868123e2d";
const originalImageBytes = 820469;
const originalImageSha256 = "5787827db942b773baf25e4d38a1de670e31880165eb4ad3583ab5d262e029e3";
const optimizedImageSizes = "(max-width: 600px) calc(100vw - 2rem - 2px), min(calc(100vw - 3rem - 2px), calc(88rem - 2px))";
const optimizedImageWidths = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const optimizedImageUrl = (width: number) => `/_next/image?url=${encodeURIComponent(imagePath)}&w=${width}&q=75`;

function expectExactOptimizerUrl(value: string) {
  const url = new URL(value, testOrigin);
  expect(url.origin).toBe(testOrigin);
  expect(url.username).toBe("");
  expect(url.password).toBe("");
  expect(url.hash).toBe("");
  expect(url.pathname).toBe("/_next/image");
  expect([...url.searchParams.keys()].sort()).toEqual(["q", "url", "w"]);
  expect(url.searchParams.get("url")).toBe(imagePath);
  expect(url.searchParams.get("q")).toBe("75");
  const width = Number(url.searchParams.get("w"));
  expect(optimizedImageWidths).toContain(width);
  expect(url.searchParams.get("w")).toBe(String(width));
  return width;
}

// These checks preserve a dated display and its stated limits, not scientific validity.
async function expectDecodedWholeMap(image: Locator, delivery: "original" | "optimized") {
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(element => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  })).toBe(true);
  await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
  const decoded = await image.evaluate(element => {
    const img = element as HTMLImageElement;
    return { width: img.naturalWidth, height: img.naturalHeight, currentSrc: img.currentSrc };
  });
  if (delivery === "original") {
    expect(decoded.width).toBe(1560);
    expect(decoded.height).toBe(1020);
    await expect(image).toHaveAttribute("src", imagePath);
    expect(decoded.currentSrc).toBe(`${testOrigin}${imagePath}`);
  } else {
    // Responsive natural dimensions may be density-corrected. The immutable
    // original retains exact1560x1020; this delivery preserves its full frame.
    expect(Math.abs(decoded.height - decoded.width * 1020 / 1560)).toBeLessThanOrEqual(1);
    await expect(image).toHaveAttribute("sizes", optimizedImageSizes);
    await expect(image).toHaveAttribute("srcset", optimizedImageWidths.map(width => `${optimizedImageUrl(width)} ${width}w`).join(", "));
    await expect(image).toHaveAttribute("src", optimizedImageUrl(3840));
    expectExactOptimizerUrl(decoded.currentSrc);
    expectExactOptimizerUrl((await image.getAttribute("src"))!);
  }
  await expect(image).toHaveAttribute("width", "1560");
  await expect(image).toHaveAttribute("height", "1020");
  const dimensions = await image.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    return { width: bounds.width, height: bounds.height, objectFit: css.objectFit, left: bounds.left, right: bounds.right };
  });
  // Borders can contribute up to two CSS pixels; the image must not be cropped to a tile.
  expect(Math.abs(dimensions.width / dimensions.height - 1560 / 1020)).toBeLessThan(0.015);
  expect(dimensions.objectFit).not.toBe("cover");
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(await image.page().evaluate(() => innerWidth));
}

async function expectCoverageTable(page: Page) {
  const table = page.getByRole("table", { name: "Common-valid VV/VH coverage of the full search/review areas" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText(["Area", "Common-valid fraction"]);
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.locator("tbody tr").nth(0).locator("th, td")).toHaveText(["Source-area AOI", "54.6721%"]);
  await expect(table.locator("tbody tr").nth(1).locator("th, td")).toHaveText(["Upper-corridor AOI", "75.7928%"]);
  await expect(page.getByText(/These fractions describe common-valid VV\/VH coverage; the image displays VV alone\./)).toBeVisible();
  await expect(page.getByText(/Both original full-area screening dispositions remain deferred\./)).toBeVisible();
  await expect(page.getByText(/Coverage is not a measure of alignment or change\./)).toBeVisible();
}

function observeExternalRequests(page: Page) {
  const external: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== testOrigin) external.push(request.url());
  });
  return external;
}

test("The complete dated radar map decodes and stays contained at four viewport sizes", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(casePath);
    await expect(page.locator("main h1")).toContainText("Nepal");
    await expect(page.locator("main h1")).toContainText("Satellite Atlas.");
    await expect(page.getByText("Research and product direction", { exact: true })).toBeVisible();
    await expect(page.getByText("Codex-assisted GIS and software", { exact: true })).toBeVisible();
    await expect(page.getByText(/I set the research direction and the ArcGIS outcome, then guided successive presentation decisions\./)).toBeVisible();
    await expect(page.getByText("Unverified GIS experiment", { exact: true })).toBeVisible();
    await expect(page.getByText(/16 August and 28 August 2026\./)).toBeVisible();
    await expect(page.getByText(credit, { exact: true })).toBeVisible();
    await expect(page.locator("main img")).toHaveCount(1);
    const figure = page.locator("main figure[data-nepal-map]");
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("alt", /16 August 2026 on the left and 28 August on the right/);
    await expect(image).toHaveAttribute("alt", /Dates, legend, north arrows and kilometre scales remain visible/);
    await expectDecodedWholeMap(image, "optimized");
    await expect(figure.locator("figcaption")).toContainText("unregistered visual comparison—not a mapped landslide result");
    await expect(figure.locator("figcaption")).toContainText("Blank regions are exclusions, not proof of no change.");
    const fullSize = figure.getByRole("link", { name: /Open full-size map/ });
    await expect(fullSize).toBeVisible();
    await expect(fullSize).toHaveAttribute("href", imagePath);
    await expect(fullSize).toHaveAttribute("target", "_blank");
    await expect(fullSize).toHaveAttribute("rel", "noreferrer");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "mobile.png" : "desktop.png"), fullPage: true, animations: "disabled" });
    }
  }
  expect(pageErrors).toEqual([]);
});

test("The full-size map opens the same local PNG without contacting source sites", async ({ page }) => {
  const external = observeExternalRequests(page);
  await page.goto(casePath);
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Open full-size map/ }).click(),
  ]);
  try {
    await popup.waitForLoadState("load");
    await expect(popup).toHaveURL(`${testOrigin}${imagePath}`);
    const originalResponse = await page.request.get(imagePath);
    expect(originalResponse.status()).toBe(200);
    const originalBytes = await originalResponse.body();
    expect(originalBytes.byteLength).toBe(originalImageBytes);
    expect(createHash("sha256").update(originalBytes).digest("hex")).toBe(originalImageSha256);
    await expect.poll(() => popup.locator("img").evaluate(element => {
      const img = element as HTMLImageElement;
      return img.complete && img.naturalWidth === 1560 && img.naturalHeight === 1020;
    })).toBe(true);
    expect(external).toEqual([]);
  } finally {
    await popup.close();
  }
});

test("Native keyboard details preserve exact coverage and distinguish display from change", async ({ page }, testInfo) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(casePath);
    const summary = page.locator("main summary").filter({ hasText: detailsLabel });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    expect(await summary.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await expectCoverageTable(page);
    await expect(page.getByText(/Registration is unverified\. A brighter or darker patch does not by itself establish terrain movement, landslide damage or event attribution\./)).toBeVisible();
    await expect(page.getByText(/No new processing or image arithmetic was performed for this portfolio page\./)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath("details-open-mobile.png"), fullPage: true, animations: "disabled" });
    }
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).not.toHaveAttribute("open", "");
    await expect(page.getByRole("table")).not.toBeVisible();
  }
});

test("Selected work foregrounds the Nepal project and leads to the actual map", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work");
  const link = page.getByRole("link", { name: caseLink });
  const entry = page.getByRole("article").filter({ has: link });
  await expect(entry.getByRole("heading", { name: "Nepal Satellite Atlas", exact: true })).toBeVisible();
  await expect(entry.getByText(/My contribution: research and product direction, with Codex-assisted GIS and software implementation\./)).toBeVisible();
  await expect(entry.getByRole("img")).toHaveCount(1);
  const image = entry.getByRole("img");
  await expect(image).toHaveAttribute("alt", /16 and 28 August 2026/);
  await expectDecodedWholeMap(image, "original");
  await expect(entry.locator("figcaption")).toContainText("unregistered visual experiment, not a mapped landslide result");
  await expect(entry.locator("figcaption")).toContainText(credit);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await link.click();
  await expect(page).toHaveURL(/\/work\/nepal-satellite-atlas$/);
  await expectDecodedWholeMap(page.locator("main figure[data-nepal-map] img"), "optimized");
  await page.getByRole("link", { name: "Back to selected work" }).click();
  await expect(page).toHaveURL(/\/work$/);
});

test("Closed and open methods have no automated WCAG A or AA violations with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(casePath);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expectDecodedWholeMap(page.locator("main figure[data-nepal-map] img"), "optimized");
  const axeTags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
  const closed = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(closed.violations).toEqual([]);
  await page.locator("main summary").filter({ hasText: detailsLabel }).click();
  await expectCoverageTable(page);
  const open = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(open.violations).toEqual([]);
});

test("The map, contribution story, coverage and navigation remain usable without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const external = observeExternalRequests(page);
    await page.goto(`${testOrigin}/work`);
    const link = page.getByRole("link", { name: caseLink });
    const entry = page.getByRole("article").filter({ has: link });
    await expectDecodedWholeMap(entry.getByRole("img"), "original");
    await link.click();
    await expect(page.locator("main h1")).toContainText("Satellite Atlas.");
    await expect(page.getByText("Research and product direction", { exact: true })).toBeVisible();
    await expect(page.getByText("Unverified GIS experiment", { exact: true })).toBeVisible();
    await expect(page.getByText(credit, { exact: true })).toBeVisible();
    await expectDecodedWholeMap(page.locator("main figure[data-nepal-map] img"), "optimized");
    await expect(page.getByRole("link", { name: /Open full-size map/ })).toHaveAttribute("href", imagePath);
    const summary = page.locator("main summary").filter({ hasText: detailsLabel });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    await expectCoverageTable(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath("no-js-mobile.png"), fullPage: true });
    await page.getByRole("link", { name: "Back to selected work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    expect(external).toEqual([]);
  } finally {
    await context.close();
  }
});

test("Core routes use local resources while credited source links remain unvisited", async ({ page }) => {
  const external = observeExternalRequests(page);
  await page.goto("/work");
  await page.getByRole("link", { name: caseLink }).click();
  await expectDecodedWholeMap(page.locator("main figure[data-nepal-map] img"), "optimized");
  await page.locator("main summary").filter({ hasText: detailsLabel }).click();
  await expectCoverageTable(page);
  await expect(page.getByRole("link", { name: /GIS demonstration — imagery, methods and credits/ })).toHaveAttribute("href", `${sourceSnapshot}/docs/GIS_DEMONSTRATION.md`);
  await expect(page.getByRole("link", { name: /Browser comparison — controls and display boundary/ })).toHaveAttribute("href", `${sourceSnapshot}/docs/GIS_SWIPE_VIEWER.md`);
  await expect(page.getByRole("link", { name: /HyP3 processing environment DOI/ })).toHaveAttribute("href", "https://doi.org/10.5281/zenodo.3962581");
  await expect(page.getByRole("link", { name: /HyP3 GAMMA plugin DOI/ })).toHaveAttribute("href", "https://doi.org/10.5281/zenodo.3962936");
  expect(external).toEqual([]);
});
