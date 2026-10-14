import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const casePath = "/work/west-hawaii-heat-exposure";
const caseLink = "Read West Hawaiʻi heat-exposure case study";
const detailsLabel = "Read the values and what the map can tell us";
const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;

// These are the saved display values, not assertions of field or scientific validity.
const savedRows = [
  ["2015 · 8 or above", "43", "4,731.23", "82.97%", "100.00%"],
  ["2015 · No valid DHW", "8", "971.05", "17.03%", "Not assessed"],
  ["2019 · Below 4", "5", "471.82", "8.27%", "9.97%"],
  ["2019 · 4 to below 8", "4", "647.26", "11.35%", "13.68%"],
  ["2019 · 8 or above", "34", "3,612.16", "63.35%", "76.35%"],
  ["2019 · No valid DHW", "8", "971.05", "17.03%", "Not assessed"],
];

async function expectDecoded(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(element => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  })).toBe(true);
  await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
}

async function expectSavedTable(page: Page) {
  const table = page.getByRole("table", { name: "Saved habitat-area comparison — annual maximum DHW (°C-weeks)" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText(["Year / class", "Cells", "Area (ha)", "All habitat", "Assessed only"]);
  await expect(table.locator("tbody tr")).toHaveCount(6);
  for (const [index, values] of savedRows.entries()) {
    await expect(table.locator("tbody tr").nth(index).locator("th, td")).toHaveText(values);
  }
  await expect(page.getByText(/All mapped habitat: 5,702\.29 ha\. Assessed habitat: 4,731\.23 ha\./)).toBeVisible();
  await expect(page.getByText(/The assessed percentage excludes the unavailable area; the all-habitat percentage retains it\./)).toBeVisible();
}

function observeExternalRequests(page: Page) {
  const external: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== testOrigin) external.push(request.url());
  });
  return external;
}

test("Year-specific reef maps decode and the case stays contained at four viewport sizes", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(casePath);
    await expect(page.locator("main h1")).toContainText("Heat exposure");
    await expect(page.locator("main h1")).toContainText("Hawaiʻi reefs.");
    await expect(page.getByText("Research framing and guided GIS analysis", { exact: true })).toBeVisible();
    await expect(page.locator("main img")).toHaveCount(2);
    for (const year of [2015, 2019]) {
      const figure = page.locator(`main figure[data-reef-map="${year}"]`);
      await expect(figure).toHaveCount(1);
      await expect(figure.getByRole("heading", { name: String(year), exact: true })).toBeVisible();
      const image = figure.getByRole("img");
      await expect(image).toHaveAttribute("src", new RegExp(`/heat-exposure-${year}\\.svg$`));
      await expect(image).toHaveAttribute("alt", new RegExp(String(year)));
      await expectDecoded(image);
      await expect(figure.locator("figcaption")).toContainText("Coarse satellite cells are not individual reef measurements.");
    }
    await expect(page.locator('figure[data-reef-map="2015"] img')).toHaveAttribute("alt", /all 43 assessed habitat cells/);
    await expect(page.locator('figure[data-reef-map="2019"] img')).toHaveAttribute("alt", /34 habitat cells at 8 or above, four at 4 to below 8, five below 4/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "mobile.png" : "desktop.png"), fullPage: true, animations: "disabled" });
    }
  }
  expect(pageErrors).toEqual([]);
});

test("Habitat shares preserve the common denominator and visible missing-data category", async ({ page }) => {
  await page.goto(casePath);
  const comparison = page.locator("figure[data-habitat-comparison]");
  await expect(comparison.locator("figcaption")).toContainText("same 5,702.29 ha denominator in each year");
  const shares2015 = comparison.getByRole("list", { name: "2015 mapped habitat shares" });
  const shares2019 = comparison.getByRole("list", { name: "2019 mapped habitat shares" });
  await expect(shares2015.getByRole("listitem")).toHaveText(["8 or above83.0%", "No valid DHW17.0%"]);
  await expect(shares2019.getByRole("listitem")).toHaveText(["Below 48.3%", "4 to below 811.4%", "8 or above63.3%", "No valid DHW17.0%"]);
  await expect(comparison.getByText(/17\.0% has no valid DHW in either year/)).toBeVisible();
  await expect(comparison.getByText(/it is not treated as low exposure/)).toBeVisible();
  const missingMarks = comparison.locator('[data-exposure-class="unknown"]');
  await expect(missingMarks).toHaveCount(2);
  for (const mark of await missingMarks.all()) {
    expect(await mark.evaluate(element => getComputedStyle(element).backgroundImage)).not.toBe("none");
    await expect(mark.locator("..")).toHaveAttribute("aria-hidden", "true");
    const percentage = await mark.evaluate(element => element.getBoundingClientRect().width / element.parentElement!.getBoundingClientRect().width * 100);
    expect(percentage).toBeCloseTo(17.0, 0);
  }
  await expect(page.getByText("83.0% of all mapped habitat in 2015", { exact: true })).toBeVisible();
  await expect(page.getByText("63.3% in 2019", { exact: true })).toBeVisible();
});

test("The native explanation opens by keyboard and distinguishes all from assessed habitat", async ({ page }, testInfo) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(casePath);
    const summary = page.locator("main summary").filter({ hasText: detailsLabel });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    expect(await summary.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await expectSavedTable(page);
    await expect(page.getByText(/They describe satellite heat exposure, not observed coral bleaching, mortality or recovery\./)).toBeVisible();
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

test("Selected work shows both real maps and leads to the reef study", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work");
  const link = page.getByRole("link", { name: caseLink });
  const entry = page.getByRole("article").filter({ has: link });
  await expect(entry.getByRole("heading", { name: "Heat exposure across West Hawaiʻi reefs" })).toBeVisible();
  await expect(entry.getByRole("img")).toHaveCount(2);
  for (const year of [2015, 2019]) {
    const image = entry.locator(`img[src$="/heat-exposure-${year}.svg"]`);
    await expect(image).toHaveAttribute("alt", new RegExp(String(year)));
    await expectDecoded(image);
  }
  await expect(entry.locator("figcaption")).toContainText("These are heat-exposure maps, not coral-damage observations.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await link.click();
  await expect(page).toHaveURL(/\/work\/west-hawaii-heat-exposure$/);
  await page.getByRole("link", { name: "Back to selected work" }).click();
  await expect(page).toHaveURL(/\/work$/);
});

test("Closed and open explanations have no automated WCAG A or AA violations with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(casePath);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  for (const image of await page.locator("main img").all()) await expectDecoded(image);
  const summary = page.locator("main summary").filter({ hasText: detailsLabel });
  const axeTags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
  const closed = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(closed.violations).toEqual([]);
  await summary.click();
  await expectSavedTable(page);
  const open = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(open.violations).toEqual([]);
});

test("The comparison, work-index navigation and values remain usable without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const external = observeExternalRequests(page);
    await page.goto(`${testOrigin}/work`);
    const link = page.getByRole("link", { name: caseLink });
    const entry = page.getByRole("article").filter({ has: link });
    await expect(entry.getByRole("img")).toHaveCount(2);
    for (const image of await entry.getByRole("img").all()) await expectDecoded(image);
    await link.click();
    await expect(page.locator("main h1")).toContainText("Hawaiʻi reefs.");
    await expect(page.locator("main figure[data-reef-map]")).toHaveCount(2);
    for (const image of await page.locator("main img").all()) await expectDecoded(image);
    const summary = page.locator("main summary").filter({ hasText: detailsLabel });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    await expectSavedTable(page);
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

test("Core routes fetch local resources while official source links remain unvisited", async ({ page }) => {
  const external = observeExternalRequests(page);
  await page.goto("/work");
  await page.getByRole("link", { name: caseLink }).click();
  await expect(page).toHaveURL(/\/work\/west-hawaii-heat-exposure$/);
  await expect(page.locator("main img")).toHaveCount(2);
  for (const image of await page.locator("main img").all()) await expectDecoded(image);
  await page.locator("main summary").filter({ hasText: detailsLabel }).click();
  await expectSavedTable(page);
  await expect(page.getByRole("link", { name: "NOAA Coral Reef Watch — 5 km methodology" })).toHaveAttribute("href", "https://coralreefwatch.noaa.gov/product/5km/methodology.php");
  await expect(page.getByRole("link", { name: "NOAA/NCCOS and Analytical Laboratories of Hawaii — historical habitat mapping" })).toHaveAttribute("href", "https://products.coastalscience.noaa.gov/collections/benthic/e97hawaii/data2007.aspx");
  expect(external).toEqual([]);
});
