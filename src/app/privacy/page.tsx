import type { Metadata } from "next";
import Link from "next/link";
import { siteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: `Ochrana osobných údajov | ${siteSettings.brandName}`,
  description:
    "Informácie o spracovaní osobných údajov pri používaní webu ALUPLEXamp a odoslaní dopytového formulára.",
  alternates: {
    canonical: `${siteSettings.siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
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
          Zásady ochrany osobných údajov
        </h1>
        <p className="mb-10 text-sm leading-7 text-muted-foreground sm:text-base">
          Táto stránka vysvetľuje, aké osobné údaje spracúvame pri používaní
          webu ALUPLEXamp a pri odoslaní dopytového formulára. Text je
          pripravený pre bežný kontaktný a objednávkový proces bez používateľských
          účtov a bez databázového ukladania dopytov na webe.
        </p>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Prevádzkovateľ
            </h2>
            <p>
              Prevádzkovateľom webu a kontaktného formulára je ALUPLEXamp.
              Kontaktný e-mail pre otázky k ochrane osobných údajov:
              {" "}
              <a href="mailto:info@aluplex.sk" className="text-primary underline underline-offset-4">
                info@aluplex.sk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Aké údaje spracúvame
            </h2>
            <p>
              Pri odoslaní formulára spracúvame údaje, ktoré nám dobrovoľne
              poskytnete: meno, e-mailovú adresu, predmet správy, obsah správy,
              jazykovú verziu formulára a technický čas odoslania.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Účel spracúvania
            </h2>
            <p>
              Údaje používame výlučne na odpoveď na váš dopyt, prípravu
              odporúčanej konfigurácie, komunikáciu o objednávke, cene,
              dostupnosti, servise alebo ďalších praktických otázkach súvisiacich
              s produktom ALUPLEXamp.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Právny základ
            </h2>
            <p>
              Spracúvanie je založené na vašej žiadosti pred uzatvorením zmluvy
              alebo na oprávnenom záujme odpovedať na doručenú obchodnú
              komunikáciu.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Odosielanie e-mailov
            </h2>
            <p>
              Dopytový formulár môže na doručenie správy používať e-mailovú
              službu Resend. Správa je odoslaná na kontaktné adresy ALUPLEXamp.
              Web neukladá dopyty do vlastnej databázy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Doba uchovávania
            </h2>
            <p>
              Komunikáciu uchovávame len tak dlho, ako je potrebné na vybavenie
              dopytu, nadväzujúcu obchodnú komunikáciu, servisnú históriu alebo
              splnenie zákonných povinností.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Vaše práva
            </h2>
            <p>
              Máte právo požiadať o prístup k údajom, opravu, vymazanie,
              obmedzenie spracúvania alebo namietať proti spracúvaniu. Svoju
              žiadosť môžete poslať na
              {" "}
              <a href="mailto:info@aluplex.sk" className="text-primary underline underline-offset-4">
                info@aluplex.sk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Cookies
            </h2>
            <p>
              Informácie o používaní cookies nájdete na samostatnej stránke
              {" "}
              <Link href="/cookies" className="text-primary underline underline-offset-4">
                Cookies
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
