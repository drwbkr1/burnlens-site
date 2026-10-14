# Selected portfolio dashboard

This is an independent, field-allowlisted, dated copy of five relevant records from the owner-confirmed Daily Project Recap. It is not the original private dashboard, a live query or an automatic refresh.

The public portfolio companion at /dashboard renders these same records on the server, without loading the interactive runtime. /dashboard/explore/index.html is the compiled interactive destination. It retains the installed Data-app runtime and source inspection; no protected runtime was forked. Existing case and return links use the current same origin. Both views preserve original source-review timestamps and checklist-task meaning.

The section's Work area picker is authored through the public useSectionFilters API. Its selection, reviewed rows, source scope and current-view links remain owned by that API. It retains the same desktop radio-item choices, keyboard and dismissal behavior, shared visual classes, and native coarse-pointer picker; it does not replace the protected chart, source or shell controls.

## Build

Normal portfolio npm build needs no Data plugin: it serves the committed, manifest-bound compiled HTML and JSON. Updating the authored dashboard requires Node24 and the installed Data plugin matching runtime SHA b5514c44f112ed9b8fe2e8674369e515b7e712abfc70a896140b96f0ab65cfd2. No dependency install or source-runtime build is used.

For the existing prepared authoring app, run:

```powershell
node scripts/build-portfolio-dashboard.mjs --plugin-root <absolute-installed-data-plugin> --project-dir <absolute-prepared-authoring-app>
```

For a fresh authoring workspace, first use that plugin's canonical prepare-data-app.mjs with --surface dashboard, --snapshot pointing to this data.json, and an absolute new --output directory. Read its copied AGENTS.md. The build command then hydrates this existing artifact's stable ID and exact authored sources into the prepared workspace, builds with --separate-data, verifies the pinned runtime and file hashes, and copies the exact compiled output into public/dashboard/explore. A fresh workspace is a rehydration of this artifact, not a new published identity.

No private source file is required for an ordinary site build; no local paths, task IDs or credentials are included in the reviewed data. Do not edit generated HTML, alter compiled marks, remove runtime controls, or replace the immutable snapshot with live private data. The exact HTML-only CSP exception permits the bundled data: runtime module and same-origin sidecar, not remote scripts or unsafe-eval. The companion has ordinary portfolio policy; the standalone comparison is non-indexable.

Before a rebuild that changes the snapshot filename, preserve and remove the previous generated sidecar from the public directory under the applicable local milestone. Do not leave orphaned historical snapshots routable. Keep source scientific acceptance and human-playtest limits intact; authoring completion is not a release claim.
