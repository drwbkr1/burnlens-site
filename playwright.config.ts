import { defineConfig } from "@playwright/test";

const rawTestPort = process.env.PORTFOLIO_TEST_PORT ?? "3101";
const testPort = Number(rawTestPort);
if (!Number.isInteger(testPort) || testPort < 1024 || testPort > 65_535) {
  throw new Error(`PORTFOLIO_TEST_PORT must be an integer from 1024 to 65535; received ${rawTestPort}.`);
}
const testOrigin = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: "line",
  use: {
    baseURL: testOrigin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run start -- -p ${testPort}`,
    url: testOrigin,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
