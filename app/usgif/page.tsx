import { permanentRedirect } from "next/navigation";

export default function LegacyUSGIFRedirectPage() {
  permanentRedirect("/");
}
