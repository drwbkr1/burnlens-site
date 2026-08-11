import { permanentRedirect } from "next/navigation";

export default function LegacyGraduatePortfolioResumeRedirectPage() {
  permanentRedirect("/resume");
}
