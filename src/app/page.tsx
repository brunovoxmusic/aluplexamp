'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Target, Shield, Music, ThermometerSun, Weight, Magnet, ShieldCheck,
  Zap, Power, Mic2, Volume2, Headphones, Settings, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Menu, X, Wrench, ArrowRight, Sparkles, Flame, CircleDot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui/sheet';
import { translations, type Language } from '@/lib/translations';

// ========== HOOKS ==========

function useTranslation() {
  const [lang, setLang] = useState<Language>('sk');
  const t = useCallback(
    (key: string): string => translations[lang]?.[key] ?? key,
    [lang]
  );
  return { lang, setLang, t };
}

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const children = el.querySelectorAll('.fade-in-up');
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useScrolled(threshold = 100) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return scrolled;
}

function useShowScrollTop(threshold = 500) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return show;
}

// ========== NAVIGATION ==========

function Navigation({ lang, setLang, t }: { lang: Language; setLang: (l: Language) => void; t: (k: string) => string }) {
  const scrolled = useScrolled(50);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: 'soundlib', label: t('nav.soundlib') },
    { id: 'specs', label: t('nav.specs') },
    { id: 'config', label: t('nav.config') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'faq', label: t('nav.faq') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const langOptions: Language[] = ['sk', 'en', 'de'];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-active shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center"
          >
            <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 sm:h-8 w-auto" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side: Language + Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
              {langOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    lang === l
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5" aria-label="Menu">
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border-[#2a2a2a]/50">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-foreground flex items-center gap-3">
                    <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                {/* Mobile Language Switcher */}
                <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 mb-8 w-fit border border-white/[0.06]">
                  {langOptions.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); }}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        lang === l
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className="text-left px-4 py-3.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-all duration-200"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
                <SheetClose className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ========== HERO SECTION (Slideshow Redesign) ==========

const HERO_SLIDES = [
  '/aluplex/aluplex-1.jpg',
  '/aluplex/aluplex-56.jpg',
  '/aluplex/DSC6821.jpg',
  '/aluplex/aluplex-138.jpg',
  '/aluplex/DSC6775.jpg',
];

function HeroSection({ t }: { t: (k: string) => string }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Slideshow Background — 5 images with CSS fade cycle */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {HERO_SLIDES.map((src, i) => (
          <div key={i} className="hero-slide">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Multi-layer overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/75 to-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-[#0a0a0a]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-transparent" />

        {/* Amber glow accent */}
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(212,146,42,0.06)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 hero-grid-pattern pointer-events-none opacity-[0.03]" />

      {/* Content — left aligned with generous top spacing */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-36 lg:py-40">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="hero-fade-item" style={{ animationDelay: '0.3s' }}>
            <Badge className="mb-8 sm:mb-10 px-4 py-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 backdrop-blur-sm">
              <Sparkles className="size-3.5 mr-2" />
              {t('hero.badge')}
            </Badge>
          </div>

          {/* Title */}
          <div className="hero-fade-item" style={{ animationDelay: '0.5s' }}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 sm:mb-6 text-gradient-amber-shimmer leading-[1.05] break-words">
              {t('hero.title')}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="hero-fade-item" style={{ animationDelay: '0.7s' }}>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-foreground/90 mb-3 sm:mb-4 tracking-wide">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Description */}
          <div className="hero-fade-item" style={{ animationDelay: '0.8s' }}>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-8 sm:mb-12 leading-relaxed">
              {t('hero.description')}
            </p>
          </div>

          {/* Key specs strip */}
          <div className="hero-fade-item flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-12" style={{ animationDelay: '0.9s' }}>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
              <Zap className="size-3.5 sm:size-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground/80">30W</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
              <Flame className="size-3.5 sm:size-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground/80">EL34</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
              <CircleDot className="size-3.5 sm:size-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground/80">12.5 kg</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
              <Wrench className="size-3.5 sm:size-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground/80">Handwired</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-fade-item flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4" style={{ animationDelay: '1.0s' }}>
            <Button
              size="lg"
              onClick={() => scrollTo('specs')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02]"
            >
              {t('hero.cta.listen')}
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollTo('config')}
              className="border-white/10 text-foreground hover:bg-white/5 hover:text-foreground hover:border-white/20 px-8 py-6 text-base rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              {t('hero.cta.configure')}
              <Settings className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bouncing scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 bounce-chevron z-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="size-5 text-muted-foreground/30" />
        </div>
      </div>
    </section>
  );
}

// ========== VALUE PROPOSITION ==========

function ValueProps({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const cards = [
    { icon: Heart, title: t('vp.handcrafted.title'), desc: t('vp.handcrafted.desc') },
    { icon: Target, title: t('vp.turret.title'), desc: t('vp.turret.desc') },
    { icon: Shield, title: t('vp.premium.title'), desc: t('vp.premium.desc') },
    { icon: Music, title: t('vp.living.title'), desc: t('vp.living.desc') },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="fade-in-up group bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-4 sm:p-5 lg:p-8 text-center card-hover backdrop-blur-sm"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
                <card.icon className="size-5 sm:size-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== ENGINEERING SECTION ==========

function EngineeringSection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const features = [
    { icon: ThermometerSun, title: t('eng.heat.title'), desc: t('eng.heat.desc') },
    { icon: Weight, title: t('eng.lightweight.title'), desc: t('eng.lightweight.desc') },
    { icon: Magnet, title: t('eng.nonmagnetic.title'), desc: t('eng.nonmagnetic.desc') },
    { icon: ShieldCheck, title: t('eng.corrosion.title'), desc: t('eng.corrosion.desc') },
  ];

  return (
    <section id="specs" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left */}
          <div>
            <div className="fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('eng.title')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {t('eng.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm sm:text-base max-w-xl">
                {t('eng.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="fade-in-up group bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-4 sm:p-5 card-hover backdrop-blur-sm"
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <f.icon className="size-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual */}
          <div className="fade-in-up" style={{ transitionDelay: '200ms' }}>
            <div className="relative bg-card/50 border border-[#2a2a2a]/60 rounded-3xl overflow-hidden tube-glow backdrop-blur-sm">
              {/* Real chassis back image */}
              <div className="relative">
                <img src="/aluplex/aluplex-back-naked.jpg" alt="ALUPLEXamp chassis internals" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-8 lg:p-10 relative">
                {/* Weight display */}
                <div className="text-center mb-8">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.3em] mb-3">{t('eng.weight.title')}</p>
                  <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gradient-amber leading-none">12.5</div>
                  <p className="text-base sm:text-lg text-muted-foreground mt-2 font-light">{t('eng.weight.label')}</p>
                </div>

                {/* Voltage callout */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Power className="size-5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">{t('eng.voltage')}</span>
                  </div>
                </div>

                {/* Chassis label */}
                <div className="text-center pt-6 border-t border-white/[0.06]">
                  <p className="text-[10px] sm:text-xs font-mono text-muted-foreground/40 tracking-[0.4em] uppercase">
                    {t('eng.chassis')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== SOUND ARCHITECTURE ==========

function SoundArchitecture({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const specs = [
    { icon: Zap, label: t('sa.classab') },
    { icon: Power, label: t('sa.power') },
    { icon: Mic2, label: t('sa.preamp') },
    { icon: Volume2, label: t('sa.poweramp') },
    { icon: Headphones, label: t('sa.fxloop') },
    { icon: Settings, label: t('sa.impedance') },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('sa.title')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('sa.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('sa.subtitle')}</p>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-14">
          {specs.map((spec, i) => (
            <div
              key={i}
              className="fade-in-up group bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-4 sm:p-5 lg:p-8 text-center card-hover backdrop-blur-sm"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
                <spec.icon className="size-5 sm:size-6 text-primary" />
              </div>
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">{spec.label}</p>
            </div>
          ))}
        </div>

        {/* EL34 + ECC83 Callout */}
        <div className="fade-in-up relative overflow-hidden bg-gradient-to-r from-primary/[0.04] via-primary/[0.08] to-primary/[0.04] border border-primary/15 rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm" style={{ transitionDelay: '400ms' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse,rgba(212,146,42,0.06)_0%,transparent_70%)] pointer-events-none" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3">
            {t('sa.el34.title')}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl relative z-10">
            {t('sa.el34.desc')}
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== SOUND LIBRARY — Premium Waveform Player ==========

interface WaveformData {
  peaks: number[];
  duration: number;
}

function generateWaveform(audioSrc: string): Promise<WaveformData> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    const peaks: number[] = [];
    const numBars = 120;
    audio.src = audioSrc;
    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      const sampleInterval = Math.floor(dur / numBars);
      const audioCtx = new AudioContext();
      fetch(audioSrc)
        .then(r => r.arrayBuffer())
        .then(buf => audioCtx.decodeAudioData(buf))
        .then(audioBuffer => {
          const channelData = audioBuffer.getChannelData(0);
          const samplesPerBar = Math.floor(channelData.length / numBars);
          for (let i = 0; i < numBars; i++) {
            let max = 0;
            const start = i * samplesPerBar;
            for (let j = start; j < start + samplesPerBar && j < channelData.length; j++) {
              const abs = Math.abs(channelData[j]);
              if (abs > max) max = abs;
            }
            peaks.push(max);
          }
          audioCtx.close();
          resolve({ peaks, duration: dur });
        })
        .catch(() => {
          // Fallback: generate pseudo-random waveform
          const fallbackPeaks: number[] = [];
          for (let i = 0; i < numBars; i++) {
            const base = 0.3 + 0.5 * Math.sin(i * 0.15) * Math.sin(i * 0.07);
            fallbackPeaks.push(Math.max(0.08, Math.min(1, base + (Math.random() - 0.5) * 0.3)));
          }
          resolve({ peaks: fallbackPeaks, duration: dur });
        });
    });
    audio.addEventListener('error', () => {
      const fallbackPeaks: number[] = [];
      for (let i = 0; i < numBars; i++) {
        fallbackPeaks.push(0.2 + Math.random() * 0.6);
      }
      resolve({ peaks: fallbackPeaks, duration: 10 });
    });
  });
}

function SoundLibrary({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const [activeTrack, setActiveTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveforms, setWaveforms] = useState<WaveformData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragTarget = useRef<'waveform' | 'progress'>('waveform');

  const trackAccents = ['rgba(58,154,92,1)', 'rgba(212,146,42,1)', 'rgba(198,40,40,1)', 'rgba(124,58,237,1)', 'rgba(8,145,178,1)'];
  const trackAccentsFaded = ['rgba(58,154,92,0.15)', 'rgba(212,146,42,0.15)', 'rgba(198,40,40,0.15)', 'rgba(124,58,237,0.15)', 'rgba(8,145,178,0.15)'];
  const trackAccentsMid = ['rgba(58,154,92,0.5)', 'rgba(212,146,42,0.5)', 'rgba(198,40,40,0.5)', 'rgba(124,58,237,0.5)', 'rgba(8,145,178,0.5)'];

  const tracks = [
    { name: t('sl.track1.name'), gear: t('sl.track1.gear'), settings: t('sl.track1.settings'), desc: t('sl.track1.desc'), src: '/audio/track1-woody-clean.wav', tag: 'CLEAN' },
    { name: t('sl.track2.name'), gear: t('sl.track2.gear'), settings: t('sl.track2.settings'), desc: t('sl.track2.desc'), src: '/audio/track2-british-crunch.wav', tag: 'CRUNCH' },
    { name: t('sl.track3.name'), gear: t('sl.track3.gear'), settings: t('sl.track3.settings'), desc: t('sl.track3.desc'), src: '/audio/track3-brown-sound.wav', tag: 'HIGH GAIN' },
    { name: t('sl.track4.name'), gear: t('sl.track4.gear'), settings: t('sl.track4.settings'), desc: t('sl.track4.desc'), src: '/audio/track4-dynamic-breakup.wav', tag: 'DYNAMIC' },
    { name: t('sl.track5.name'), gear: t('sl.track5.gear'), settings: t('sl.track5.settings'), desc: t('sl.track5.desc'), src: '/audio/track5-volume-rolloff.wav', tag: 'ROLL-OFF' },
  ];

  // Load all waveforms on mount
  useEffect(() => {
    Promise.all(tracks.map(tr => generateWaveform(tr.src))).then(data => {
      setWaveforms(data);
      setLoaded(true);
    });
  }, []);

  // Set volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = waveformRef.current;
    if (!canvas || !waveforms.length) return;

    const drawWaveform = () => {
      const container = waveformContainerRef.current;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const waveform = waveforms[activeTrack];
      if (!waveform) return;

      ctx.clearRect(0, 0, w, h);

      const peaks = waveform.peaks;
      const numBars = peaks.length;
      const barGap = 2;
      const barWidth = Math.max(1, (w - barGap * (numBars - 1)) / numBars);
      const progress = duration > 0 ? currentTime / duration : 0;
      const progressIdx = Math.floor(progress * numBars);
      const centerY = h / 2;
      const accent = trackAccents[activeTrack];

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barGap);
        const peak = peaks[i];
        const barH = Math.max(2, peak * (h * 0.42));

        if (i <= progressIdx) {
          const gradient = ctx.createLinearGradient(x, centerY - barH, x, centerY + barH);
          gradient.addColorStop(0, accent);
          gradient.addColorStop(0.5, trackAccentsMid[activeTrack]);
          gradient.addColorStop(1, accent);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        }

        ctx.beginPath();
        ctx.roundRect(x, centerY - barH, barWidth, barH * 2, barWidth / 2);
        ctx.fill();
      }

      // Progress cursor
      if (progress > 0 && progress < 1) {
        const cursorX = progressIdx * (barWidth + barGap) + barWidth / 2;
        ctx.beginPath();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.shadowColor = trackAccentsMid[activeTrack];
        ctx.shadowBlur = 10;
        ctx.moveTo(cursorX, 4);
        ctx.lineTo(cursorX, h - 4);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = accent;
        ctx.shadowBlur = 12;
        ctx.arc(cursorX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.fillStyle = accent;
        ctx.arc(cursorX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawWaveform();
    window.addEventListener('resize', drawWaveform);
    return () => window.removeEventListener('resize', drawWaveform);
  }, [waveforms, activeTrack, currentTime, duration]);

  const playTrack = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack === index && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.src = tracks[index].src;
    audio.load();
    audio.play().then(() => {
      setActiveTrack(index);
      setPlaying(true);
    }).catch(() => {});
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const playNext = () => {
    const next = (activeTrack + 1) % tracks.length;
    setCurrentTime(0);
    playTrack(next);
  };

  const playPrev = () => {
    const prev = (activeTrack - 1 + tracks.length) % tracks.length;
    setCurrentTime(0);
    playTrack(prev);
  };

  const handleTimeUpdate = () => {
    if (!isDragging.current && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    playNext();
  };

  const seekToPosition = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!audioRef.current || !duration) return;
    const ref = dragTarget.current === 'progress' ? progressRef.current : waveformContainerRef.current;
    if (!ref) return;
    const rect = ref.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleWaveformMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragTarget.current = 'waveform';
    seekToPosition(e);
  };

  useEffect(() => {
    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) seekToPosition(e);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches[0]) {
        seekToPosition(e.touches[0] as unknown as MouseEvent);
      }
    };
    const handleTouchEnd = () => { isDragging.current = false; };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [duration, waveforms, activeTrack]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTrack = tracks[activeTrack];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="soundlib" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} preload="metadata" />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('sl.title')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('sl.title')}</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">{t('sl.subtitle')}</p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground font-medium">{t('sl.badge')}</span>
          </div>
        </div>

        <div className="fade-in-up lg:flex gap-6" style={{ transitionDelay: '100ms' }}>
          {/* Track List — horizontal scroll on mobile, vertical sidebar on desktop */}
          <div className="lg:w-[280px] xl:w-[300px] flex-shrink-0 mb-4 lg:mb-0">
            {/* Mobile: horizontal scrollable track pills */}
            <div className="lg:hidden track-scroll flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== activeTrack) { setActiveTrack(i); setPlaying(false); setCurrentTime(0); } else { playTrack(i); } }}
                  className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left transition-all duration-300"
                  style={{
                    background: activeTrack === i ? trackAccentsFaded[i] : 'rgba(255,255,255,0.02)',
                    borderColor: activeTrack === i ? trackAccents[i] : 'rgba(42,42,42,0.6)',
                  }}
                >
                  {/* Playing indicator or number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                    style={{
                      background: activeTrack === i ? trackAccents[i] : 'rgba(255,255,255,0.04)',
                      color: activeTrack === i ? '#0a0a0a' : 'rgba(138,133,128,0.7)',
                    }}
                  >
                    {playing && activeTrack === i ? (
                      <div className="flex items-end gap-[1.5px] h-2.5">
                        <span className="w-[1.5px] rounded-full bg-current audio-bar" style={{ animationDelay: '0s' }} />
                        <span className="w-[1.5px] rounded-full bg-current audio-bar" style={{ animationDelay: '0.15s' }} />
                        <span className="w-[1.5px] rounded-full bg-current audio-bar" style={{ animationDelay: '0.08s' }} />
                      </div>
                    ) : (
                      <span className="font-mono">{i + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: activeTrack === i ? trackAccents[i] : 'rgba(138,133,128,0.9)' }}>
                      {track.tag}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {/* Desktop: vertical sidebar list */}
            <div className="hidden lg:block bg-card/60 border border-[#2a2a2a]/60 rounded-2xl overflow-hidden backdrop-blur-sm">
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== activeTrack) { setActiveTrack(i); setPlaying(false); setCurrentTime(0); } else { playTrack(i); } }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.03] group"
                  style={{
                    background: activeTrack === i ? trackAccentsFaded[i] : undefined,
                    borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  {/* Track Number / Playing Indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: activeTrack === i ? trackAccents[i] : 'rgba(255,255,255,0.04)',
                      color: activeTrack === i ? '#0a0a0a' : 'rgba(138,133,128,0.7)',
                    }}
                  >
                    {playing && activeTrack === i ? (
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="w-[2px] rounded-full bg-current audio-bar" style={{ animationDelay: '0s' }} />
                        <span className="w-[2px] rounded-full bg-current audio-bar" style={{ animationDelay: '0.2s' }} />
                        <span className="w-[2px] rounded-full bg-current audio-bar" style={{ animationDelay: '0.1s' }} />
                      </div>
                    ) : (
                      <span className="font-mono">{String(i + 1).padStart(2, '0')}</span>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors duration-300 ${activeTrack === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>
                      {track.tag}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                      {track.name}
                    </p>
                  </div>

                  {/* Duration */}
                  {waveforms[i] && (
                    <span className="text-[11px] font-mono text-muted-foreground/40 flex-shrink-0 tabular-nums">
                      {formatTime(waveforms[i].duration)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Player */}
          <div className="flex-1 min-w-0">
            <div className="relative bg-card/80 border border-[#2a2a2a]/80 rounded-2xl overflow-hidden backdrop-blur-sm">
              {/* Accent glow behind player */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[400px] h-[160px] pointer-events-none transition-colors duration-700"
                style={{ background: `radial-gradient(ellipse, ${trackAccentsFaded[activeTrack]} 0%, transparent 70%)` }}
              />

              {/* Now Playing Header */}
              <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="inline-block w-2 h-2 rounded-full transition-colors duration-500" style={{ background: trackAccents[activeTrack] }} />
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{currentTrack.tag}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate leading-tight">
                      {currentTrack.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1.5 truncate">
                      {currentTrack.gear}
                    </p>
                  </div>
                  {/* EQ Visualizer */}
                  {playing && (
                    <div className="flex items-end gap-[3px] h-8 sm:h-10 flex-shrink-0 mt-1 px-2">
                      {[0,1,2,3,4].map((b) => (
                        <div key={b} className="w-[3px] rounded-full transition-colors duration-500"
                          style={{ background: trackAccents[activeTrack], animation: `eqBar${b + 1} ${1.2 - b * 0.08}s ease-in-out infinite ${b * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Waveform Display */}
              <div className="relative px-4 sm:px-6">
                <div
                  ref={waveformContainerRef}
                  className={`relative w-full h-24 sm:h-28 lg:h-32 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer overflow-hidden transition-all duration-300 ${playing ? 'border-white/[0.08]' : ''}`}
                  onMouseDown={handleWaveformMouseDown}
                  onTouchStart={(e) => { isDragging.current = true; if (e.touches[0]) seekToPosition(e.touches[0] as unknown as MouseEvent); }}
                >
                  <canvas ref={waveformRef} className="absolute inset-0 w-full h-full" />
                  {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[24, 38, 16, 42, 12, 34, 28, 44, 18, 36, 20, 40, 14, 30, 26, 10, 32, 22, 46, 20].map((h, i) => (
                          <div key={i} className="w-1 bg-primary/30 rounded-full animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between mt-2.5 px-0.5">
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground/50 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground/50 tabular-nums">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="relative px-4 sm:px-6 pt-3 pb-4 sm:pb-5">
                {/* Progress Bar */}
                <div
                  ref={progressRef}
                  className="relative w-full h-1 bg-white/[0.06] rounded-full mb-5 cursor-pointer group"
                  onMouseDown={(e) => {
                    dragTarget.current = 'progress';
                    isDragging.current = true;
                    seekToPosition(e);
                  }}
                >
                  <div className="absolute inset-0 h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%`, background: trackAccents[activeTrack] }}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    style={{ left: `calc(${progress}% - 6px)`, background: trackAccents[activeTrack], boxShadow: `0 0 8px ${trackAccentsMid[activeTrack]}` }}
                  />
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Volume */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8H4a1 1 0 00-1 1v6a1 1 0 001 1h2.5l4.5 4V4l-4.5 4z" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 accent-[#d4922a] cursor-pointer"
                      aria-label="Volume"
                    />
                  </div>

                  {/* Prev / Play / Next */}
                  <div className="flex items-center gap-2 sm:gap-3 mx-auto">
                    <button
                      onClick={playPrev}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] transition-all duration-200"
                      aria-label="Previous track"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>

                    <button
                      onClick={togglePlay}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                        playing
                          ? 'text-primary-foreground play-btn-pulse shadow-lg'
                          : 'text-primary-foreground hover:shadow-lg'
                      }`}
                      style={{
                        background: trackAccents[activeTrack],
                        boxShadow: playing ? `0 0 24px ${trackAccentsMid[activeTrack]}` : undefined,
                      }}
                      aria-label={playing ? 'Pause' : 'Play'}
                    >
                      {playing ? (
                        <svg className="size-5 sm:size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="size-5 sm:size-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={playNext}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] transition-all duration-200"
                      aria-label="Next track"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Spacer for balance */}
                  <div className="hidden sm:block w-[120px] flex-shrink-0" />
                </div>
              </div>

              {/* Track Description */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-5">
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 sm:px-4 py-3">
                  <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: trackAccentsMid[activeTrack] }}>
                    {currentTrack.settings}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">
                    {currentTrack.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== CONFIGURATOR ==========

function ConfiguratorSection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const [color, setColor] = useState<string>('tiger');
  const [impedance, setImpedance] = useState<string>('8');
  const [fxLoop, setFxLoop] = useState(true);

  const colors = [
    { id: 'tiger', label: t('cfg.color.tiger'), swatch: 'swatch-tiger' },
    { id: 'black', label: t('cfg.color.black'), swatch: 'swatch-black' },
    { id: 'cream', label: t('cfg.color.cream'), swatch: 'swatch-cream' },
    { id: 'red', label: t('cfg.color.red'), swatch: 'swatch-red' },
  ];

  const previewClass = `config-preview-${color}`;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="config" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('cfg.title')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('cfg.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('cfg.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls */}
          <div className="space-y-8 fade-in-up">
            {/* Color */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-[0.15em] mb-4">{t('cfg.color')}</h3>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      color === c.id ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'border-[#2a2a2a]/60 hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div className={`aspect-square ${c.swatch} transition-transform duration-300 group-hover:scale-110`} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                      <span className="text-[10px] sm:text-xs text-white/90 font-medium">{c.label}</span>
                    </div>
                    {color === c.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Impedance */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-[0.15em] mb-4">{t('cfg.impedance')}</h3>
              <div className="flex gap-3">
                {['8', '16'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setImpedance(val)}
                    className={`flex-1 py-3.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
                      impedance === val
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                        : 'border-[#2a2a2a]/60 text-muted-foreground hover:border-[#3a3a3a] hover:text-foreground'
                    }`}
                  >
                    {val} Ohm
                  </button>
                ))}
              </div>
            </div>

            {/* FX Loop */}
            <div className="bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-[0.15em]">{t('cfg.fxloop')}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {fxLoop ? t('cfg.fxloop.on') : t('cfg.fxloop.off')}
                  </p>
                </div>
                <Switch checked={fxLoop} onCheckedChange={setFxLoop} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="fade-in-up" style={{ transitionDelay: '150ms' }}>
            <div className={`rounded-3xl overflow-hidden ${previewClass} border border-[#2a2a2a]/60`}>
              {/* Branding */}
              <div className="px-5 sm:px-8 pt-5 sm:pt-8">
                <p className="text-[10px] sm:text-xs text-muted-foreground/40 font-mono tracking-[0.4em] uppercase mb-2">
                  {t('cfg.preview.brand')}
                </p>
                <div className="w-12 h-[1px] bg-primary/30" />
              </div>

              {/* Visual center */}
              <div className="flex items-center justify-center px-4 sm:px-8 pb-4 sm:pb-6">
                <div className="text-center w-full">
                  <img src="/aluplex/aluplex-1.jpg" alt="ALUPLEXamp" className="w-full max-w-sm mx-auto rounded-2xl opacity-90 object-cover aspect-[3/2] shadow-2xl shadow-black/30" />
                </div>
              </div>

              {/* Summary */}
              <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                <div className="bg-[#0a0a0a]/60 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-4">{t('cfg.summary')}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('cfg.summary.color')}</span>
                      <span className="text-foreground font-medium">{colors.find(c => c.id === color)?.label}</span>
                    </div>
                    <div className="w-full h-px bg-white/[0.04]" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('cfg.summary.impedance')}</span>
                      <span className="text-foreground font-medium">{impedance} Ohm</span>
                    </div>
                    <div className="w-full h-px bg-white/[0.04]" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('cfg.summary.fxloop')}</span>
                      <span className="text-foreground font-medium">{fxLoop ? t('cfg.fxloop.on') : t('cfg.fxloop.off')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => scrollTo('contact')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5 sm:py-6 text-base font-semibold rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.01]"
              >
                {t('cfg.cta')}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== GALLERY ==========

function GallerySection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = [
    // --- Real ALUPLEXamp photos ---
    { label: t('gal.front'), src: '/aluplex/aluplex-1.jpg' },
    { label: t('gal.control'), src: '/aluplex/DSC6775.jpg' },
    { label: t('gal.internals'), src: '/aluplex/aluplex-back-naked.jpg' },
    { label: t('glow'), src: '/aluplex/DSC6821.jpg' },
    { label: t('gal.tubes'), src: '/aluplex/DSC6827.jpg' },
    { label: t('gal.side'), src: '/aluplex/aluplex-56.jpg' },
    { label: t('gal.wiring'), src: '/aluplex/DSC6790.jpg' },
    { label: t('gal.studio'), src: '/aluplex/aluplex-138.jpg' },
    { label: t('gal.naked'), src: '/aluplex/aluplex-109.jpg' },
    { label: t('gal.rear'), src: '/aluplex/aluplex-123.jpg' },
  ];

  const prev = () => {
    if (lightbox !== null) setLightbox(lightbox === 0 ? items.length - 1 : lightbox - 1);
  };

  const next = () => {
    if (lightbox !== null) setLightbox(lightbox === items.length - 1 ? 0 : lightbox + 1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <section id="gallery" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('gal.title')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('gal.title')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('gal.subtitle')}</p>
        </div>

        {/* Gallery Grid - responsive masonry-like */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`fade-in-up group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#2a2a2a]/40 cursor-pointer card-hover ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2 sm:aspect-auto' : ''
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
              aria-label={item.label}
            >
              <img src={item.src} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {/* Always-on gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-[10px] sm:text-xs text-white/70 font-medium group-hover:text-white/90 transition-colors">{item.label}</span>
              </div>
              {/* Expand icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <X className="size-3 text-white rotate-45" />
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <div className="absolute top-0 left-0 right-0 z-[102] flex items-center justify-between p-4 sm:p-6">
              <button
                className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors border border-white/10"
                onClick={() => setLightbox(null)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
                <span className="text-xs text-white/60 font-medium">{lightbox + 1} / {items.length}</span>
              </div>
            </div>
            <button
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[101] p-2.5 sm:p-3 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors border border-white/10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[101] p-2.5 sm:p-3 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors border border-white/10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="relative w-[95vw] sm:w-[85vw] max-w-5xl aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={items[lightbox].src} alt={items[lightbox].label} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <p className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-white/50 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              {items[lightbox].label}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ========== FAQ ==========

function FAQSection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const faqs = Array.from({ length: 10 }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <section id="faq" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('faq.title')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('faq.title')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('faq.subtitle')}</p>
        </div>

        <div className="fade-in-up" style={{ transitionDelay: '100ms' }}>
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card/50 border border-[#2a2a2a]/60 rounded-2xl px-3 sm:px-5 lg:px-6 data-[state=open]:border-primary/20 data-[state=open]:bg-card/80 transition-all duration-300 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-foreground hover:text-primary hover:no-underline py-4 sm:py-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {faq.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 sm:pb-5 pl-10 sm:pl-12">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// ========== CTA SECTION ==========

function CTASection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className="fade-in-up relative rounded-3xl overflow-hidden border border-primary/15 p-6 sm:p-10 lg:p-16 text-center">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.08] to-primary/[0.04]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,146,42,0.06)_0%,transparent_60%)]" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 sm:mb-8">
              <Music className="size-7 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">{t('cta.subtitle')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a href="mailto:info@aluplexamp.com">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 sm:py-6 text-base font-semibold rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] w-full sm:w-auto">
                  {t('cta.contact')}
                </Button>
              </a>
              <a href="mailto:order@aluplexamp.com">
                <Button variant="outline" className="border-white/10 text-foreground hover:bg-white/5 hover:text-foreground hover:border-white/20 px-8 py-5 sm:py-6 text-base rounded-xl backdrop-blur-sm transition-all duration-300 w-full sm:w-auto">
                  {t('cta.order')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER ==========

function Footer({ t }: { t: (k: string) => string }) {
  return (
    <footer className="border-t border-[#2a2a2a]/50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 safe-bottom mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 w-auto opacity-70" />
          </div>

          <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>

          {/* Handwired */}
          <div className="flex items-center gap-2 text-muted-foreground/50 text-xs">
            <Wrench className="size-3" />
            <span>{t('footer.handwired')}</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/30 mt-1">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

// ========== SCROLL TO TOP ==========

function ScrollToTop() {
  const show = useShowScrollTop(500);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-xl bg-primary/90 backdrop-blur-sm text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/20 hover:bg-primary transition-all duration-300 hover:scale-105 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp className="size-5" />
    </button>
  );
}

// ========== SECTION DIVIDER ==========

function SectionDivider() {
  return <div className="section-divider" />;
}

// ========== MAIN PAGE ==========

export default function Home() {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation lang={lang} setLang={setLang} t={t} />
      <main className="flex-1">
        <HeroSection t={t} />
        <SectionDivider />
        <ValueProps t={t} />
        <SectionDivider />
        <EngineeringSection t={t} />
        <SectionDivider />
        <SoundArchitecture t={t} />
        <SectionDivider />
        <SoundLibrary t={t} />
        <SectionDivider />
        <ConfiguratorSection t={t} />
        <SectionDivider />
        <GallerySection t={t} />
        <SectionDivider />
        <FAQSection t={t} />
        <SectionDivider />
        <CTASection t={t} />
      </main>
      <Footer t={t} />
      <ScrollToTop />
    </div>
  );
}
