import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
const homeCssPath = "components/home/homepage.module.css";
const workCssPath = "app/work/work-index.module.css";
const home = read(homePath);
const work = read(workPath);
const homeCss = read(homeCssPath);
const workCss = read(workCssPath);
const nativePath = "components/home/PersonalFieldAtlas.tsx";
const revealPath = "components/home/ProjectImageReveal.tsx";
const previewDataPath = "components/home/projects.ts";
const nativeHome = read(nativePath);
const reveal = read(revealPath);
const previewData = read(previewDataPath);
const homepageProjects = (await import("../components/home/projects.ts")).homepageProjects;
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
  if (path === workPath) assert.match(source, /from\s+["']@\/content\/project-model["']/,
    "The work index must consume the canonical project model directly.");
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
reject(home + nativeHome + previewData, /@\/content\/projects/, homePath,
  "The selected homepage must not reintroduce the legacy aggregate projection.");
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

requireText(work, 'import styles from "./work-index.module.css";', workPath);
requireText(work, "className={styles.", workPath);

// NFA106: native screenshot selection replaces the carousel presentation only.
// Canonical project classification, work-index records and case boundaries stay below.
requireText(home, 'import { PersonalFieldAtlas } from "@/components/home/PersonalFieldAtlas";', homePath);
requireText(home, "<PersonalFieldAtlas>", homePath);
requireText(home, "</PersonalFieldAtlas>", homePath);
requireText(home, 'title: { absolute: title }', homePath);
requireText(home, 'alternates: { canonical: "/" }', homePath);
for (const value of ["Software, maps & interactive experiences", "product direction, research and Codex-assisted development.",
  'url: "/"', 'siteName: "Drew Baker Portfolio"', 'type: "website"',
  'images: [{ url: "/opengraph-image", width: 1200, height: 630 }]',
  'card: "summary_large_image"', 'images: ["/opengraph-image"]',
  '"@type": "Person"', 'name: "William (Drew) Baker"', 'alternateName: "Drew Baker"',
  "url: getSiteOrigin()", "JSON.stringify(personSchema).replace(/</g,",
]) requireText(home, value, homePath);
for (const [path, source] of [[homePath, home], [nativePath, nativeHome], [previewDataPath, previewData]]) {
  reject(source, /ProjectCarousel|data-carousel-slide|aria-roledescription=["'](?:carousel|slide)["']/,
    path, "The selected front door must not import, hide behind or require a carousel.");
  reject(source, /^(?:["'])use client(?:["']);/m, path,
    "Homepage composition and data must remain server-renderable.");
}
for (const value of ['id="main-content"', 'aria-label="About Drew"', "<h1>Drew Baker.</h1>",
  "I turn data and complex ideas into usable software.",
  "My work brings together software, maps and interactive experiences.",
  "I shape the question, decide what the result needs to do and refine it through use.",
  "I’m studying artificial intelligence and machine learning at Purdue",
  "I set the direction, make product decisions and review the result.",
  "Development is collaborative and includes Codex assistance.",
  'aria-label="Résumé and contact"', 'href="/resume"',
  'href="https://www.linkedin.com/in/william-baker-843946162/"',
  'aria-label="Selected project previews"', "homepageProjects.map((project) => <ProjectImageReveal",
  'aria-label="More portfolio work"', 'href="/work"', 'href="/work/burnlens"', 'href="/dashboard"',
]) requireText(nativeHome, value, nativePath);
requireText(nativeHome, 'import { homepageProjects } from "./projects";', nativePath);
requireText(nativeHome, 'import styles from "./homepage.module.css";', nativePath);
requireText(reveal, 'import styles from "./homepage.module.css";', revealPath);
for (const [path, source] of [[nativePath, nativeHome], [previewDataPath, previewData]]) {
  reject(source, /HistoricalCourseworkShelf|allPublishedWork|projects\.secondary/, path,
    "Archive material must remain on the work index.");
}
const expectedPreviews = [
  { title:"Runbook Sentinel", href:"/work/runbook-sentinel", skills:["Python","SQLite","API design"],
    description:"I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act.",
    files:["runbook-interface-thumbnail-v2.webp","runbook-interface-expanded-v2.webp","runbook-interface-expanded-mobile-v2.webp"],
    surface:"#09111e" },
  { title:"West Hawaiʻi heat", href:"/work/west-hawaii-heat-exposure", skills:["ArcGIS Pro","Spatial joins","Satellite data"],
    description:"I worked through a guided ArcGIS workflow to correct coastal coverage.",
    files:["west-hawaii-thumbnail.webp","west-hawaii-expanded.webp","west-hawaii-expanded-mobile.webp"],
    surface:"#e9e2d8" },
  { title:"Nepal Satellite Atlas", href:"/work/nepal-satellite-atlas", skills:["ArcGIS Pro","Cartography","Satellite imagery"],
    description:"I defined an ArcGIS atlas I could open, compare and export.",
    files:["nepal-thumbnail.webp","nepal-expanded.webp","nepal-expanded-mobile.webp"], surface:"#fffeff" },
];
assert.equal(homepageProjects.length, expectedPreviews.length, "The reviewed three-project preview selection drifted.");
const screenshotHashes = new Map([
  ["runbook-interface-thumbnail-v2.webp","612953f4f30e3ff22d96fcdeaee4715bfd9d21a44da7078b850f24c4dc89a181"],
  ["runbook-interface-expanded-v2.webp","9e6d235679300a3d6ee41658e57c751a14a3beb23bcf4956bebb9cbfe4cc0145"],
  ["runbook-interface-expanded-mobile-v2.webp","d8023dcea77057d0e614fb82a50b8bb435bb723047817ad8a85b353f0877fbe2"],
  ["after-the-tip-thumbnail.webp","28143dd32b5b941757c16d2b7bc5b2fc9b1a0f778eda7ee1976d259bff538dec"],
  ["after-the-tip-expanded.webp","1b3d287937fd57fbf37e6f67baddb5762f223f99ed55ceb99741fc5bb2391a40"],
  ["after-the-tip-expanded-mobile.webp","9cb7e4de1eb91bba6222dd48d035440b7a53ba170617c71682045d0136600721"],
  ["west-hawaii-thumbnail.webp","40d54296189bd65d3e89b0a4d090e9c83b2da6de68a2a3698ad2571629662c83"],
  ["west-hawaii-expanded.webp","6feb93908e6c3e458eb97e47c7ab2160c3fe7835afa97deaf4fa4714a23e3089"],
  ["west-hawaii-expanded-mobile.webp","874c7e192ca4b7517839fa9e63df3de31be34063042e253abd464d09a8762364"],
  ["nepal-thumbnail.webp","4bd64448359811bf19e8a9779959ab492ce6b7510b1ad24b3b7ca337aa063888"],
  ["nepal-expanded.webp","13a36fb18ac1b1e4e44a5c26124592728973a381eb96512b036de6aa99625a78"],
  ["nepal-expanded-mobile.webp","9fcdfe08cc51bbdccf8201d2397ac854fb43e0d6206e44cdc6e595f09b21e966"],
]);
const screenshotPaths = [];
for (const [index, expected] of expectedPreviews.entries()) {
  const actual = homepageProjects[index];
  for (const key of ["title","href","description"]) assert.equal(actual[key], expected[key],
    "Reviewed native homepage copy/order drifted: " + expected.title + "." + key);
  assert.deepEqual(actual.skills, expected.skills, "Preview skills must remain source-supported: " + expected.title);
  assert.equal(actual.imageSurface, expected.surface, "Preserved screenshot surface changed.");
  assert.equal(actual.priority === true, index === 0, "Only the first visible thumbnail is eager/high-priority.");
  for (const [mode, position, width, height] of [
    ["thumbnail",0,320,380],["expanded",1,1168,600],["expandedMobile",2,640,640],
  ]) {
    const image = actual[mode];
    const path = "public/media/projects/homepage-reveal/" + expected.files[position];
    assert.deepEqual(image, {src:path.slice("public".length),width,height}, "Exact framed screenshot changed: " + path);
    const bytes = readFileSync(resolve(projectRoot,path));
    assert.equal(bytes.toString("ascii",0,4), "RIFF", "Screenshot must remain a WebP: " + path);
    assert.equal(bytes.toString("ascii",8,12), "WEBP", "Screenshot must remain a WebP: " + path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), screenshotHashes.get(expected.files[position]),
      "Reviewed capture bytes changed: " + path);
    screenshotPaths.push(path);
  }
}
assert.equal(new Set(screenshotPaths).size, 9, "Exactly nine distinct framed screenshots are required.");
assert.match(homepageProjects[0].imageDescription, /Cropped frozen Runbook Sentinel dashboard[\s\S]*synthetic[\s\S]*Real infrastructure disconnected; not a live operations console/);
assert.deepEqual(homepageProjects[0].imageContext, ["Frozen synthetic interface","Real infrastructure disconnected"]);
assert.match(homepageProjects[1].imageDescription, /Saved West Hawaiʻi habitat-area comparison[\s\S]*Annual maximum DHW \(°C-weeks\)[\s\S]*5,702\.29 ha historical reef\/hardbottom denominator[\s\S]*2015—8 or above 83\.0%, unavailable 17\.0%; 2019—below 4 8\.3%, 4 to below 8 11\.4%, 8 or above 63\.3%, unavailable 17\.0%[\s\S]*Satellite heat exposure, not observed coral condition/);
assert.deepEqual(homepageProjects[1].imageContext, ["2015 / 2019 · annual max DHW","5,702.29 ha mapped habitat","17.0% unavailable"]);
assert.equal(homepageProjects[1].credit, "NOAA Coral Reef Watch; NOAA/NCCOS and Analytical Laboratories of Hawaii. Saved-data comparison over historical habitat mapped from 2004–06 imagery—not observed coral condition.");
assert.match(homepageProjects[2].imageDescription, /16 and 28 August 2026[\s\S]*Registration unverified[\s\S]*Blank regions are excluded data, not evidence of no change[\s\S]*not a mapped landslide result/);
assert.deepEqual(homepageProjects[2].imageContext, ["16 & 28 August 2026","Radar excerpt · −30 to 0 dB","Registration unverified"]);
assert.equal(homepageProjects[2].credit, "ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA. Cropped excerpts; full map, legend and scale remain on the project page.");
requireText(previewData, "Preview selection only; this does not change the project's flagship registry.", previewDataPath);
requireText(previewData, "satisfies readonly ProjectImageRevealProps[]", previewDataPath);
for (const project of homepageProjects) {
  assert.ok(!/https?:\/\/|data:|blob:/i.test(project.thumbnail.src + project.expanded.src + project.expandedMobile.src),
    "Screenshot sources must remain local and allowlist-bound.");
  assert.ok(Array.isArray(project.imageContext) && project.imageContext.length > 0);
}
assert.match(reveal, /^"use client";/, "Only the small native disclosure enhancement is a client boundary.");
for (const value of ["<figure", "<article", "aria-labelledby={titleId}", "<details", "name={groupName}",
  "<summary", "ref={summary}", "Expand image", "Collapse", "<picture",
  'media="(max-width: 450px)"', "srcSet={expandedMobile.src}",
  "width={expandedMobile.width} height={expandedMobile.height}", "alt={imageDescription}",
  'loading="lazy" decoding="async"', 'data-project-image-frame aria-hidden="true"',
  "data-project-image-semantic", "data-project-image-expanded", "data-project-image-thumbnail",
  "picture className={styles.pfrSrOnly}", "useRef<HTMLImageElement>",
  'data-image-readiness={imageReadiness}', 'useState<"native" | "pending" | "ready">("native")',
  "await image.decode()", 'image.addEventListener("load", handleLoad)',
  'image.removeEventListener("load", handleLoad)', 'setImageReadiness("pending")', 'setImageReadiness("ready")',
  'loading={priority ? "eager" : "lazy"}', 'fetchPriority={priority ? "high" : "auto"}',
  "imageContext.map", "id={contextId}", "<figcaption", "id={creditId}", "aria-describedby=",
  'groupName = "portfolio-project-previews"', 'event.key !== "Escape"', "event.defaultPrevented",
  "!details?.open", "event.currentTarget.contains(event.target as Node)", "event.preventDefault()",
  "details.open = false", "summary?.focus({ preventScroll: true })", 'useId()', "useRef<HTMLDetailsElement>",
  "href={href}",
]) requireText(reveal, value, revealPath);
assert.equal((reveal.match(/<summary\b/g) ?? []).length, 1, "A card must have one native summary, not duplicate collapse controls.");
assert.equal((reveal.match(/<a\b/g) ?? []).length, 1, "Explore is one independent direct link.");
assert.ok(reveal.indexOf("</details>") < reveal.indexOf("<a className={styles.pfrExplore}"),
  "Explore must remain outside the native disclosure and its toggle target.");
assert.ok(reveal.indexOf("data-project-image-semantic") < reveal.indexOf("</details>")
  && reveal.indexOf("</details>") < reveal.indexOf('data-project-image-frame aria-hidden="true"'),
  "The qualified image must close natively in details; the decorative frame persists outside it.");
assert.equal((reveal.match(/data-project-image-semantic/g) ?? []).length, 1, "One qualified accessible image per disclosure.");
assert.equal((reveal.match(/data-project-image-frame/g) ?? []).length, 1, "One persistent visual frame per card.");
assert.ok(reveal.indexOf("</article>") < reveal.indexOf("<figcaption"),
  "The source credit must remain visible outside the closed disclosure.");
reject(reveal, /<details\b[^>]*\bopen(?:\s|=|>)/, revealPath, "Reveals must start closed.");
reject(reveal, /<summary\b[^>]*\b(?:aria-expanded|aria-controls|role|tabIndex)=/, revealPath,
  "Use native summary semantics instead of emulated accordion state.");
for (const [path, source] of [[homePath,home],[nativePath,nativeHome],[revealPath,reveal],[previewDataPath,previewData]]) {
  reject(source, /fetch\s*\(|localStorage|sessionStorage|setInterval|setTimeout|requestAnimationFrame|autoPlay|autoplay|navigator\.(?:geolocation|mediaDevices)|sendBeacon/,
    path, "The homepage may not fetch, persist telemetry, auto-rotate, autoplay or request sensors.");
  reject(source, /(?:window|document)\.addEventListener\s*\(\s*["'](?:scroll|wheel|keydown|pointermove|mousemove)/,
    path, "Interaction must remain local; no page-level tracking or scroll/key hijack.");
  reject(source, /mailto:|tel:|<form\b|<iframe\b|<canvas\b|<video\b|<audio\b|<script[^>]*src=/i,
    path, "Public contact/privacy and zero-heavy-runtime-media boundaries remain.");
  reject(source, /(?:I (?:build|built|design|designed|engineer)|my (?:implemented|proven))[^<.]{0,80}(?:electrical|embedded|power-system|hardware)/i,
    path, "The homepage must not imply unsupported EE or hardware implementation.");
}

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
requireText(work, "toReaderFirst", workPath);
reject(work, /function\s+readerFirst\s*\(/, workPath, "Reader-first copy must stay in the canonical model layer.");
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

// Canonical ownership and source topology remain in the full work/case records.
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
  "Start with my contribution and the project’s scope. Open the case study for the story, or expand the full project record. Codex assists with research, implementation and testing.",
  workPath);
reject(work, /Each row[^<]*\bthe methods\b/s, workPath,
  "the shared introduction must not promise methods that the BurnLens row does not present");

// The work-index world keeps its established semantic-token-only styling.
for (const [path, css] of [[workCssPath, workCss]]) {
  requireText(css, "var(--color-ink)", path);
  requireText(css, "var(--color-rule)", path);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media\s+print/);
  reject(css, /url\s*\(/i, path, "Remote/raster CSS backgrounds are forbidden.");
  reject(css, /#[0-9a-f]{3,8}\b|rgba?\s*\(/i, path, "Work-index styling must retain semantic tokens.");
}
assert.match(globals, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--color-focus\)/s,
  "Shared chrome and work journeys must retain the semantic high-contrast focus role.");
for (const value of [".pfrStudyColumns", "grid-template-columns:43% 57%", ".pfrProfile", ".pfrSelected",
  ".pfrReveal", ".pfrSummary", ".pfrContext", ".pfrExplore", ".pfrCredit",
  ".pfrReveal[open] .pfrSummary", ".pfrReveal[open] .pfrOpenLabel",
  ".pfrReveal[open] ~ .pfrDetails { visibility:hidden; }",
  ".pfrFullImage img", "object-fit:contain", ".pfrMediaFrame",
  ".pfrReveal:not([open]):hover ~ .pfrMediaFrame .pfrThumbnail",
  ".pfrSummary:hover .pfrClosedLabel", ".pfrSummary:focus-visible .pfrClosedLabel",
  "top:37px", "height:44px", "min-width:74px", "pointer-events:none", "pointer-events:auto",
  "animation:pfr-label-in 220ms ease 320ms both",
  "transition:top 650ms", "left 650ms", "width 650ms", "height 650ms", "border-radius 650ms",
  ".pfrReveal[open] ~ .pfrMediaFrame { top:0; left:0; width:100%; height:100%; border-radius:0; }",
  ".pfrFullImage", "transition:opacity 350ms ease", '[data-image-readiness="pending"]',
  "@media (hover:none), (pointer:coarse)", "@media (prefers-reduced-motion:reduce)",
  "animation:none !important; transition:none !important;",
  "@media (max-width:650px)", ".pfrStudyColumns { display:block; }",
  "@media (forced-colors:active)", "outline:3px solid Highlight",
]) requireText(homeCss, value, homeCssPath);
assert.match(homeCss, /\.pfrThumbnail\s*\{[^}]*object-fit:cover/,
  "Only the reviewed detail thumbnail uses cropped cover fitting.");
assert.match(homeCss, /\.pfrMediaFrame\s*\{[^}]*border-radius:36px 5px 27px 7px/,
  "The original thumbnail frame, not an entry-only clip, owns the reversible expansion.");
reject(homeCss, /pfr-reveal|clip-path:inset\(80px|@keyframes[^}]*clip-path/i, homeCssPath,
  "The image must grow and contract, not pop behind a reveal wipe.");
const expandedRule = homeCss.match(/\.pfrFullImage\s+img\s*\{([^}]+)\}/)?.[1] ?? "";
reject(expandedRule, /(?:filter|transform|clip-path|mask(?:-image)?)\s*:/, homeCssPath,
  "Expanded recorded evidence must remain proportional, unfiltered and unmasked.");
reject(homeCss, /\.pfrReveal\[open\][^{]*?(?:hover|focus)[^{]*\{[^}]*(?:opacity\s*:\s*(?:0(?:\.\d+)?|\.\d+)|filter\s*:)/i,
  homeCssPath, "Expanded images must never dim on hover/focus.");
requireText(homeCss, ".pfrStudy a:focus-visible, .pfrSummary:focus-visible", homeCssPath);
requireText(homeCss, "outline:3px solid #f0f6f5", homeCssPath);
requireText(homeCss, "box-shadow:0 0 0 6px #163443", homeCssPath);
const screenCss = homeCss.slice(0, homeCss.indexOf("@media print"));
function fontPixels(selectors) {
  const escaped = selectors.replaceAll(".", "\\.");
  const body = screenCss.match(new RegExp("(?:^|\\n)" + escaped + "\\s*\\{([^}]+)\\}"))?.[1] ?? "";
  const value = body.match(/font-size:\s*(\d+(?:\.\d+)?)px/)?.[1]
    ?? body.match(/font:\s*\d+\s+(\d+(?:\.\d+)?)px\//)?.[1];
  assert.ok(value, "Reviewed native font declaration missing: " + selectors);
  return Number(value);
}
for (const selector of [".pfrDetails p", ".pfrExplore", ".pfrCredit", ".pfrProfileLinks a, .pfrStudyLinks a"]) {
  assert.ok(fontPixels(selector) >= 13, "Essential native text must remain at least13px: " + selector);
}
for (const selector of [".pfrClosedLabel, .pfrOpenLabel", ".pfrContext", ".pfrSkills li", ".pfrEyebrow", ".pfrBackground h2"]) {
  assert.ok(fontPixels(selector) >= 12, "Native labels must remain at least12px: " + selector);
}
const nativePrint = homeCss.slice(homeCss.indexOf("@media print"));
for (const value of [".pfrReveal, .pfrMediaFrame { display:none !important; }",
  ".pfrTitle, .pfrDetails, .pfrExplore", "position:static", "visibility:visible",
  ".pfrReveal[open] ~ .pfrDetails { visibility:visible; }", '.pfrStudy a[href^="/"]::after',
  'content:" (burnlensproject.org" attr(href) ")"',
]) requireText(nativePrint, value, homeCssPath + " print");
reject(homeCss, /url\s*\(/i, homeCssPath, "All screenshot media must remain explicit local HTML resources.");

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
  nativePath,
  revealPath,
  previewDataPath,
  ...screenshotPaths,
]) {
  assert.ok(publicAllowlist.files.includes(requiredPath), `${requiredPath} is absent from the explicit public files.`);
}
assert.ok(
  publicAllowlist.script_files.includes("scripts/verify-front-door-u04.mjs"),
  "The U04 verifier is absent from script_files.",
);

// NFA090 adds reader-first discovery without replacing the canonical project record.
const resumePath = "app/resume/page.tsx";
const resume = read(resumePath);
const expectedFlagshipReaderCopy = {
  burnlens: {
    status: "Public v0.56.0 research portfolio release",
    summary: "I defined the audience, public story and use limits for an experimental computer-vision and geospatial project, and owned its publication decisions. Codex led technical, product and reliability work within that direction. The result was a public v0.56.0 research portfolio release—not an operational wildfire tool.",
  },
  "runbook-sentinel": {
    status: "Released synthetic testbed · no real systems connected",
    summary: "I designed and implemented a Python/SQLite synthetic incident-response testbed that separates diagnosis and proposals from approval and execution. I owned its release and evaluation, including the rejection of a local-model candidate that failed the output contract. At v0.0.20, it used synthetic state only; no real systems were connected.",
  },
};

function readerCopyEntries(source, objectName, location) {
  const object = source.match(new RegExp(`const ${objectName} = \\{([\\s\\S]*?)\\n\\} as const`));
  assert.ok(object, `${location}: ${objectName} source boundaries are absent.`);
  const entries = [...object[1].matchAll(
    /(?:^|\n)\s*(?:"([^"]+)"|([A-Za-z][\w-]*)):\s*\{\s*status:\s*("(?:[^"\\]|\\.)*"),\s*summary:\s*("(?:[^"\\]|\\.)*"),?\s*\}/g,
  )].map((match) => [match[1] ?? match[2], {
    status: JSON.parse(match[3]),
    summary: JSON.parse(match[4]),
  }]);
  assert.ok(entries.length > 0, `${location}: ${objectName} has no readable copy pairs.`);
  return Object.fromEntries(entries);
}

const workReaderCopy = readerCopyEntries(work, "flagshipReaderCopy", workPath);
const resumeReaderCopy = readerCopyEntries(resume, "resumeReaderCopy", resumePath);
assert.deepEqual(workReaderCopy, expectedFlagshipReaderCopy,
  `${workPath}: the exact two reviewed flagship summary/status pairs must remain.`);
for (const [projectId, expected] of Object.entries(expectedFlagshipReaderCopy)) {
  assert.equal(workReaderCopy[projectId].summary, resumeReaderCopy[projectId]?.summary,
    `${projectId}: the work summary must match the unchanged NFA086 résumé summary.`);
  assert.equal(workReaderCopy[projectId].status, expected.status,
    "Work discovery must retain the reviewed canonical flagship status: " + projectId);
}

const sharedCodexAttribution = "Codex assists with research, implementation and testing.";
const flagshipLaneStart = work.indexOf('data-work-lane="flagships"');
const currentProjectsStart = work.indexOf('id="current-projects"');
assert.ok(flagshipLaneStart >= 0 && currentProjectsStart > flagshipLaneStart,
  `${workPath}: flagship lane source boundaries are absent or out of order.`);
const flagshipLane = work.slice(flagshipLaneStart, currentProjectsStart);
requireCompactedText(flagshipLane, sharedCodexAttribution, `${workPath} flagship introduction`);
requireCompactedText(nativeHome, "Development is collaborative and includes Codex assistance.", nativePath);
assert.deepEqual([...work.matchAll(/<FlagshipEntry\s+project=\{flagships\[(\d+)\]\}\s+ordinal="([^"]+)"\s*\/>/g)]
  .map((match) => [match[1], match[2]]), [["0", "01"], ["1", "02"]],
`${workPath}: exactly two ordered flagship entries must use their established project records.`);
assert.equal((work.match(/<FlagshipEntry\b/g) ?? []).length, 2,
  `${workPath}: no extra flagship entry may be added by the discovery projection.`);

const flagshipEntryStart = work.indexOf("function FlagshipEntry(");
const supportingEntryStart = work.indexOf("function SupportingEntry(");
assert.ok(flagshipEntryStart >= 0 && supportingEntryStart > flagshipEntryStart,
  `${workPath}: flagship entry source boundaries are absent or out of order.`);
const flagshipEntry = work.slice(flagshipEntryStart, supportingEntryStart);
requireText(flagshipEntry, "const readerCopy = flagshipReaderCopy[project.id];", workPath);
requireText(flagshipEntry, "<p data-work-short-status>{readerCopy.status}</p>", workPath);
requireText(flagshipEntry,
  "<p className={styles.contributionSummary} data-work-contribution-first>{readerCopy.summary}</p>", workPath);
assert.equal((flagshipEntry.match(/data-work-short-status/g) ?? []).length, 1,
  `${workPath}: each flagship template must have one visible short status.`);
assert.equal((flagshipEntry.match(/data-work-contribution-first/g) ?? []).length, 1,
  `${workPath}: each flagship template must have one reviewed contribution summary.`);
assert.equal((work.match(/data-work-project-record=/g) ?? []).length, 1,
  `${workPath}: both flagship records must come from one canonical native template.`);
assert.equal((flagshipEntry.match(/<details\b/g) ?? []).length, 1,
  `${workPath}: each flagship requires exactly one native full-record disclosure.`);
const projectRecord = flagshipEntry.match(/<details\b([^>]*)>([\s\S]*?)<\/details>/);
assert.ok(projectRecord, `${workPath}: the native full-record disclosure is absent.`);
requireText(projectRecord[1], "className={styles.projectRecord}", workPath);
requireText(projectRecord[1], "data-work-project-record={project.id}", workPath);
reject(projectRecord[1], /\b(?:open|name)(?=\s|=|$)/, workPath,
  "full project records must start closed and remain independent, not a named exclusive accordion");
requireText(projectRecord[2],
  '<summary>Full project record <span className="sr-only">for {project.title}</span></summary>', workPath);
assert.equal((projectRecord[2].match(/<summary\b/g) ?? []).length, 1,
  `${workPath}: each native record requires one project-specific summary.`);
reject(flagshipEntry, /\b(?:onToggle|onClick|aria-expanded|aria-controls)\b|role=["'](?:button|tab)["']/,
  workPath, "native project records must not gain a scripted or custom accordion control");

const directCaseLink = flagshipEntry.match(/<Link href=\{project\.route\} aria-label=\{`Read \$\{project\.title\} case study`\}>[\s\S]*?<\/Link>/);
assert.ok(directCaseLink, `${workPath}: the direct, project-labeled case link is absent.`);
assert.ok(directCaseLink.index + directCaseLink[0].length < projectRecord.index,
  `${workPath}: the direct case link must remain outside and before the optional full record.`);
assert.equal((flagshipEntry.match(/<Link\b/g) ?? []).length, 1,
  `${workPath}: each flagship must retain one direct case-study link.`);
requireText(directCaseLink[0], 'Read {project.title} case study <span aria-hidden="true">→</span>', workPath);
requireText(flagshipEntry, '<div className={styles.recordColumn}>', workPath);
assert.ok(flagshipEntry.indexOf("data-atlas-grid") < projectRecord.index &&
  flagshipEntry.indexOf("data-authority-break") < projectRecord.index,
`${workPath}: both established diagrams must remain available before the optional record.`);

assert.deepEqual([...projectRecord[2].matchAll(/data-field-key="([^"]+)"/g)].map((match) => match[1]),
  ["maturity", "problem", "intendedUser", "personalRole", "decisionSupported", "stack", "outcome", "limitations"],
  `${workPath}: the complete canonical flagship field order must remain inside the full record.`);
for (const field of ["maturity", "problem", "intendedUser", "personalRole", "decisionSupported", "outcome", "limitations"]) {
  requireText(projectRecord[2], `{summary(project.id, "${field}")}`, `${workPath} canonical full record`);
}
requireText(projectRecord[2], '<dl className={styles.workFacts} data-work-facts>', workPath);
requireText(projectRecord[2], '<dt>{project.id === "burnlens" ? "Role split" : "My role"}</dt>', workPath);
requireText(projectRecord[2], 'project.id === "runbook-sentinel"', workPath);
requireText(projectRecord[2], "<ul data-method-list>", workPath);
requireText(projectRecord[2], "{runbookStackItems().map((item) => (", workPath);
requireText(projectRecord[2], "<strong>{toReaderFirst(item.name)}</strong>", workPath);
requireText(projectRecord[2], "<span>{toReaderFirst(item.purpose)}</span>", workPath);
assert.equal((flagshipEntry.match(/data-field-key="maturity"/g) ?? []).length, 1,
  `${workPath}: canonical maturity must move once, not be duplicated as a short status.`);
const outsideProjectRecord = flagshipEntry.replace(projectRecord[0], "");
reject(outsideProjectRecord, /data-field-key=|data-work-facts|data-method-list/, workPath,
  "the full canonical ledger must not be duplicated outside its optional record");
requireCompactedText(outsideProjectRecord,
  "For a complete printout in this browser, expand “Full project record” before printing.", workPath);
requireText(outsideProjectRecord, "data-work-print-hint", workPath);
assert.ok(flagshipEntry.indexOf("data-work-print-hint") > projectRecord.index + projectRecord[0].length,
  `${workPath}: the unsupported-browser print instruction must be available outside the closed record.`);

const discoveryCssStart = workCss.indexOf("/* NFA-090: contribution-first flagship overview; native records keep full facts. */");
assert.ok(discoveryCssStart >= 0, `${workCssPath}: the scoped discovery styles are absent.`);
const discoveryCss = workCss.slice(discoveryCssStart);
const contributionRule = discoveryCss.match(/\.flagshipLane\s+\.flagshipTitle\s*>\s*\.contributionSummary\s*\{([^}]+)\}/)?.[1];
assert.ok(contributionRule, `${workCssPath}: contribution prose needs its scoped typography override.`);
for (const declaration of ["color: var(--color-ink);", "font-size: 1.0625rem;", "font-weight: 400;",
  "letter-spacing: normal;", "line-height: 1.6;", "text-transform: none;"]) {
  requireText(contributionRule, declaration, `${workCssPath} contribution prose`);
}
assert.match(discoveryCss, /\.projectRecord\s*>\s*summary:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--color-focus\)/,
  `${workCssPath}: native summaries must retain visible semantic focus treatment.`);
assert.match(discoveryCss, /\.printEvidenceHint\s*\{[^}]*display:\s*none\s*;/,
  `${workCssPath}: the compatibility instruction is hidden by default, not the project record.`);
assert.match(discoveryCss, /@supports\s+not selector\(::details-content\)\s*\{\s*\.printEvidenceHint\s*\{[^}]*display:\s*block\s*;/,
  `${workCssPath}: unsupported browsers must show the manual-expand print instruction.`);
const discoveryPrintStart = discoveryCss.lastIndexOf("@media print");
assert.ok(discoveryPrintStart >= 0, `${workCssPath}: native records need a dedicated print treatment.`);
const discoveryPrint = discoveryCss.slice(discoveryPrintStart);
assert.match(discoveryPrint, /\.projectRecord::details-content\s*\{(?=[^}]*display:\s*block\s*!important\s*;)(?=[^}]*content-visibility:\s*visible\s*!important\s*;)[^}]*\}/,
  `${workCssPath}: supported print engines must expose the closed record content.`);
assert.match(discoveryPrint, /\.projectRecord\s*>\s*summary,\s*\.printEvidenceHint\s*\{[^}]*display:\s*none\s*;/,
  `${workCssPath}: supported print output omits disclosure controls and compatibility instructions.`);
assert.match(discoveryPrint, /@supports\s+not selector\(::details-content\)\s*\{\s*\.printEvidenceHint\s*\{(?=[^}]*display:\s*block\s*;)(?=[^}]*font-size:\s*10pt\s*;)[^}]*\}/,
  `${workCssPath}: unsupported print engines must retain the explicit manual-expand fallback.`);

console.log(JSON.stringify({
  status: "passed", publication_authority: "none", browser_execution_qualified: false,
  hierarchy: expectedHierarchy, homepageFeaturedFailures: [], workIndexFeaturedFailures: [],
  previewCases: homepageProjects.map((project) => project.href),
  presentationMigration: "NFA106 native screenshot disclosures; canonical hierarchy and full case/work evidence retained",
  screenshotAssets: screenshotPaths.length, meaningfulCaseAndWorkSafeguardsRetained: true,
  frontDoorConsumers: [homePath, nativePath, revealPath, previewDataPath, workPath],
}));
