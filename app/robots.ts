import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/command-center",
          "/academy/admin/",
          "/academy/learn/",
          "/academy/certificate/",
          "/academy/success",
          "/sign-in",
          "/sign-up",
          "/axionis",
          "/apps/axionis",
          "/apps/axionis/",
          "/*?checkout=*",
          "/*?session_id=*",
          "/*?enrollment=*"
        ],
      },
    ],
    sitemap: "https://www.obserrallc.com/sitemap.xml",
    host: "www.obserrallc.com",
  };
}
