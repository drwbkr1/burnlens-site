import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://burnlensproject.org"),
  title: "BurnLens | Wildfire planning support for resilient communities",
  description:
    "BurnLens is a public-interest wildfire planning initiative that turns satellite imagery and authoritative fire information into planning-ready maps, memos, and screening materials for local resilience work.",
  applicationName: "BurnLens",
  keywords: [
    "BurnLens",
    "wildfire planning",
    "community resilience",
    "evacuation access",
    "geospatial AI",
    "Deschutes County",
    "wildfire screening",
  ],
  openGraph: {
    title: "BurnLens",
    description:
      "Wildfire planning support for resilient communities through planning-ready maps, memos, and review materials.",
    url: "https://burnlensproject.org",
    siteName: "BurnLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BurnLens",
    description:
      "Wildfire planning support for resilient communities through planning-ready maps, memos, and review materials.",
  },
  alternates: {
    canonical: "https://burnlensproject.org",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
