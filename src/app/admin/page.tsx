"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  AudioLibrarySettings,
  AudioTrackSettings,
  ContactSettings,
  HeroBackgroundSettings,
  MaintenanceSettings,
  PublicSectionId,
  SiteSettings,
} from "@/lib/site";
import { PUBLIC_SECTION_IDS, isSectionVisible } from "@/lib/site";
import type { Language, Translations } from "@/lib/translations";

const publicSectionLabels: Record<
  PublicSectionId,
  { label: string; description: string }
> = {
  hero: { label: "Hero (úvod)", description: "Hlavná úvodná obrazovka s nadpisom a tlačidlami." },
  valueProps: { label: "Prednosti", description: "Bloky s hlavnými výhodami zosilňovača." },
  specs: { label: "Špecifikácie", description: "Technické parametre a konštrukcia." },
  soundArchitecture: { label: "Architektúra zvuku", description: "Popis zvukového reťazca." },
  soundlib: { label: "Ukážky zvuku", description: "Audio prehrávač s nahrávkami." },
  purchasePath: { label: "Cesta k objednávke", description: "Postup od výberu po dodanie." },
  config: { label: "Konfigurátor", description: "Výber farby a vybavenia s dopytom." },
  gallery: { label: "Galéria", description: "Fotografie zosilňovača." },
  faq: { label: "Časté otázky", description: "Otázky a odpovede." },
  cta: { label: "Výzva na kontakt (CTA)", description: "Pás s tlačidlami kontakt a objednávka." },
  contact: { label: "Kontakt", description: "Kontaktný formulár a údaje." },
};

const languages: Array<{ value: Language; label: string }> = [
  { value: "sk", label: "Slovenčina" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const sections = [
  { id: "hero", label: "Hero" },
  { id: "cta", label: "CTA" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Kontakt" },
  { id: "allText", label: "Všetky texty" },
  { id: "siteContact", label: "Kontaktné údaje" },
  { id: "audio", label: "Audio" },
  { id: "visibility", label: "Viditeľnosť sekcií" },
  { id: "maintenance", label: "Maintenance" },
  { id: "seo", label: "SEO" },
  { id: "advanced", label: "JSON" },
] as const;

type SectionId = (typeof sections)[number]["id"];

// Vercel rejects request bodies over 4.5 MB; keep uploads and saves safely below it.
const MAX_AUDIO_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_MAINTENANCE_IMAGE_BYTES = 1024 * 1024;
const MAX_SAVE_PAYLOAD_BYTES = 4 * 1024 * 1024;
type SaveState = "idle" | "loading" | "saving" | "saved" | "error";
type TextField = { key: string; label: string; multiline?: boolean };
type MaintenanceLocalizedKey =
  | "eyebrow"
  | "title"
  | "message"
  | "secondaryMessage"
  | "imageAlt";

const CONTACT_EMAIL = "info@aluplexamp.com";

const defaultContactSettings: ContactSettings = {
  publicEmail: CONTACT_EMAIL,
  formEmail: CONTACT_EMAIL,
  phone: "",
  instagram: "https://instagram.com/aluplexamp",
  youtube: "https://youtube.com/@aluplexamp",
  facebook: "https://facebook.com/aluplexamp",
};

const defaultHeroBackground: HeroBackgroundSettings = {
  mode: "static",
  staticImage: "/aluplex/aluplex-red-front.jpg",
  slides: [
    "/aluplex/aluplex-red-front.jpg",
    "/aluplex/aluplex-1.jpg",
    "/aluplex/aluplex-56.jpg",
    "/aluplex/DSC6821.jpg",
    "/aluplex/aluplex-138.jpg",
  ],
};

const defaultAudioTracks: AudioTrackSettings[] = Array.from(
  { length: 7 },
  (_, index) => {
    const id = index + 1;
    const sources = [
      "/audio/track1-woody-clean.mp3",
      "/audio/track2-cranked-british-crunch.mp3",
      "/audio/track3-brown-sound-session.mp3",
      "/audio/track4-touch-dynamics.mp3",
      "/audio/track5-volume-rolloff.mp3",
      "/audio/track6-lead-sustain.mp3",
      "/audio/track7-extended-amp-journey.mp3",
    ];

    return {
      id: `track${id}`,
      enabled: true,
      src: sources[index],
      tagKey: `sl.track${id}.tag`,
      nameKey: `sl.track${id}.name`,
      gearKey: `sl.track${id}.gear`,
      settingsKey: `sl.track${id}.settings`,
      descKey: `sl.track${id}.desc`,
    };
  }
);

const defaultAudioLibrary: AudioLibrarySettings = {
  tracks: defaultAudioTracks,
};

const heroFields: TextField[] = [
  { key: "hero.badge", label: "Badge" },
  { key: "hero.title", label: "H1 nadpis" },
  { key: "hero.subtitle", label: "Podnadpis" },
  { key: "hero.description", label: "Popis", multiline: true },
  { key: "hero.cta.listen", label: "Primary CTA" },
  { key: "hero.cta.configure", label: "Secondary CTA" },
  { key: "hero.handwired", label: "Spec label" },
];

const ctaFields: TextField[] = [
  { key: "cta.title", label: "Nadpis" },
  { key: "cta.subtitle", label: "Text", multiline: true },
  { key: "cta.contact", label: "Tlačidlo kontakt" },
  { key: "cta.order", label: "Tlačidlo objednávka" },
];

const contactFields: TextField[] = [
  { key: "form.title", label: "Nadpis formulára" },
  { key: "form.subtitle", label: "Popis formulára", multiline: true },
  { key: "form.name.placeholder", label: "Placeholder meno" },
  { key: "form.email.placeholder", label: "Placeholder email" },
  { key: "form.subject.placeholder", label: "Placeholder predmet" },
  { key: "form.message.placeholder", label: "Placeholder správa", multiline: true },
  { key: "form.submit", label: "Tlačidlo odoslať" },
  { key: "form.success", label: "Success správa", multiline: true },
  { key: "form.error", label: "Error správa", multiline: true },
];

const defaultMaintenance: MaintenanceSettings = {
  enabled: false,
  eyebrow: "ALUPLEXamp",
  title: "Stránku práve ladíme.",
  message:
    "Pripravujeme aktualizáciu webu, aby sme mohli lepšie predstaviť zosilňovač ALUPLEXamp, jeho zvuk a možnosti výroby na objednávku.",
  secondaryMessage:
    `Ak nás potrebuješ kontaktovať hneď, napíš na ${CONTACT_EMAIL}.`,
  imageUrl: "/aluplex/aluplex-1.jpg",
  imageAlt: "ALUPLEXamp elektrónkový gitarový zosilňovač",
  localized: {
    sk: {
      eyebrow: "ALUPLEXamp",
      title: "Stránku práve ladíme.",
      message:
        "Pripravujeme aktualizáciu webu, aby sme mohli lepšie predstaviť zosilňovač ALUPLEXamp, jeho zvuk a možnosti výroby na objednávku.",
      secondaryMessage: `Ak nás potrebuješ kontaktovať hneď, napíš na ${CONTACT_EMAIL}.`,
      imageAlt: "ALUPLEXamp elektrónkový gitarový zosilňovač",
    },
    en: {
      eyebrow: "ALUPLEXamp",
      title: "The website is being tuned.",
      message:
        "We are preparing an update that will present the ALUPLEXamp amplifier, its sound and made-to-order options with more precision.",
      secondaryMessage: `For direct contact, email us at ${CONTACT_EMAIL}.`,
      imageAlt: "ALUPLEXamp tube guitar amplifier",
    },
    de: {
      eyebrow: "ALUPLEXamp",
      title: "Die Website wird gerade abgestimmt.",
      message:
        "Wir bereiten ein Update vor, das den ALUPLEXamp Verstaerker, seinen Klang und die Fertigung auf Bestellung praeziser praesentiert.",
      secondaryMessage: `Fuer direkten Kontakt schreiben Sie uns an ${CONTACT_EMAIL}.`,
      imageAlt: "ALUPLEXamp Roehren-Gitarrenverstaerker",
    },
  },
};

function sortEntries(entries: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b))
  );
}

// Keep the original key order so saving does not reshuffle the whole JSON file.
function preserveKeyOrder(
  original: Record<string, string>,
  edited: Record<string, string>
) {
  const ordered: Record<string, string> = {};

  for (const key of Object.keys(original)) {
    if (key in edited) ordered[key] = edited[key];
  }

  for (const key of Object.keys(edited)) {
    if (!(key in ordered)) ordered[key] = edited[key];
  }

  return ordered;
}

const apiErrorMessages: Record<string, string> = {
  unauthorized: "Nesprávne admin heslo.",
  rate_limited: "Príliš veľa neúspešných pokusov. Skús to znova o 15 minút.",
  invalid_content: "Obsah má neplatný formát a nebol uložený.",
  invalid_json: "Server dostal neplatné dáta.",
  content_read_failed: "Obsah sa nepodarilo načítať.",
  invalid_upload_payload: "Neplatná požiadavka na upload.",
  invalid_audio_file: "Súbor musí byť MP3, WAV, M4A alebo OGG a mať najviac 4 MB.",
  upload_failed: "Upload súboru zlyhal.",
  missing_github_content_token: "Na serveri chýba GITHUB_CONTENT_TOKEN, obsah sa nedá uložiť.",
};

// API routes return machine codes; show them to the admin in plain Slovak.
function describeMessage(message: string) {
  if (apiErrorMessages[message]) return apiErrorMessages[message];
  if (message.startsWith("github_")) {
    return `Zápis do GitHubu zlyhal (${message}). Skontroluj GITHUB_CONTENT_TOKEN a skús znova.`;
  }

  return message;
}

function getEditorErrorMessage(error: unknown) {
  if (error instanceof SyntaxError) {
    return `Neplatný JSON: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Úpravy sa nepodarilo použiť.";
}

function getFallbackSite(): SiteSettings {
  return {
    siteUrl: "https://aluplexamp.com",
    brandName: "ALUPLEXamp",
    title: "",
    description: "",
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    ogImage: "/og-image.jpg",
    keywords: [],
    heroBackground: defaultHeroBackground,
    contactSettings: defaultContactSettings,
    audioLibrary: defaultAudioLibrary,
    maintenance: defaultMaintenance,
  };
}

function normalizeSite(nextSite: SiteSettings): SiteSettings {
  return {
    ...nextSite,
    heroBackground: {
      ...defaultHeroBackground,
      ...nextSite.heroBackground,
      slides:
        nextSite.heroBackground?.slides && nextSite.heroBackground.slides.length > 0
          ? nextSite.heroBackground.slides
          : defaultHeroBackground.slides,
    },
    contactSettings: {
      ...defaultContactSettings,
      ...nextSite.contactSettings,
    },
    audioLibrary: {
      ...defaultAudioLibrary,
      ...nextSite.audioLibrary,
      tracks:
        nextSite.audioLibrary?.tracks && nextSite.audioLibrary.tracks.length > 0
          ? nextSite.audioLibrary.tracks
          : defaultAudioLibrary.tracks,
    },
    maintenance: {
      ...defaultMaintenance,
      ...nextSite.maintenance,
      localized: {
        ...defaultMaintenance.localized,
        ...nextSite.maintenance?.localized,
      },
    },
  };
}

export default function AdminPage() {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [site, setSite] = useState<SiteSettings>(getFallbackSite);
  const [language, setLanguage] = useState<Language>("sk");
  const [section, setSection] = useState<SectionId>("hero");
  const [jsonValue, setJsonValue] = useState("");
  const [siteJsonValue, setSiteJsonValue] = useState("");
  const [keywordValue, setKeywordValue] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [status, setStatus] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [uploadingTrackId, setUploadingTrackId] = useState<string | null>(null);

  async function loadContent(adminPassword: string) {
    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch("/api/admin/content", {
        cache: "no-store",
        headers: {
          "x-admin-password": adminPassword,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodarilo sa načítať obsah.");
      }

      const nextTranslations = data.translations ?? data.content;
      const nextSite = normalizeSite(data.site ?? getFallbackSite());

      setTranslations(nextTranslations);
      setSite(nextSite);
      setJsonValue(JSON.stringify(sortEntries(nextTranslations.sk), null, 2));
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      setKeywordValue(nextSite.keywords.join("\n"));
      setAdminPassword(adminPassword);
      setIsAuthenticated(true);
      sessionStorage.setItem("aluplex-admin-password", adminPassword);
      setStatus("idle");
    } catch (error) {
      setIsAuthenticated(false);
      sessionStorage.removeItem("aluplex-admin-password");
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Nepodarilo sa načítať obsah."
      );
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("aluplex-admin-password");

    if (storedPassword) {
      queueMicrotask(() => {
        loadContent(storedPassword);
      });
      return;
    }

    queueMicrotask(() => {
      setAuthChecked(true);
    });
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadContent(password);
  }

  function logout() {
    setIsAuthenticated(false);
    setTranslations(null);
    setPassword("");
    setAdminPassword("");
    setStatus("idle");
    setMessage("");
    sessionStorage.removeItem("aluplex-admin-password");
  }

  const keyCount = useMemo(() => {
    if (!translations) return 0;
    return Object.keys(translations[language]).length;
  }, [translations, language]);

  function setTranslationField(key: string, value: string) {
    setTranslations((current) => {
      if (!current) return current;

      return {
        ...current,
        [language]: {
          ...current[language],
          [key]: value,
        },
      };
    });
    setStatus("idle");
    setMessage("");
  }

  function setSiteField<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) {
    setSite((current) => {
      const nextSite = { ...current, [key]: value };
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function setHeroBackgroundField<K extends keyof HeroBackgroundSettings>(
    key: K,
    value: HeroBackgroundSettings[K]
  ) {
    setSite((current) => {
      const nextSite = normalizeSite({
        ...current,
        heroBackground: {
          ...defaultHeroBackground,
          ...current.heroBackground,
          [key]: value,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function setContactSettingsField<K extends keyof ContactSettings>(
    key: K,
    value: ContactSettings[K]
  ) {
    setSite((current) => {
      const nextSite = normalizeSite({
        ...current,
        contactSettings: {
          ...defaultContactSettings,
          ...current.contactSettings,
          [key]: value,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function setAudioTrackField<K extends keyof AudioTrackSettings>(
    index: number,
    key: K,
    value: AudioTrackSettings[K]
  ) {
    setSite((current) => {
      const audioLibrary = current.audioLibrary ?? defaultAudioLibrary;
      const tracks = [...audioLibrary.tracks];
      tracks[index] = { ...tracks[index], [key]: value };
      const nextSite = normalizeSite({
        ...current,
        audioLibrary: {
          ...audioLibrary,
          tracks,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function removeAudioTrack(index: number) {
    const tracks = site.audioLibrary?.tracks ?? defaultAudioLibrary.tracks;

    // normalizeSite falls back to the default tracks when the list is empty.
    if (tracks.length <= 1) {
      setStatus("error");
      setMessage("Posledný audio track sa nedá odstrániť. Môžeš ho vypnúť.");
      return;
    }

    const track = tracks[index];
    const trackName = track ? translations?.[language][track.nameKey] || track.id : "";
    if (!window.confirm(`Naozaj odstrániť track „${trackName}“?`)) return;

    setSite((current) => {
      const audioLibrary = current.audioLibrary ?? defaultAudioLibrary;
      const tracks = audioLibrary.tracks.filter((_, trackIndex) => trackIndex !== index);
      const nextSite = normalizeSite({
        ...current,
        audioLibrary: {
          ...audioLibrary,
          tracks,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function addAudioTrack() {
    const currentTracks = site.audioLibrary?.tracks ?? defaultAudioLibrary.tracks;
    // Derive the next id from existing ids and translation keys, not the track count,
    // so removing a track can never produce a duplicate id that overwrites another track's texts.
    const usedNumbers = [
      ...currentTracks.map((track) => track.id),
      ...Object.keys(translations?.sk ?? {}),
    ]
      .map((value) => /(?:^|\.)track(\d+)(?:\.|$)/.exec(value)?.[1])
      .filter((value): value is string => Boolean(value))
      .map(Number);
    const nextNumber = Math.max(0, ...usedNumbers) + 1;
    const id = `track${nextNumber}`;
    const nextTrack: AudioTrackSettings = {
      id,
      enabled: true,
      src: "",
      tagKey: `sl.${id}.tag`,
      nameKey: `sl.${id}.name`,
      gearKey: `sl.${id}.gear`,
      settingsKey: `sl.${id}.settings`,
      descKey: `sl.${id}.desc`,
    };

    setSite((current) => {
      const audioLibrary = current.audioLibrary ?? defaultAudioLibrary;
      const nextSite = normalizeSite({
        ...current,
        audioLibrary: {
          ...audioLibrary,
          tracks: [...audioLibrary.tracks, nextTrack],
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });

    setTranslations((current) => {
      if (!current) return current;

      const defaults = {
        sk: {
          tag: "NOVÁ UKÁŽKA",
          name: "Nová zvuková ukážka",
          gear: "ALUPLEXamp",
          settings: "Doplň nastavenie aparátu",
          desc: "Doplň popis charakteru zvuku.",
        },
        en: {
          tag: "NEW SAMPLE",
          name: "New sound sample",
          gear: "ALUPLEXamp",
          settings: "Add amplifier settings",
          desc: "Add a description of the tone character.",
        },
        de: {
          tag: "NEUES SAMPLE",
          name: "Neue Klangprobe",
          gear: "ALUPLEXamp",
          settings: "Verstärker-Einstellung ergänzen",
          desc: "Beschreibung des Klangcharakters ergänzen.",
        },
      } satisfies Record<Language, Record<string, string>>;

      return {
        ...current,
        sk: {
          ...current.sk,
          [nextTrack.tagKey]: defaults.sk.tag,
          [nextTrack.nameKey]: defaults.sk.name,
          [nextTrack.gearKey]: defaults.sk.gear,
          [nextTrack.settingsKey]: defaults.sk.settings,
          [nextTrack.descKey]: defaults.sk.desc,
        },
        en: {
          ...current.en,
          [nextTrack.tagKey]: defaults.en.tag,
          [nextTrack.nameKey]: defaults.en.name,
          [nextTrack.gearKey]: defaults.en.gear,
          [nextTrack.settingsKey]: defaults.en.settings,
          [nextTrack.descKey]: defaults.en.desc,
        },
        de: {
          ...current.de,
          [nextTrack.tagKey]: defaults.de.tag,
          [nextTrack.nameKey]: defaults.de.name,
          [nextTrack.gearKey]: defaults.de.gear,
          [nextTrack.settingsKey]: defaults.de.settings,
          [nextTrack.descKey]: defaults.de.desc,
        },
      };
    });
    setStatus("idle");
    setMessage("");
  }

  async function uploadAudioTrack(index: number, file: File | null) {
    if (!file) return;

    if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
      setStatus("error");
      setMessage("Audio súbor môže mať najviac 4 MB. Zmenši ho (napr. MP3 192 kbps) a skús znova.");
      return;
    }

    try {
      setUploadingTrackId(site.audioLibrary?.tracks[index]?.id ?? String(index));
      setStatus("saving");
      setMessage("");

      const body = new FormData();
      body.append("password", adminPassword);
      body.append("kind", "audio");
      body.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok || typeof data.src !== "string") {
        throw new Error(data.error || "Upload audio súboru zlyhal.");
      }

      setAudioTrackField(index, "src", data.src);
      setStatus("saved");
      setMessage("Audio súbor bol nahratý. Po kontrole nezabudni uložiť obsah.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload audio súboru zlyhal.");
    } finally {
      setUploadingTrackId(null);
    }
  }

  function setMaintenanceField<K extends keyof MaintenanceSettings>(
    key: K,
    value: MaintenanceSettings[K]
  ) {
    setSite((current) => {
      const nextSite = normalizeSite({
        ...current,
        maintenance: {
          ...defaultMaintenance,
          ...current.maintenance,
          [key]: value,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function setMaintenanceLocalizedField(
    lang: Language,
    key: MaintenanceLocalizedKey,
    value: string
  ) {
    setSite((current) => {
      const currentMaintenance = current.maintenance ?? defaultMaintenance;
      const localized = {
        ...defaultMaintenance.localized,
        ...currentMaintenance.localized,
        [lang]: {
          ...defaultMaintenance.localized?.[lang],
          ...currentMaintenance.localized?.[lang],
          [key]: value,
        },
      };
      const nextSite = normalizeSite({
        ...current,
        maintenance: {
          ...defaultMaintenance,
          ...currentMaintenance,
          localized,
        },
      });
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
      return nextSite;
    });
    setStatus("idle");
    setMessage("");
  }

  function importMaintenanceImage(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Vybraný súbor musí byť obrázok.");
      return;
    }

    if (file.size > MAX_MAINTENANCE_IMAGE_BYTES) {
      setStatus("error");
      setMessage("Obrázok môže mať najviac 1 MB, pretože sa ukladá priamo do obsahu webu.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("error");
        setMessage("Obrázok sa nepodarilo načítať.");
        return;
      }

      setMaintenanceField("imageUrl", reader.result);
    };
    reader.onerror = () => {
      setStatus("error");
      setMessage("Obrázok sa nepodarilo načítať.");
    };
    reader.readAsDataURL(file);
  }

  function changeLanguage(nextLanguage: Language) {
    if (!translations) return;

    try {
      const bundle = commitSectionEdits(section);
      if (!bundle) return;

      setLanguage(nextLanguage);
      setJsonValue(
        JSON.stringify(sortEntries(bundle.translations[nextLanguage]), null, 2)
      );
      setStatus("idle");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setMessage(getEditorErrorMessage(error));
    }
  }

  function changeSection(nextSection: SectionId) {
    if (nextSection === section) return;

    try {
      const bundle = commitSectionEdits(section);
      if (!bundle) {
        setSection(nextSection);
        return;
      }

      // Re-seed editors that hold their own copy of the data, so they never show stale content.
      if (nextSection === "advanced") {
        setJsonValue(
          JSON.stringify(sortEntries(bundle.translations[language]), null, 2)
        );
        setSiteJsonValue(JSON.stringify(bundle.site, null, 2));
      } else if (nextSection === "seo") {
        setKeywordValue(bundle.site.keywords.join("\n"));
      }

      setSection(nextSection);
    } catch (error) {
      setStatus("error");
      setMessage(getEditorErrorMessage(error));
    }
  }

  function commitSectionEdits(fromSection: SectionId) {
    if (!translations) return null;

    let nextTranslations = translations;
    let nextSite = site;

    if (fromSection === "advanced") {
      const parsedTranslations = JSON.parse(jsonValue) as Record<string, unknown>;
      if (
        !parsedTranslations ||
        typeof parsedTranslations !== "object" ||
        Array.isArray(parsedTranslations)
      ) {
        throw new Error("Preklady musia byť JSON objekt.");
      }

      const invalidTranslation = Object.entries(parsedTranslations).find(
        ([key, value]) => typeof key !== "string" || typeof value !== "string"
      );

      if (invalidTranslation) {
        throw new Error("Každý prekladový kľúč aj hodnota musia byť text.");
      }

      const parsedSite = normalizeSite(JSON.parse(siteJsonValue) as SiteSettings);
      if (
        !Array.isArray(parsedSite.keywords) ||
        !parsedSite.keywords.every((keyword) => typeof keyword === "string")
      ) {
        throw new Error("SEO keywords musia byť pole textov.");
      }

      nextTranslations = {
        ...translations,
        [language]: preserveKeyOrder(
          translations[language],
          parsedTranslations as Record<string, string>
        ),
      };
      nextSite = parsedSite;
      setTranslations(nextTranslations);
      setSite(nextSite);
      setKeywordValue(nextSite.keywords.join("\n"));
    } else if (fromSection === "seo") {
      nextSite = {
        ...site,
        keywords: keywordValue
          .split("\n")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      };
      setSite(nextSite);
      setSiteJsonValue(JSON.stringify(nextSite, null, 2));
    }

    return { translations: nextTranslations, site: nextSite };
  }

  async function saveContent() {
    try {
      setStatus("saving");
      setMessage("");

      const bundle = commitSectionEdits(section);
      if (!bundle) return;

      const payload = JSON.stringify({
        password: adminPassword,
        translations: bundle.translations,
        site: bundle.site,
      });

      if (new Blob([payload]).size > MAX_SAVE_PAYLOAD_BYTES) {
        throw new Error(
          "Obsah je príliš veľký na uloženie (limit 4 MB). Zmenši alebo odstráň vložený obrázok."
        );
      }

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Uloženie zlyhalo.");
      }

      setStatus("saved");
      setMessage(
        data.savedTo === "github"
          ? "Obsah je uložený do GitHubu. Verejná stránka si načíta aktuálny CMS obsah automaticky; Vercel zároveň spustí nový produkčný deploy."
          : "Obsah je uložený lokálne."
      );
    } catch (error) {
      setStatus("error");
      setMessage(getEditorErrorMessage(error));
    }
  }

  function renderTextFields(fields: TextField[]) {
    if (!translations) return null;

    return (
      <div className="grid gap-4">
        {fields.map((field) => (
          <label key={field.key} className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              {field.label}
            </span>
            {field.multiline ? (
              <textarea
                value={translations[language][field.key] ?? ""}
                onChange={(event) => setTranslationField(field.key, event.target.value)}
                rows={4}
                className="min-h-28 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
              />
            ) : (
              <input
                value={translations[language][field.key] ?? ""}
                onChange={(event) => setTranslationField(field.key, event.target.value)}
                className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
              />
            )}
          </label>
        ))}
      </div>
    );
  }

  function renderHeroFields() {
    const heroBackground = site.heroBackground ?? defaultHeroBackground;

    return (
      <div className="grid gap-6">
        {renderTextFields(heroFields)}

        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb800]">
              Hero pozadie
            </p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Nastavte hlavný obrázok hero sekcie alebo zapnite slideshow z vybraných obrázkov.
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Režim pozadia
            </span>
            <select
              value={heroBackground.mode}
              onChange={(event) =>
                setHeroBackgroundField(
                  "mode",
                  event.target.value === "slideshow" ? "slideshow" : "static"
                )
              }
              className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
            >
              <option value="static">Statický obrázok</option>
              <option value="slideshow">Slideshow obrázkov</option>
            </select>
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Statický obrázok
            </span>
            <input
              value={heroBackground.staticImage}
              onChange={(event) =>
                setHeroBackgroundField("staticImage", event.target.value)
              }
              placeholder="/aluplex/aluplex-red-front.jpg"
              className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
            />
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Slideshow obrázky
            </span>
            <textarea
              value={heroBackground.slides.join("\n")}
              onChange={(event) =>
                setHeroBackgroundField(
                  "slides",
                  event.target.value
                    .split("\n")
                    .map((src) => src.trim())
                    .filter(Boolean)
                )
              }
              rows={6}
              placeholder="/aluplex/aluplex-red-front.jpg"
              className="min-h-36 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
            />
            <span className="text-xs leading-5 text-white/40">
              Každý obrázok zadajte na nový riadok. Odporúčané sú súbory z adresára
              public/aluplex, napr. /aluplex/aluplex-red-front.jpg.
            </span>
          </label>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <div className="relative min-h-52">
              <img
                src={
                  heroBackground.mode === "slideshow"
                    ? heroBackground.slides[0] ?? heroBackground.staticImage
                    : heroBackground.staticImage
                }
                alt="Hero background preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/45 to-transparent" />
              <div className="relative z-10 flex min-h-52 flex-col justify-end p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffb800]">
                  Preview
                </p>
                <p className="mt-2 max-w-md text-lg font-semibold text-white">
                  {heroBackground.mode === "slideshow"
                    ? `Slideshow: ${heroBackground.slides.length} obrázkov`
                    : "Statický hero obrázok"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAllTextFields() {
    if (!translations) return null;

    const filter = textFilter.trim().toLowerCase();
    const entries = Object.entries(translations[language])
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([key, value]) => {
        if (!filter) return true;
        return (
          key.toLowerCase().includes(filter) ||
          value.toLowerCase().includes(filter)
        );
      });

    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">
            Kompletný editor textov pre {language.toUpperCase()}
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Tu sú editovateľné všetky textové kľúče použité na stránke vrátane
            jazykových mutácií. Zmeny sa ukladajú spolu s obsahom CMS.
          </p>
          <input
            value={textFilter}
            onChange={(event) => setTextFilter(event.target.value)}
            placeholder="Filtrovať podľa kľúča alebo textu"
            className="mt-4 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
          />
        </div>

        <div className="grid gap-3">
          {entries.map(([key, value]) => (
            <label key={key} className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-4">
              <span className="font-mono text-[11px] text-[#ffb800]/85">
                {key}
              </span>
              <textarea
                value={value}
                onChange={(event) => setTranslationField(key, event.target.value)}
                rows={value.length > 120 ? 4 : 2}
                className="min-h-16 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderSiteContactFields() {
    const contactSettings = site.contactSettings ?? defaultContactSettings;

    return (
      <div className="grid gap-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
          Tieto údaje sa používajú vo footeri, CTA, maintenance obrazovke,
          Schema.org metadátach a kontaktnom/dopytovom formulári.
        </div>
        {[
          ["publicEmail", "Univerzálny verejný e-mail"],
          ["formEmail", "E-mail pre kontaktný/dopyt formulár"],
          ["phone", "Telefon"],
          ["instagram", "Instagram URL"],
          ["youtube", "YouTube URL"],
          ["facebook", "Facebook URL"],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              {label}
            </span>
            <input
              value={contactSettings[key as keyof ContactSettings]}
              onChange={(event) =>
                setContactSettingsField(
                  key as keyof ContactSettings,
                  event.target.value
                )
              }
              placeholder={key.includes("Email") ? CONTACT_EMAIL : undefined}
              className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
            />
          </label>
        ))}
      </div>
    );
  }

  function renderAudioFields() {
    const audioLibrary = site.audioLibrary ?? defaultAudioLibrary;

    return (
      <div className="grid gap-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">
            Audio prehrávač zvukových ukážok
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Zapni/vypni zverejnené tracky, nastav zdroj audio súboru alebo nahraj
            nový súbor. Názvy a popisy trackov sú prekladové kľúče, ktoré môžeš
            upravovať tu aj v sekcii Všetky texty.
          </p>
        </div>

        <div className="grid gap-4">
          {audioLibrary.tracks.map((track, index) => (
            <div key={`${track.id}-${index}`} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {translations?.[language]?.[track.nameKey] || track.id}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-white/35">
                    {track.src || "Bez audio súboru"}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-white/65">
                  <input
                    type="checkbox"
                    checked={track.enabled}
                    onChange={(event) =>
                      setAudioTrackField(index, "enabled", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#ffb800]"
                  />
                  Zverejniť v prehrávači
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    ID tracku
                  </span>
                  <input
                    value={track.id}
                    onChange={(event) =>
                      setAudioTrackField(index, "id", event.target.value)
                    }
                    className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    Audio URL
                  </span>
                  <input
                    value={track.src}
                    onChange={(event) =>
                      setAudioTrackField(index, "src", event.target.value)
                    }
                    placeholder="/audio/nazov-suboru.mp3"
                    className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-5">
                {[
                  ["tagKey", "Tag"],
                  ["nameKey", "Názov"],
                  ["gearKey", "Aparat"],
                  ["settingsKey", "Nastavenie"],
                  ["descKey", "Popis"],
                ].map(([key, label]) => (
                  <label key={key} className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                      {label}
                    </span>
                    <input
                      value={track[key as keyof AudioTrackSettings] as string}
                      onChange={(event) =>
                        setAudioTrackField(
                          index,
                          key as keyof AudioTrackSettings,
                          event.target.value as never
                        )
                      }
                      className="h-10 rounded-md border border-white/10 bg-black/35 px-3 font-mono text-xs text-white outline-none transition focus:border-[#ffb800]/70"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                      Názov tracku ({language.toUpperCase()})
                    </span>
                    <input
                      value={translations?.[language]?.[track.nameKey] ?? ""}
                      onChange={(event) =>
                        setTranslationField(track.nameKey, event.target.value)
                      }
                      className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                      Tag ({language.toUpperCase()})
                    </span>
                    <input
                      value={translations?.[language]?.[track.tagKey] ?? ""}
                      onChange={(event) =>
                        setTranslationField(track.tagKey, event.target.value)
                      }
                      className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
                    />
                  </label>
                </div>
                <label className="mt-3 grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    Popis zvuku ({language.toUpperCase()})
                  </span>
                  <textarea
                    value={translations?.[language]?.[track.descKey] ?? ""}
                    onChange={(event) =>
                      setTranslationField(track.descKey, event.target.value)
                    }
                    rows={3}
                    className="min-h-20 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-white/10 px-4 text-xs font-semibold text-white/70 transition hover:border-[#ffb800]/50 hover:text-white">
                  {uploadingTrackId === track.id ? "Nahrávam..." : "Nahrať audio súbor"}
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    className="sr-only"
                    disabled={uploadingTrackId === track.id}
                    onChange={(event) =>
                      uploadAudioTrack(index, event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeAudioTrack(index)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-red-400/20 px-4 text-xs font-semibold text-red-200/80 transition hover:border-red-400/45 hover:text-red-100"
                >
                  Odstrániť track
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAudioTrack}
          className="inline-flex h-11 items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933]"
        >
          Pridať nový audio track
        </button>
      </div>
    );
  }

  function renderFaqFields() {
    if (!translations) return null;

    return (
      <div className="grid gap-4">
        {renderTextFields([
          { key: "faq.title", label: "Nadpis" },
          { key: "faq.subtitle", label: "Podnadpis", multiline: true },
        ])}
        <div className="grid gap-4">
          {Array.from({ length: 10 }, (_, index) => {
            const id = index + 1;

            return (
              <div key={id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-semibold text-white">
                  Otázka {id}
                </p>
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    Otázka
                  </span>
                  <input
                    value={translations[language][`faq.q${id}`] ?? ""}
                    onChange={(event) =>
                      setTranslationField(`faq.q${id}`, event.target.value)
                    }
                    className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                </label>
                <label className="mt-3 grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    Odpoveď
                  </span>
                  <textarea
                    value={translations[language][`faq.a${id}`] ?? ""}
                    onChange={(event) =>
                      setTranslationField(`faq.a${id}`, event.target.value)
                    }
                    rows={4}
                    className="min-h-28 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSeoFields() {
    return (
      <div className="grid gap-4">
        {[
          ["siteUrl", "Canonical URL"],
          ["brandName", "Názov brandu"],
          ["title", "SEO title"],
          ["description", "Meta description"],
          ["ogTitle", "Open Graph title"],
          ["ogDescription", "Open Graph description"],
          ["twitterTitle", "Twitter title"],
          ["twitterDescription", "Twitter description"],
          ["ogImage", "OG image path"],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              {label}
            </span>
            {(key as keyof SiteSettings).toString().includes("Description") ||
            key === "description" ? (
              <textarea
                value={site[key as keyof SiteSettings] as string}
                onChange={(event) =>
                  setSiteField(key as keyof SiteSettings, event.target.value as never)
                }
                rows={3}
                className="min-h-24 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
              />
            ) : (
              <input
                value={site[key as keyof SiteSettings] as string}
                onChange={(event) =>
                  setSiteField(key as keyof SiteSettings, event.target.value as never)
                }
                className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
              />
            )}
          </label>
        ))}
        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            Keywords - jeden výraz na riadok
          </span>
          <textarea
            value={keywordValue}
            onChange={(event) => setKeywordValue(event.target.value)}
            rows={8}
            className="min-h-44 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
          />
        </label>
      </div>
    );
  }

  function setSectionVisible(id: PublicSectionId, visible: boolean) {
    // Store only hidden sections so new sections default to visible.
    const next = { ...site.sectionVisibility };
    if (visible) {
      delete next[id];
    } else {
      next[id] = false;
    }
    setSiteField(
      "sectionVisibility",
      Object.keys(next).length > 0 ? next : undefined
    );
  }

  function renderVisibilityFields() {
    const hiddenCount = PUBLIC_SECTION_IDS.filter(
      (id) => !isSectionVisible(site.sectionVisibility, id)
    ).length;

    return (
      <div className="grid gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
          Vypnutá sekcia sa na verejnej stránke nezobrazí a zmizne aj z menu a
          päty. Texty ostávajú uložené, po zapnutí sa sekcia vráti. Zmena sa
          prejaví po uložení.
          {hiddenCount > 0 ? (
            <span className="mt-1 block text-[#ffe5a3]">
              Skryté sekcie: {hiddenCount} z {PUBLIC_SECTION_IDS.length}
            </span>
          ) : null}
        </div>
        {PUBLIC_SECTION_IDS.map((id) => {
          const visible = isSectionVisible(site.sectionVisibility, id);
          return (
            <label
              key={id}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4"
            >
              <span>
                <span className="block text-sm font-semibold text-white">
                  {publicSectionLabels[id].label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/45">
                  {publicSectionLabels[id].description}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${visible ? "text-emerald-300" : "text-white/40"}`}
                >
                  {visible ? "Zobrazená" : "Skrytá"}
                </span>
                <input
                  type="checkbox"
                  checked={visible}
                  aria-label={`Zobraziť sekciu ${publicSectionLabels[id].label}`}
                  onChange={(event) =>
                    setSectionVisible(id, event.target.checked)
                  }
                  className="h-5 w-5 accent-[#ffb800]"
                />
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderMaintenanceFields() {
    const maintenance = site.maintenance ?? defaultMaintenance;
    const maintenancePreview =
      maintenance.localized?.[language] ??
      defaultMaintenance.localized?.[language] ??
      maintenance;

    return (
      <div className="grid gap-5">
        {maintenance.enabled ? (
          <div className="rounded-lg border border-[#ffb800]/30 bg-[#ffb800]/10 p-4 text-sm leading-6 text-[#ffe5a3]">
            Web je momentálne prepnutý do maintenance mode. Bežný návštevník vidí
            iba servisnú obrazovku; administrácia ostáva dostupná.
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
            Maintenance mode je vypnutý. Po zapnutí sa verejná stránka nahradí
            servisnou obrazovkou s textami a obrázkom z tejto sekcie.
          </div>
        )}

        <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4">
          <span>
            <span className="block text-sm font-semibold text-white">
              Zapnúť maintenance mode
            </span>
            <span className="mt-1 block text-xs leading-5 text-white/45">
              Použi len počas príprav, opráv alebo krátkodobej odstávky webu.
            </span>
          </span>
          <input
            type="checkbox"
            checked={maintenance.enabled}
            onChange={(event) =>
              setMaintenanceField("enabled", event.target.checked)
            }
            className="h-5 w-5 accent-[#ffb800]"
          />
        </label>

        {[
          ["eyebrow", "Krátky horný text", false],
          ["title", "Hlavný nadpis", false],
          ["message", "Hlavná informácia", true],
          ["secondaryMessage", "Doplnková informácia / kontakt", true],
          ["imageUrl", "URL obrázka alebo importovaný data URL obrázok", true],
          ["imageAlt", "Alternatívny popis obrázka", false],
        ].map(([key, label, multiline]) => (
          <label key={key as string} className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              {label}
            </span>
            {multiline ? (
              <textarea
                value={maintenance[key as keyof MaintenanceSettings] as string}
                onChange={(event) =>
                  setMaintenanceField(
                    key as keyof MaintenanceSettings,
                    event.target.value as never
                  )
                }
                rows={key === "imageUrl" ? 4 : 5}
                className="min-h-24 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
              />
            ) : (
              <input
                value={maintenance[key as keyof MaintenanceSettings] as string}
                onChange={(event) =>
                  setMaintenanceField(
                    key as keyof MaintenanceSettings,
                    event.target.value as never
                  )
                }
                className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
              />
            )}
          </label>
        ))}

        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb800]">
                Jazyk maintenance obrazovky
              </p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                Verejná servisná obrazovka používa tieto texty pre SK, EN a DE.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
              {languages.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLanguage(item.value)}
                  className={`h-8 rounded-md px-3 text-xs font-semibold transition ${
                    language === item.value
                      ? "bg-[#ffb800] text-black"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {item.value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {[
            ["eyebrow", "Krátky horný text", false],
            ["title", "Hlavný nadpis", false],
            ["message", "Hlavná informácia", true],
            ["secondaryMessage", "Doplnková informácia / kontakt", true],
            ["imageAlt", "Alternatívny popis obrázka", false],
          ].map(([key, label, multiline]) => {
            const localizedCopy =
              maintenance.localized?.[language] ??
              defaultMaintenance.localized?.[language] ??
              defaultMaintenance;
            const value = localizedCopy[key as MaintenanceLocalizedKey] ?? "";

            return (
              <label key={`${language}-${key}`} className="mt-4 grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                  {label}
                </span>
                {multiline ? (
                  <textarea
                    value={value}
                    onChange={(event) =>
                      setMaintenanceLocalizedField(
                        language,
                        key as MaintenanceLocalizedKey,
                        event.target.value
                      )
                    }
                    rows={5}
                    className="min-h-24 resize-y rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(event) =>
                      setMaintenanceLocalizedField(
                        language,
                        key as MaintenanceLocalizedKey,
                        event.target.value
                      )
                    }
                    className="h-11 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#ffb800]/70"
                  />
                )}
              </label>
            );
          })}
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            Import obrázka z počítača
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => importMaintenanceImage(event.target.files?.[0] ?? null)}
            className="rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ffb800] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          />
          <span className="text-xs leading-5 text-white/40">
            Import uloží obrázok priamo do JSON ako data URL. Pre produkciu je
            ideálny komprimovaný JPG alebo WebP do približne 300 kB.
          </span>
        </label>

        {maintenance.imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="relative min-h-[360px]">
              <img
                src={maintenance.imageUrl}
                alt={maintenance.imageAlt || "Maintenance preview"}
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/70" />
              <div className="amp-perforation-field absolute inset-y-0 right-0 w-1/2 opacity-[0.10]" />
              <div className="relative z-10 grid min-h-[360px] gap-6 p-6 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
                <div>
                  <p className="inline-flex rounded-full border border-[#ffb800]/25 bg-[#ffb800]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb800]">
                    Preview maintenance obrazovky
                  </p>
                  <h3 className="mt-5 max-w-xl text-4xl font-semibold leading-tight text-white">
                    {maintenancePreview.title || "Stránku práve ladíme."}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/68">
                    {maintenancePreview.message}
                  </p>
                  {maintenancePreview.secondaryMessage ? (
                    <p className="mt-3 max-w-xl text-xs leading-5 text-white/45">
                      {maintenancePreview.secondaryMessage}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Status signálu
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-tight text-white">
                    Ladenie obsahu prebieha
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {["EL34", "ECC83", "30 W", "Turret"].map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderMaintenanceQuickControl() {
    const maintenance = site.maintenance ?? defaultMaintenance;

    return (
      <div
        className={`rounded-lg border p-4 ${
          maintenance.enabled
            ? "border-[#ffb800]/35 bg-[#ffb800]/10"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb800]">
              Maintenance mode
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {maintenance.enabled ? "Stránka je odstavená" : "Stránka je aktívna"}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Zapnúť/vypnúť maintenance mode a potom uložiť obsah.
            </p>
          </div>
          <label className="relative mt-1 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={maintenance.enabled}
              onChange={(event) =>
                setMaintenanceField("enabled", event.target.checked)
              }
              className="peer sr-only"
              aria-label="Zapnúť alebo vypnúť maintenance mode"
            />
            <span className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-[#ffb800]" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-black" />
          </label>
        </div>

        <button
          type="button"
          onClick={() => changeSection("maintenance")}
          className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-white/10 px-3 text-xs font-semibold text-white/70 transition hover:border-[#ffb800]/50 hover:text-white"
        >
          Upraviť texty a obrázok
        </button>
      </div>
    );
  }

  function renderAdvancedFields() {
    return (
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            Preklady pre {language.toUpperCase()}
          </span>
          <textarea
            value={jsonValue}
            onChange={(event) => setJsonValue(event.target.value)}
            spellCheck={false}
            rows={18}
            className="min-h-[420px] resize-y rounded-md border border-white/10 bg-black/35 p-4 font-mono text-[13px] leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            SEO site.json
          </span>
          <textarea
            value={siteJsonValue}
            onChange={(event) => setSiteJsonValue(event.target.value)}
            spellCheck={false}
            rows={14}
            className="min-h-[320px] resize-y rounded-md border border-white/10 bg-black/35 p-4 font-mono text-[13px] leading-6 text-white outline-none transition focus:border-[#ffb800]/70"
          />
        </label>
      </div>
    );
  }

  function renderCurrentSection() {
    if (status === "loading") {
      return <p className="text-sm text-white/55">Načítavam obsah...</p>;
    }

    if (!translations) {
      return <p className="text-sm text-red-200">Obsah nie je dostupný.</p>;
    }

    if (section === "hero") return renderHeroFields();
    if (section === "cta") return renderTextFields(ctaFields);
    if (section === "faq") return renderFaqFields();
    if (section === "contact") return renderTextFields(contactFields);
    if (section === "allText") return renderAllTextFields();
    if (section === "siteContact") return renderSiteContactFields();
    if (section === "audio") return renderAudioFields();
    if (section === "visibility") return renderVisibilityFields();
    if (section === "maintenance") return renderMaintenanceFields();
    if (section === "seo") return renderSeoFields();
    return renderAdvancedFields();
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-[#e8e6e1]">
        <p className="text-sm text-white/55">Overujem prihlásenie...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-[#e8e6e1]">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-lg border border-white/10 bg-[#101010] p-6 shadow-2xl shadow-black/40"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb800]">
            ALUPLEXamp CMS
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">
            Prihlásenie administratora
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Obsah administrácie, úpravy a ukladanie zmien sú dostupné iba po
            zadaní admin hesla.
          </p>

          <label className="mt-6 grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
              Admin heslo
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="h-12 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
              placeholder="ADMIN_PASSWORD"
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Overujem..." : "Prihlásiť sa"}
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {describeMessage(message)}
            </p>
          ) : null}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e6e1]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb800]">
              ALUPLEXamp CMS
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Správa obsahu webu
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Bezdatabázový editor textov, FAQ a SEO metadát. V produkcii ukladá
              zmeny priamo do GitHub repozitára.
            </p>
            {site.maintenance?.enabled ? (
              <p className="mt-4 inline-flex rounded-md border border-[#ffb800]/30 bg-[#ffb800]/10 px-3 py-2 text-sm font-medium text-[#ffe5a3]">
                Web je aktuálne v maintenance mode.
              </p>
            ) : null}
          </div>

          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-[#ffb800]/60 hover:text-white"
          >
            Otvoriť web
          </a>
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Prihlásenie
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Administrátor prihlásený
              </p>
              <button
                type="button"
                onClick={logout}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-white/10 px-3 text-xs font-semibold text-white/70 transition hover:border-[#ffb800]/50 hover:text-white"
              >
                Odhlásiť sa
              </button>
            </div>

            {renderMaintenanceQuickControl()}

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              {languages.map((item) => (
                <button
                  key={item.value}
                  onClick={() => changeLanguage(item.value)}
                  className={`flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm transition ${
                    language === item.value
                      ? "bg-[#ffb800] text-black"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs opacity-70">{item.value.toUpperCase()}</span>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeSection(item.id)}
                  className={`flex h-10 w-full items-center rounded-md px-3 text-left text-sm transition ${
                    section === item.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
              <div className="flex items-center justify-between">
                <span>Počet kľúčov</span>
                <strong className="text-white">{keyCount}</strong>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Stav</span>
                <strong className="text-white">{status}</strong>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[720px] flex-col rounded-lg border border-white/10 bg-[#101010]">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {sections.find((item) => item.id === section)?.label}
                  {section !== "seo" &&
                  section !== "advanced" &&
                  section !== "maintenance" &&
                  section !== "siteContact" &&
                  section !== "audio"
                    ? ` - ${language.toUpperCase()}`
                    : ""}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  {section === "advanced"
                    ? "Pokročilý režim pre priame úpravy JSON dát."
                    : "Uprav texty a ulož ich do súborového CMS."}
                </p>
              </div>

              <button
                onClick={saveContent}
                disabled={!translations || status === "saving" || status === "loading"}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "saving" ? "Ukladám..." : "Uložiť obsah"}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {renderCurrentSection()}
            </div>

            {message ? (
              <div
                className={`border-t px-4 py-3 text-sm ${
                  status === "error"
                    ? "border-red-500/20 bg-red-500/10 text-red-200"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {describeMessage(message)}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
