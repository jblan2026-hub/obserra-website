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
          "/academy/admin/",
          "/academy/learn/",
          "/academy/certificate/",
          "/academy/success",
          "/florida-security-training/access",
          "/florida-security-training/admin/",
          "/florida-security-training/completion",
          "/florida-security-training/enroll",
          "/florida-security-training/exam",
          "/florida-security-training/identity",
          "/florida-security-training/live/",
          "/florida-security-training/makeup",
          "/florida-security-training/observer",
          "/portal/",
          "/sign-in",
          "/sign-up",
          "/*?checkout=*",
          "/*?session_id=*",
          "/*?enrollment=*"
        ],
      },
    ],
    sitemap: ["https://www.obserrallc.com/sitemap.xml", "https://www.obserrallc.com/ai-marketplace/sitemap.xml"],
    host: "www.obserrallc.com",
  };
}
