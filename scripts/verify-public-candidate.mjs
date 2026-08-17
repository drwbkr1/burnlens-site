import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath, stat } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

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
if (!Array.isArray(manifest.downstream_external_action_gates)
  || manifest.downstream_external_action_gates.length === 0) {
  throw new Error("The candidate must retain its downstream external-action gates.");
}

const listed = [...manifest.files].sort();
if (new Set(listed).size !== listed.length) {
  throw new Error("The public candidate allowlist contains duplicate paths.");
}

function assertSafeRelativePath(path) {
  const segments = path?.split("/") ?? [];
  if (
    !path ||
    path.includes("\\") ||
    path.includes("\0") ||
    path.startsWith("/") ||
    /^[A-Za-z]:/.test(path) ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe candidate path: ${path}`);
  }
}

const explicitDeletions = [...manifest.explicit_deletions];
const explicitExclusions = [...manifest.explicit_exclusions];

for (const path of explicitDeletions) {
  assertSafeRelativePath(path);
  if (listed.includes(path)) {
    throw new Error(`Explicit deletion is also allowlisted: ${path}`);
  }
  try {
    await lstat(resolve(root, path));
  } catch (error) {
    if (error?.code === "ENOENT") {
      continue;
    }
    throw error;
  }
  throw new Error(`Explicit deletion still exists in the worktree: ${path}`);
}

for (const path of explicitExclusions) {
  assertSafeRelativePath(path);
  const conflicts = listed.filter(
    (listedPath) => listedPath === path || listedPath.startsWith(`${path}/`),
  );
  if (conflicts.length > 0) {
    throw new Error(
      `Explicit exclusion contains allowlisted candidate paths: ${path} -> ${conflicts.join(", ")}`,
    );
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
const allowedCredentialUrls = new Map([
  [
    "https://user:pass@portfolio.example.com",
    new Set(["scripts/verify-public-candidate.mjs", "scripts/verify-site-origin.mjs"]),
  ],
]);
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
const internalReviewPattern = new RegExp(
  [
    ["docs[\\\\/]portfolio-", "redesign"].join(""),
    ["human-", "review[\\\\/]"].join(""),
    ["owner-", "response"].join(""),
    ["credential-", "incident"].join(""),
  ].join("|"),
  "i",
);
const internalAuthorityPattern = new RegExp(
  [["thread_", "goal:"].join(""), ["authority_", "ref"].join("")].join("|"),
  "i",
);
const localAbsolutePathPattern = new RegExp(
  [
    String.raw`(?:^|[\s"'(=])[A-Za-z]:[\\/]`,
    `${["fi", "le:"].join("")}(?:/{2,3}|\\\\{2})`,
    String.raw`(?:^|[\s"'(=])/(?:Users|home)/[^\s"']+/`,
    String.raw`\\{2}[A-Za-z0-9._$ ?-]+[\\/][A-Za-z0-9._$ -]+`,
    ["%USER", "PROFILE%"].join(""),
    ["%HOME", "DRIVE%"].join(""),
    ["%HOME", "PATH%"].join(""),
    `${String.raw`\$(?:env:)?(?:`}${["HO", "ME"].join("")}|${["USER", "PROFILE"].join("")}${String.raw`)\b`}`,
    String.raw`(?:^|[\s"'(=])~[\\/]`,
    `${String.raw`\.`}${["co", "dex"].join("")}${String.raw`[\\/]`}`,
  ].join("|"),
  "im",
);
const forbiddenText = [
  { label: "local absolute path", pattern: localAbsolutePathPattern },
  { label: "internal review path", pattern: internalReviewPattern },
  { label: "internal authority reference", pattern: internalAuthorityPattern },
  {
    label: "private-key material",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/,
  },
  {
    label: "token-like secret",
    pattern:
      /(?:A(?:KI|SI)A[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|glpat-[A-Za-z0-9_-]{20,}|npm_[A-Za-z0-9]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/,
  },
  {
    label: "embedded URL credentials",
    pattern: /(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s/@:]+:[^\s/@]+@/i,
  },
  {
    label: "credential query secret",
    pattern: /[?&](?:access_token|api[_-]?key|auth[_-]?token|credential|key|token)=[A-Za-z0-9._~+\/%-]{8,}/i,
  },
  {
    label: "assigned secret",
    pattern:
      /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd|private[_-]?key|secret)\b\s*[:=]\s*["']?[A-Za-z0-9+/_=-]{8,}/i,
  },
  {
    label: "environment secret",
    pattern:
      /\b[A-Z][A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD|PASSWD|PRIVATE_KEY)\s*=\s*(["']?)[A-Za-z0-9+/_=-]{8,}\1/,
  },
  {
    label: "authorization header secret",
    pattern:
      /\b(?:authorization|proxy-authorization)\s*[:=]\s*["']?(?:bearer|basic)\s+[A-Za-z0-9+/_.=-]{12,}/i,
  },
  { label: "legacy contact secret", pattern: /(?:RESEND_API_KEY|CONTACT_TO_EMAIL|CONTACT_FROM_EMAIL)\s*=\s*\S+/ },
];

const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const controlCharacterPattern = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u;
const mojibakePattern =
  /(?:\u00c2[\u0080-\u00ff]|\u00c3[\u0080-\u00ff]|\u00e2[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]|\u00f0[\u0080-\u00bf\u0178])/u;
const urlTokenCharacterPattern = /[A-Za-z0-9._~:/?#@!$&()*+,;=%\[\]-]/;

function redactExactAllowedCredentialUrls(path, source) {
  let text = source;
  let placeholderIndex = 0;

  for (const [url, allowedPaths] of allowedCredentialUrls) {
    let searchFrom = 0;
    while (true) {
      const index = text.indexOf(url, searchFrom);
      if (index === -1) break;
      const before = text[index - 1] ?? "";
      const after = text[index + url.length] ?? "";
      const exactToken =
        !urlTokenCharacterPattern.test(before) && !urlTokenCharacterPattern.test(after);
      if (!exactToken || !allowedPaths.has(path)) {
        throw new Error(`Credential URL is not exactly allowlisted for public candidate file: ${path}`);
      }
      const placeholder = `https://credential-allowlist.invalid/${placeholderIndex}`;
      text = `${text.slice(0, index)}${placeholder}${text.slice(index + url.length)}`;
      searchFrom = index + placeholder.length;
      placeholderIndex += 1;
    }
  }

  return text;
}

function redactManifestExclusionDeclarations(path, source) {
  if (path !== "scripts/public-candidate-allowlist.json") return source;
  let text = source;
  for (const [index, exclusion] of explicitExclusions.entries()) {
    text = text.replaceAll(JSON.stringify(exclusion), JSON.stringify(`explicit-exclusion-${index}`));
  }
  return text;
}

function decodeStrictUtf8(path, bytes) {
  if (
    (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) ||
    (bytes[0] === 0xff && bytes[1] === 0xfe) ||
    (bytes[0] === 0xfe && bytes[1] === 0xff)
  ) {
    throw new Error(`Byte-order mark found in public candidate file: ${path}`);
  }
  let text;
  try {
    text = utf8Decoder.decode(bytes);
  } catch {
    throw new Error(`Invalid UTF-8 found in public candidate file: ${path}`);
  }
  if (text.includes("\ufffd")) {
    throw new Error(`Unicode replacement character found in public candidate file: ${path}`);
  }
  if (text.includes("\ufeff")) {
    throw new Error(`Byte-order mark found in public candidate file: ${path}`);
  }
  if (controlCharacterPattern.test(text)) {
    throw new Error(`Forbidden control character found in public candidate file: ${path}`);
  }
  if (mojibakePattern.test(text)) {
    throw new Error(`Probable encoding corruption found in public candidate file: ${path}`);
  }
  return text;
}

function pngCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function assertPngHasNoMetadata(path, bytes) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const allowedChunkTypes = new Set(["IHDR", "IDAT", "IEND"]);
  if (bytes.length < 45 || !bytes.subarray(0, signature.length).equals(signature)) {
    throw new Error(`Invalid PNG signature in public candidate image: ${path}`);
  }

  let offset = signature.length;
  let ihdrCount = 0;
  let idatCount = 0;
  let iendCount = 0;
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error(`Truncated PNG chunk in public candidate image: ${path}`);
    }
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const chunkEnd = offset + 12 + length;
    if (!/^[A-Za-z]{4}$/.test(type) || chunkEnd > bytes.length) {
      throw new Error(`Invalid PNG chunk in public candidate image: ${path}`);
    }
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    const actualCrc = pngCrc32(bytes.subarray(offset + 4, offset + 8 + length));
    if (actualCrc !== expectedCrc) {
      throw new Error(`Invalid PNG chunk checksum in public candidate image: ${path}`);
    }
    if (!allowedChunkTypes.has(type)) {
      throw new Error(`PNG metadata or unsupported ancillary chunk ${type} found in: ${path}`);
    }
    if (type === "IHDR") {
      ihdrCount += 1;
      if (offset !== signature.length || length !== 13) {
        throw new Error(`Invalid PNG IHDR placement in public candidate image: ${path}`);
      }
    } else if (type === "IDAT") {
      idatCount += 1;
      if (ihdrCount !== 1 || iendCount > 0) {
        throw new Error(`Invalid PNG IDAT placement in public candidate image: ${path}`);
      }
    } else {
      iendCount += 1;
      if (length !== 0 || idatCount === 0 || chunkEnd !== bytes.length) {
        throw new Error(`Invalid PNG IEND placement in public candidate image: ${path}`);
      }
    }
    offset = chunkEnd;
  }
  if (ihdrCount !== 1 || idatCount === 0 || iendCount !== 1) {
    throw new Error(`Incomplete PNG structure in public candidate image: ${path}`);
  }
}

function assertJpegHasNoMetadata(path, bytes) {
  if (
    bytes.length < 16 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes.at(-2) !== 0xff ||
    bytes.at(-1) !== 0xd9
  ) {
    throw new Error(`Invalid JPEG boundary markers in public candidate image: ${path}`);
  }

  const allowedSegmentMarkers = new Set([0xc0, 0xc4, 0xd8, 0xda, 0xdb, 0xdd, 0xe0]);
  let offset = 2;
  let jfifCount = 0;
  let frameCount = 0;
  let scanStart = -1;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xff) {
      throw new Error(`Invalid JPEG segment boundary in public candidate image: ${path}`);
    }
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    if (marker === undefined) {
      throw new Error(`Truncated JPEG marker in public candidate image: ${path}`);
    }
    if (!allowedSegmentMarkers.has(marker) || marker === 0xd8) {
      throw new Error(`JPEG metadata or unsupported marker FF${marker.toString(16)} found in: ${path}`);
    }
    if (offset + 2 >= bytes.length) {
      throw new Error(`Truncated JPEG segment in public candidate image: ${path}`);
    }
    const segmentLength = bytes.readUInt16BE(offset + 1);
    const segmentEnd = offset + 1 + segmentLength;
    if (segmentLength < 2 || segmentEnd > bytes.length) {
      throw new Error(`Invalid JPEG segment length in public candidate image: ${path}`);
    }
    if (marker === 0xe0) {
      jfifCount += 1;
      const jfifHeader = bytes.subarray(offset + 3, segmentEnd);
      if (
        offset !== 3 ||
        segmentLength !== 16 ||
        jfifHeader.toString("ascii", 0, 5) !== "JFIF\0" ||
        jfifHeader[5] !== 1 ||
        jfifHeader[6] > 2 ||
        jfifHeader[7] > 2 ||
        jfifHeader[12] !== 0 ||
        jfifHeader[13] !== 0
      ) {
        throw new Error(`Unsupported JPEG APP0 payload in public candidate image: ${path}`);
      }
    }
    if (marker === 0xc0) frameCount += 1;
    if (marker === 0xda) {
      scanStart = segmentEnd;
      break;
    }
    offset = segmentEnd;
  }
  if (jfifCount !== 1 || frameCount !== 1 || scanStart < 0) {
    throw new Error(`Incomplete baseline JPEG structure in public candidate image: ${path}`);
  }

  let foundEnd = false;
  for (let index = scanStart; index < bytes.length - 1; index += 1) {
    if (bytes[index] !== 0xff) continue;
    let markerOffset = index + 1;
    while (bytes[markerOffset] === 0xff) markerOffset += 1;
    const marker = bytes[markerOffset];
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      index = markerOffset;
      continue;
    }
    if (marker === 0xd9 && index === bytes.length - 2) {
      foundEnd = true;
      break;
    }
    throw new Error(`Unexpected JPEG scan marker FF${marker.toString(16)} found in: ${path}`);
  }
  if (!foundEnd) {
    throw new Error(`JPEG scan has no terminal EOI marker in public candidate image: ${path}`);
  }
}

const canonicalRoot = await realpath(root);
const rootPrefix = `${canonicalRoot}${sep}`;
const candidateEntries = [];
for (const path of listed) {
  assertSafeRelativePath(path);
  const absolutePath = resolve(root, path);
  const resolvedPath = await realpath(absolutePath);
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
    let text = decodeStrictUtf8(path, bytes);
    if (text.includes("\r")) {
      throw new Error(`Non-LF line ending found in public candidate file: ${path}`);
    }
    text = redactExactAllowedCredentialUrls(path, text);
    text = redactManifestExclusionDeclarations(path, text);
    for (const rule of forbiddenText) {
      if (rule.pattern.test(text)) {
        throw new Error(`${rule.label} found in public candidate file: ${path}`);
      }
    }
    for (const match of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
      if (!allowedEmails.has(match[0].toLowerCase())) {
        throw new Error(`Unexpected email address in public candidate file ${path}: ${match[0]}`);
      }
    }
  } else if (suffix === ".png") {
    assertPngHasNoMetadata(path, bytes);
  } else if (suffix === ".jpg" || suffix === ".jpeg") {
    assertJpegHasNoMetadata(path, bytes);
  } else {
    throw new Error(`Unsupported binary type in public candidate: ${path}`);
  }

  candidateEntries.push({
    path,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
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
      downstream_external_action_gates: manifest.downstream_external_action_gates.length,
    },
    null,
    2,
  ),
);
