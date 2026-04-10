import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALUPLEXamp — Modern British Tone Machine",
  description:
    "Handcrafted tube guitar amplifier with aluminium chassis. Class AB, 30W, ECC83 + EL34 tubes. Built for musicians who demand perfect British tone.",
  keywords: [
    "tube amplifier",
    "guitar amplifier",
    "ALUPLEXamp",
    "handcrafted amp",
    "EL34",
    "ECC83",
    "British tone",
    "aluminium chassis",
    "turret board",
    "Class AB",
    "30W amplifier",
  ],
  authors: [{ name: "ALUPLEXamp" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ALUPLEXamp — Modern British Tone Machine",
    description:
      "A premium handcrafted tube guitar amplifier with aluminium chassis. 30W of pure British tone — EL34 + ECC83.",
    siteName: "ALUPLEXamp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALUPLEXamp — Modern British Tone Machine",
    description:
      "Handcrafted tube guitar amplifier. Class AB, 30W, EL34 + ECC83. Pure British tone.",
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
    <html lang="sk" suppressHydrationWarning className="dark">
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
