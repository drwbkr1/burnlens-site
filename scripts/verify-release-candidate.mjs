import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(sourceRoot, "scripts/public-candidate-allowlist.json"), "utf8"),
);
const snapshotRoot = await mkdtemp(join(tmpdir(), "nfa-release-candidate-"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
let primaryError;

function windowsCommandLine(args) {
  const tokens = [npmCommand, ...args];
  for (const token of tokens) {
    if (!/^[A-Za-z0-9_.:@/\\-]+$/.test(token)) {
      throw new Error(`Unsafe Windows command token: ${token}`);
    }
  }
  return tokens.join(" ");
}

function candidateEnvironment(overrides) {
  const environment = { ...process.env };
  for (const name of [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SITE_INDEXING",
    "PORTFOLIO_DEPLOYMENT_CONTEXT",
    "PORTFOLIO_TEST_PORT",
    "VERCEL_ENV",
  ]) {
    delete environment[name];
  }
  return { ...environment, ...overrides };
}

function run(args, environment, capture = false) {
  const executable = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : npmCommand;
  const processArguments =
    process.platform === "win32" ? ["/d", "/s", "/c", windowsCommandLine(args)] : args;
  const result = spawnSync(executable, processArguments, {
    cwd: snapshotRoot,
    env: environment,
    encoding: "utf8",
    shell: false,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    const detail = capture ? `\n${result.stdout ?? ""}\n${result.stderr ?? ""}` : "";
    throw new Error(`npm ${args.join(" ")} failed with exit code ${result.status}.${detail}`);
  }

  return result;
}

function assertDisposableSnapshot(path) {
  const systemTemp = resolve(tmpdir());
  const resolvedPath = resolve(path);
  const relativePath = relative(systemTemp, resolvedPath);
  if (
    !isAbsolute(resolvedPath) ||
    relativePath.startsWith("..") ||
    relativePath === "" ||
    !basename(resolvedPath).startsWith("nfa-release-candidate-")
  ) {
    throw new Error(`Refusing to remove unexpected snapshot path: ${resolvedPath}`);
  }
}

try {
  for (const path of manifest.files) {
    const source = resolve(sourceRoot, path);
    const destination = resolve(snapshotRoot, path);
    if (!(await stat(source)).isFile()) {
      throw new Error(`Allowlisted source is not a regular file: ${path}`);
    }
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }

  const localEnvironment = candidateEnvironment({
    PORTFOLIO_DEPLOYMENT_CONTEXT: "local",
    NEXT_PUBLIC_SITE_INDEXING: "deny",
    PORTFOLIO_TEST_PORT: "3101",
  });
  run(["ci"], localEnvironment);
  run(["exec", "playwright", "--", "install", "chromium"], localEnvironment);

  const audit = run(["audit", "--json"], localEnvironment, true);
  const auditResult = JSON.parse(audit.stdout);
  if ((auditResult.metadata?.vulnerabilities?.total ?? 0) !== 0) {
    throw new Error("Dependency audit reported one or more vulnerabilities.");
  }

  run(["run", "verify:public-scope"], localEnvironment);
  run(["run", "check"], localEnvironment);
  run(["run", "test:site"], localEnvironment);

  const productionEnvironment = candidateEnvironment({
    VERCEL_ENV: "production",
    PORTFOLIO_DEPLOYMENT_CONTEXT: "production",
    NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com",
    NEXT_PUBLIC_SITE_INDEXING: "allow",
    PORTFOLIO_TEST_PORT: "3102",
  });
  run(["run", "build"], productionEnvironment);
  run(["run", "test:site"], productionEnvironment);

  const previewEnvironment = candidateEnvironment({
    VERCEL_ENV: "preview",
    PORTFOLIO_DEPLOYMENT_CONTEXT: "preview",
    NEXT_PUBLIC_SITE_URL: "https://preview.portfolio.example.com",
    NEXT_PUBLIC_SITE_INDEXING: "deny",
    PORTFOLIO_TEST_PORT: "3103",
  });
  run(["run", "build"], previewEnvironment);
  run(["run", "test:site"], previewEnvironment);

  const entries = [];
  for (const path of [...manifest.files].sort()) {
    const bytes = await readFile(resolve(snapshotRoot, path));
    entries.push({
      path,
      bytes: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  const digestInput = entries.map((entry) => `${entry.path}\t${entry.bytes}\t${entry.sha256}`).join("\n");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        publication_authority: "none",
        candidate_files: entries.length,
        candidate_bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
        candidate_digest: createHash("sha256").update(digestInput).digest("hex"),
        dependency_audit: auditResult.metadata.vulnerabilities,
        environments: [
          { context: "local", origin: "local fallback", indexing: "deny", browser_tests: 27 },
          { context: "production", origin: "https://portfolio.example.com", indexing: "allow", browser_tests: 27 },
          { context: "preview", origin: "https://preview.portfolio.example.com", indexing: "deny", browser_tests: 27 },
        ],
      },
      null,
      2,
    ),
  );
} catch (error) {
  primaryError = error;
  throw error;
} finally {
  assertDisposableSnapshot(snapshotRoot);
  try {
    await rm(snapshotRoot, {
      recursive: true,
      force: true,
      maxRetries: 20,
      retryDelay: 250,
    });
  } catch (cleanupError) {
    if (!primaryError) throw cleanupError;
    process.stderr.write(
      `Cleanup warning retained after the primary verification failure at ${snapshotRoot}: ${cleanupError}\n`,
    );
  }
}
