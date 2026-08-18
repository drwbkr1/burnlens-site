import type { MetadataRoute } from "next";

import { getSiteUrl, shouldIndexSite } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (!shouldIndexSite()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
