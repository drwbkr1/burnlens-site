import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import approvedSnapshot from "../content/dashboard-artifact/data.json" with { type: "json" };

const rows = approvedSnapshot.queries.portfolio_projects.rows;
const previews = [
  { id: "runbook-sentinel", title: "Runbook Sentinel" },
  { id: "west-hawaii-heat-exposure", title: "West Hawaiʻi heat" },
  { id: "nepal-satellite-atlas", title: "Nepal Satellite Atlas" },
] as const;
const htmlHash = "ee2687c4b8acdcaeb0751291bcea55cc6d4f2b396295bae598ff99a11f5bb66a";
const snapshotHash = "591dd3b8ea5ef905b3d90fb0bbc1b5610054629024ccb4837957aadd0a711ea3";
const snapshotPath = `/dashboard/explore/snapshot.${snapshotHash}.json`;
const explorerPath = "/dashboard/explore/index.html";
const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const rowKeys = ["id", "title", "sourceTitle", "category", "sourceReviewedAt", "coveredThrough", "session", "completedTasks", "plannedTasks", "completedModules", "plannedModules", "caseRoute", "state"].sort();

function nativeCard(page: Page, project: typeof previews[number]) {
  return page.getByRole("region", { name: "Selected project previews", exact: true })
    .getByRole("article", { name: project.title, exact: true });
}

type FrameSample = { at: number; left: number; top: number; width: number; height: number };
type FrameTrace = { active: boolean; samples: FrameSample[] };

async function frameBounds(frame: Locator) {
  return frame.evaluate(element => {
    const box = element.getBoundingClientRect();
    const card = element.closest("article")!.getBoundingClientRect();
    return { left: box.left - card.left, top: box.top - card.top, width: box.width, height: box.height };
  });
}

// Start before native activation, so a slow driver round trip cannot miss the
// real intermediate frames. This observes CSS geometry; it does not drive it.
async function beginFrameTrace(frame: Locator) {
  await frame.evaluate(element => {
    const target = element as HTMLElement & { __nfa109FrameTrace?: FrameTrace };
    if (target.__nfa109FrameTrace) target.__nfa109FrameTrace.active = false;
    const trace: FrameTrace = { active: true, samples: [] };
    target.__nfa109FrameTrace = trace;
    const start = performance.now();
    const sample = () => {
      const box = target.getBoundingClientRect();
      const card = target.closest("article")!.getBoundingClientRect();
      trace.samples.push({ at: performance.now() - start, left: box.left - card.left, top: box.top - card.top, width: box.width, height: box.height });
      if (trace.active && target.isConnected && performance.now() - start < 2000) requestAnimationFrame(sample);
    };
    sample();
  });
}

async function finishFrameTrace(frame: Locator) {
  return frame.evaluate(element => {
    const trace = (element as HTMLElement & { __nfa109FrameTrace?: FrameTrace }).__nfa109FrameTrace;
    if (!trace) throw new Error("The persistent image frame was replaced during its transition.");
    trace.active = false;
    return trace.samples;
  });
}

function expectIntermediateFrame(samples: FrameSample[], small: Awaited<ReturnType<typeof frameBounds>>, large: Awaited<ReturnType<typeof frameBounds>>) {
  expect(samples.length, "real animation-frame samples were recorded").toBeGreaterThan(2);
  expect(samples.some(sample => sample.width > small.width + 2 && sample.width < large.width - 2
    && sample.height > small.height + 2 && sample.height < large.height - 2
    && sample.left > large.left + .5 && sample.left < small.left - .5
    && sample.top > large.top + .5 && sample.top < small.top - .5),
  "the SAME thumbnail frame passes through a real intermediate size and position, not an immediate pop or entry-only wipe").toBe(true);
}

async function openExplorer(page: Page) {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== testOrigin) external.push(request.url());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(explorerPath, { waitUntil: "networkidle" });
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(5);
  await expect(page.locator(".bar-family-list-row")).toHaveCount(5);
  return { external, errors };
}

async function filterWork(page: Page, category: string) {
  // The authored scoped control uses a native picker on coarse pointers and a
  // radio-item menu on fine pointers. Exercise whichever real control is visible.
  const native = page.getByRole("combobox", { name: "Work area", exact: true });
  if (await native.isVisible()) await native.selectOption({ label: category });
  else {
    await page.getByRole("button", { name: "Work area", exact: true }).click();
    await page.getByRole("menuitemradio", { name: category, exact: true }).click();
  }
}

function assertPublicProjection(value: unknown) {
  const forbiddenKeys = /^(?:modulesJSON|activitiesJSON|activity|privatePath|privateUrl|token|password|secret|forecast|ownerEstimate|branch|commit|threadId|controlId)$/i;
  function visit(item: unknown) {
    if (typeof item === "string") {
      expect(item).not.toMatch(/[a-z]:[\\/]|file:\/\/|(?:localhost|127\.0\.0\.1)(?::\d+)?|(?:project|library)-file:/i);
      const urls = item.match(/https?:\/\/[^\s"<>]+/g) ?? [];
      expect(urls, "selected snapshot contains no public or private remote URLs").toEqual([]);
    } else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) {
        expect(key, "no copied private/operational payload fields").not.toMatch(forbiddenKeys);
        visit(child);
      }
    }
  }
  visit(value);
}

test("Polar-night project previews stay manual and native disclosure exclusivity never hides project links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const selection = page.getByRole("region", { name: "Selected project previews", exact: true });
  expect(await selection.getByRole("heading", { level: 2 }).allTextContents()).toEqual(previews.map(project => project.title));
  await expect(selection.locator("details[open]")).toHaveCount(0);
  await page.waitForTimeout(1200);
  await expect(selection.locator("details[open]"), "idle never auto-expands or advances project discovery").toHaveCount(0);
  for (const project of previews) {
    const card = nativeCard(page, project);
    await card.locator("summary").click();
    await expect(card.locator("details")).toHaveAttribute("open", "");
    await expect(selection.locator("details[open]")).toHaveCount(1);
    for (const item of previews) {
      await expect(nativeCard(page, item).getByRole("heading", { level: 2 })).toBeVisible();
      await expect(nativeCard(page, item).getByRole("link", { name: `Explore ${item.title} project`, exact: true })).toBeVisible();
      if (item.id !== project.id) await expect(nativeCard(page, item).locator("details")).not.toHaveAttribute("open", "");
    }
  }
  await nativeCard(page, previews[2]).locator("summary").click();
  await expect(selection.locator("details[open]")).toHaveCount(0);
  await expect(page.locator("main audio, main video, main canvas, main iframe")).toHaveCount(0);
});

test("Image reveal motion is finite, image inspection stays unfaded and only the separate Collapse control closes it", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "networkidle" });
    const card = nativeCard(page, previews[0]);
    const summary = card.locator("summary");
    const details = card.locator("details");
    const frame = card.locator("[data-project-image-frame]");
    const image = card.locator("[data-project-image-expanded]");
    await frame.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
    await expect(card).toHaveAttribute("data-image-readiness", "ready");
    await expect(frame).toHaveAttribute("aria-hidden", "true");
    await expect(card.getByRole("img")).toHaveCount(0);
    const closed = await frameBounds(frame);
    const transition = await frame.evaluate(element => {
      const style = getComputedStyle(element);
      return { properties: style.transitionProperty.split(",").map(value => value.trim()), durations: style.transitionDuration.split(",").map(value => Number.parseFloat(value)), clip: style.clipPath, animation: style.animationName };
    });
    expect(transition.properties).toEqual(expect.arrayContaining(["top", "left", "width", "height", "border-radius"]));
    expect(transition.durations.every(duration => duration > 0 && duration <= 1)).toBe(true);
    expect(transition.clip).toBe("none");
    expect(transition.animation).toBe("none");
    const initialTitleSize = await card.getByRole("heading", { level: 2 }).evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
    await beginFrameTrace(frame);
    await summary.click();
    await expect(details).toHaveAttribute("open", "");
    await expect(card.getByRole("img")).toHaveCount(1);
    await expect(card.locator("[data-project-image-semantic]")).toHaveAccessibleName(/frozen Runbook Sentinel dashboard.*not a live operations console/i);
    await expect.poll(() => frame.evaluate(element => {
      const box = element.getBoundingClientRect(); const card = element.closest("article")!.getBoundingClientRect();
      return Math.max(Math.abs(box.width - card.width), Math.abs(box.height - card.height), Math.abs(box.top - card.top), Math.abs(box.left - card.left));
    })).toBeLessThanOrEqual(2);
    const opened = await frameBounds(frame);
    const opening = await finishFrameTrace(frame);
    expectIntermediateFrame(opening, closed, opened);
    await expect(image.locator("..")).toHaveCSS("opacity", "1");
    const collapseLabel = summary.locator(":scope > span").filter({ hasText: /^Collapse/ });
    await expect(collapseLabel).toHaveCSS("opacity", "1");
    await expect(summary).toHaveAccessibleName("Collapse Runbook Sentinel image");
    expect(await card.getByRole("heading", { level: 2 }).evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(initialTitleSize);
    const bounds = await image.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.move(bounds!.x + bounds!.width * .5, bounds!.y + bounds!.height * .65);
    await expect(image.locator("..")).toHaveCSS("opacity", "1");
    await expect(image).toHaveCSS("filter", "none");
    await page.mouse.click(bounds!.x + bounds!.width * .5, bounds!.y + bounds!.height * .65);
    await expect(details).toHaveAttribute("open", "");
    await expect(collapseLabel).toHaveCSS("opacity", "1");
    await expect(summary.locator(":scope > span").filter({ hasText: /^Expand image/ })).toBeHidden();
    await beginFrameTrace(frame);
    await summary.click();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(card.getByRole("img"), "native collapse removes the qualified image from the accessibility tree").toHaveCount(0);
    await expect.poll(async () => {
      const box = await frameBounds(frame);
      return Math.max(Math.abs(box.width - closed.width), Math.abs(box.height - closed.height), Math.abs(box.left - closed.left), Math.abs(box.top - closed.top));
    }).toBeLessThanOrEqual(1.5);
    const closing = await finishFrameTrace(frame);
    expectIntermediateFrame(closing, closed, opened);
    await testInfo.attach(`${width}px-real-frame-expansion-contraction`, { body: JSON.stringify({ closed, opened, transition, opening, closing }, null, 2), contentType: "application/json" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await summary.click();
    await expect(details).toHaveAttribute("open", "");
    await expect(page.getByRole("heading", { level: 1, name: "Drew Baker.", exact: true })).toBeVisible();
    expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
    }))).toBe(true);
    expect(await page.locator("html").evaluate(element => getComputedStyle(element).scrollBehavior)).toBe("auto");
    await expect(collapseLabel).toHaveCSS("opacity", "1");
    await expect(image.locator("..")).toHaveCSS("opacity", "1");
  }
});

test("Dashboard SSR and no-JavaScript companion retain the exact five dated qualified records", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toHaveText("Project dashboard.");
    await expect(page.locator("main")).toContainText(/October 7, 2026.*5 PM Pacific/);
    await expect(page.locator("main")).toContainText(/dated snapshot.*not live status/i);
    await expect(page.locator("[data-dashboard-project]")).toHaveCount(5);
    expect(rows.map(row => [row.id, row.completedTasks, row.plannedTasks, row.completedModules, row.plannedModules])).toEqual([
      ["hotseat", 41, 45, 11, 13], ["ncaa", 9, 16, 5, 12], ["asm540", 16, 23, 1, 8], ["nepal", 16, 27, 2, 8], ["portfolio", 9, 15, 3, 6],
    ]);
    expect(rows.map(row => row.sourceReviewedAt)).toEqual(["2026-10-08T00:12:00Z", "2026-10-04T20:21:26Z", "2026-10-07T00:06:35Z", "2026-10-08T00:05:01Z", "2026-10-08T00:11:48Z"]);
    for (const row of rows) {
      expect(Object.keys(row).sort()).toEqual(rowKeys);
      expect(row.coveredThrough).toBe("2026-10-08T00:00:00.000Z");
      expect(row.session).toBe("2026-10-07");
      const record = page.locator(`[data-dashboard-project="${row.id}"]`);
      await expect(record.getByRole("heading", { level: 2 })).toContainText(row.title);
      await expect(record.locator("h2 a")).toHaveAttribute("href", row.caseRoute);
      await expect(record).toContainText(row.state);
      await expect(record).toContainText(`${row.completedTasks} of ${row.plannedTasks}`);
      await expect(record.locator("time")).toHaveAttribute("datetime", row.sourceReviewedAt);
      await expect(record).toContainText(`${row.completedModules} of ${row.plannedModules} listed modules complete`);
    }
    await expect(page.locator('[data-dashboard-project="nepal"]')).toContainText(/unverified.*six empty windows unsupported.*blocked.*registration evidence/i);
    await expect(page.locator('[data-dashboard-project="asm540"]')).toContainText(/wrong field.*unfinished/i);
    await page.getByText("Snapshot scope", { exact: true }).click();
    await expect(page.locator("main")).toContainText(/portfolio record predates this design update/i);
    await expect(page.getByRole("link", { name: "Compare the project checklists", exact: true })).toHaveAttribute("href", explorerPath);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test("Independent dashboard HTTP artifacts match reviewed bytes and its CSP exception stays route-local", async ({ request }) => {
  const html = await request.get(explorerPath);
  const bytes = Buffer.from(await html.body());
  expect(html.status()).toBe(200);
  expect(bytes.byteLength).toBe(2_859_454);
  expect(hash(bytes)).toBe(htmlHash);
  const snapshot = await request.get(snapshotPath);
  const snapshotBytes = Buffer.from(await snapshot.body());
  expect(snapshot.status()).toBe(200);
  expect(snapshotBytes.byteLength).toBe(7209);
  expect(hash(snapshotBytes)).toBe(snapshotHash);
  expect(JSON.parse(snapshotBytes.toString("utf8"))).toEqual(approvedSnapshot);
  const csp = html.headers()["content-security-policy"];
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("script-src 'self' data: 'unsafe-inline'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).toContain("base-uri 'none'");
  expect(csp).toContain("form-action 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toContain("unsafe-eval");
  expect(html.headers()["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expect(html.headers()["x-content-type-options"]).toBe("nosniff");
  expect(html.headers()["x-frame-options"]).toBe("DENY");
  for (const route of ["/", "/dashboard", snapshotPath]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const directives = response.headers()["content-security-policy"].split(";");
    const script = directives.find(directive => directive.trim().startsWith("script-src "));
    expect(script).toContain("'self'");
    expect(script).not.toContain("data:");
    expect(script).not.toContain("unsafe-eval");
  }
  const head = bytes.toString("utf8").split("</head>")[0];
  expect(head).not.toMatch(/data-app-local-thread|CODEX_(?:SESSION|THREAD)_ID|[a-z]:[\\/]users[\\/]/i);
  expect(head).toContain(snapshotHash);
});

test("Interactive dashboard filters real records and exposes only the selected source preview", async ({ page, request }) => {
  const observed = await openExplorer(page);
  const expectedChoices = ["All", "Interactive software", "Data visualization", "Environmental GIS"];
  const native = page.getByRole("combobox", { name: "Work area", exact: true });
  if (await native.isVisible()) {
    expect(await native.locator("option").allTextContents()).toEqual(expectedChoices);
    await expect(page.getByRole("button", { name: "Work area", exact: true })).toBeHidden();
  } else {
    const trigger = page.getByRole("button", { name: "Work area", exact: true });
    const menu = page.getByRole("menu", { name: "Work area", exact: true });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await trigger.press("Enter");
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await menu.getByRole("menuitemradio").allTextContents()).toEqual(expectedChoices);
    const all = menu.getByRole("menuitemradio", { name: "All", exact: true });
    const environmental = menu.getByRole("menuitemradio", { name: "Environmental GIS", exact: true });
    const data = menu.getByRole("menuitemradio", { name: "Data visualization", exact: true });
    await expect(all).toHaveAttribute("aria-checked", "true");
    await expect(all).toBeFocused();
    await page.keyboard.press("End");
    await expect(environmental).toBeFocused();
    await page.keyboard.press("Home");
    await expect(all).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(environmental).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(all).toBeFocused();
    await page.keyboard.press("d");
    await expect(data).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(menu).toBeVisible();
    await expect(data).toBeFocused();
    await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(5);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    // A fresh pointer-open must not retain the last menu's typeahead/focus index.
    await trigger.click();
    await page.keyboard.press("ArrowDown");
    await expect(all).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await expect(page.locator(".workbench-definition")).toContainText(/not hours, effort shares or whole-project acceptance/);
  expect(await page.locator(".bar-family-list-row").allTextContents()).toHaveLength(5);
  await filterWork(page, "Environmental GIS");
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(2);
  await expect(page.locator(".bar-family-list-row")).toHaveCount(2);
  expect(await page.locator("[data-reviewed-rows] [data-dashboard-project]").evaluateAll(records => records.map(record => record.getAttribute("data-dashboard-project")))).toEqual(["asm540", "nepal"]);
  await page.getByRole("button", { name: "Listed tasks completed actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "View data source", exact: true }).click();
  const source = page.getByRole("complementary", { name: "Data source for Listed tasks completed", exact: true });
  await expect(source).toBeVisible();
  await source.getByRole("tab", { name: "Data preview", exact: true }).click();
  await expect(source.locator("table")).toBeVisible();
  await expect(source).toContainText("West Hawaiʻi heat exposure");
  await expect(source).toContainText("Nepal Satellite Atlas");
  await expect(source).not.toContainText("Wildfire Response");
  await source.getByRole("button", { name: "Close data source", exact: true }).click();
  await filterWork(page, "Data visualization");
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(1);
  await expect(page.locator(".bar-family-list-row")).toHaveCount(1);
  await expect(page.locator("[data-reviewed-rows]")).toContainText("After the Tip");
  await filterWork(page, "All");
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(5);
  await filterWork(page, "Interactive software");
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(2);
  await expect(page.locator(".bar-family-list-row")).toHaveCount(2);
  expect(await page.locator("[data-reviewed-rows] [data-dashboard-project]").evaluateAll(records => records.map(record => record.getAttribute("data-dashboard-project")))).toEqual(["hotseat", "portfolio"]);
  await filterWork(page, "All");
  await expect(page.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(5);
  const snapshot = await (await request.get(snapshotPath)).json();
  expect(Object.keys(snapshot).sort()).toEqual(Object.keys(approvedSnapshot).sort());
  expect(Object.keys(snapshot.queries)).toEqual(["portfolio_projects"]);
  expect(Object.keys(snapshot.queries.portfolio_projects).sort()).toEqual(["methods", "rows", "source"]);
  expect(snapshot.queries.portfolio_projects.rows).toEqual(rows);
  for (const row of snapshot.queries.portfolio_projects.rows) expect(Object.keys(row).sort()).toEqual(rowKeys);
  assertPublicProjection(snapshot);
  expect(observed.external).toEqual([]);
  expect(observed.errors).toEqual([]);
});

test("Actual independent dashboard is usable at three widths with no overflow or automated WCAG violations", async ({ page, browser }, testInfo) => {
  test.setTimeout(60_000);
  for (const width of [1440, 900, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const observed = await openExplorer(page);
    await expect(page.locator(".portfolio-workbench")).toBeVisible();
    for (const row of rows) await expect(page.locator(`[data-dashboard-project="${row.id}"] h2 a`)).toBeVisible();
    const geometry = await page.locator(".portfolio-workbench").evaluate(workbench => ({
      viewport: innerWidth, document: document.documentElement.scrollWidth,
      escaping: [...workbench.querySelectorAll<HTMLElement>("a, summary, p, .bar-family-list-row")].filter(element => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return style.display !== "none" && bounds.width > 0 && (bounds.left < -1.5 || bounds.right > innerWidth + 1.5);
      }).map(element => element.textContent?.trim()),
    }));
    expect(geometry.document).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.escaping).toEqual([]);
    const picker = page.getByRole("button", { name: "Work area", exact: true });
    await picker.click();
    const menu = page.getByRole("menu", { name: "Work area", exact: true });
    await expect(menu).toBeVisible();
    const bounds = await menu.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(10);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 10);
    expect(bounds!.y).toBeGreaterThanOrEqual(10);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(990);
    const popupReference = await picker.evaluate(trigger => {
      const controls = trigger.getAttribute("aria-controls");
      const matches = controls ? [...document.querySelectorAll<HTMLElement>("[id]")].filter(element => element.id === controls) : [];
      const popup = matches[0];
      const rectangle = popup?.getBoundingClientRect();
      return {
        triggerId: trigger.id, controls, expanded: trigger.getAttribute("aria-expanded"),
        matches: matches.length, role: popup?.getAttribute("role"),
        labelledBy: popup?.getAttribute("aria-labelledby")?.split(/\s+/),
        visible: Boolean(popup && rectangle && rectangle.width > 0 && rectangle.height > 0 && getComputedStyle(popup).visibility !== "hidden"),
      };
    });
    expect(popupReference.triggerId).not.toBe("");
    expect(popupReference.controls).toBe(await menu.getAttribute("id"));
    expect(popupReference.expanded).toBe("true");
    expect(popupReference.matches).toBe(1);
    expect(popupReference.role).toBe("menu");
    expect(popupReference.labelledBy).toContain(popupReference.triggerId);
    expect(popupReference.visible).toBe(true);
    await testInfo.attach(`dashboard-${width}px-popup-reference`, { body: JSON.stringify(popupReference, null, 2), contentType: "application/json" });
    const openAudit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(openAudit.violations, `${width}px open Work area menu`).toEqual([]);
    await testInfo.attach(`dashboard-${width}px-open-menu`, { body: await page.screenshot(), contentType: "image/png" });
    await testInfo.attach(`dashboard-${width}px-open-menu-axe-incomplete`, { body: JSON.stringify(openAudit.incomplete, null, 2), contentType: "application/json" });
    // Axe requests manual review for aria-controls on popup triggers even when
    // the target exists. Retain the raw finding above and review only this
    // exact trigger after the explicit DOM reference proof; no rule is disabled.
    const unreviewed = openAudit.incomplete.filter(result => {
      if (result.id === "color-contrast") return false;
      if (result.id !== "aria-valid-attr-value" || result.nodes.length !== 1) return true;
      const node = result.nodes[0];
      return JSON.stringify(node.target) !== JSON.stringify([`#${popupReference.triggerId}`])
        || node.any.length !== 0 || node.none.length !== 0 || node.all.length !== 1
        || node.all[0].data?.messageKey !== "controlsWithinPopup";
    });
    expect(unreviewed, "no unknown ARIA findings beyond the directly reviewed Work area reference").toEqual([]);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(picker).toBeFocused();
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(audit.violations, `${width}px actual dashboard`).toEqual([]);
    // The retained protected runtime has manually reviewed chart/gradient
    // color-contrast incompletes; record every unresolved node, never call it a pass.
    await testInfo.attach(`dashboard-${width}px-axe-incomplete`, { body: JSON.stringify(audit.incomplete, null, 2), contentType: "application/json" });
    expect(audit.incomplete.map(result => result.id).filter(id => id !== "color-contrast"), "only explicitly tracked protected-runtime contrast incompletes").toEqual([]);
    expect(observed.external).toEqual([]);
    expect(observed.errors).toEqual([]);
  }
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, baseURL: testOrigin });
  try {
    const mobilePage = await mobile.newPage();
    const observed = await openExplorer(mobilePage);
    const native = mobilePage.getByRole("combobox", { name: "Work area", exact: true });
    await expect(native).toBeVisible();
    await expect(mobilePage.getByRole("button", { name: "Work area", exact: true })).toBeHidden();
    expect(await native.locator("option").allTextContents()).toEqual(["All", "Interactive software", "Data visualization", "Environmental GIS"]);
    for (const [choice, count] of [["Environmental GIS", 2], ["Data visualization", 1], ["Interactive software", 2], ["All", 5]] as const) {
      await native.selectOption({ label: choice });
      await expect(mobilePage.locator("[data-reviewed-rows] [data-dashboard-project]")).toHaveCount(count);
      await expect(mobilePage.locator(".bar-family-list-row")).toHaveCount(count);
    }
    await testInfo.attach("dashboard-coarse-390", { body: await mobilePage.screenshot(), contentType: "image/png" });
    const audit = await new AxeBuilder({ page: mobilePage }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(audit.violations).toEqual([]);
    await testInfo.attach("dashboard-coarse-390-axe-incomplete", { body: JSON.stringify(audit.incomplete, null, 2), contentType: "application/json" });
    expect(audit.incomplete.map(result => result.id).filter(id => id !== "color-contrast")).toEqual([]);
    expect(observed.external).toEqual([]);
    expect(observed.errors).toEqual([]);
  } finally { await mobile.close(); }
});

test("Print keeps a light motion-free biography and project-link handoff while scientific qualifiers remain on All projects", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await nativeCard(page, previews[2]).locator("summary").click();
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
  expect(await page.locator("html").evaluate(element => getComputedStyle(element).colorScheme)).toBe("light");
  expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
  }))).toBe(true);
  await expect(page.getByRole("heading", { level: 1, name: "Drew Baker.", exact: true })).toBeVisible();
  await expect(page.getByText("I set the direction, make product decisions and review the result. Development is collaborative and includes Codex assistance.", { exact: true })).toBeVisible();
  for (const project of previews) {
    const card = nativeCard(page, project);
    await expect(card.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(card.getByRole("list", { name: "Relevant tools and skills", exact: true })).toBeVisible();
    await expect(card.locator(":scope > div > p")).toBeVisible();
    const explore = card.getByRole("link", { name: `Explore ${project.title} project`, exact: true });
    await expect(explore).toBeVisible();
    expect(await explore.evaluate(element => getComputedStyle(element, "::after").content)).toContain(`burnlensproject.org/work/${project.id}`);
    await expect(card.locator("summary")).toBeHidden();
    for (const image of await card.locator("img").all()) await expect(image).toBeHidden();
  }
  const credit = nativeCard(page, previews[2]).locator("..").locator("figcaption");
  await expect(credit).toBeVisible();
  await expect(credit).toContainText("ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.");
  for (const [label, href] of [
    ["All projects", "/work"],
    ["BurnLens case", "/work/burnlens"],
    ["Workbench", "/dashboard"],
    ["My résumé", "/resume"],
    ["Get in touch", "https://www.linkedin.com/in/william-baker-843946162/"],
  ] as const) {
    // The print-only URL suffix contributes to local anchors' accessible names.
    const name = href.startsWith("/") ? `${label} (burnlensproject.org${href})` : label;
    const link = page.locator("main").getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
  await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
  await page.goto("/work", { waitUntil: "networkidle" });
  const paths = page.locator('#current-projects [data-lead-figure="purdue"] svg path');
  const originalColors = [{ fill: "rgb(117, 127, 100)", stroke: "rgb(72, 81, 63)" }, { fill: "rgb(92, 117, 122)", stroke: "rgb(49, 78, 84)" }];
  expect(await paths.evaluateAll(elements => elements.map(element => ({ fill: getComputedStyle(element).fill, stroke: getComputedStyle(element).stroke })))).toEqual(originalColors);
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  const current = page.locator("#current-projects");
  for (const figure of await current.locator("article:not(:has([data-lead-figure])) figure").all()) await expect(figure.locator("figcaption")).toBeVisible();
  const tip = current.getByRole("article").filter({ has: page.getByRole("heading", { name: "After the Tip", exact: true }) });
  await expect(tip.getByText(/^Actual mean positive lead contributions/)).toBeVisible();
  await expect(tip).toContainText("Not an uncertainty band or team-strength comparison.");
  await expect(tip.locator("figure")).toBeHidden();
  await expect(current).toContainText(/unregistered.*not a mapped landslide/i);
  await expect(current).toContainText("heat-exposure maps, not coral-damage observations");
  for (const image of await current.locator("img").all()) await expect(image).toBeHidden();
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.locator("[data-dashboard-project]")).toHaveCount(5);
  for (const row of rows) await expect(page.locator(`[data-dashboard-project="${row.id}"]`)).toContainText(row.state);
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
});

test("Native expanded screenshots keep controls, context and attribution inside responsive frames with a touch inspection path", async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const project of previews) {
      const card = nativeCard(page, project);
      const summary = card.locator("summary");
      await summary.click();
      await expect(card.locator("details")).toHaveAttribute("open", "");
      const image = card.locator("[data-project-image-expanded]");
      await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
      await expect(image.locator("..")).toHaveCSS("opacity", "1");
      await expect(card.getByRole("img")).toHaveCount(1);
      const framing = await card.evaluate(element => {
        const cardBounds = element.getBoundingClientRect();
        const title = element.querySelector("h2")!;
        const summary = element.querySelector("summary")!;
        const label = [...summary.children].find(child => getComputedStyle(child).display !== "none")!;
        const context = element.querySelector("details > div > p")!;
        const explore = element.querySelector("a")!;
        const image = element.querySelector<HTMLImageElement>("[data-project-image-expanded]")!;
        const bounds = (node: Element) => {
          const box = node.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
        };
        const contained = (node: Element) => {
          const box = node.getBoundingClientRect();
          return box.left >= cardBounds.left - 1 && box.right <= cardBounds.right + 1
            && box.top >= cardBounds.top - 1 && box.bottom <= cardBounds.bottom + 1;
        };
        return {
          fullCard: cardBounds.left >= -.5 && cardBounds.right <= innerWidth + .5,
          contained: [title, summary, label, context, explore, image].map(contained),
          title: bounds(title), label: bounds(label), context: bounds(context), explore: bounds(explore), summary: bounds(summary),
          fonts: { control: Number.parseFloat(getComputedStyle(label).fontSize), context: Number.parseFloat(getComputedStyle(context).fontSize), link: Number.parseFloat(getComputedStyle(explore).fontSize) },
          image: { fit: getComputedStyle(image).objectFit, clip: getComputedStyle(image).clipPath, filter: getComputedStyle(image).filter, opacity: getComputedStyle(image).opacity },
        };
      });
      expect(framing.fullCard, `${project.id} at ${width}px`).toBe(true);
      expect(framing.contained.every(Boolean), "all reading and interactive overlays remain in the frame").toBe(true);
      expect(framing.label.top, "Collapse sits below the compact title").toBeGreaterThanOrEqual(framing.title.bottom - 1);
      expect(framing.title.right <= framing.context.left + 1 || framing.title.bottom <= framing.context.top + 1, "title and context do not overlap").toBe(true);
      expect(framing.explore.top).toBeGreaterThan(framing.label.bottom);
      expect(framing.summary.height).toBeGreaterThanOrEqual(44);
      expect(framing.explore.height).toBeGreaterThanOrEqual(44);
      expect(framing.fonts.control).toBeGreaterThanOrEqual(13);
      expect(framing.fonts.context).toBeGreaterThanOrEqual(12);
      expect(framing.fonts.link).toBeGreaterThanOrEqual(13);
      expect(framing.image).toEqual({ fit: "contain", clip: "none", filter: "none", opacity: "1" });
      await testInfo.attach(`${project.id}-${width}px-native-framing`, { body: JSON.stringify(framing, null, 2), contentType: "application/json" });
      if (project.id === "nepal-satellite-atlas" || project.id === "west-hawaii-heat-exposure") {
        const credit = card.locator("..").locator("figcaption");
        await expect(credit).toBeVisible();
        expect(await credit.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(13);
        const creditBounds = await credit.boundingBox();
        expect(creditBounds).not.toBeNull();
        expect(creditBounds!.x).toBeGreaterThanOrEqual(0);
        expect(creditBounds!.x + creditBounds!.width).toBeLessThanOrEqual(width + 1);
      }
      await summary.click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: testOrigin });
  try {
    const touchPage = await touchContext.newPage();
    await touchPage.goto("/");
    for (const project of previews) {
      const card = nativeCard(touchPage, project);
      const summary = card.locator("summary");
      await expect(summary.locator(":scope > span").filter({ hasText: /^Expand image/ })).toHaveCSS("opacity", "1");
      await summary.tap();
      await expect(card.locator("details")).toHaveAttribute("open", "");
      await card.scrollIntoViewIfNeeded();
      const image = card.locator("[data-project-image-expanded]");
      await expect(image.locator("..")).toHaveCSS("opacity", "1");
      const bounds = await image.boundingBox();
      expect(bounds).not.toBeNull();
      await touchPage.touchscreen.tap(bounds!.x + bounds!.width * .5, bounds!.y + bounds!.height * .65);
      await expect(card.locator("details")).toHaveAttribute("open", "");
      await expect(image).toHaveCSS("opacity", "1");
      await expect(summary).toHaveAccessibleName(`Collapse ${project.title} image`);
      await summary.tap();
      await expect(card.locator("details")).not.toHaveAttribute("open", "");
    }
    await testInfo.attach("390px-touch-native-previews", { body: await touchPage.screenshot({ fullPage: true, animations: "disabled" }), contentType: "image/png" });
  } finally { await touchContext.close(); }
});
