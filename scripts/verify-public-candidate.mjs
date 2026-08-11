import { createHash } from "node:crypto";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "scripts/public-candidate-allowlist.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (manifest.schema_version !== "nfa-public-candidate-allowlist-v1") {
  throw new Error("Unsupported public candidate allowlist schema.");
}
if (manifest.publication_authority !== "none") {
  throw new Error("The local candidate must not imply publication authority.");
}
if (!Array.isArray(manifest.owner_gates) || manifest.owner_gates.length === 0) {
  throw new Error("The candidate must retain its unresolved owner gates.");
}

const listed = [...manifest.files].sort();
if (new Set(listed).size !== listed.length) {
  throw new Error("The public candidate allowlist contains duplicate paths.");
}

function assertSafeRelativePath(path) {
  if (!path || path.includes("\\") || path.startsWith("/") || path.split("/").includes("..")) {
    throw new Error(`Unsafe candidate path: ${path}`);
  }
}

async function listTree(directory) {
  const absoluteDirectory = resolve(root, directory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await listTree(relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      throw new Error(`Candidate trees may not contain links or special files: ${relativePath}`);
    }
  }

  return files;
}

const discovered = [...manifest.root_files, ...manifest.script_files];
for (const tree of manifest.include_trees) {
  discovered.push(...(await listTree(tree)));
}
discovered.sort();

if (JSON.stringify(discovered) !== JSON.stringify(listed)) {
  const discoveredSet = new Set(discovered);
  const listedSet = new Set(listed);
  const missing = listed.filter((path) => !discoveredSet.has(path));
  const unlisted = discovered.filter((path) => !listedSet.has(path));
  throw new Error(
    `Candidate scope drifted. Missing: ${missing.join(", ") || "none"}. Unlisted: ${unlisted.join(", ") || "none"}.`,
  );
}

const allowedEmails = new Set(["test@example.com"]);
const allowedCredentialUrl = "https://user:pass@portfolio.example.com";
const textExtensions = new Set([
  ".css",
  ".env",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
]);
const forbiddenText = [
  { label: "local absolute path", pattern: /[A-Za-z]:[\\/](?:Users|Documents|Projects|source)[\\/]/i },
  { label: "internal review path", pattern: /docs[\\/]portfolio-redesign|human-review[\\/]|owner-response|credential-incident/i },
  { label: "internal authority reference", pattern: /thread_goal:|authority_ref/i },
  { label: "private-key material", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: "token-like secret", pattern: /(?:AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,})/ },
  { label: "legacy contact secret", pattern: /(?:RESEND_API_KEY|CONTACT_TO_EMAIL|CONTACT_FROM_EMAIL)\s*=\s*\S+/ },
];

const candidateEntries = [];
for (const path of listed) {
  assertSafeRelativePath(path);
  const absolutePath = resolve(root, path);
  const resolvedPath = await realpath(absolutePath);
  const rootPrefix = `${await realpath(root)}${sep}`;
  if (!resolvedPath.startsWith(rootPrefix)) {
    throw new Error(`Candidate path escapes the repository: ${path}`);
  }
  const fileStat = await stat(resolvedPath);
  if (!fileStat.isFile()) {
    throw new Error(`Candidate entry is not a regular file: ${path}`);
  }

  const bytes = await readFile(resolvedPath);
  const suffix = path.includes(".") ? `.${path.split(".").at(-1).toLowerCase()}` : "";
  if (
    textExtensions.has(suffix) ||
    path === ".env.example" ||
    path === ".gitattributes" ||
    path === ".gitignore"
  ) {
    let text = bytes.toString("utf8");
    if (text.includes("\r")) {
      throw new Error(`Non-LF line ending found in public candidate file: ${path}`);
    }
    if (text.includes(allowedCredentialUrl)) {
      text = text.replaceAll(allowedCredentialUrl, "https://credential-test.invalid");
    }
    for (const rule of forbiddenText) {
      if (path === "scripts/verify-public-candidate.mjs") {
        continue;
      }
      if (path === "scripts/public-candidate-allowlist.json" && rule.label === "internal review path") {
        continue;
      }
      if (rule.pattern.test(text)) {
        throw new Error(`${rule.label} found in public candidate file: ${path}`);
      }
    }
    for (const match of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
      if (!allowedEmails.has(match[0].toLowerCase())) {
        throw new Error(`Unexpected email address in public candidate file ${path}: ${match[0]}`);
      }
    }
  } else {
    const printable = bytes.toString("latin1");
    if (/[A-Za-z]:\\Users\\/i.test(printable)) {
      throw new Error(`Embedded local path found in binary candidate file: ${path}`);
    }
  }

  candidateEntries.push({
    path,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

for (const path of manifest.explicit_deletions) {
  assertSafeRelativePath(path);
  if (listed.includes(path)) {
    throw new Error(`Explicit deletion is also allowlisted: ${path}`);
  }
}
for (const path of manifest.explicit_exclusions) {
  assertSafeRelativePath(path);
  if (listed.includes(path)) {
    throw new Error(`Explicit exclusion is also allowlisted: ${path}`);
  }
}

const digestInput = candidateEntries.map((entry) => `${entry.path}\t${entry.bytes}\t${entry.sha256}`).join("\n");
const candidateDigest = createHash("sha256").update(digestInput).digest("hex");
const totalBytes = candidateEntries.reduce((sum, entry) => sum + entry.bytes, 0);

console.log(
  JSON.stringify(
    {
      status: "pass",
      publication_authority: "none",
      files: candidateEntries.length,
      bytes: totalBytes,
      candidate_digest: candidateDigest,
      explicit_deletions: manifest.explicit_deletions.length,
      explicit_exclusions: manifest.explicit_exclusions.length,
      owner_gates: manifest.owner_gates.length,
    },
    null,
    2,
  ),
);
