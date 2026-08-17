# Drew Baker portfolio

An evidence-led personal portfolio for software development, human-directed Codex orchestration, geospatial and climate work, and risk-aware systems. The site uses Next.js and keeps project claims adjacent to their evidence and limits.

## Local development

Use the committed lockfile and Node.js 24 or a compatible supported release:

```bash
npm ci
npx playwright install chromium
npm run dev
```

Run the complete local quality gate with:

```bash
npm run verify
```

`npm run check` generates Next.js route types before TypeScript, runs lint and source/media policy checks, and creates a production build. `npm run test:site` runs the responsive, accessibility, metadata, privacy, and performance browser suite against that build.

## Public origin

`https://burnlensproject.org` is the selected production homepage for this personal portfolio. Each production change is represented as live only after the exact release is authorized and verified at that origin. BurnLens remains a flagship case study at `/work/burnlens`; `/burnlens` is only a convenience redirect.

`NEXT_PUBLIC_SITE_URL` is the exact canonical origin used by metadata, structured data, the sitemap, and robots output. It must be an HTTPS origin with no credentials, path, query, or fragment. Loopback HTTP origins are accepted for local testing.

`PORTFOLIO_DEPLOYMENT_CONTEXT` must be `local`, `preview`, or `production`. Preview and local builds are non-indexable. Production also requires an explicit `NEXT_PUBLIC_SITE_INDEXING=allow|deny` decision; indexing is never inferred from a missing provider variable. Preview and production contexts require an exact site URL. Local builds use the selected portfolio origin as a deterministic metadata fallback.

Copy `.env.example` to `.env.local` only when testing a specific origin.

## Contact and privacy

The public site links to professional profiles and intentionally omits direct email, phone, location, contact forms, and analytics. The legacy `/api/contact` endpoint returns `410 Gone` and does not accept or deliver submissions.

The self-hosted Manrope and Newsreader font notices are retained under `public/media/licenses/` and verified with the other public media manifests. Any project-specific media attribution remains adjacent to the case study that uses it.

No general license is granted for this portfolio's source code or original editorial content; default copyright applies unless a file states otherwise. Third-party fonts and project-specific media remain governed by their adjacent license and provenance records.

## Deployment boundary

Hosting and domain configuration live outside this repository. A branch push may create a hosted preview, and a change to the production branch may deploy immediately. Configure and verify the exact origin, preview visibility, production domain, and rollback target before publishing.

On Linux CI, install the browser and its system dependencies with `npx playwright install --with-deps chromium`. A production host must run the complete verified build gate or provide equivalent checks before `next build`; Vercel's default build command does not imply that policy by itself.
