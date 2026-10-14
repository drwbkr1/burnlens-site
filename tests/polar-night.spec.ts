import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import approvedSnapshot from "../content/dashboard-artifact/data.json" with { type: "json" };

const rows = approvedSnapshot.queries.portfolio_projects.rows;
const ids = ["wildfire-response", "after-the-tip", "west-hawaii-heat-exposure", "nepal-satellite-atlas", "burnlens", "runbook-sentinel"] as const;
const htmlHash = "ee2687c4b8acdcaeb0751291bcea55cc6d4f2b396295bae598ff99a11f5bb66a";
const snapshotHash = "591dd3b8ea5ef905b3d90fb0bbc1b5610054629024ccb4837957aadd0a711ea3";
const snapshotPath = `/dashboard/explore/snapshot.${snapshotHash}.json`;
const explorerPath = "/dashboard/explore/index.html";
const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const rowKeys = ["id", "title", "sourceTitle", "category", "sourceReviewedAt", "coveredThrough", "session", "completedTasks", "plannedTasks", "completedModules", "plannedModules", "caseRoute", "state"].sort();

async function selectCard(page: Page, id: typeof ids[number]) {
  const card = page.locator(`[data-carousel-slide="${id}"]`);
  const link = card.locator(`a[href="/work/${id}"]`);
  await link.focus();
  await expect(link).toBeFocused();
  await expect.poll(() => card.evaluate(element => {
    const track = element.parentElement!;
    const first = track.querySelector<HTMLElement>("[data-carousel-slide]")!;
    return Math.abs(track.scrollLeft - ((element as HTMLElement).offsetLeft - first.offsetLeft));
  })).toBeLessThan(1.5);
  return card;
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

test("Polar-night carousel is manual, bounded and keyboard/focus navigable across all six cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const carousel = page.locator("[data-project-carousel]");
  const track = carousel.locator("#project-track");
  const previous = carousel.getByRole("button", { name: "Previous project", exact: true });
  const next = carousel.getByRole("button", { name: "Next project", exact: true });
  const position = carousel.locator('[aria-live="polite"]');
  expect(await carousel.locator("[data-carousel-slide]").evaluateAll(cards => cards.map(card => card.getAttribute("data-carousel-slide")))).toEqual([...ids]);
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect(position).toContainText("1 of 6");
  const initial = await track.evaluate(element => element.scrollLeft);
  await page.waitForTimeout(1200);
  expect(await track.evaluate(element => element.scrollLeft), "no autoplay while idle").toBe(initial);
  await next.click();
  await expect(position).toContainText("2 of 6");
  await expect(next, "advancing does not steal button focus").toBeFocused();
  await track.focus();
  await page.keyboard.press("End");
  await expect(position).toContainText("6 of 6");
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
  await page.keyboard.press("ArrowRight");
  await expect(position).toContainText("6 of 6");
  await page.keyboard.press("Home");
  await expect(position).toContainText("1 of 6");
  await page.keyboard.press("ArrowLeft");
  await expect(previous).toBeDisabled();
  for (const [index, id] of ids.entries()) {
    await selectCard(page, id);
    await expect(position).toContainText(`${index + 1} of 6`);
  }
  await expect(page.locator("main audio, main video, main iframe")).toHaveCount(0);
});

test("Kinetic typography has one finite arrival and reduced motion keeps readable instant controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
  const h1 = page.locator("main h1");
  const motion = await h1.evaluate(element => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount, opacity: style.opacity };
  });
  expect(motion.name).not.toBe("none");
  expect(motion.duration).toBe("0.7s");
  expect(motion.iterations).toBe("1");
  expect(motion.opacity).toBe("1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(h1).toBeVisible();
  expect(await h1.evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
  }))).toBe(true);
  expect(await page.locator("#project-track").evaluate(element => getComputedStyle(element).scrollBehavior)).toBe("auto");
  await page.locator("#project-track").focus();
  await page.keyboard.press("End");
  await expect(page.locator('[data-project-carousel] [aria-live="polite"]')).toContainText("6 of 6");
  expect(await page.locator("main h1").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
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

test("Print is light and motion-free while scientific source colors and qualifiers stay bounded", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const paths = page.locator('[data-carousel-slide="after-the-tip"] [data-lead-figure] svg path');
  const originalColors = [{ fill: "rgb(117, 127, 100)", stroke: "rgb(72, 81, 63)" }, { fill: "rgb(92, 117, 122)", stroke: "rgb(49, 78, 84)" }];
  expect(await paths.evaluateAll(elements => elements.map(element => ({ fill: getComputedStyle(element).fill, stroke: getComputedStyle(element).stroke })))).toEqual([...originalColors, ...originalColors]);
  expect(await page.locator('[data-current-project] img, [data-lead-figure] svg').evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.filter === "none" && style.clipPath === "none";
  }))).toBe(true);
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
  expect(await page.locator("html").evaluate(element => getComputedStyle(element).colorScheme)).toBe("light");
  expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
  }))).toBe(true);
  await expect(page.getByRole("button", { name: "Next project", includeHidden: true })).toBeHidden();
  for (const id of ids) await expect(page.locator(`[data-carousel-slide="${id}"] a[href="/work/${id}"]`)).toBeVisible();
  for (const figure of await page.locator('[data-current-project]:not([data-current-project="after-the-tip"]) figure').all()) await expect(figure.locator("figcaption")).toBeVisible();
  await expect(page.locator('[data-current-project="after-the-tip"]').getByText(/^Mean positive lead contribution/)).toBeVisible();
  for (const figure of await page.locator('[data-current-project="after-the-tip"] figure').all()) await expect(figure).toBeHidden();
  await expect(page.locator('[data-current-project="nepal-satellite-atlas"]')).toContainText(/unregistered.*not a mapped landslide/i);
  await expect(page.locator('[data-current-project="west-hawaii-heat-exposure"]')).toContainText(/not observed reef condition/i);
  for (const image of await page.locator('[data-current-project] img').all()) await expect(image).toBeHidden();
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.locator("[data-dashboard-project]")).toHaveCount(5);
  for (const row of rows) await expect(page.locator(`[data-dashboard-project="${row.id}"]`)).toContainText(row.state);
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
});

test("Every carousel card keeps complete source media and captions inside the active mobile and desktop frame", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const id of ids) {
      const card = await selectCard(page, id);
      await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
      await expect.poll(() => card.locator("img").evaluateAll(images => images.every(image =>
        (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
      ))).toBe(true);
      await card.locator("img").evaluateAll(async images => {
        await Promise.all(images.map(image => (image as HTMLImageElement).decode()));
      });
      await expect.poll(() => card.evaluate(element =>
        element.getBoundingClientRect().height <= element.parentElement!.clientHeight + 1.5,
      )).toBe(true);
      const framing = await card.evaluate(element => {
        const cardBounds = element.getBoundingClientRect();
        const track = element.parentElement!;
        const trackBounds = track.getBoundingClientRect();
        return { fullCard: cardBounds.left >= -.5 && cardBounds.right <= innerWidth + .5,
          fullHeight: cardBounds.height <= track.clientHeight + 1.5,
          media: [...element.querySelectorAll<HTMLImageElement>("img")].map(image => {
            const style = getComputedStyle(image); const bounds = image.getBoundingClientRect();
            const contentWidth = bounds.width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth) - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
            const contentHeight = bounds.height - Number.parseFloat(style.borderTopWidth) - Number.parseFloat(style.borderBottomWidth) - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
            return { loaded: image.complete && image.naturalWidth > 0, fit: style.objectFit, clip: style.clipPath, filter: style.filter,
              ratioDelta: Math.abs(contentWidth / contentHeight - image.naturalWidth / image.naturalHeight),
              contained: bounds.left >= cardBounds.left - 1.5 && bounds.right <= cardBounds.right + 1.5 && bounds.bottom <= trackBounds.bottom + 1.5 };
          }),
          captions: [...element.querySelectorAll("figcaption")].map(caption => { const bounds = caption.getBoundingClientRect(); return bounds.left >= cardBounds.left - 1.5 && bounds.right <= cardBounds.right + 1.5 && bounds.bottom <= trackBounds.bottom + 1.5; }),
        };
      });
      expect(framing.fullCard, `${id} at ${width}px`).toBe(true);
      expect(framing.fullHeight, `${id} active track height`).toBe(true);
      expect(framing.captions.length, `${id} complete caption`).toBeGreaterThan(0);
      expect(framing.captions.every(Boolean)).toBe(true);
      for (const media of framing.media) {
        expect(media.loaded).toBe(true); expect(media.fit).toBe("contain"); expect(media.clip).toBe("none"); expect(media.filter).toBe("none");
        expect(media.ratioDelta).toBeLessThan(.01); expect(media.contained).toBe(true);
      }
      if (id === "after-the-tip") await expect(card.locator("[data-lead-figure]")).toHaveCount(2);
      else if (id === "west-hawaii-heat-exposure") await expect(card.locator("img")).toHaveCount(2);
      else if (id === "wildfire-response" || id === "nepal-satellite-atlas") await expect(card.locator("img")).toHaveCount(1);
      else await expect(card.locator("img, picture, video, canvas")).toHaveCount(0);
      if (width === 768 && id === ids[0]) {
        const track = page.locator("#project-track");
        const next = page.getByRole("button", { name: "Next project", exact: true });
        await next.scrollIntoViewIfNeeded();
        const trackBounds = await track.boundingBox();
        expect(trackBounds).not.toBeNull();
        const pointerY = Math.min(trackBounds!.y + 40, 980);
        expect(pointerY).toBeGreaterThan(trackBounds!.y);
        await page.mouse.move(trackBounds!.x + trackBounds!.width / 2, pointerY);
        await page.mouse.wheel(0, 300);
        await expect.poll(() => track.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
        const before = await track.evaluate(element => ({ innerScrollTop: element.scrollTop, windowY: scrollY }));
        await next.click();
        await expect(next).toBeFocused();
        await expect.poll(() => track.evaluate(element => element.scrollTop)).toBe(0);
        await expect(page.locator('[aria-live="polite"]')).toContainText("2 of 6");
        const activeTitle = page.locator(`[data-carousel-slide="${ids[1]}"]`).getByRole("heading", { level: 3 });
        await expect(activeTitle).toBeVisible();
        const after = await activeTitle.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const frame = element.closest("[data-carousel-slide]")!.parentElement!.getBoundingClientRect();
          return { titleTop: bounds.top, titleBottom: bounds.bottom, frameTop: frame.top, frameBottom: frame.bottom, windowY: scrollY };
        });
        expect(after.titleTop).toBeGreaterThanOrEqual(after.frameTop);
        expect(after.titleBottom).toBeLessThanOrEqual(after.frameBottom);
        expect(after.windowY).toBe(before.windowY);
        await testInfo.attach("native-768-inner-scroll-reset", {
          body: JSON.stringify({ input: "native mouse wheel", width, before, after }),
          contentType: "application/json",
        });
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
