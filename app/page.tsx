import type { Metadata } from "next";
import { PersonalFieldAtlas } from "@/components/home/PersonalFieldAtlas";
import { getSiteOrigin } from "@/lib/site-origin";

const title = "Drew Baker | Software, maps & interactive experiences";
const description = "Drew Baker turns data and complex ideas into usable software, maps and interactive experiences through product direction, research and Codex-assisted development.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: "Drew Baker Portfolio", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { title, description, card: "summary_large_image", images: ["/opengraph-image"] },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "William (Drew) Baker",
  alternateName: "Drew Baker",
  url: getSiteOrigin(),
  description,
  sameAs: ["https://github.com/drwbkr1", "https://www.linkedin.com/in/william-baker-843946162/"],
  knowsAbout: ["software development", "product direction", "geospatial analysis", "data visualization", "interactive experiences"],
};

export default function HomePage() {
  return (
    <PersonalFieldAtlas>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }} />
    </PersonalFieldAtlas>
  );
}
