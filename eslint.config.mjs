import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// The scoped glob dependency supports this site's default root only.
// Reject custom Next roots before linting instead of assuming glob equivalence.
export function assertDefaultNextRoots(configs) {
  for (const config of configs) {
    const nextSettings = config.settings?.next;
    if (
      nextSettings !== null &&
      (typeof nextSettings === "object" || typeof nextSettings === "function") &&
      "rootDir" in nextSettings
    ) {
      throw new Error(
        "Custom settings.next.rootDir is unsupported: retain the default ESLint cwd root.",
      );
    }
  }
  return configs;
}

export default assertDefaultNextRoots(defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]));
