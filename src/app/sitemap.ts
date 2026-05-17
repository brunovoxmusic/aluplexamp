import type { MetadataRoute } from "next";
import { siteSettings } from "@/lib/site";

const staticPages = [
  { path: "/", priority: 1, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((page) => ({
    url: `${siteSettings.siteUrl}${page.path === "/" ? "" : page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates:
      page.path === "/"
        ? {
            languages: {
              sk: siteSettings.siteUrl,
              en: `${siteSettings.siteUrl}?lang=en`,
              de: `${siteSettings.siteUrl}?lang=de`,
              "x-default": siteSettings.siteUrl,
            },
          }
        : undefined,
  }));
}
