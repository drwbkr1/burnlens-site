import assert from "node:assert/strict";

import { getSiteOrigin, getSiteUrl, shouldIndexSite } from "../lib/site-origin.ts";

assert.equal(getSiteOrigin({}), "https://burnlensproject.org");
assert.equal(
  getSiteOrigin({ NEXT_PUBLIC_SITE_URL: " https://portfolio.example.com/ " }),
  "https://portfolio.example.com",
);
assert.equal(getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "http://localhost:3101" }), "http://localhost:3101");
assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com" }).pathname, "/");

assert.throws(() => getSiteOrigin({ VERCEL_ENV: "preview" }), /required for preview and production/);
assert.throws(
  () => getSiteOrigin({ PORTFOLIO_DEPLOYMENT_CONTEXT: "production" }),
  /required for preview and production/,
);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "portfolio.example.com" }), /absolute/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "ftp://portfolio.example.com" }), /HTTP or HTTPS/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "http://portfolio.example.com" }), /HTTPS/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://user:pass@portfolio.example.com" }), /credentials/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com/work" }), /without a path/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com?draft=1" }), /without a path/);
assert.throws(() => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com#draft" }), /without a path/);

assert.equal(shouldIndexSite({}), false);
assert.equal(shouldIndexSite({ VERCEL_ENV: "preview" }), false);
assert.equal(shouldIndexSite({ VERCEL_ENV: "development" }), false);
assert.equal(
  shouldIndexSite({
    PORTFOLIO_DEPLOYMENT_CONTEXT: "production",
    NEXT_PUBLIC_SITE_URL: "https://burnlensproject.org",
    NEXT_PUBLIC_SITE_INDEXING: "allow",
  }),
  true,
);
assert.equal(
  shouldIndexSite({
    PORTFOLIO_DEPLOYMENT_CONTEXT: "production",
    NEXT_PUBLIC_SITE_URL: "https://burnlensproject.org",
    NEXT_PUBLIC_SITE_INDEXING: "deny",
  }),
  false,
);
assert.throws(
  () =>
    shouldIndexSite({
      PORTFOLIO_DEPLOYMENT_CONTEXT: "production",
      NEXT_PUBLIC_SITE_URL: "https://burnlensproject.org",
    }),
  /explicit NEXT_PUBLIC_SITE_INDEXING decision/,
);
assert.throws(
  () => shouldIndexSite({ NEXT_PUBLIC_SITE_INDEXING: "allow" }),
  /only for an explicit production context/,
);
assert.throws(
  () =>
    shouldIndexSite({
      VERCEL_ENV: "preview",
      PORTFOLIO_DEPLOYMENT_CONTEXT: "production",
      NEXT_PUBLIC_SITE_URL: "https://burnlensproject.org",
      NEXT_PUBLIC_SITE_INDEXING: "allow",
    }),
  /must agree with VERCEL_ENV/,
);
assert.throws(() => shouldIndexSite({ NEXT_PUBLIC_SITE_INDEXING: "maybe" }), /allow or deny/);

console.log(
  "Site-origin policy verified: strict origin, explicit production context, indexing denied by default.",
);
