import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Obserra",
    short_name: "Obserra",
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
