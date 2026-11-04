import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const wildfireGameUrl = "https://wildfire-response-vertical-slice.drew-baker-15.chatgpt.site";

async function observeGameRequests(page: Page) {
  const gameRequests: string[] = [];
  // Context observation includes the initial request of a target=_blank popup.
  // Record attempted access as failure and abort it, never fake a game response.
  page.context().on("request", request => {
    if (new URL(request.url()).origin === new URL(wildfireGameUrl).origin) gameRequests.push(request.url());
  });
  page.on("popup", popup => gameRequests.push(`unexpected popup: ${popup.url()}`));
  await page.context().route(url => url.origin === new URL(wildfireGameUrl).origin, route => {
    gameRequests.push(`blocked game request: ${route.request().url()}`);
    return route.abort("blockedbyclient");
  });
  return gameRequests;
}

async function expectWildfireEntryActions(page: Page) {
  const actions = page.locator("[data-wildfire-entry-actions]");
  await expect(actions).toHaveCount(1);
  await expect(actions).toBeVisible();
  const links = actions.locator(":scope > a");
  await expect(links).toHaveCount(2);
  expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute("href"))))
    .toEqual([wildfireGameUrl, "#my-decisions"]);
  const game = page.locator(`a[href="${wildfireGameUrl}"]`);
  const decisions = actions.locator('a[href="#my-decisions"]');
  const externalLinks = page.locator('main a[href^="https://"], main a[href^="http://"]');
  await expect(externalLinks).toHaveCount(1);
  await expect(externalLinks).toHaveAttribute("href", wildfireGameUrl);
  await expect(game).toHaveCount(1);
  await expect(game).toHaveAccessibleName("Open the game (opens in a new tab)");
  await expect(game).toHaveAttribute("target", "_blank");
  await expect(game).toHaveAttribute("rel", "noreferrer");
  await expect(game.locator("span.sr-only")).toHaveText("(opens in a new tab)");
  await expect(decisions).toHaveAccessibleName("See the decisions");
  await expect(actions.locator("..")).toContainText("A cooperative browser game about deciding what to protect");
  await expect(actions.locator("..")).toContainText("I shaped the product direction and brought playtest feedback");
  const layout = await actions.evaluate(element => {
    const opening = element.closest('section[aria-labelledby="wildfire-title"]');
    const figure = opening?.querySelector("figure");
    const actionLinks = [...element.querySelectorAll(":scope > a")];
    if (!opening || !figure || actionLinks.length !== 2) throw new Error("The intro actions and first case-study figure must share the opening section.");
    return {
      beforeFirstFigure: Boolean(element.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING),
      groupBottom: element.getBoundingClientRect().bottom,
      figureTop: figure.getBoundingClientRect().top,
      targets: actionLinks.map(link => {
        const rect = link.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
      }),
    };
  });
  expect(layout.beforeFirstFigure).toBe(true);
  expect(layout.groupBottom).toBeLessThanOrEqual(layout.figureTop + 1);
  for (const target of layout.targets) {
    expect(target.width).toBeGreaterThanOrEqual(24);
    expect(target.height).toBeGreaterThanOrEqual(24);
  }
  const [gameTarget, decisionsTarget] = layout.targets;
  if (Math.abs(gameTarget.top - decisionsTarget.top) <= 1) {
    expect(gameTarget.right, "Game entry must precede decisions within the same visual row").toBeLessThanOrEqual(decisionsTarget.left + 1);
  } else {
    expect(gameTarget.bottom, "Wrapped entry actions must retain game-first visual order").toBeLessThanOrEqual(decisionsTarget.top + 1);
  }
  // Establish the starting focus without activating the external anchor. All
  // subsequent transitions are native keyboard input between the two actions.
  await game.focus();
  await page.keyboard.press("Tab");
  await expect(decisions).toBeFocused();
  for (const link of [decisions, game]) {
    if (link === game) await page.keyboard.press("Shift+Tab");
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    const focus = await link.evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const colorProbe = document.createElement("canvas");
      colorProbe.width = colorProbe.height = 1;
      const paint = colorProbe.getContext("2d");
      if (!paint) throw new Error("A color probe is required to check effective outline alpha.");
      paint.fillStyle = "transparent";
      paint.fillStyle = style.outlineColor;
      paint.fillRect(0, 0, 1, 1);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        outlineColor: style.outlineColor,
        outlineAlpha: paint.getImageData(0, 0, 1, 1).data[3],
        unobscured: center === element || Boolean(center && element.contains(center)),
      };
    });
    expect(focus.outlineStyle).not.toBe("none");
    expect(focus.outlineWidth).toBeGreaterThan(0);
    expect(focus.outlineColor).not.toBe("transparent");
    expect(focus.outlineAlpha, "Focus outline must have nonzero effective alpha; contrast still needs review").toBeGreaterThan(0);
    expect(focus.unobscured).toBe(true);
  }
  await page.keyboard.press("Tab");
  await expect(decisions).toBeFocused();
  return { actions, game, decisions };
}

async function enterWildfireDecisionsByKeyboard(page: Page) {
  const { decisions } = await expectWildfireEntryActions(page);
  await expect(decisions).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/wildfire-response#my-decisions$/);
  await expect(page.locator("#my-decisions").getByRole("heading", { name: "Make the choices visible.", exact: true })).toBeInViewport();
}

test("Wildfire case study renders its contribution and actual media across sizes", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", error => consoleErrors.push(error.message));
  const gameRequests = await observeGameRequests(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work/wildfire-response");
    await expect(page.locator("main h1")).toContainText("Wildfire Response");
    await expect(page.getByText("Product direction and playtest feedback", { exact: true })).toBeVisible();
    await expectWildfireEntryActions(page);
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
  expect(gameRequests, "Inspecting portfolio actions must not request or open the external game").toEqual([]);
});

test("Tradeoffs work by keyboard and the case is discoverable from selected work", async ({ page }) => {
  const gameRequests = await observeGameRequests(page);
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
  await enterWildfireDecisionsByKeyboard(page);
  expect(gameRequests).toEqual([]);
});

test("Case study has no automated WCAG A or AA violations", async ({ page }) => {
  const gameRequests = await observeGameRequests(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/wildfire-response");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  // The existing exitLinks print rule intentionally removes navigation only:
  // both relocated intro actions and the unchanged bottom return link.
  const actions = page.locator("[data-wildfire-entry-actions]");
  await expect(actions.locator(":scope > a")).toHaveCount(2);
  await page.emulateMedia({ media: "print" });
  await expect(actions).toBeHidden();
  await expect(actions.locator(`a[href="${wildfireGameUrl}"]`)).toBeHidden();
  await expect(actions.locator('a[href="#my-decisions"]')).toBeHidden();
  await expect(page.locator('main a[href="/work"]')).toBeHidden();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByText("A cooperative browser game about deciding what to protect when water, money and crew time are limited.", { exact: true })).toBeVisible();
  await expect(page.getByText("I shaped the product direction and brought playtest feedback into the map, controls and consequences. I work with Codex on implementation and iteration.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Make the choices visible.", exact: true })).toBeVisible();
  await expect(page.getByText(/Independent human playtests and physical-device experience remain open\./)).toBeVisible();
  await expect(page.locator("main figure")).toHaveCount(2);
  for (const figure of await page.locator("main figure").all()) await expect(figure).toBeVisible();
  expect(gameRequests).toEqual([]);
});

test("Core case-study journey works without JavaScript and with reduced motion", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const gameRequests = await observeGameRequests(page);
    await page.goto("http://127.0.0.1:" + (process.env.PORTFOLIO_TEST_PORT ?? "3101") + "/work");
    await page.getByRole("link", { name: "Read Wildfire Response case study" }).click();
    await expect(page.locator("main h1")).toContainText("Wildfire Response");
    const summary = page.locator("main summary").filter({ hasText: "Protect a place" });
    await summary.click();
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    await expect(page.getByText(/Protection buys a home or water pump time/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("no-js-mobile.png"), fullPage: true });
    await enterWildfireDecisionsByKeyboard(page);
    expect(gameRequests).toEqual([]);
  } finally {
    await context.close();
  }
});
