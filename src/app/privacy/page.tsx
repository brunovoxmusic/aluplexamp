import type { Metadata } from "next";
import Link from "next/link";
import { siteSettings } from "@/lib/site";

const contactEmail = siteSettings.contactSettings?.publicEmail || "info@aluplexamp.com";

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
          Táto stránka vysvetľuje, aké osobné údaje spracúvame pri odoslaní
          kontaktného alebo objednávkového dopytu cez web ALUPLEXamp.
        </p>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Správca
            </h2>
            <p>
              Správcom osobných údajov je ALUPLEXamp, Slovensko, EÚ.
              Kontaktný e-mail pre otázky k ochrane osobných údajov:
              {" "}
              <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-4">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Aké údaje spracúvame
            </h2>
            <p>
              Pri odoslaní formulára spracúvame iba údaje, ktoré nám
              dobrovoľne poskytnete: meno, e-mailovú adresu a správu z
              kontaktného formulára. Predmet správy a jazyková verzia môžu byť
              pripojené ako doplnkový technický kontext dopytu.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Účel spracúvania
            </h2>
            <p>
              Údaje používame výlučne na vybavenie vášho dopytu, prípravu
              odporúčanej konfigurácie a komunikáciu súvisiacu s výrobou
              zosilňovača ALUPLEXamp na objednávku.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Právny základ
            </h2>
            <p>
              Právnym základom spracúvania je čl. 6 ods. 1 písm. b) GDPR:
              spracúvanie je potrebné na vykonanie opatrení pred uzatvorením
              zmluvy alebo na plnenie zmluvy.
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
              Komunikáciu uchovávame po dobu potrebnú na vybavenie dopytu a
              následne počas zákonnej archivačnej lehoty, ak sa na konkrétnu
              komunikáciu alebo objednávku vzťahuje.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Vaše práva
            </h2>
            <p>
              Máte právo na prístup k údajom, opravu, vymazanie, obmedzenie
              spracúvania, prenosnosť údajov a právo namietať proti
              spracúvaniu. Svoju žiadosť môžete poslať na
              {" "}
              <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-4">
                {contactEmail}
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
