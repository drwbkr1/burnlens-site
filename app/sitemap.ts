import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-origin";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const routes = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/work", changeFrequency: "monthly", priority: 0.9 },
    { path: "/work/burnlens", changeFrequency: "monthly", priority: 0.9 },
    { path: "/work/runbook-sentinel", changeFrequency: "monthly", priority: 0.9 },
    { path: "/work/wildfire-response", changeFrequency: "monthly", priority: 0.8 },
    { path: "/work/after-the-tip", changeFrequency: "monthly", priority: 0.8 },
    { path: "/work/west-hawaii-heat-exposure", changeFrequency: "monthly", priority: 0.8 },
    { path: "/work/nepal-satellite-atlas", changeFrequency: "monthly", priority: 0.8 },
    { path: "/dashboard", changeFrequency: "monthly", priority: 0.6 },
    { path: "/work/quest-craft", changeFrequency: "monthly", priority: 0.7 },
    { path: "/work/openclaw-showcase", changeFrequency: "monthly", priority: 0.7 },
    { path: "/resume", changeFrequency: "monthly", priority: 0.7 },
  ] as const;

  return routes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
