import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALUPLEXamp – Modern Plexi Tone Machine | Handcrafted Guitar Amplifier",
  description:
    "ALUPLEXamp – boutique handcrafted tube guitar amplifier built in Slovakia. 30W Class AB, turret board, aluminium chassis, ECC83/EL34. Sound tested by Vadim Bušovský (Dorian Gray, The Gang). Pure tone, no compromises.",
  keywords: [
    "tube amp",
    "plexi amp",
    "boutique guitar amplifier",
    "boutique zosilňovače",
    "lampový aparát",
    "handmade amplifier",
    "turret board amp",
    "ALUPLEXamp",
    "ALUPLEX",
    "EL34 amplifier",
    "ECC83 preamp",
    "aluminium chassis amp",
    "handcrafted guitar amp Slovakia",
    "Vadim Bušovský",
    "gitarový zvuk",
    "custom tube amp",
    "Dorian Gray",
    "hand-wired amplifier",
  ],
  authors: [{ name: "ALUPLEXamp" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ALUPLEXamp – Modern Plexi Tone Machine",
    description:
      "Handcrafted boutique tube guitar amplifier. 30W Class AB, turret board, aluminium chassis. Sound tested by Vadim Bušovský – legend of Slovak rock (Dorian Gray, The Gang).",
    url: "https://aluplexamp.com",
    siteName: "ALUPLEXamp",
    type: "website",
    locale: "sk_SK",
    alternateLocale: ["en_US", "de_DE"],
    images: [
      {
        url: "https://aluplexamp.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ALUPLEXamp – Modern Plexi Tone Machine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ALUPLEXamp – Modern Plexi Tone Machine",
    description:
      "Boutique handcrafted tube guitar amp with premium components. Sound tested by Vadim Bušovský (Dorian Gray, The Gang). Pure tone from Slovakia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "ALUPLEXamp",
              description:
                "Modern Plexi Tone Machine – Handcrafted Boutique Guitar Amplifier with turret board construction, aluminium chassis, and premium components.",
              brand: {
                "@type": "Brand",
                name: "ALUPLEXamp",
              },
              manufacturer: {
                "@type": "Organization",
                name: "ALUPLEXamp",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "SK",
                },
              },
              category: "Boutique Guitar Amplifier",
              material: "Aluminium Chassis",
              additionalProperty: [
                {
                  "@type": "PropertyValue",
                  name: "Power",
                  value: "30W",
                },
                {
                  "@type": "PropertyValue",
                  name: "Class",
                  value: "AB",
                },
                {
                  "@type": "PropertyValue",
                  name: "Preamp Tubes",
                  value: "ECC83",
                },
                {
                  "@type": "PropertyValue",
                  name: "Power Tubes",
                  value: "EL34",
                },
                {
                  "@type": "PropertyValue",
                  name: "Impedance",
                  value: "8/16 Ohm",
                },
                {
                  "@type": "PropertyValue",
                  name: "Construction",
                  value: "Turret Board",
                },
                {
                  "@type": "PropertyValue",
                  name: "Weight",
                  value: "12.5 kg",
                },
              ],
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/MadeToOrder",
                priceCurrency: "EUR",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
