import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "BurnLens | Public-Interest Wildfire Planning Support",
  description:
    "BurnLens is a public-interest wildfire planning initiative building planning-ready screening products for evacuation access, community exposure, and local resilience work in Deschutes County, Oregon.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
