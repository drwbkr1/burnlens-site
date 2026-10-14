import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getProjectSource,
  projectHierarchy,
  projectRecords,
  projectSurfacePlan,
  targetSurfaceHierarchy,
  toReaderFirst,
} from "../content/project-model.ts";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function read(path) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

function requireText(source, value, location) {
  assert.ok(source.includes(value), `${location} must include ${JSON.stringify(value)}.`);
}

function requireCompactedText(source, value, location) {
  const compactSource = source.replace(/\s+/g, " ");
  assert.ok(compactSource.includes(value), `${location} must include ${JSON.stringify(value)}.`);
}

function reject(source, pattern, location, reason) {
  assert.doesNotMatch(source, pattern, `${location}: ${reason}`);
}

const homePath = "app/page.tsx";
const workPath = "app/work/page.tsx";
const homeCssPath = "app/home.module.css";
const workCssPath = "app/work/work-index.module.css";
const home = read(homePath);
const work = read(workPath);
const homeCss = read(homeCssPath);
const workCss = read(workCssPath);
const carouselPath = "components/ProjectCarousel.tsx";
const carouselCssPath = "components/ProjectCarousel.module.css";
const carousel = read(carouselPath);
const carouselCss = read(carouselCssPath);
const globals = read("app/globals.css");
const packageJson = JSON.parse(read("package.json"));
const publicAllowlist = JSON.parse(read("scripts/public-candidate-allowlist.json"));

const expectedHierarchy = {
  flagship: ["burnlens", "runbook-sentinel"],
  supporting: ["quest-craft", "openclaw-showcase"],
  archive: [
    "hierarchical-clustering",
    "energy-sector-data-governance",
    "der-dcp",
  ],
};
assert.deepEqual(projectHierarchy, expectedHierarchy, "Canonical three-lane project hierarchy drifted.");
assert.deepEqual(targetSurfaceHierarchy.homepage, {
  flagshipProjectIds: expectedHierarchy.flagship,
  supportingProjectIds: expectedHierarchy.supporting,
  archiveProjectIds: [],
}, "Homepage project hierarchy drifted.");
assert.deepEqual(
  Object.fromEntries(
    Object.entries(targetSurfaceHierarchy.workIndex).map(([lane, value]) => [lane, value.projectIds]),
  ),
  {
    flagships: expectedHierarchy.flagship,
    "supporting-notes": expectedHierarchy.supporting,
    "historical-reading-shelf": expectedHierarchy.archive,
  },
  "Work-index lane membership drifted.",
);

const exactWorkIndexFields = {
  burnlens: ["problem", "intendedUser", "personalRole", "decisionSupported", "outcome", "limitations", "maturity"],
  "runbook-sentinel": ["problem", "intendedUser", "personalRole", "decisionSupported", "stack", "outcome", "limitations", "maturity"],
  "quest-craft": ["problem", "intendedUser", "personalRole", "decisionSupported", "testStrategy", "outcome", "limitations", "maturity"],
  "openclaw-showcase": ["problem", "decisionSupported", "personalRole", "implementation", "stack", "outcome", "limitations", "maturity"],
};
for (const [projectId, fields] of Object.entries(exactWorkIndexFields)) {
  assert.deepEqual(
    projectSurfacePlan[projectId].fields.workIndex,
    fields,
    `${projectId}: work-index field projection drifted.`,
  );
  for (const field of fields) {
    assert.equal(
      projectRecords[projectId].evidence[field].state,
      "supported",
      `${projectId}.${field}: a projected work-index field must remain supported.`,
    );
  }
}

const featuredTargets = {
  "runbook-sentinel": ["RS.F03"],
};
for (const [projectId, caseTargets] of Object.entries(featuredTargets)) {
  assert.deepEqual(
    projectSurfacePlan[projectId].featuredFailureIds.homepage,
    [],
    `${projectId}: failure evidence must remain in the full case, not dominate the homepage.`,
  );
  assert.deepEqual(
    projectSurfacePlan[projectId].featuredFailureIds.workIndex,
    [],
    `${projectId}: the work index must not repeat a featured failure.`,
  );

  const failureField = projectRecords[projectId].evidence.failureDividend;
  assert.equal(failureField.state, "supported", `${projectId}: failure evidence is not supported.`);
  assert.ok(projectSurfacePlan[projectId].featuredFailureIds.projectRoute.includes(caseTargets[0]),
    `${projectId}: the removed homepage feature must remain in the full case.`);
  const selected = failureField.value.find((failure) => failure.id === caseTargets[0]);
  assert.ok(selected, `${projectId}: preserved case failure is absent.`);
  assert.equal(selected.featured, true, `${selected.id}: the preserved evidence feature flag changed.`);
  for (const stage of ["failure", "buildChange", "earnedCapability", "boundary"]) {
    assert.equal(typeof selected[stage], "string", `${selected.id}.${stage}: value is absent.`);
    assert.ok(selected[stage].trim().length > 0, `${selected.id}.${stage}: value is empty.`);
  }
  assert.ok(
    selected.sourceIds.some((sourceId) => {
      const source = getProjectSource(sourceId);
      return source.availability === "public" && "href" in source;
    }),
    `${selected.id}: at least one public, linkable source is required.`,
  );
  const firstPublicSourceId = selected.sourceIds.find((sourceId) => {
    const source = getProjectSource(sourceId);
    return source.availability === "public" && "href" in source;
  });
  assert.equal(
    firstPublicSourceId,
    "rs.model_comparison.0018",
    `${selected.id}: the first public source projection drifted.`,
  );
}
assert.deepEqual(projectSurfacePlan.burnlens.featuredFailureIds.homepage, []);
assert.deepEqual(projectSurfacePlan.burnlens.featuredFailureIds.workIndex, []);
assert.equal(projectRecords.burnlens.evidence.failureDividend.state, "not_applicable");

for (const [path, source] of [[homePath, home], [workPath, work]]) {
  assert.match(
    source,
    /from\s+["']@\/content\/project-model["']/,
    `${path} must consume the canonical project model directly.`,
  );
  reject(source, /\ballPublishedWork\b|\bprojects\.secondary\b/, path,
    "legacy aggregate projections are forbidden on the front door");
  reject(source, /const\s+(?:burnlens|runbook(?:Sentinel)?|questCraft|openclaw)\s*=\s*\{/i, path,
    "route-local duplicate project facts are forbidden");
  reject(source, /^(?:["'])use client(?:["']);/m, path, "the page must remain a server component");
  reject(source, /\b(?:useState|useEffect|useLayoutEffect|useReducer|useRef)\s*\(/, path,
    "client hooks are forbidden");
  reject(source, /<\s*(?:canvas|video|audio)\b|\bautoPlay\b|addEventListener\s*\(\s*["']scroll/i, path,
    "canvas, autoplay media, and scroll handlers are forbidden");
}
reject(home, /@\/content\/projects/, homePath, "the homepage must use only the canonical model");
assert.match(
  work,
  /import\s*\{\s*historicalCoursework\s*\}\s*from\s*["']@\/content\/projects["'];/,
  `${workPath}: only the reader-first historical shelf may use the legacy content projection.`,
);
const legacyWorkImports = [...work.matchAll(
  /import\s*\{([^}]*)\}\s*from\s*["']@\/content\/projects["']/g,
)].flatMap((match) => match[1].split(",").map((name) => name.trim()).filter(Boolean));
assert.deepEqual(
  legacyWorkImports,
  ["historicalCoursework"],
  `${workPath}: no designed-lane symbol may come from the legacy content projection.`,
);

requireText(home, 'import styles from "./home.module.css";', homePath);
requireText(work, 'import styles from "./work-index.module.css";', workPath);
for (const [path, source] of [[homePath, home], [workPath, work]]) {
  requireText(source, "className={styles.", path);
}

for (const [pattern, reason] of [
  [/HistoricalCourseworkShelf/, "the complete historical shelf belongs only on /work"],
  [/dashboard-baseline-0020\.png|ward-creek-overlay\.png/, "case-study raster evidence must not be promoted to the homepage"],
  [/flagship-media|image-card|media-card/i, "generic image-card markup is forbidden"],
]) {
  reject(home, pattern, homePath, reason);
}

const exactHomeCopy = [
  "Software · maps · interactive experiences",
  "I turn data and complex ideas ",
  "usable software.",
  "How I work",
  "Release details",
  "Follow the work.",
  "Open project dashboard",
];
for (const value of exactHomeCopy) requireText(home, value, homePath);
requireCompactedText(home,
  "My work brings together software, maps and interactive experiences.", homePath);
assert.match(home, /I set the direction[\s\S]*product decisions[\s\S]*Codex/,
  `${homePath}: direction, decisions, and Codex assistance must remain explicit.`);
requireText(home, '<nav className={styles.actions} aria-label="Primary actions">', homePath);
reject(
  home,
  /<div\b(?=[^>]*className=\{styles\.actions\})(?=[^>]*aria-label=["']Primary actions["'])[^>]*>/,
  homePath,
  "the named primary-action group must remain a navigation landmark, not a labeled generic div",
);
// NFA073 intentionally replaces the long spread/current-project side index with
// one SSR six-card selection. The immutable NFA073 baseline retains old gates.
requireText(home, 'import { ProjectCarousel } from "@/components/ProjectCarousel";', homePath);
requireText(home, "<ProjectCarousel projectNames={projectNames}>", homePath);
requireText(home, "</ProjectCarousel>", homePath);
const carouselIds = ["wildfire-response", "after-the-tip", "west-hawaii-heat-exposure", "nepal-satellite-atlas", "burnlens", "runbook-sentinel"];
assert.deepEqual([...home.matchAll(/data-carousel-slide="([^"]+)"/g)].map(match => match[1]), carouselIds,
  "The exact six approved carousel cards and order must remain.");
assert.equal((home.match(/data-current-project=/g) ?? []).length, 4,
  `${homePath}: exactly the four approved current cases must be represented.`);
const cards = home.slice(home.indexOf("<ProjectCarousel "), home.indexOf("</ProjectCarousel>"));
assert.equal((cards.match(/data-contribution(?:\s|>)/g) ?? []).length, 6,
  `${homePath}: each current and flagship card requires its own contribution paragraph.`);
const exactContributions = [
  "A cooperative browser game about protecting a community with limited resources. I shaped the product direction and used my first playtest to refine the map, controls and consequences.",
  "I redirected a score catalogue into a shared-clock comparison of Purdue’s games and a screened NCAA season, refining the question and sound direction.",
  "I framed an environmental question and worked through GIS choices to compare satellite heat exposure over historical reef habitat. The saved comparison challenged my starting hypothesis.",
  "I defined an ArcGIS atlas I could open, compare and export, then guided its maps and browser presentation.",
  "I set the audience and public story for an experimental computer-vision and geospatial project, then owned the publication decisions.",
  "I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act, and owned its release.",
];
assert.deepEqual([...cards.matchAll(/<p[^>]*data-contribution>([^<]+)<\/p>/g)].map(match => match[1]), exactContributions,
  "All six NFA070 contribution paragraphs must stay exact and ordered.");
for (const projectId of carouselIds.slice(0, 4)) {
  requireText(home, `data-current-project="${projectId}"`, homePath);
  requireText(home, `href="/work/${projectId}"`, homePath);
}
for (const value of [
  "/media/projects/wildfire-response/planning-v027.jpg",
  'width={1279} height={631} unoptimized',
  "Historical Wildfire Response planning screen with a terrain map, community sites and resource controls.",
  "Historical v0.27 synthetic development fixture · gameplay disabled · AI-assisted terrain art.",
  '<LeadFigure cohort="purdue" compact /><LeadFigure cohort="all" compact />',
  "Mean positive lead contribution · points per game · regulation only. Descriptive means, not confidence intervals. Purdue’s games are included in the season; the above/below orientations differ, not a team-strength comparison.",
  "/media/projects/west-hawaii-heat-exposure/heat-exposure-2015.svg",
  "/media/projects/west-hawaii-heat-exposure/heat-exposure-2019.svg",
  "2015 saved coastal grid: assessed habitat cells share the highest annual peak heat-stress class; unavailable cells are hatched.",
  "2019 saved coastal grid: the same historical habitat has a mix of annual peak heat-stress classes; unavailable cells are hatched.",
  "Saved data-only redraws · annual peak satellite heat exposure over historical habitat—not observed reef condition. Read the full maps and NOAA source credits in the case study.",
  "/media/projects/nepal-satellite-atlas/dated-radar-atlas.png",
  'width={1560} height={1020} unoptimized',
  "Full paired radar atlas for 16 and 28 August 2026, with a shared display scale, dates, partial coverage and source credits.",
  "Unregistered visual experiment—not a mapped landslide result.",
  "ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA.",
  "<AtlasFigure />",
  "<ControlTraceFigure />",
]) requireText(cards, value, `${homePath} exact source visuals`);
assert.equal((cards.match(/width=\{480\} height=\{1160\} unoptimized/g) ?? []).length, 2,
  "Both reef redraws must retain their original intrinsic dimensions.");
assert.equal((cards.match(/<ReleaseDetails projectId=/g) ?? []).length, 2,
  "Both native source-bound flagship details must remain.");
for (const value of ["data-atlas-grid", "data-atlas-transect", "data-atlas-legend", "data-control-rail", "data-authority-break",
  "A field-atlas reading: the release, later evidence snapshot, and use boundary stay distinct",
  "Two rails meet at an explicit authority break; model output never becomes permission."]) {
  requireText(home, value, homePath);
}
requireText(home, 'href="/dashboard"', homePath);
assert.match(carousel, /^"use client";/, `${carouselPath}: only the interactive wrapper is a client component.`);
reject(carousel, /@\/content\/|getProject|LeadFigure|next\/image|fetch\s*\(|localStorage|setInterval|setTimeout|autoPlay|autoplay/i,
  carouselPath, "the wrapper must not import project/source data, fetch, store user data, rotate automatically or own evidence visuals");
requireText(carousel, "{children}", carouselPath);
requireText(carousel, 'id="selected-work"', carouselPath);
requireText(carousel, "data-current-work data-front-door-flagships data-project-carousel", carouselPath);
requireText(carousel, 'aria-roledescription="carousel"', carouselPath);
requireText(carousel, 'tabIndex={0}', carouselPath);
requireText(carousel, 'aria-live="polite" aria-atomic="true" hidden', carouselPath);
requireText(carousel, 'aria-label="Previous project"', carouselPath);
requireText(carousel, 'aria-label="Next project"', carouselPath);
requireText(carousel, 'href="/work"', carouselPath);
requireText(carousel, "if (event.target !== track) return;", carouselPath);
requireText(carousel, "Math.max(0, Math.min(cards.length - 1, index))", carouselPath);
requireText(carousel, 'matchMedia("(prefers-reduced-motion: reduce)")', carouselPath);
requireText(carousel, 'behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"', carouselPath);
for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) requireText(carousel, key, carouselPath);
reject(carousel, /(?:window|document)\.addEventListener\s*\(\s*["'](?:scroll|wheel|keydown|pointermove|mousemove)/,
  carouselPath, "carousel input must remain local; no page scroll hijack or cursor tracking");
requireText(carouselCss, "overflow-x: auto", carouselCssPath);
requireText(carouselCss, "scroll-snap-type: x mandatory", carouselCssPath);
requireText(carouselCss, "scroll-snap-align: center", carouselCssPath);
requireText(carouselCss, ".controls[hidden], .position[hidden] { display: none; }", carouselCssPath);
reject(home, /data-featured-turn|data-turn-copy|data-turn-boundary|9 of 84/, homePath,
  "failure metrics belong in the full case, not the contribution-first homepage");
requireText(work, "Software systems, focused field notes, and work in progress.", workPath);
requireCompactedText(work,
  "BurnLens and Runbook Sentinel remain the two established flagships.", workPath);
const workMetadataTitle = "Selected work | Drew Baker";
const workMetadataDescription =
  "Software systems, product decisions, current projects and a historical reading shelf.";
const workMetadataStart = work.indexOf("export const metadata: Metadata = {");
const workMetadataEnd = work.indexOf("const flagships =");
assert.ok(workMetadataStart >= 0 && workMetadataEnd > workMetadataStart,
  `${workPath}: static metadata boundaries are absent or out of order.`);
const workMetadata = work.slice(workMetadataStart, workMetadataEnd);
for (const value of [
  'url: "/work"',
  'siteName: "Drew Baker Portfolio"',
  'type: "website"',
  'images: [{ url: "/opengraph-image", width: 1200, height: 630 }]',
  'card: "summary_large_image"',
  'images: ["/opengraph-image"]',
]) {
  requireText(workMetadata, value, `${workPath} metadata`);
}
assert.equal(
  workMetadata.split(`title: "${workMetadataTitle}"`).length - 1,
  2,
  `${workPath}: Open Graph and Twitter must retain the same route-specific title.`,
);
assert.equal(
  workMetadata.split(workMetadataDescription).length - 1,
  2,
  `${workPath}: Open Graph and Twitter must retain the same route-specific description.`,
);
assert.equal(
  workMetadata.split("/opengraph-image").length - 1,
  2,
  `${workPath}: Open Graph and Twitter must reuse only the root social image.`,
);
assert.equal(
  (workMetadata.match(/\bimages\s*:/g) ?? []).length,
  2,
  `${workPath}: only the exact Open Graph and Twitter image declarations are allowed.`,
);
reject(workMetadata, /https?:\/\/|new\s+URL\s*\(/i, `${workPath} metadata`,
  "route social metadata must remain host-neutral and reuse the existing root asset");
for (const [path, source] of [[homePath, home], [workPath, work]]) {
  requireText(source, "toReaderFirst", path);
  reject(source, /function\s+readerFirst\s*\(/, path, "reader-first copy must stay in the canonical model layer");
}
assert.equal(toReaderFirst("9 of 84 valid outputs"), "9 of 84 outputs that passed the required structure");
assert.equal(toReaderFirst("JSON and JSONL traces"), "JSON records and chained event logs");
assert.doesNotMatch(toReaderFirst("MCP server"), /\bMCP\b/);

for (const clause of [
  "Energy is historical governance context and a direction of interest",
  "not evidence of an implemented energy system",
  "electrical engineering, controls, embedded",
  "power-systems, or hardware implementation experience",
]) {
  requireCompactedText(work, clause, workPath);
}
reject(home, /(?:I (?:build|built|design|designed|engineer)|my (?:implemented|proven))[^<.]{0,80}(?:electrical|embedded|power-system|hardware)/i,
  homePath, "the constructive homepage must not imply unsupported EE or hardware implementation");
assert.match(work, /Public reviewer snapshot[\s\S]*private stack[\s\S]*general[\s-]+child[\s-]+safety/i,
  `${workPath}: Quest Craft public/private/safety boundary remains mandatory on its work-index destination.`);
assert.match(work, /Public documentation artifact[\s\S]*private runtime[\s\S]*not inspected or\s*evaluated[\s\S]*no runtime capability, intended user, or failure dividend/i,
  `${workPath}: OpenClaw disclosure remains mandatory on its work-index destination.`);

for (const value of [
  'data-flagship-teaser="burnlens"',
  'data-flagship-teaser="runbook-sentinel"',
  "data-visual-world={burnlens.visualWorld}",
  "data-visual-world={runbook.visualWorld}",
  "data-portfolio-making",
  'data-orchestration-marker="D.01"',
  'data-orchestration-marker="C.01"',
  "data-home-project-details",
]) {
  requireText(home, value, homePath);
}
assert.match(
  home,
  /data-portfolio-making[\s\S]*data-orchestration-marker="D\.01"[\s\S]*data-orchestration-marker="C\.01"[\s\S]*data-source-id="burnlens-pinned-tree"[\s\S]*data-source-id="burnlens-release"/,
  `${homePath}: human direction, Codex assistance, and retained public build/release source topology drifted.`,
);
assert.equal((home.match(/data-orchestration-marker=/g) ?? []).length, 2,
  `${homePath}: the working-method section must keep the concise two-role split.`);
assert.ok(home.indexOf("</ProjectCarousel>") < home.indexOf("data-portfolio-making"),
  `${homePath}: the working method must follow the selected project stories.`);
requireText(home, "https://github.com/drwbkr1/burnlens-deschutes/blob/a741111d82e69689022d2058118ed8f4b9bf3546/records/prompt-build-log/2026-07-27-p6o1-t02.md#L26-L69", homePath);
assert.equal(getProjectSource("burnlens-release").href,
  "https://github.com/drwbkr1/burnlens-deschutes/releases/tag/v0.56.0-baseline-first-portfolio-release");
reject(home, /BL\.F0[1-3]|burnlens-(?:report|failure-record|media-manifest)/, homePath,
  "held BurnLens failures and governed-evidence sources must not return to the homepage");
for (const value of [
  'data-work-lane="flagships"',
  'data-work-lane="supporting-notes"',
  'data-work-lane="historical-reading-shelf"',
  "data-work-entry",
  "data-work-ordinal",
  "data-work-facts",
  "data-method-list",
  'data-field-key="problem"',
  'data-field-key="intendedUser"',
  'data-field-key="personalRole"',
  'data-field-key="decisionSupported"',
  'data-field-key="implementation"',
  'data-field-key="stack"',
  'data-field-key="testStrategy"',
  'data-field-key="outcome"',
  'data-field-key="limitations"',
  'data-field-key="maturity"',
  "data-atlas-grid",
  "data-atlas-transect",
  "data-control-rail",
  "data-authority-break",
  'data-capability-boundary="energy-ee"',
]) {
  requireText(work, value, workPath);
}
reject(work, /data-featured-turn|featuredFailureIds|failureDividend/, workPath,
  "the work index must not duplicate homepage failure turns");
requireText(work, '<dt>{project.id === "burnlens" ? "Role split" : "My role"}</dt>', workPath);
requireCompactedText(work,
  "Each row states the problem, role, supported decision or result, and limits before it asks you to open the full evidence narrative.",
  workPath);
reject(work, /Each row[^<]*\bthe methods\b/s, workPath,
  "the shared introduction must not promise methods that the BurnLens row does not present");

for (const [path, css] of [[homeCssPath, homeCss], [workCssPath, workCss], [carouselCssPath, carouselCss]]) {
  requireText(css, "var(--color-ink)", path);
  requireText(css, "var(--color-rule)", path);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, `${path}: reduced-motion treatment is required.`);
  assert.match(css, /@media\s+print/, `${path}: print treatment is required.`);
  reject(css, /url\s*\(/i, path, "front-door visual worlds must not smuggle in raster or remote background assets");
  reject(css, /#[0-9a-f]{3,8}\b|rgba?\s*\(/i, path, "route-local color literals are forbidden; use semantic tokens or preserved source-display primitives");
}
requireText(homeCss, "var(--color-page)", homeCssPath);
requireText(workCss, "var(--color-page)", workCssPath);
assert.match(homeCss, /\.atlas[A-Za-z0-9_-]*/, `${homeCssPath}: atlas selectors are required.`);
assert.match(homeCss, /\.making[A-Za-z0-9_-]*/, `${homeCssPath}: concise ownership selectors are required.`);
assert.match(homeCss, /\.(?:control|rail|breaker)[A-Za-z0-9_-]*/, `${homeCssPath}: control-trace selectors are required.`);
assert.match(globals, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--color-focus\)/s,
  "The shared high-contrast focus role must serve both front-door routes and all carousel controls.");
assert.match(homeCss, /\.controlRail\s+li\s+span\s*\{(?=[^}]*background:\s*var\(--color-page\)\s*;)(?=[^}]*color:\s*var\(--color-accent\)\s*;)[^}]*\}/,
  `${homeCssPath}: small diagram markers require an opaque contrasting local surface.`);
assert.match(homeCss, /\.reefMaps\s*\{(?=[^}]*background:\s*var\(--white\))(?=[^}]*color:\s*var\(--charcoal\))[^}]*\}/,
  `${homeCssPath}: source reef maps keep a neutral white/dark display, separate from the night theme.`);
assert.match(homeCss, /\.projectMedia\s+img\s*\{[^}]*height:\s*auto[^}]*object-fit:\s*contain/s,
  `${homeCssPath}: source images require whole-image containment and intrinsic proportional sizing.`);
const imageDeclarations = homeCss.match(/\.projectMedia\s+img\s*\{([^}]+)\}/)?.[1] ?? "";
for (const property of ["filter", "clip-path", "transform"]) {
  const value = imageDeclarations.match(new RegExp(`${property}:\\s*([^;]+)`))?.[1].trim();
  assert.ok(value === undefined || value === "none",
    `${homeCssPath}: scientific/source image ${property} must be absent or none.`);
}
requireText(homeCss, "animation: typeArrival 700ms", homeCssPath);
assert.match(homeCss, /@keyframes\s+typeArrival\s*\{[^]*?from\s*\{[^}]*transform:[^}]*\}[^]*?to\s*\{[^}]*transform:/,
  `${homeCssPath}: the selected finite, fully visible kinetic headline treatment must remain.`);
reject(homeCss, /@keyframes\s+typeArrival[^]*?opacity\s*:\s*0/,
  homeCssPath, "kinetic typography must not withhold the meaningful opening");
assert.match(workCss, /\.atlas[A-Za-z0-9_-]*/, `${workCssPath}: atlas selectors are required.`);
assert.match(workCss, /\.(?:control|rail|breaker)[A-Za-z0-9_-]*/,
  `${workCssPath}: control-trace selectors are required.`);
assert.match(workCss, /:focus-visible[^}]*\{[^}]*outline[^}]*var\(--color-focus\)/s,
  `${workCssPath}: dark-surface focus must use the semantic focus role.`);
assert.match(
  workCss,
  /\.workFacts\s+ul\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(15rem,\s*100%\),\s*1fr\)\)\s*;/,
  `${workCssPath}: method tiles must adapt rather than clip at text zoom.`,
);
assert.match(
  workCss,
  /\.historyList\s+article\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.45fr\)\s+minmax\(0,\s*0\.85fr\)\s+minmax\(0,\s*1\.1fr\)\s+minmax\(0,\s*0\.45fr\)\s*;/,
  `${workCssPath}: historical rows must use flexible zero-minimum tracks.`,
);
assert.match(
  workCss,
  /\.historyMeta\s+p\s*\{[^}]*overflow-wrap:\s*anywhere\s*;/,
  `${workCssPath}: long historical metadata must wrap inside its flexible track.`,
);
reject(
  workCss,
  /\.workFacts\s+ul\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  workCssPath,
  "the clipped fixed two-column method grid must not return",
);
reject(
  workCss,
  /\.historyList\s+article\s*\{[^}]*grid-template-columns:\s*minmax\(9rem,/,
  workCssPath,
  "fixed-rem historical tracks must not return",
);

assert.equal(
  packageJson.scripts["verify:front-door-u04"],
  "node --experimental-strip-types scripts/verify-front-door-u04.mjs",
  "package.json must expose the U04 verifier.",
);
assert.match(
  packageJson.scripts.check,
  /verify:runbook-u03\s+&&\s+npm run verify:front-door-u04\s+&&\s+npm run verify:quest-u05\s+&&\s+npm run verify:openclaw-u06\s+&&\s+npm run verify:media/,
  "The U04 verifier must run after Runbook and before the Quest, OpenClaw, and media verification gates.",
);
assert.equal(
  packageJson.scripts.verify,
  "npm run check && npm run test:site",
  "The integrated verify command must retain the browser suite after static checks.",
);
for (const requiredPath of [
  homePath,
  homeCssPath,
  workPath,
  workCssPath,
  "scripts/verify-front-door-u04.mjs",
  "tests/portfolio.spec.ts",
  "tests/homepage-contributions.spec.ts",
  carouselPath,
  carouselCssPath,
]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from the explicit public files.`);
}
assert.ok(
  publicAllowlist.script_files.includes("scripts/verify-front-door-u04.mjs"),
  "The U04 verifier is absent from script_files.",
);

console.log(JSON.stringify({
  status: "passed",
  hierarchy: expectedHierarchy,
  homepageFeaturedFailures: [],
  workIndexFeaturedFailures: [],
  currentCases: carouselIds.slice(0, 4),
  carouselCases: carouselIds,
  presentationMigration: "NFA073 owner-selected manual carousel; source claims and core journeys retained",
  orchestrationMarkers: ["D.01", "C.01"],
  visualWorlds: ["field-atlas", "control-trace"],
  rasterFlagshipTeasers: 0,
  frontDoorConsumers: [homePath, workPath],
}));
