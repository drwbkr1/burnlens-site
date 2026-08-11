import { permanentRedirect } from "next/navigation";

export default function LegacyUSGIFResumeRedirectPage() {
  permanentRedirect("/resume");
}
