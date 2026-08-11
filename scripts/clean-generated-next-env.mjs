import { rm } from "node:fs/promises";

await rm(new URL("../next-env.d.ts", import.meta.url), { force: true });
