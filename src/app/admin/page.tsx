"use client";

import { useEffect, useMemo, useState } from "react";
import type { Language, Translations } from "@/lib/translations";

const languages: Array<{ value: Language; label: string }> = [
  { value: "sk", label: "Slovak" },
  { value: "en", label: "English" },
  { value: "de", label: "German" },
];

type SaveState = "idle" | "loading" | "saving" | "saved" | "error";

function sortEntries(entries: Record<string, string>) {
  return Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
}

export default function AdminPage() {
  const [content, setContent] = useState<Translations | null>(null);
  const [language, setLanguage] = useState<Language>("sk");
  const [editorValue, setEditorValue] = useState("");
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

        setContent(data.content);
        setEditorValue(JSON.stringify(sortEntries(data.content.sk), null, 2));
        setStatus("idle");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Nepodarilo sa nacitat obsah.");
      }
    }

    loadContent();
  }, []);

  const keyCount = useMemo(() => {
    if (!content) return 0;
    return Object.keys(content[language]).length;
  }, [content, language]);

  function changeLanguage(nextLanguage: Language) {
    if (!content) return;
    setLanguage(nextLanguage);
    setEditorValue(JSON.stringify(sortEntries(content[nextLanguage]), null, 2));
    setMessage("");
    setStatus("idle");
  }

  function applyEditorValue() {
    if (!content) return null;

    const parsed = JSON.parse(editorValue) as Record<string, unknown>;
    const invalidEntry = Object.entries(parsed).find(
      ([key, value]) => typeof key !== "string" || typeof value !== "string"
    );

    if (invalidEntry) {
      throw new Error("Kazdy kluc aj hodnota musia byt text.");
    }

    const nextContent = {
      ...content,
      [language]: sortEntries(parsed as Record<string, string>),
    };

    setContent(nextContent);
    return nextContent;
  }

  async function saveContent() {
    try {
      setStatus("saving");
      setMessage("");

      const nextContent = applyEditorValue();
      if (!nextContent) return;

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, content: nextContent }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ulozenie zlyhalo.");
      }

      setStatus("saved");
      setMessage(
        "Obsah je ulozeny. V produkcii sa zmena zapise do GitHubu a nasledny Vercel deploy publikuje novu verziu."
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ulozenie zlyhalo.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e6e1]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb800]">
              ALUPLEXamp CMS
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Textovy editor webu
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Upravuje preklady a marketingove texty ulozene v JSON subore.
              Ziadna databaza, ziadny externy CMS.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-[#ffb800]/60 hover:text-white"
          >
            Otvorit web
          </a>
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[260px_1fr]">
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

          <section className="flex min-h-[620px] flex-col rounded-lg border border-white/10 bg-[#101010]">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {language.toUpperCase()} obsah
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Zachovaj JSON format: kluce aj hodnoty musia byt text.
                </p>
              </div>

              <button
                onClick={saveContent}
                disabled={!content || status === "saving"}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#ffb800] px-5 text-sm font-semibold text-black transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "saving" ? "Ukladam..." : "Ulozit obsah"}
              </button>
            </div>

            <textarea
              value={editorValue}
              onChange={(event) => setEditorValue(event.target.value)}
              spellCheck={false}
              className="min-h-[520px] flex-1 resize-y border-0 bg-black/35 p-4 font-mono text-[13px] leading-6 text-white outline-none"
            />

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
