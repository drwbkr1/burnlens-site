import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "William Drew Baker — Portfolio",
    short_name: "Drew Baker",
    description:
      "Software systems, geospatial evidence, and risk-aware decision tools for uncertain, high-consequence settings.",
    start_url: "/",
    display: "standalone",
    background_color: "#E9E2D8",
    theme_color: "#222222",
    categories: ["portfolio", "technology", "education"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
