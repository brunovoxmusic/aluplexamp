'use client';

import { useStore } from '@/lib/store';
import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { SocialProof } from '@/components/landing/SocialProof';
import { ValueProps } from '@/components/landing/ValueProps';
import { AIDemo } from '@/components/landing/AIDemo';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { AppShell } from '@/components/app/AppShell';

export default function Home() {
  const view = useStore((s) => s.view);

  if (view === 'app') {
    return <AppShell />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <ValueProps />
        <AIDemo />
        <Features />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
