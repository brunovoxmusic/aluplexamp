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
          Web ALUPLEXamp používa cookies a lokálne uložené nastavenia iba v
          rozsahu potrebnom pre základnú funkčnosť stránky, zapamätanie voľby v
          cookie banneri a prípadné budúce meranie návštevnosti v súlade s
          ochranou súkromia.
        </p>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Nevyhnutné nastavenia
            </h2>
            <p>
              Stránka si môže uložiť vašu voľbu v cookie banneri do lokálneho
              úložiska prehliadača. Táto voľba slúži iba na to, aby sa banner
              nezobrazoval opakovane pri každej návšteve.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Analytika
            </h2>
            <p>
              Ak bude na webe aktivované meranie návštevnosti, má byť nastavené
              v režime rešpektujúcom súkromie a až po zohľadnení vašej voľby v
              cookie banneri, pokiaľ to vyžaduje platná legislatíva.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Ako zmeniť voľbu
            </h2>
            <p>
              Súhlas alebo odmietnutie môžete zmeniť vymazaním dát stránky v
              nastaveniach prehliadača. Po ďalšej návšteve sa cookie banner
              zobrazí znova.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Kontakt
            </h2>
            <p>
              Otázky k cookies alebo ochrane súkromia môžete poslať na
              {" "}
              <a href="mailto:info@aluplex.sk" className="text-primary underline underline-offset-4">
                info@aluplex.sk
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
