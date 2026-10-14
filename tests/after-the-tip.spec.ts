import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";

const casePath = "/work/after-the-tip";
const audioLabel = "After the Tip lead-voice excerpt";

async function loadMetadata(audio: Locator) {
  await audio.evaluate(element => {
    const player = element as HTMLAudioElement;
    player.preload = "metadata";
    player.load();
  });
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).readyState)).toBeGreaterThanOrEqual(1);
}

async function seekPaused(audio: Locator, seconds: number) {
  await audio.evaluate((element, position) => {
    const player = element as HTMLAudioElement;
    player.pause();
    player.currentTime = position;
  }, seconds);
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBeCloseTo(seconds, 1);
}

test("After the Tip shows the contribution and two legible figures across viewport sizes", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(casePath);
    await expect(page.locator("main h1")).toContainText("After the Tip");
    await expect(page.getByText("Product and sound direction", { exact: true })).toBeVisible();
    for (const cohort of ["all", "purdue"]) {
      const figure = page.locator(`main figure[data-lead-figure="${cohort}"]`);
      await expect(figure).toHaveCount(1);
      await expect(figure.locator('svg[role="img"]')).toHaveCount(1);
      await expect(figure.locator('svg[role="img"]')).toBeVisible();
      await expect(figure.locator("figcaption")).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(width === 390 ? "mobile.png" : "desktop.png"), fullPage: true, animations: "disabled" });
    }
  }
  expect(pageErrors).toEqual([]);
});

test("Selected work links to the case and ribbon explanation operates by keyboard", async ({ page }) => {
  await page.goto("/work");
  await page.getByRole("link", { name: "Read After the Tip case study" }).click();
  await expect(page).toHaveURL(/\/work\/after-the-tip$/);
  const summary = page.locator("main summary").filter({ hasText: "Understanding the two ribbons" });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveAttribute("open", "");
  expect(await summary.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).not.toHaveAttribute("open", "");
});

test("Shared-clock listening is optional, native, and does not autoplay", async ({ page }) => {
  await page.goto(casePath);
  const listening = page.getByRole("region", { name: "Listen on one shared clock" });
  const audio = listening.locator(`audio[aria-label="${audioLabel}"]`);
  await expect(audio).toHaveCount(1);
  await expect(audio).toBeVisible();
  await expect(audio).toHaveAttribute("controls", "");
  await expect(audio).toHaveAttribute("preload", "none");
  await expect(audio).not.toHaveAttribute("autoplay", "");
  expect(await audio.evaluate(element => (element as HTMLAudioElement).autoplay)).toBe(false);
  expect(await audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(true);
  expect(await audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBe(0);
  await expect(listening.getByRole("button", { name: "Full season", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(listening.getByRole("button", { name: "Full season", exact: true })).toBeVisible();
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toBeVisible();
});

test("A paused cohort switch preserves the elapsed position on the common clock", async ({ page }) => {
  await page.goto(casePath);
  const listening = page.getByRole("region", { name: "Listen on one shared clock" });
  const audio = listening.locator(`audio[aria-label="${audioLabel}"]`);
  await loadMetadata(audio);
  expect(await audio.evaluate(element => (element as HTMLAudioElement).duration)).toBeCloseTo(60, 1);
  await seekPaused(audio, 13.5);
  await listening.getByRole("button", { name: "Purdue games", exact: true }).click();
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).readyState)).toBeGreaterThanOrEqual(1);
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBeCloseTo(13.5, 1);
  await expect(listening.locator('output[aria-label="Regulation elapsed"]')).toHaveText("09:00");
  expect(await audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(true);
  expect(await audio.evaluate(element => (element as HTMLAudioElement).duration)).toBeCloseTo(60, 1);
});

test("Playback and rapid cohort switches keep the selected excerpt on the shared clock", async ({ page }) => {
  await page.goto(casePath);
  const listening = page.getByRole("region", { name: "Listen on one shared clock" });
  const audio = listening.locator(`audio[aria-label="${audioLabel}"]`);
  await loadMetadata(audio);
  await seekPaused(audio, 13.5);
  await audio.evaluate(async element => { await (element as HTMLAudioElement).play(); });
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(false);
  await listening.getByRole("button", { name: "Purdue games", exact: true }).click();
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(false);
  const afterFirstSwitch = await audio.evaluate(element => (element as HTMLAudioElement).currentTime);
  expect(afterFirstSwitch).toBeGreaterThanOrEqual(13.4);
  expect(afterFirstSwitch).toBeLessThan(16);
  await listening.getByRole("button", { name: "Full season", exact: true }).click();
  await listening.getByRole("button", { name: "Purdue games", exact: true }).click();
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(listening.getByRole("button", { name: "Full season", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(false);
  const afterRapidSwitch = await audio.evaluate(element => (element as HTMLAudioElement).currentTime);
  expect(afterRapidSwitch).toBeGreaterThanOrEqual(afterFirstSwitch - 0.1);
  expect(afterRapidSwitch).toBeLessThan(afterFirstSwitch + 3);
  await audio.evaluate(element => (element as HTMLAudioElement).pause());
});

test("A persistent selected-track failure retains paused position and the selected cohort for retry", async ({ page }) => {
  await page.goto(casePath);
  const listening = page.getByRole("region", { name: "Listen on one shared clock" });
  const audio = listening.locator(`audio[aria-label="${audioLabel}"]`);
  await loadMetadata(audio);
  await seekPaused(audio, 13.5);
  let aborted = false;
  const wavRequest = (url: URL) => url.pathname.endsWith("/lead-voices-purdue-40x.wav");
  await page.route(wavRequest, async route => {
    aborted = true;
    await route.abort("failed");
  });
  await listening.getByRole("button", { name: "Purdue games", exact: true }).click();
  await expect(listening.getByRole("button", { name: "Retry audio", exact: true })).toBeVisible();
  expect(aborted).toBe(true);
  await page.unroute(wavRequest);
  await listening.getByRole("button", { name: "Retry audio", exact: true }).click();
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).readyState)).toBeGreaterThanOrEqual(1);
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(listening.getByRole("button", { name: "Retry audio", exact: true })).not.toBeVisible();
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBeCloseTo(13.5, 1);
  await expect(listening.locator('output[aria-label="Regulation elapsed"]')).toHaveText("09:00");
  expect(await audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(true);
});

test("A persistent selected-track failure retains the active playback intent for retry", async ({ page }) => {
  await page.goto(casePath);
  const listening = page.getByRole("region", { name: "Listen on one shared clock" });
  const audio = listening.locator(`audio[aria-label="${audioLabel}"]`);
  await loadMetadata(audio);
  await seekPaused(audio, 13.5);
  await audio.evaluate(async element => { await (element as HTMLAudioElement).play(); });
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(false);
  let aborted = false;
  const wavRequest = (url: URL) => url.pathname.endsWith("/lead-voices-purdue-40x.wav");
  await page.route(wavRequest, async route => {
    aborted = true;
    await route.abort("failed");
  });
  await listening.getByRole("button", { name: "Purdue games", exact: true }).click();
  await expect(listening.getByRole("button", { name: "Retry audio", exact: true })).toBeVisible();
  expect(aborted).toBe(true);
  expect(await audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(true);
  await page.unroute(wavRequest);
  await listening.getByRole("button", { name: "Retry audio", exact: true }).click();
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).paused)).toBe(false);
  await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(listening.getByRole("button", { name: "Retry audio", exact: true })).not.toBeVisible();
  const recoveredPosition = await audio.evaluate(element => (element as HTMLAudioElement).currentTime);
  expect(recoveredPosition).toBeGreaterThanOrEqual(13.4);
  expect(recoveredPosition).toBeLessThan(16);
  await audio.evaluate(element => (element as HTMLAudioElement).pause());
});

test("After the Tip has no automated WCAG A or AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(casePath);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("The core comparison and native audio fallback remain usable without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}/work`);
    await page.getByRole("link", { name: "Read After the Tip case study" }).click();
    await expect(page.locator("main h1")).toContainText("After the Tip");
    await expect(page.locator('main figure[data-lead-figure] svg[role="img"]')).toHaveCount(2);
    const summary = page.locator("main summary").filter({ hasText: "Understanding the two ribbons" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    const listening = page.getByRole("region", { name: "Listen on one shared clock" });
    await expect(listening.getByRole("button", { name: "Full season", exact: true })).not.toBeVisible();
    await expect(listening.getByRole("button", { name: "Purdue games", exact: true })).not.toBeVisible();
    await expect(listening.locator(`audio[aria-label="${audioLabel}"]`)).not.toBeVisible();
    const fallbacks = page.locator("main noscript audio");
    await expect(fallbacks).toHaveCount(2);
    for (const audio of await fallbacks.all()) {
      await expect(audio).toBeVisible();
      await expect(audio).toHaveAttribute("controls", "");
      await expect(audio).toHaveAttribute("preload", "none");
      expect(await audio.getAttribute("aria-label")).toBeTruthy();
      expect(await audio.evaluate(element => (element as HTMLAudioElement).autoplay)).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("no-js-mobile.png"), fullPage: true });
  } finally {
    await context.close();
  }
});
