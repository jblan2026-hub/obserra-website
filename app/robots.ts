import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/academy/learn/", "/academy/certificate/", "/academy/success", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://www.obserrallc.com/sitemap.xml",
    host: "https://www.obserrallc.com",
  };
}
