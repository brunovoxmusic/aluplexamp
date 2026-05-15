import siteJson from "@/content/site.json";

export type SiteSettings = {
  siteUrl: string;
  brandName: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  ogImage: string;
  keywords: string[];
};

export const siteSettings = siteJson as SiteSettings;
