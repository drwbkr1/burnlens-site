import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://burnlensproject.org"),
  title: "BurnLens Deschutes | Experimental CV + GEOINT portfolio project",
  description:
    "BurnLens Deschutes is an experimental, portfolio-first computer vision and GEOINT wildfire-screening project for Deschutes County, Oregon, with documented boundaries, traceability, and official-source precedence.",
  applicationName: "BurnLens Deschutes",
  keywords: [
    "BurnLens Deschutes",
    "computer vision portfolio",
    "GEOINT portfolio",
    "wildfire screening",
    "experimental geospatial workflow",
    "Deschutes County",
    "source precedence",
  ],
  openGraph: {
    title: "BurnLens Deschutes",
    description:
      "Experimental CV + GEOINT portfolio work for wildfire-related screening, with transparent limitations and official-source precedence.",
    url: "https://burnlensproject.org",
    siteName: "BurnLens Deschutes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BurnLens Deschutes",
    description:
      "Experimental CV + GEOINT portfolio work with transparent limitations. Not official wildfire information or emergency guidance.",
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
