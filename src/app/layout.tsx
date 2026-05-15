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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
        email: ["info@aluplex.sk", "objednavky@aluplex.sk"],
        address: {
          "@type": "PostalAddress",
          addressCountry: "SK",
          addressRegion: "Slovakia, European Union",
        },
        sameAs: [
          "https://instagram.com/aluplexamp",
          "https://youtube.com/@aluplexamp",
          "https://facebook.com/aluplexamp",
        ],
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
        mainEntity: [
          {
            "@type": "Question",
            name: "What tubes does ALUPLEXamp use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The ALUPLEXamp uses 4× ECC83 preamp tubes and 2× EL34 power tubes, all by JJ Electronics. This combination delivers the classic British rock tone with warm midrange and rich harmonics.",
            },
          },
          {
            "@type": "Question",
            name: "What is the power output?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "30 W in Class AB push-pull configuration — the legendary sweet spot for stage and studio use.",
            },
          },
          {
            "@type": "Question",
            name: "Does it have an effects loop?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes — the ALUPLEXamp features a tube-driven, switchable effects loop that places time-based effects in the optimal position of the signal chain.",
            },
          },
          {
            "@type": "Question",
            name: "What impedance can I use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The ALUPLEXamp supports switchable 8 Ohm and 16 Ohm impedance via a selector on the rear panel.",
            },
          },
          {
            "@type": "Question",
            name: "Is the chassis really aluminium?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes — the entire chassis is aluminium, providing passive cooling, non-magnetic properties, lightweight construction at only 12.5 kg, and natural corrosion resistance with beautiful patina over time.",
            },
          },
          {
            "@type": "Question",
            name: "How does the voltage selector work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The built-in voltage selector on the rear panel switches between 115V (US) and 230V (EU), making the ALUPLEXamp ready for international use.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="sk" suppressHydrationWarning className="dark">
      <head>
        <link rel="canonical" href={SITE_URL} />
        <link rel="alternate" hrefLang="sk" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}?lang=en`} />
        <link rel="alternate" hrefLang="de" href={`${SITE_URL}?lang=de`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
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
