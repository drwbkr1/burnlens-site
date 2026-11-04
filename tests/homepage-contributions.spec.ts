import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const testOrigin = `http://127.0.0.1:${process.env.PORTFOLIO_TEST_PORT ?? "3101"}`;
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://burnlensproject.org").origin;
const expectedIndexable = process.env.PORTFOLIO_DEPLOYMENT_CONTEXT === "production" && process.env.NEXT_PUBLIC_SITE_INDEXING === "allow";
const hero = "I turn data and complex ideas into usable software.";
const nepalCredit = "ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.";
const hawaiiCredit = "NOAA Coral Reef Watch; NOAA/NCCOS and Analytical Laboratories of Hawaii.";
const previews = [
  {
    id: "runbook-sentinel", title: "Runbook Sentinel", asset: "runbook-interface", suffix: "-v2",
    skills: ["Python", "SQLite", "API design"],
    contribution: "I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act.",
    context: ["Frozen synthetic interface", "Real infrastructure disconnected"],
    alternative: /frozen Runbook Sentinel dashboard.*Real infrastructure disconnected; not a live operations console/i,
  },
  {
    id: "west-hawaii-heat-exposure", title: "West Hawaiʻi heat", asset: "west-hawaii", suffix: "",
    skills: ["ArcGIS Pro", "Spatial joins", "Satellite data"],
    contribution: "I worked through a guided ArcGIS workflow to correct coastal coverage.",
    context: ["2015 / 2019 · annual max DHW", "5,702.29 ha mapped habitat", "17.0% unavailable"],
    alternative: /Saved West Hawaiʻi habitat-area comparison.*Annual maximum DHW \(°C-weeks\).*5,702\.29 ha historical reef\/hardbottom denominator.*2015—8 or above 83\.0%, unavailable 17\.0%; 2019—below 4 8\.3%, 4 to below 8 11\.4%, 8 or above 63\.3%, unavailable 17\.0%.*Satellite heat exposure, not observed coral condition/i,
  },
  {
    id: "nepal-satellite-atlas", title: "Nepal Satellite Atlas", asset: "nepal", suffix: "",
    skills: ["ArcGIS Pro", "Cartography", "Satellite imagery"],
    contribution: "I defined an ArcGIS atlas I could open, compare and export.",
    context: ["16 & 28 August 2026", "Radar excerpt · −30 to 0 dB", "Registration unverified"],
    alternative: /Sentinel-1D radar views dated 16 and 28 August 2026.*Registration unverified.*Blank regions are excluded data.*not a mapped landslide result/i,
  },
] as const;
type Preview = typeof previews[number];

function previewCard(page: Page, project: Preview) {
  return page.getByRole("region", { name: "Selected project previews", exact: true })
    .getByRole("article", { name: project.title, exact: true });
}

function assetPath(project: Preview, mode: "thumbnail" | "expanded" | "expanded-mobile") {
  return `/media/projects/homepage-reveal/${project.asset}-${mode}${project.suffix}.webp`;
}

function observeExternalRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== testOrigin) requests.push(request.url());
  });
  return requests;
}

// A real Tab sequence establishes keyboard modality. Do not substitute focus()
// or pointer clicks for reachability and :focus-visible coverage.
async function tabTo(page: Page, target: Locator) {
  for (let count = 0; count < 64; count += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate(element => element === document.activeElement)) {
      await expect(target).toBeFocused();
      expect(await target.evaluate(element => element.matches(":focus-visible"))).toBe(true);
      expect(await target.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
      return;
    }
  }
  throw new Error("Keyboard target was not reachable within 64 real Tab presses.");
}

async function expectScreenshot(page: Page, project: Preview, width: number) {
  const card = previewCard(page, project);
  const semantic = card.locator("[data-project-image-semantic]");
  const image = card.locator("[data-project-image-expanded]");
  const frame = card.locator("[data-project-image-frame]");
  await expect(frame).toHaveAttribute("aria-hidden", "true");
  await expect(card.getByRole("img")).toHaveCount(1);
  await expect(semantic).toHaveAccessibleName(project.alternative);
  await expect(image).toBeVisible();
  await frame.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(element => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  })).toBe(true);
  await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
  await expect(image.locator("..")).toHaveCSS("opacity", "1");
  const descriptions = await semantic.evaluate(element => (element.getAttribute("aria-describedby") ?? "").split(/\s+/)
    .map(id => document.getElementById(id)?.textContent ?? "").join(" "));
  const geometry = await image.evaluate(element => {
    const img = element as HTMLImageElement;
    const bounds = img.getBoundingClientRect();
    const card = img.closest("article")!.getBoundingClientRect();
    const style = getComputedStyle(img);
    return {
      path: new URL(img.currentSrc || img.src, location.href).pathname,
      naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
      width: bounds.width, height: bounds.height,
      contained: bounds.left >= card.left - 1 && bounds.right <= card.right + 1
        && bounds.top >= card.top - 1 && bounds.bottom <= card.bottom + 1,
      frameWidthDelta: Math.abs(bounds.width - card.width), frameHeightDelta: Math.abs(bounds.height - card.height),
      fit: style.objectFit, filter: style.filter, clip: style.clipPath, opacity: style.opacity,
    };
  });
  const mobile = width <= 450;
  expect(geometry.path).toBe(assetPath(project, mobile ? "expanded-mobile" : "expanded"));
  expect([geometry.naturalWidth, geometry.naturalHeight]).toEqual(mobile ? [640, 640] : [1168, 600]);
  expect(geometry.width).toBeGreaterThan(0);
  expect(geometry.height).toBeGreaterThan(0);
  expect(geometry.contained).toBe(true);
  expect(geometry.frameWidthDelta).toBeLessThanOrEqual(2);
  expect(geometry.frameHeightDelta).toBeLessThanOrEqual(2);
  // Expanded screenshots preserve their purpose-made frame. The organic
  // thumbnail is a deliberate detail crop, not this whole-image view.
  expect(geometry.fit).toBe("contain");
  expect(geometry.filter).toBe("none");
  expect(geometry.clip).toBe("none");
  expect(geometry.opacity).toBe("1");
  for (const text of project.context) expect(descriptions).toContain(text);
  if (project.id === "nepal-satellite-atlas") expect(descriptions).toContain(nepalCredit);
  if (project.id === "west-hawaii-heat-exposure") {
    expect(descriptions).toContain(hawaiiCredit);
    expect(descriptions).toContain("historical habitat mapped from 2004–06 imagery—not observed coral condition");
  }
  for (const text of project.context) await expect(card.locator("details > div > p")).toContainText(text);
}

// Retain NFA093's useful figure-label/alignment regression on the actual case
// comparison. Its two figures no longer belong to a rejected homepage carousel.
async function expectScientificLeadFigures(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready; });
  const figures = page.locator("#comparison figure[data-lead-figure]");
  const geometry = await figures.evaluateAll(nodes => nodes.map(figure => {
    const bounds = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height };
    };
    const caption = figure.querySelector("figcaption")!;
    return {
      cohort: figure.getAttribute("data-lead-figure"), figure: bounds(figure), svg: bounds(figure.querySelector("svg")!),
      title: caption.firstElementChild!.textContent, count: caption.lastElementChild!.textContent,
      labels: [...figure.querySelectorAll("span")].map(label => ({ text: label.textContent?.trim(), box: bounds(label), visibility: getComputedStyle(label).visibility })),
    };
  }));
  expect(geometry.map(item => item.cohort)).toEqual(["all", "purdue"]);
  expect(geometry.map(item => item.title)).toEqual(["The screened season", "Purdue's games"]);
  expect(geometry.map(item => item.count)).toEqual(["6,002 games · both sides", "30 games · both sides"]);
  for (const item of geometry) {
    expect(item.svg.width).toBeGreaterThan(0);
    expect(item.svg.height).toBeGreaterThan(0);
    expect(item.labels).toHaveLength(12); // Caption, two sides, 14/0/14 and five clock ticks.
    for (const label of item.labels) {
      expect(label.text).toBeTruthy();
      expect(label.visibility).toBe("visible");
      expect(label.box.width).toBeGreaterThan(0);
      expect(label.box.height).toBeGreaterThan(0);
      expect(label.box.left).toBeGreaterThanOrEqual(item.figure.left - 1);
      expect(label.box.right).toBeLessThanOrEqual(item.figure.right + 1);
      expect(label.box.top).toBeGreaterThanOrEqual(item.figure.top - 1);
      expect(label.box.bottom).toBeLessThanOrEqual(item.figure.bottom + 1);
    }
  }
  const [first, second] = geometry;
  if (page.viewportSize()!.width > 700) {
    expect(first.figure.right).toBeLessThanOrEqual(second.figure.left + 1);
    expect(Math.abs(first.figure.top - second.figure.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.svg.top - second.svg.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.svg.bottom - second.svg.bottom)).toBeLessThanOrEqual(1);
  } else {
    expect(first.figure.bottom).toBeLessThanOrEqual(second.figure.top + 1);
    expect(Math.abs(first.figure.left - second.figure.left)).toBeLessThanOrEqual(1);
  }
  for (const figure of await figures.all()) {
    await expect(figure.getByRole("img")).toHaveAccessibleName(/mean positive lead contributions across regulation.*Shared zero to 14 point scale/);
    expect(await figure.locator("svg path").evaluateAll(paths => paths.map(path => ({ fill: getComputedStyle(path).fill, stroke: getComputedStyle(path).stroke })))).toEqual([
      { fill: "rgb(117, 127, 100)", stroke: "rgb(72, 81, 63)" }, { fill: "rgb(92, 117, 122)", stroke: "rgb(49, 78, 84)" },
    ]);
  }
}

test("Biography-first discovery preserves contributions, skills and screenshot source boundaries", async ({ page }) => {
  await page.goto("/");
  const profile = page.getByRole("region", { name: "About Drew", exact: true });
  await expect(profile.getByRole("heading", { level: 1 })).toHaveText("Drew Baker.");
  await expect(profile.getByText(hero, { exact: true })).toBeVisible();
  await expect(profile.getByRole("heading", { name: "My background", exact: true })).toBeVisible();
  await expect(profile).toContainText(/studying artificial intelligence and machine learning at Purdue/);
  await expect(profile.getByRole("heading", { name: "My approach", exact: true })).toBeVisible();
  await expect(profile).toContainText("I set the direction, make product decisions and review the result.");
  await expect(profile).toContainText("Development is collaborative and includes Codex assistance.");
  await expect(page.getByRole("link", { name: "Drew Baker, home", exact: true })).toHaveAttribute("aria-current", "page");
  const selection = page.getByRole("region", { name: "Selected project previews", exact: true });
  await expect(selection.getByRole("article")).toHaveCount(3);
  expect(await selection.getByRole("heading", { level: 2 }).allTextContents()).toEqual(previews.map(project => project.title));
  await expect(page.locator("[data-project-carousel], [data-carousel-slide]")).toHaveCount(0);
  for (const project of previews) {
    const card = previewCard(page, project);
    await expect(card.getByText(project.contribution, { exact: true })).toBeVisible();
    await expect(card.getByRole("list", { name: "Relevant tools and skills", exact: true }).getByRole("listitem")).toHaveText([...project.skills]);
    await expect(card.getByRole("link", { name: `Explore ${project.title} project`, exact: true })).toHaveAttribute("href", `/work/${project.id}`);
    await expect(card.locator("details")).not.toHaveAttribute("open", "");
    await expect(card.locator("summary")).toHaveAccessibleName(`Expand image: ${project.title}`);
    const thumbnail = card.locator("[data-project-image-thumbnail]");
    await expect(thumbnail).toHaveAttribute("src", assetPath(project, "thumbnail"));
    await expect(thumbnail).toHaveAttribute("width", "320");
    await expect(thumbnail).toHaveAttribute("height", "380");
    await expect(thumbnail).toHaveAttribute("alt", "");
    await expect(card.locator("[data-project-image-frame]")).toHaveAttribute("aria-hidden", "true");
    await expect(card.locator("[data-project-image-semantic]")).toHaveAttribute("alt", project.alternative);
    await expect(card.getByRole("img")).toHaveCount(0);
  }
  await expect(previewCard(page, previews[0]).locator("[data-project-image-thumbnail]")).toHaveAttribute("fetchpriority", "high");
  const hawaiiFigure = previewCard(page, previews[1]).locator("..");
  await expect(hawaiiFigure.locator("figcaption")).toContainText(hawaiiCredit);
  await expect(hawaiiFigure.locator("figcaption")).toContainText("2004–06 imagery—not observed coral condition");
  const nepalFigure = previewCard(page, previews[2]).locator("..");
  await expect(nepalFigure.locator("figcaption")).toContainText(nepalCredit);
  await expect(nepalFigure.locator("figcaption")).toContainText("Cropped excerpts; full map, legend and scale remain on the project page.");
});

test("All-project discovery retains current-project qualifications and distinct flagship records", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.getByRole("navigation", { name: "More portfolio work", exact: true }).getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  const current = page.locator("#current-projects");
  const wildfire = current.getByRole("article").filter({ has: page.getByRole("heading", { name: "Wildfire Response", exact: true }) });
  for (const text of [/historical synthetic development fixture/i, /gameplay disabled/i, /AI-assisted terrain art/i]) await expect(wildfire.locator("figcaption")).toContainText(text);
  await expect(wildfire).toContainText("My contribution: product direction and playtest feedback, with Codex-assisted development.");
  const tip = current.getByRole("article").filter({ has: page.getByRole("heading", { name: "After the Tip", exact: true }) });
  for (const text of [/Local exploratory prototype; not submitted/i, /mean positive lead contributions/i, /30 Purdue games · both sides · regulation only/i, /Not an uncertainty band or team-strength comparison/i]) await expect(tip).toContainText(text);
  await expect(tip.locator('[data-lead-figure="purdue"] svg path')).toHaveCount(2);
  expect(await tip.locator("svg path").evaluateAll(paths => paths.map(path => ({ fill: getComputedStyle(path).fill, stroke: getComputedStyle(path).stroke })))).toEqual([
    { fill: "rgb(117, 127, 100)", stroke: "rgb(72, 81, 63)" },
    { fill: "rgb(92, 117, 122)", stroke: "rgb(49, 78, 84)" },
  ]);
  const reef = current.getByRole("article").filter({ has: page.getByRole("heading", { name: "Heat exposure across West Hawaiʻi reefs", exact: true }) });
  await expect(reef.locator("img")).toHaveCount(2);
  await expect(reef.locator("figcaption")).toContainText("heat-exposure maps, not coral-damage observations");
  const nepal = current.getByRole("article").filter({ has: page.getByRole("heading", { name: "Nepal Satellite Atlas", exact: true }) });
  await expect(nepal.locator("figcaption")).toContainText("unregistered visual experiment, not a mapped landslide result");
  await expect(nepal.locator("figcaption")).toContainText(nepalCredit);
  const flagships = page.locator('[data-work-lane="flagships"]');
  expect(await flagships.locator("[data-project-model-id]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-project-model-id")))).toEqual(["burnlens", "runbook-sentinel"]);
  const burnlens = flagships.locator('[data-project-model-id="burnlens"]');
  await expect(burnlens).toContainText("Public v0.56.0 research portfolio release");
  await expect(burnlens).toContainText("Codex led technical, product and reliability work within that direction.");
  await expect(burnlens.locator("[data-atlas-transect]")).toBeVisible();
  await expect(burnlens.locator("[data-control-rail], [data-authority-break]")).toHaveCount(0);
  const runbook = flagships.locator('[data-project-model-id="runbook-sentinel"]');
  await expect(runbook).toContainText("Released synthetic testbed · no real systems connected");
  await expect(runbook.locator("[data-control-rail]")).toHaveCount(2);
  await expect(runbook.locator("[data-authority-break]")).toBeVisible();
  await expect(runbook.locator("[data-atlas-transect]")).toHaveCount(0);
  for (const project of [burnlens, runbook]) {
    await project.locator("summary").click();
    await expect(project.locator("details")).toHaveAttribute("open", "");
    await expect(project.locator("dt")).toContainText(["Problem", "Intended reviewer"]);
    await expect(project.locator('[data-field-key="personalRole"]')).toBeVisible();
    await expect(project.locator('[data-field-key="limitations"]')).toBeVisible();
  }
  // The other current cases remain ordinary links from All projects; selected
  // previews are not the site's complete project roster.
  for (const id of ["wildfire-response", "west-hawaii-heat-exposure"] as const) {
    await page.goto("/work");
    await page.locator(`#current-projects a[href="/work/${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/work/${id}$`));
    await expect(page.locator("main h1")).toBeVisible();
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work/after-the-tip");
    await expectScientificLeadFigures(page);
  }
});

test("Actual screenshot previews decode in their purpose-made mobile and desktop frames at four widths", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(async () => { await document.fonts.ready; });
    for (const project of previews) {
      const card = previewCard(page, project);
      await expect(card.getByRole("heading", { level: 2 })).toBeVisible();
      const thumbnail = card.locator("[data-project-image-thumbnail]");
      await thumbnail.scrollIntoViewIfNeeded();
      await expect.poll(() => thumbnail.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth === 320)).toBe(true);
      await card.locator("summary").click();
      await expectScreenshot(page, project, width);
      if (width === 390 || width === 1440) await card.screenshot({ path: testInfo.outputPath(`${project.id}-${width}px-expanded.png`), animations: "disabled" });
      await card.locator("summary").click();
      await expect(card.locator("details")).not.toHaveAttribute("open", "");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`${width}px-biography-first.png`), fullPage: true, animations: "disabled" });
    }
  }
  expect(errors).toEqual([]);
});

test("Real keyboard journeys expand native previews, restore focus with Escape and reach each selected case", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const project of previews) {
      await page.goto("/");
      const card = previewCard(page, project);
      const summary = card.locator("summary");
      const details = card.locator("details");
      const explore = card.getByRole("link", { name: `Explore ${project.title} project`, exact: true });
      await tabTo(page, summary);
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("open", "");
      await expect(summary).toHaveAccessibleName(`Collapse ${project.title} image`);
      await expectScreenshot(page, project, width);
      await tabTo(page, explore);
      await page.keyboard.press("Escape");
      await expect(details).not.toHaveAttribute("open", "");
      await expect(card.getByRole("img")).toHaveCount(0);
      await expect(summary).toBeFocused();
      expect(await summary.evaluate(element => element.matches(":focus-visible"))).toBe(true);
      await page.keyboard.press("Space");
      await expect(details).toHaveAttribute("open", "");
      await page.keyboard.press("Space");
      await expect(details).not.toHaveAttribute("open", "");
      await tabTo(page, explore);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`/work/${project.id}$`));
      await expect(page.locator("main h1")).toBeVisible();
    }
    await page.goto("/");
    await tabTo(page, page.getByRole("navigation", { name: "More portfolio work", exact: true }).getByRole("link", { name: "All projects", exact: true }));
    await page.keyboard.press("Escape");
    await expect(page.getByRole("link", { name: "All projects", exact: true })).toBeFocused();
    await testInfo.attach(`${width}px-keyboard-escape-outside-preview`, { body: await page.screenshot({ animations: "disabled" }), contentType: "image/png" });
  }
});

test("Direct homepage journeys reach all projects, the other flagship, résumé, workbench and contact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const journey of [
    { name: "All projects", path: "/work" }, { name: "BurnLens case", path: "/work/burnlens" },
    { name: "My résumé", path: "/resume" }, { name: "Workbench", path: "/dashboard" },
  ]) {
    await page.goto("/");
    const link = page.locator("main").getByRole("link", { name: journey.name, exact: true });
    await expect(link).toHaveAttribute("href", journey.path);
    await tabTo(page, link);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${testOrigin}${journey.path}`);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await page.goto("/");
  const contact = page.getByRole("navigation", { name: "Résumé and contact", exact: true }).getByRole("link", { name: "Get in touch", exact: true });
  await tabTo(page, contact);
  await expect(contact).toHaveAttribute("href", "https://www.linkedin.com/in/william-baker-843946162/");
  // Check the public destination without navigating to a third-party profile.
});

test("Native previews, project journeys and the mobile menu remain usable without JavaScript", async ({ browser }, testInfo) => {
  test.setTimeout(90_000);
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width, height: 900 }, baseURL: testOrigin });
    try {
      const page = await context.newPage();
      const external = observeExternalRequests(page);
      for (const project of previews) {
        await page.goto("/");
        const card = previewCard(page, project);
        const summary = card.locator("summary");
        await tabTo(page, summary);
        await page.keyboard.press("Enter");
        await expect(card.locator("details")).toHaveAttribute("open", "");
        await expectScreenshot(page, project, width);
        await page.keyboard.press("Enter");
        await expect(card.locator("details")).not.toHaveAttribute("open", "");
        await tabTo(page, card.getByRole("link", { name: `Explore ${project.title} project`, exact: true }));
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(new RegExp(`/work/${project.id}$`));
        await page.getByRole("link", { name: "Drew Baker, home", exact: true }).click();
        await expect(page).toHaveURL(`${testOrigin}/`);
      }
      for (const [name, path] of [["All projects", "/work"], ["BurnLens case", "/work/burnlens"], ["Workbench", "/dashboard"]] as const) {
        await page.goto("/");
        await page.locator("main").getByRole("link", { name, exact: true }).click();
        await expect(page).toHaveURL(`${testOrigin}${path}`);
        if (path === "/dashboard") await expect(page.locator("[data-dashboard-project]")).toHaveCount(5);
      }
      await page.goto("/");
      if (width === 390) {
        const menu = page.locator(".mobile-menu");
        await tabTo(page, menu.locator("summary"));
        await page.keyboard.press("Enter");
        await expect(menu).toHaveAttribute("open", "");
        await tabTo(page, menu.getByRole("link", { name: "Work", exact: true }));
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/work$/);
        await expect(menu).not.toHaveAttribute("open", "");
        await page.goto("/");
        await menu.locator("summary").click();
        await menu.getByRole("link", { name: "Résumé", exact: true }).click();
      } else await page.locator("main").getByRole("link", { name: "My résumé", exact: true }).click();
      await expect(page).toHaveURL(/\/resume$/);
      await page.goto("/");
      await expect(page.getByRole("link", { name: "Get in touch", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/william-baker-843946162/");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${width}px-native-no-js.png`), fullPage: true, animations: "disabled" });
      expect(external).toEqual([]);
    } finally { await context.close(); }
  }
});

test("Reduced-motion reading keeps local resources, accurate metadata and no autoplay media", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const external = observeExternalRequests(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  for (const project of previews) {
    await previewCard(page, project).locator("summary").click();
    await expectScreenshot(page, project, page.viewportSize()!.width);
  }
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.locator("main *").evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration].every(value => value.split(",").every(duration => Number.parseFloat(duration) <= .01));
  }))).toBe(true);
  await expect(page.locator("main audio, main video, main canvas, main iframe")).toHaveCount(0);
  await expect(page).toHaveTitle("Drew Baker | Software, maps & interactive experiences");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", siteOrigin);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", expectedIndexable ? /^index, follow$/ : /^noindex, nofollow$/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Drew Baker Portfolio");
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute("content", /software.*maps.*interactive experiences.*Codex-assisted development/i);
    await expect(page.locator(selector)).not.toHaveAttribute("content", /inspectable software systems|evidence-bound systems/i);
  }
  const person = JSON.parse(await page.locator('main script[type="application/ld+json"]').textContent() ?? "{}");
  expect(person).toMatchObject({ "@type": "Person", name: "William (Drew) Baker", alternateName: "Drew Baker", url: siteOrigin });
  expect(person).toHaveProperty("sameAs", ["https://github.com/drwbkr1", "https://www.linkedin.com/in/william-baker-843946162/"]);
  expect(person.knowsAbout).toEqual(["software development", "product direction", "geospatial analysis", "data visualization", "interactive experiences"]);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("Closed previews, each expanded screenshot and the native mobile menu have no automated WCAG violations", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const audit = async (state: string) => {
      const result = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(result.violations, `${width}px ${state}`).toEqual([]);
      // Retain unresolved automated checks for manual review; no suppressed rules
      // or claim that an automated scan establishes complete accessibility.
      await testInfo.attach(`${width}px-${state}-axe-incomplete`, { body: JSON.stringify(result.incomplete, null, 2), contentType: "application/json" });
    };
    await audit("closed");
    for (const project of previews) {
      const card = previewCard(page, project);
      await card.locator("summary").click();
      await expectScreenshot(page, project, width);
      await audit(`${project.id}-expanded`);
      await card.locator("summary").click();
    }
    if (width === 390) {
      await page.locator(".mobile-menu summary").click();
      await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toBeVisible();
      await audit("mobile-menu-open");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${width}px-accessible-home.png`), fullPage: true, animations: "disabled" });
  }
});
