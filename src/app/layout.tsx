import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  title: "Flowd — AI-Powered Productivity",
  description:
    "Flowd is an AI-powered productivity system that plans your day, prioritizes tasks, builds habits, and helps you focus on what matters most.",
  keywords: [
    "productivity",
    "AI",
    "task manager",
    "habit tracker",
    "pomodoro timer",
    "AI assistant",
    "daily planner",
    "focus timer",
    "productivity app",
  ],
  authors: [{ name: "Flowd" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Flowd — AI-Powered Productivity",
    description:
      "Stop guessing what to do next. Flowd's AI plans your day, prioritizes tasks, and builds habits — so you focus on what matters.",
    siteName: "Flowd",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowd — AI-Powered Productivity",
    description:
      "AI-powered productivity system: task manager + habits + pomodoro + AI assistant.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
