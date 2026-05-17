import type { MetadataRoute } from "next";
import { siteSettings } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/admin", "/api/admin/"],
      },
    ],
    sitemap: `${siteSettings.siteUrl}/sitemap.xml`,
  };
}
