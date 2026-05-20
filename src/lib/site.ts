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
  maintenance?: MaintenanceSettings;
};

export type MaintenanceSettings = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  message: string;
  secondaryMessage: string;
  imageUrl: string;
  imageAlt: string;
};

export const siteSettings = siteJson as SiteSettings;
