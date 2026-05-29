import type { Metadata } from "next";
import Link from "next/link";
import { siteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cookies | ${siteSettings.brandName}`,
  description:
    "Informácie o používaní cookies na webe ALUPLEXamp vrátane základného súhlasu a technických cookies.",
  alternates: {
    canonical: `${siteSettings.siteUrl}/cookies`,
  },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-10 inline-flex text-sm text-primary hover:text-primary/80 underline underline-offset-4"
        >
          Späť na ALUPLEXamp
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          ALUPLEXamp
        </p>
        <h1 className="mb-6 text-3xl font-bold sm:text-5xl">
          Informácie o cookies
        </h1>
        <p className="mb-10 text-sm leading-7 text-muted-foreground sm:text-base">
          Cookies sú malé textové súbory alebo lokálne uložené nastavenia,
          ktoré pomáhajú webu správne fungovať a zapamätať si niektoré voľby
          návštevníka.
        </p>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Prečo cookies používame
            </h2>
            <p>
              Web ALUPLEXamp používa cookies a lokálne uložené nastavenia na
              základnú funkčnosť stránky, zapamätanie voľby v cookie banneri a
              technické nastavenia rozhrania.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Typy cookies
            </h2>
            <p>
              Nevyhnutné cookies a lokálne nastavenia slúžia na fungovanie webu,
              napríklad pre Next.js session stav, uloženie témy a zapamätanie
              rozhodnutia v cookie banneri. Analytické cookies môžu byť použité
              iba v prípade aktivácie merania návštevnosti a v súlade s platnou
              legislatívou.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Ako cookies spravovať
            </h2>
            <p>
              Cookies môžete spravovať, obmedziť alebo vymazať v nastaveniach
              svojho prehliadača. Po vymazaní dát stránky sa môže cookie banner
              zobraziť znova.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Kontakt
            </h2>
            <p>
              Otázky k cookies alebo ochrane súkromia môžete poslať na
              {" "}
              <a href="mailto:info@aluplexamp.com" className="text-primary underline underline-offset-4">
                info@aluplexamp.com
              </a>
              . Súvisiace informácie nájdete aj na stránke
              {" "}
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                Ochrana osobných údajov
              </Link>
              .
            </p>
          </section>

          <p className="border-t border-white/10 pt-6 text-xs text-muted-foreground/60">
            Posledná aktualizácia: máj 2026.
          </p>
        </div>
      </article>
    </main>
  );
}
