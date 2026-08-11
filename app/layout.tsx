import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { getSiteOrigin, shouldIndexSite } from "@/lib/site-origin";

const siteUrl = getSiteOrigin();
const indexable = shouldIndexSite();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Drew Baker | Software, geospatial systems & climate work",
    template: "%s | Drew Baker",
  },
  description:
    "Drew Baker designs and tests software, geospatial workflows, and risk-aware decision tools for climate, infrastructure, and public-interest work.",
  applicationName: "Drew Baker Portfolio",
  authors: [{ name: "William (Drew) Baker", url: siteUrl }],
  creator: "William (Drew) Baker",
  keywords: [
    "software engineering",
    "geospatial systems",
    "climate technology",
    "energy policy",
    "machine learning evaluation",
    "SRE safety",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Drew Baker Portfolio",
    title: "Drew Baker | Evidence-bound systems",
    description:
      "Software, geospatial workflows, and risk-aware decision tools—from wildfire evidence to incident-agent safety and energy policy.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drew Baker | Evidence-bound systems",
    description:
      "Software, geospatial workflows, and risk-aware decision tools for uncertain, high-consequence settings.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
    },
  },
  category: "portfolio",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#E9E2D8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
