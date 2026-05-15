"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteSettings } from "@/lib/site";
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
  { id: "seo", label: "SEO" },
  { id: "advanced", label: "JSON" },
] as const;

type SectionId = (typeof sections)[number]["id"];
type SaveState = "idle" | "loading" | "saving" | "saved" | "error";
type TextField = { key: string; label: string; multiline?: boolean };

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
  const [status, setStatus] = useState<SaveState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch("/api/admin/content", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Nepodarilo sa nacitat obsah.");
        }

        const nextTranslations = data.translations ?? data.content;
        const nextSite = data.site ?? getFallbackSite();

        setTranslations(nextTranslations);
        setSite(nextSite);
        setJsonValue(JSON.stringify(sortEntries(nextTranslations.sk), null, 2));
        setSiteJsonValue(JSON.stringify(nextSite, null, 2));
        setKeywordValue(nextSite.keywords.join("\n"));
        setStatus("idle");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Nepodarilo sa nacitat obsah."
        );
      }
    }

    loadContent();
  }, []);

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
    setSite((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setMessage("");
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

      const parsedSite = JSON.parse(siteJsonValue) as SiteSettings;
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
          password,
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
        "Obsah je ulozeny. V produkcii sa zmena zapise do GitHubu a Vercel ju nasadi novym deployom."
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

    if (section === "hero") return renderTextFields(heroFields);
    if (section === "cta") return renderTextFields(ctaFields);
    if (section === "faq") return renderFaqFields();
    if (section === "contact") return renderTextFields(contactFields);
    if (section === "seo") return renderSeoFields();
    return renderAdvancedFields();
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
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Admin heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-3 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#ffb800]/70"
                placeholder="ADMIN_PASSWORD"
              />
            </div>

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
                  {section !== "seo" && section !== "advanced"
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
