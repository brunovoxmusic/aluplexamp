"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  HeroBackgroundSettings,
  MaintenanceSettings,
  SiteSettings,
} from "@/lib/site";
import type { Language, Translations } from "@/lib/translations";

const languages: Array<{ value: Language; label: string }> = [
  { value: "sk", label: "Slovencina" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const sections = [
  { id: "hero", label: "Hero" },
  { id: "cta", label: "CTA" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Kontakt" },
  { id: "maintenance", label: "Maintenance" },
  { id: "seo", label: "SEO" },
  { id: "advanced", label: "JSON" },
] as const;

type SectionId = (typeof sections)[number]["id"];
type SaveState = "idle" | "loading" | "saving" | "saved" | "error";
type TextField = { key: string; label: string; multiline?: boolean };
type MaintenanceLocalizedKey =
  | "eyebrow"
  | "title"
  | "message"
  | "secondaryMessage"
  | "imageAlt";

const CONTACT_EMAIL = "info@aluplexamp.com";

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
  { key: "cta.contact", label: "Tlacidlo kontakt" },
  { key: "cta.order", label: "Tlacidlo objednavka" },
];

const contactFields: TextField[] = [
  { key: "form.title", label: "Nadpis formulara" },
  { key: "form.subtitle", label: "Popis formulara", multiline: true },
  { key: "form.name.placeholder", label: "Placeholder meno" },
  { key: "form.email.placeholder", label: "Placeholder email" },
  { key: "form.subject.placeholder", label: "Placeholder predmet" },
  { key: "form.message.placeholder", label: "Placeholder sprava", multiline: true },
  { key: "form.submit", label: "Tlacidlo odoslat" },
  { key: "form.success", label: "Success sprava", multiline: true },
  { key: "form.error", label: "Error sprava", multiline: true },
];

const defaultMaintenance: MaintenanceSettings = {
  enabled: false,
  eyebrow: "ALUPLEXamp",
  title: "Stranku prave ladime.",
  message:
    "Pripravujeme aktualizaciu webu, aby sme mohli lepsie predstavit zosilnovac ALUPLEXamp, jeho zvuk a moznosti vyroby na objednavku.",
  secondaryMessage:
    `Ak nas potrebujes kontaktovat hned, napis na ${CONTACT_EMAIL}.`,
  imageUrl: "/aluplex/aluplex-1.jpg",
  imageAlt: "ALUPLEXamp elektronkovy gitarovy zosilnovac",
  localized: {
    sk: {
      eyebrow: "ALUPLEXamp",
      title: "Stranku prave ladime.",
      message:
        "Pripravujeme aktualizaciu webu, aby sme mohli lepsie predstavit zosilnovac ALUPLEXamp, jeho zvuk a moznosti vyroby na objednavku.",
      secondaryMessage: `Ak nas potrebujes kontaktovat hned, napis na ${CONTACT_EMAIL}.`,
      imageAlt: "ALUPLEXamp elektronkovy gitarovy zosilnovac",
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
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [status, setStatus] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

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
        throw new Error(data.error || "Nepodarilo sa nacitat obsah.");
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
        error instanceof Error ? error.message : "Nepodarilo sa nacitat obsah."
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
      setMessage("Vybrany subor musi byt obrazok.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("error");
        setMessage("Obrazok sa nepodarilo nacitat.");
        return;
      }

      setMaintenanceField("imageUrl", reader.result);
    };
    reader.onerror = () => {
      setStatus("error");
      setMessage("Obrazok sa nepodarilo nacitat.");
    };
    reader.readAsDataURL(file);
  }

  function changeLanguage(nextLanguage: Language) {
    if (!translations) return;
    setLanguage(nextLanguage);
    setJsonValue(JSON.stringify(sortEntries(translations[nextLanguage]), null, 2));
    setStatus("idle");
    setMessage("");
  }

  function applyAdvancedEditors() {
    if (!translations) return null;

    let nextTranslations = translations;
    let nextSite = site;

    if (section === "advanced") {
      const parsedTranslations = JSON.parse(jsonValue) as Record<string, unknown>;
      const invalidTranslation = Object.entries(parsedTranslations).find(
        ([key, value]) => typeof key !== "string" || typeof value !== "string"
      );

      if (invalidTranslation) {
        throw new Error("Kazdy prekladovy kluc aj hodnota musia byt text.");
      }

      const parsedSite = normalizeSite(JSON.parse(siteJsonValue) as SiteSettings);
      if (!Array.isArray(parsedSite.keywords)) {
        throw new Error("SEO keywords musia byt pole textov.");
      }

      nextTranslations = {
        ...translations,
        [language]: sortEntries(parsedTranslations as Record<string, string>),
      };
      nextSite = parsedSite;
      setTranslations(nextTranslations);
      setSite(nextSite);
      setKeywordValue(nextSite.keywords.join("\n"));
    } else if (section === "seo") {
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

      const bundle = applyAdvancedEditors();
      if (!bundle) return;

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          translations: bundle.translations,
          site: bundle.site,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ulozenie zlyhalo.");
      }

      setStatus("saved");
      setMessage(
        data.savedTo === "github"
          ? "Obsah je ulozeny do GitHubu. Verejna stranka si nacita aktualny CMS obsah automaticky; Vercel zaroven spusti novy produkcny deploy."
          : "Obsah je ulozeny lokalne."
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ulozenie zlyhalo.");
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
              Nastavte hlavny obrazok hero sekcie alebo zapnite slideshow z vybranych obrazkov.
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Rezim pozadia
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
              <option value="static">Staticky obrazok</option>
              <option value="slideshow">Slideshow obrazkov</option>
            </select>
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Staticky obrazok
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
              Slideshow obrazky
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
              Kazdy obrazok zadajte na novy riadok. Odporucane su subory z adresara
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
                    ? `Slideshow: ${heroBackground.slides.length} obrazkov`
                    : "Staticky hero obrazok"}
                </p>
              </div>
            </div>
          </div>
        </div>
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
                  Otazka {id}
                </p>
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                    Otazka
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
                    Odpoved
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
          ["brandName", "Nazov brandu"],
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
            Keywords - jeden vyraz na riadok
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
            Web je momentalne prepnuty do maintenance mode. Bezny navstevnik vidi
            iba servisnu obrazovku; administracia ostava dostupna.
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
            Maintenance mode je vypnuty. Po zapnuti sa verejna stranka nahradi
            servisnou obrazovkou s textami a obrazkom z tejto sekcie.
          </div>
        )}

        <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4">
          <span>
            <span className="block text-sm font-semibold text-white">
              Zapnut maintenance mode
            </span>
            <span className="mt-1 block text-xs leading-5 text-white/45">
              Pouzi len pocas priprav, oprav alebo kratkodobej odstavky webu.
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
          ["eyebrow", "Kratky horny text", false],
          ["title", "Hlavny nadpis", false],
          ["message", "Hlavna informacia", true],
          ["secondaryMessage", "Doplnkova informacia / kontakt", true],
          ["imageUrl", "URL obrazka alebo importovany data URL obrazok", true],
          ["imageAlt", "Alternativny popis obrazka", false],
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
                Verejna servisna obrazovka pouziva tieto texty pre SK, EN a DE.
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
            ["eyebrow", "Kratky horny text", false],
            ["title", "Hlavny nadpis", false],
            ["message", "Hlavna informacia", true],
            ["secondaryMessage", "Doplnkova informacia / kontakt", true],
            ["imageAlt", "Alternativny popis obrazka", false],
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
            Import obrazka z pocitaca
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => importMaintenanceImage(event.target.files?.[0] ?? null)}
            className="rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ffb800] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          />
          <span className="text-xs leading-5 text-white/40">
            Import ulozi obrazok priamo do JSON ako data URL. Pre produkciu je
            idealny komprimovany JPG alebo WebP do priblizne 300 kB.
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
                    {maintenancePreview.title || "Stranku prave ladime."}
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
                    Status signalu
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
              {maintenance.enabled ? "Stranka je odstavena" : "Stranka je aktivna"}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Zapnut/vypnut maintenance mode a potom ulozit obsah.
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
              aria-label="Zapnut alebo vypnut maintenance mode"
            />
            <span className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-[#ffb800]" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-black" />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setSection("maintenance")}
          className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-white/10 px-3 text-xs font-semibold text-white/70 transition hover:border-[#ffb800]/50 hover:text-white"
        >
          Upravit texty a obrazok
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
      return <p className="text-sm text-white/55">Nacitavam obsah...</p>;
    }

    if (!translations) {
      return <p className="text-sm text-red-200">Obsah nie je dostupny.</p>;
    }

    if (section === "hero") return renderHeroFields();
    if (section === "cta") return renderTextFields(ctaFields);
    if (section === "faq") return renderFaqFields();
    if (section === "contact") return renderTextFields(contactFields);
    if (section === "maintenance") return renderMaintenanceFields();
    if (section === "seo") return renderSeoFields();
    return renderAdvancedFields();
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-[#e8e6e1]">
        <p className="text-sm text-white/55">Overujem prihlasenie...</p>
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
            Prihlasenie administratora
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Obsah administracie, upravy a ukladanie zmien su dostupne iba po
            zadani admin hesla.
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
              Zrusit
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Overujem..." : "Prihlasit sa"}
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {message === "unauthorized" ? "Nespravne admin heslo." : message}
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
              Sprava obsahu webu
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Bezdatabazovy editor textov, FAQ a SEO metadat. V produkcii uklada
              zmeny priamo do GitHub repozitara.
            </p>
            {site.maintenance?.enabled ? (
              <p className="mt-4 inline-flex rounded-md border border-[#ffb800]/30 bg-[#ffb800]/10 px-3 py-2 text-sm font-medium text-[#ffe5a3]">
                Web je aktualne v maintenance mode.
              </p>
            ) : null}
          </div>

          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-[#ffb800]/60 hover:text-white"
          >
            Otvorit web
          </a>
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Prihlasenie
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Administrator prihlaseny
              </p>
              <button
                type="button"
                onClick={logout}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-white/10 px-3 text-xs font-semibold text-white/70 transition hover:border-[#ffb800]/50 hover:text-white"
              >
                Odhlasit sa
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
                  onClick={() => setSection(item.id)}
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
                <span>Pocet klucov</span>
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
                  section !== "maintenance"
                    ? ` - ${language.toUpperCase()}`
                    : ""}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  {section === "advanced"
                    ? "Pokrocily rezim pre priame upravy JSON dat."
                    : "Uprav texty a uloz ich do suboroveho CMS."}
                </p>
              </div>

              <button
                onClick={saveContent}
                disabled={!translations || status === "saving" || status === "loading"}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "saving" ? "Ukladam..." : "Ulozit obsah"}
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
                {message}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
