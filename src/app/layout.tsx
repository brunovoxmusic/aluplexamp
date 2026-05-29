import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { siteSettings } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = siteSettings.siteUrl;
const MAINTENANCE_ENABLED = siteSettings.maintenance?.enabled === true;
const verifiedSocialLinks = [] as string[];
const faqJsonLdItems = [
  {
    question: "Aké elektrónky používa ALUPLEXamp?",
    answer:
      "ALUPLEXamp používa 4× ECC83 predzosilňovacie lampy a 2× EL34 výkonové lampy od JJ Electronics. Táto kombinácia prináša klasický britský rockový zvuk s teplými stredmi a bohatými harmonikami.",
  },
  {
    question: "Aký má zosilňovač výkon?",
    answer:
      "30 W v triede AB push-pull konfigurácii – legendárny sweet spot pre pódiové aj štúdiové použitie.",
  },
  {
    question: "Je aparát ručne zapojený?",
    answer:
      "Áno – každý ALUPLEXamp je ručne zapojený na turret board doske. Žiadna plošná karta, žiadna sériová výroba. Výsledkom je prehľadné zapojenie, jednoduchší servis a priama signálová cesta.",
  },
  {
    question: "Má zosilňovač efektovú slučku?",
    answer:
      "Áno – ALUPLEXamp je vybavený elektrónkovou, vypínateľnou efektovou slučkou (FX Loop), ktorá zaraďuje časovo závislé efekty na optimálne miesto v signálovej ceste.",
  },
  {
    question: "Akú impedanciu môžem použiť?",
    answer:
      "ALUPLEXamp podporuje prepínateľnú impedanciu 8 Ohm a 16 Ohm prostredníctvom prepínača na zadnom paneli.",
  },
  {
    question: "Prečo hliníkové šasi?",
    answer:
      "Hliník je ľahší než oceľ, nemagnetický, prirodzene odoláva korózii a pasívne odvádza teplo od elektrónok bez ventilátorov. Aparát tak váži len 12,5 kg a časom získava vlastnú patinu.",
  },
  {
    question: "Je zosilňovač vhodný do štúdia?",
    answer:
      "Áno – 30 W elektrónkový výkon, čistý signálový reťazec a FX Loop ho robia ideálnym pre nahrávanie. Pri nižšej hlasitosti reaguje prirodzene a zachováva charakter zvuku.",
  },
  {
    question: "Je vhodný aj na pódium?",
    answer:
      "Áno – nízka hmotnosť (12,5 kg), pevný crunch a sýty overdrive z EL34 lampy ho predurčujú na pódiové použitie. Vstavaný prepínač napätia 115V/230V zaručí funkčnosť aj v zahraničí.",
  },
  {
    question: "Ako prebieha objednávka?",
    answer:
      "Vyplňte dopytový formulár alebo napíšte na info@aluplexamp.com. Po prijatí dopytu sa dohodneme na konfigurácii, termíne výroby a podmienkach. Každý aparát je vyrábaný na objednávku.",
  },
  {
    question: "Aká je záruka?",
    answer:
      "Na každý ALUPLEXamp poskytujeme záruku podľa platných predpisov SR/EÚ. V prípade otázok nás kontaktujte na info@aluplexamp.com.",
  },
];

export const metadata: Metadata = {
  title: siteSettings.title,
  description: siteSettings.description,
  keywords: siteSettings.keywords,
  authors: [{ name: siteSettings.brandName, url: SITE_URL }],
  creator: siteSettings.brandName,
  publisher: siteSettings.brandName,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: siteSettings.ogTitle,
    description: siteSettings.ogDescription,
    siteName: siteSettings.brandName,
    type: "website",
    locale: "sk_SK",
    alternateLocale: ["en_US", "de_DE"],
    url: SITE_URL,
    images: [
      {
        url: siteSettings.ogImage,
        width: 1344,
        height: 768,
        alt: siteSettings.ogTitle,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteSettings.twitterTitle,
    description: siteSettings.twitterDescription,
    images: [siteSettings.ogImage],
  },
  robots: {
    index: !MAINTENANCE_ENABLED,
    follow: !MAINTENANCE_ENABLED,
    googleBot: {
      index: !MAINTENANCE_ENABLED,
      follow: !MAINTENANCE_ENABLED,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "sk-SK": SITE_URL,
      "en-US": `${SITE_URL}?lang=en`,
      "de-DE": `${SITE_URL}?lang=de`,
      "x-default": SITE_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "ALUPLEXamp",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
        },
        description: "Premium handcrafted tube guitar amplifier with aluminium chassis.",
        email: "info@aluplexamp.com",
        address: {
          "@type": "PostalAddress",
          addressCountry: "SK",
          addressRegion: "Slovakia, European Union",
        },
        sameAs: verifiedSocialLinks,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "ALUPLEXamp",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["sk", "en", "de"],
      },
      {
        "@type": "Product",
        name: "ALUPLEXamp",
        description: "Handcrafted tube guitar amplifier with aluminium chassis. Class AB, 30 W, 4× ECC83 + 2× EL34 tubes by JJ Electronics.",
        brand: {
          "@type": "Brand",
          name: "ALUPLEXamp",
        },
        manufacturer: {
          "@type": "Organization",
          name: "ALUPLEXamp",
        },
        category: "Guitar Amplifiers",
        material: "Aluminium chassis, turret board construction",
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          availability: "https://schema.org/MadeToOrder",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "EUR",
          },
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Power Output", value: "30 W" },
          { "@type": "PropertyValue", name: "Class", value: "AB" },
          { "@type": "PropertyValue", name: "Preamp Tubes", value: "4× ECC83 JJ Electronics" },
          { "@type": "PropertyValue", name: "Power Tubes", value: "2× EL34 JJ Electronics" },
          { "@type": "PropertyValue", name: "Weight", value: "12.5 kg" },
          { "@type": "PropertyValue", name: "Dimensions", value: "500 × 280 × 200 mm" },
          { "@type": "PropertyValue", name: "Impedance", value: "8/16 Ohm switchable" },
          { "@type": "PropertyValue", name: "Construction", value: "Hand-wired turret board" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqJsonLdItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <html lang="sk" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
