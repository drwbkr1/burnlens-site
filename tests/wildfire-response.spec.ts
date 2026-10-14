import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Wildfire case study renders its contribution and actual media across sizes", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", error => consoleErrors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work/wildfire-response");
    await expect(page.locator("main h1")).toContainText("Wildfire Response");
    await expect(page.getByText("Product direction and playtest feedback", { exact: true })).toBeVisible();
    await expect(page.locator("main figure")).toHaveCount(2);
    await expect.poll(() => page.locator("main img").evaluateAll(images =>
      images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
    )).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "mobile.png" : "desktop.png"), fullPage: true, animations: "disabled" });
    }
  }
  expect(consoleErrors).toEqual([]);
});

test("Tradeoffs work by keyboard and the case is discoverable from selected work", async ({ page }) => {
  await page.goto("/work");
  await page.getByRole("link", { name: "Read Wildfire Response case study" }).click();
  await expect(page).toHaveURL(/\/work\/wildfire-response$/);
  const summary = page.locator("main summary").filter({ hasText: "Build a line" });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveAttribute("open", "");
  await expect(page.getByText(/A hot source in gusts can send embers/)).toBeVisible();
  expect(await summary.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).not.toHaveAttribute("open", "");
});

test("Case study has no automated WCAG A or AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/wildfire-response");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("Core case-study journey works without JavaScript and with reduced motion", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:" + (process.env.PORTFOLIO_TEST_PORT ?? "3101") + "/work");
    await page.getByRole("link", { name: "Read Wildfire Response case study" }).click();
    await expect(page.locator("main h1")).toContainText("Wildfire Response");
    const summary = page.locator("main summary").filter({ hasText: "Protect a place" });
    await summary.click();
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    await expect(page.getByText(/Protection buys a home or water pump time/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("no-js-mobile.png"), fullPage: true });
  } finally {
    await context.close();
  }
});
