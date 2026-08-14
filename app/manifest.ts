import type { MetadataRoute } from "next";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: LEGAL_ENTITY_NAME,
    short_name: LEGAL_ENTITY_NAME,
    description: "Enterprise intelligence, cybersecurity, protective intelligence, secure technology, and professional training.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1521",
    theme_color: "#0a1521",
    icons: [
      {
        src: "/brand/obserra-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
