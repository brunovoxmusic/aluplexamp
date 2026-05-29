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
  heroBackground?: HeroBackgroundSettings;
  contactSettings?: ContactSettings;
  audioLibrary?: AudioLibrarySettings;
  maintenance?: MaintenanceSettings;
};

export type HeroBackgroundSettings = {
  mode: "static" | "slideshow";
  staticImage: string;
  slides: string[];
};

export type ContactSettings = {
  publicEmail: string;
  formEmail: string;
  phone: string;
  instagram: string;
  youtube: string;
  facebook: string;
};

export type AudioTrackSettings = {
  id: string;
  enabled: boolean;
  src: string;
  tagKey: string;
  nameKey: string;
  gearKey: string;
  settingsKey: string;
  descKey: string;
};

export type AudioLibrarySettings = {
  tracks: AudioTrackSettings[];
};

export type MaintenanceLanguage = "sk" | "en" | "de";

export type MaintenanceCopy = {
  eyebrow: string;
  title: string;
  message: string;
  secondaryMessage: string;
  imageAlt: string;
};

export type MaintenanceSettings = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  message: string;
  secondaryMessage: string;
  imageUrl: string;
  imageAlt: string;
  localized?: Partial<Record<MaintenanceLanguage, MaintenanceCopy>>;
};

export const siteSettings = siteJson as SiteSettings;
