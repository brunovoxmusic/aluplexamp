'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart, Target, Shield, Music, ThermometerSun, Weight, Magnet, ShieldCheck,
  Zap, Power, Mic2, Volume2, Headphones, Settings, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Menu, X, Wrench, ArrowRight, Sparkles, Flame, CircleDot,
  MapPin, Mail, Phone, Globe, ArrowUp, Ruler, Maximize2,
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
import {
  translations as staticTranslations,
  type Language,
  type Translations,
} from '@/lib/translations';
import {
  siteSettings as staticSiteSettings,
  type AudioLibrarySettings,
  type AudioTrackSettings,
  type ContactSettings,
  type HeroBackgroundSettings,
  type MaintenanceSettings,
  type SiteSettings,
} from '@/lib/site';
import { HeroAmp3D } from '@/components/hero-amp-3d';

type ConfigInquiry = {
  subject: string;
  message: string;
  nonce: number;
};

type ContentResponse = {
  translations?: Translations;
  content?: Translations;
  site?: SiteSettings;
};

type PlayerTrack = {
  name: string;
  gear: string;
  settings: string;
  desc: string;
  src: string;
  tag: string;
};

// ========== HOOKS ==========

function useTranslation() {
  const [lang, setLang] = useState<Language>('sk');
  const [content, setContent] = useState<Translations>(staticTranslations);
  const [site, setSite] = useState<SiteSettings>(staticSiteSettings);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveContent() {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as ContentResponse;
        const nextTranslations = data.translations ?? data.content;

        if (!cancelled && nextTranslations) {
          setContent(nextTranslations);
        }

        if (!cancelled && data.site) {
          setSite(data.site);
        }
      } catch {
        // Keep static build content if live CMS content cannot be loaded.
      }
    }

    loadLiveContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const t = useCallback(
    (key: string): string => content[lang]?.[key] ?? key,
    [content, lang]
  );
  // Update <html lang> attribute dynamically for accessibility and SEO
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return { lang, setLang, t, site };
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

/** Shared scroll state — single listener for all scroll-derived values */
let scrollListeners: Array<(data: { y: number; progress: number }) => void> = [];
let rafId: number | null = null;
let lastScrollData = { y: 0, progress: 0 };

function onGlobalScroll(callback: (data: { y: number; progress: number }) => void) {
  scrollListeners.push(callback);
  // Immediately call with last known data
  if (lastScrollData.y > 0) callback(lastScrollData);
  return () => {
    scrollListeners = scrollListeners.filter(l => l !== callback);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      lastScrollData = { y, progress };
      scrollListeners.forEach(cb => cb(lastScrollData));
      rafId = null;
    });
  }, { passive: true });
}

function useScrolled(threshold = 100) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    return onGlobalScroll(({ y }) => setScrolled(y > threshold));
  }, [threshold]);
  return scrolled;
}

function useShowScrollTop(threshold = 500) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    return onGlobalScroll(({ y }) => setShow(y > threshold));
  }, [threshold]);
  return show;
}

/** Returns 0–1 scroll progress of the whole document */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    return onGlobalScroll(({ progress: p }) => setProgress(p));
  }, []);
  return progress;
}

/** Tracks which section id is currently in the viewport */
function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.15, rootMargin: '-80px 0px -40% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);
  return active;
}

// ========== SCROLL PROGRESS BAR ==========

function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full scroll-progress-fill"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function AmpStarMotif({ className = '' }: { className?: string }) {
  return (
    <div className={`amp-star-motif ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function TubeGlyphCluster({ className = '' }: { className?: string }) {
  return (
    <div className={`tube-glyph-cluster ${className}`} aria-hidden="true">
      <span className="tube-glyph">
        <span />
      </span>
      <span className="tube-glyph tube-glyph-tall">
        <span />
      </span>
      <span className="tube-glyph">
        <span />
      </span>
    </div>
  );
}

function SignalPathDivider() {
  return (
    <div className="signal-path-divider" aria-hidden="true">
      <span />
      <AmpStarMotif />
      <span />
    </div>
  );
}

// ========== NAVIGATION ==========

function Navigation({ lang, setLang, t }: { lang: Language; setLang: (l: Language) => void; t: (k: string) => string }) {
  const scrolled = useScrolled(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const progress = useScrollProgress();

  const navLinks = [
    { id: 'soundlib', label: t('nav.soundlib') },
    { id: 'specs', label: t('nav.specs') },
    { id: 'config', label: t('nav.config') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'faq', label: t('nav.faq') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const sectionIds = navLinks.map((l) => l.id);
  const activeSection = useActiveSection(sectionIds);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const langOptions: Language[] = ['sk', 'en', 'de'];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-active shadow-lg shadow-black/20' : 'bg-[#0a0a0a]/60 backdrop-blur-xl'}`}>
      {/* Inline scroll progress — sits at bottom of nav bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
        <div
          className="h-full nav-progress-fill transition-[width] duration-100 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center"
            aria-label="ALUPLEXamp Home"
          >
            <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 sm:h-8 w-auto" />
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`relative px-3.5 xl:px-4 py-2 text-sm rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Active underline glow */}
                  <span className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary/40 shadow-[0_0_8px_rgba(255,184,0,0.3)]' : 'bg-transparent'
                  }`} />
                  <span className={isActive ? 'nav-link-active' : ''}>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Language + Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]" role="radiogroup" aria-label={t('a11y.language')}>
              {langOptions.map((l) => (
                <button
                  key={l}
                  role="radio"
                  aria-checked={lang === l}
                  aria-label={l.toUpperCase()}
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
                <button
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                  aria-label={t('a11y.menu.open')}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-navigation"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent id="mobile-navigation" side="right" className="w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border-[#2a2a2a]/50">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-foreground flex items-center gap-3">
                    <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                {/* Mobile Language Switcher */}
                <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 mb-8 w-fit border border-white/[0.06]" role="radiogroup" aria-label={t('a11y.language')}>
                  {langOptions.map((l) => (
                    <button
                      key={l}
                      role="radio"
                      aria-checked={lang === l}
                      aria-label={l.toUpperCase()}
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
                {/* Mobile Nav Links — with active indicator + mini progress per section */}
                <div className="flex flex-col gap-0.5">
                  {navLinks.map((link, i) => {
                    const isActive = activeSection === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => scrollTo(link.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`relative text-left pl-4 pr-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-primary/[0.08] text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        {/* Active left accent bar */}
                        <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-all duration-300 ${
                          isActive ? 'bg-primary shadow-[0_0_8px_rgba(255,184,0,0.4)]' : 'bg-transparent'
                        }`} />
                        {/* Section number */}
                        <span className={`inline-block w-5 mr-3 text-xs font-mono transition-colors duration-300 ${
                          isActive ? 'text-primary/60' : 'text-muted-foreground/30'
                        }`}>{String(i + 1).padStart(2, '0')}</span>
                        {link.label}
                      </button>
                    );
                  })}
                </div>
                <SheetClose aria-label={t('a11y.menu.close')} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
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

const DEFAULT_HERO_BACKGROUND: HeroBackgroundSettings = {
  mode: 'static',
  staticImage: '/aluplex/aluplex-red-front.jpg',
  slides: [
    '/aluplex/aluplex-red-front.jpg',
    '/aluplex/aluplex-1.jpg',
    '/aluplex/aluplex-56.jpg',
    '/aluplex/DSC6821.jpg',
    '/aluplex/aluplex-138.jpg',
  ],
};

const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  publicEmail: 'info@aluplexamp.com',
  formEmail: 'info@aluplexamp.com',
  phone: '',
  instagram: 'https://instagram.com/aluplexamp',
  youtube: 'https://youtube.com/@aluplexamp',
  facebook: 'https://facebook.com/aluplexamp',
};

const DEFAULT_AUDIO_TRACK_SETTINGS: AudioTrackSettings[] = [
  {
    id: 'track1',
    enabled: true,
    src: '/audio/track1-woody-clean.mp3',
    tagKey: 'sl.track1.tag',
    nameKey: 'sl.track1.name',
    gearKey: 'sl.track1.gear',
    settingsKey: 'sl.track1.settings',
    descKey: 'sl.track1.desc',
  },
  {
    id: 'track2',
    enabled: true,
    src: '/audio/track2-cranked-british-crunch.mp3',
    tagKey: 'sl.track2.tag',
    nameKey: 'sl.track2.name',
    gearKey: 'sl.track2.gear',
    settingsKey: 'sl.track2.settings',
    descKey: 'sl.track2.desc',
  },
  {
    id: 'track3',
    enabled: true,
    src: '/audio/track3-brown-sound-session.mp3',
    tagKey: 'sl.track3.tag',
    nameKey: 'sl.track3.name',
    gearKey: 'sl.track3.gear',
    settingsKey: 'sl.track3.settings',
    descKey: 'sl.track3.desc',
  },
  {
    id: 'track4',
    enabled: true,
    src: '/audio/track4-touch-dynamics.mp3',
    tagKey: 'sl.track4.tag',
    nameKey: 'sl.track4.name',
    gearKey: 'sl.track4.gear',
    settingsKey: 'sl.track4.settings',
    descKey: 'sl.track4.desc',
  },
  {
    id: 'track5',
    enabled: true,
    src: '/audio/track5-volume-rolloff.mp3',
    tagKey: 'sl.track5.tag',
    nameKey: 'sl.track5.name',
    gearKey: 'sl.track5.gear',
    settingsKey: 'sl.track5.settings',
    descKey: 'sl.track5.desc',
  },
  {
    id: 'track6',
    enabled: true,
    src: '/audio/track6-lead-sustain.mp3',
    tagKey: 'sl.track6.tag',
    nameKey: 'sl.track6.name',
    gearKey: 'sl.track6.gear',
    settingsKey: 'sl.track6.settings',
    descKey: 'sl.track6.desc',
  },
  {
    id: 'track7',
    enabled: true,
    src: '/audio/track7-extended-amp-journey.mp3',
    tagKey: 'sl.track7.tag',
    nameKey: 'sl.track7.name',
    gearKey: 'sl.track7.gear',
    settingsKey: 'sl.track7.settings',
    descKey: 'sl.track7.desc',
  },
];

const DEFAULT_AUDIO_LIBRARY: AudioLibrarySettings = {
  tracks: DEFAULT_AUDIO_TRACK_SETTINGS,
};

function getHeroImages(settings?: HeroBackgroundSettings) {
  const nextSettings = { ...DEFAULT_HERO_BACKGROUND, ...settings };
  const slides = Array.isArray(nextSettings.slides)
    ? nextSettings.slides.map((src) => src.trim()).filter(Boolean)
    : [];

  if (nextSettings.mode === 'slideshow' && slides.length > 1) {
    return {
      mode: 'slideshow' as const,
      images: slides,
    };
  }

  return {
    mode: 'static' as const,
    images: [nextSettings.staticImage?.trim() || DEFAULT_HERO_BACKGROUND.staticImage],
  };
}

function getContactSettings(settings?: ContactSettings): ContactSettings {
  return {
    ...DEFAULT_CONTACT_SETTINGS,
    ...settings,
  };
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function getAudioTracks(
  audioLibrary: AudioLibrarySettings | undefined,
  t: (k: string) => string
): PlayerTrack[] {
  const configuredTracks =
    audioLibrary?.tracks?.filter((track) => track.enabled && track.src.trim()) ?? [];
  const sourceTracks =
    configuredTracks.length > 0 ? configuredTracks : DEFAULT_AUDIO_LIBRARY.tracks;

  return sourceTracks.map((track) => ({
    name: t(track.nameKey),
    gear: t(track.gearKey),
    settings: t(track.settingsKey),
    desc: t(track.descKey),
    src: track.src,
    tag: t(track.tagKey),
  }));
}

function HeroSection({
  t,
  heroBackground,
}: {
  t: (k: string) => string;
  heroBackground?: HeroBackgroundSettings;
}) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const heroSpecs = [
    { icon: Zap, label: '30 W' },
    { icon: Flame, label: 'EL34' },
    { icon: CircleDot, label: '12.5 kg' },
    { icon: Wrench, label: t('hero.handwired') },
  ];
  const heroProofs = [
    t('hero.proof.order'),
    t('hero.proof.turret'),
    t('hero.proof.voltage'),
  ];
  const heroMedia = getHeroImages(heroBackground);
  const isHeroSlideshow = heroMedia.mode === 'slideshow' && heroMedia.images.length > 1;
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    setActiveHeroSlide(0);
    if (!isHeroSlideshow) return;

    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroMedia.images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isHeroSlideshow, heroMedia.images.join('|')]);

  return (
    <section className="relative min-h-screen flex items-start lg:items-center overflow-hidden bg-[#080808] section-amp-shell amp-tone-tiger">
      {/* CMS-controlled hero background: static product image or slideshow */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {heroMedia.images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`hero-slide ${
              !isHeroSlideshow || i === activeHeroSlide
                ? 'hero-slide-active'
                : ''
            }`}
          >
            <img
              src={src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding={i === 0 ? 'sync' : 'async'}
              className="w-full h-full object-cover scale-105 hero-ken-burns"
            />
          </div>
        ))}

        {/* Layered overlay — stronger center-left readability, product image remains visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/74 to-[#080808]/24" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/72 via-[#080808]/8 to-[#080808]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_45%,transparent_0%,rgba(8,8,8,0.14)_45%,rgba(8,8,8,0.62)_100%)]" />

        {/* Vignette effect for cinematic depth */}
        <div className="absolute inset-0 hero-vignette" />

        {/* Subtle amber glow — top right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,184,0,0.05)_0%,transparent_60%)] pointer-events-none" />
        {/* Subtle amber glow — bottom left */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,184,0,0.03)_0%,transparent_60%)] pointer-events-none" />
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 hero-grid-pattern pointer-events-none opacity-[0.02]" />
      <div className="absolute inset-0 amp-perforation-field opacity-[0.06] pointer-events-none" aria-hidden="true" />
      <HeroAmp3D />
      <TubeGlyphCluster className="absolute right-[9%] top-28 hidden lg:flex opacity-45" />
      <div className="absolute inset-x-0 top-24 hidden justify-center opacity-45 lg:flex" aria-hidden="true">
        <SignalPathDivider />
      </div>
      <div
        className={`hero-slide-index hidden lg:flex ${
          heroMedia.mode === 'static' ? 'opacity-0' : ''
        }`}
        aria-hidden="true"
      >
        {heroMedia.images.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hero-slide-dot ${i === activeHeroSlide ? 'hero-slide-dot-active' : ''}`}
            onClick={() => setActiveHeroSlide(i)}
            aria-label={`Zobrazit hero obrazok ${i + 1}`}
          />
        ))}
      </div>

      <div className="mobile-hero-product absolute sm:hidden">
        <img
          src="/aluplex/aluplex-red-front.jpg"
          alt="ALUPLEXamp ručne vyrábaný elektrónkový gitarový zosilňovač"
          loading="eager"
          decoding="sync"
          className="mobile-hero-product-image"
        />
      </div>

      <div className="mobile-hero-content relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 xl:px-16 py-24 sm:py-36 lg:py-32">
        <div className="hero-copy-shell">
            <div className="hero-fade-item" style={{ animationDelay: '0.2s' }}>
              <Badge className="amp-badge mb-5 sm:mb-8 max-w-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-left text-[11px] sm:text-sm leading-relaxed whitespace-normal bg-primary/[0.08] text-primary/90 border-primary/15 hover:bg-primary/[0.12] backdrop-blur-md">
                <Sparkles className="size-3.5 mr-2" />
                {t('hero.badge')}
              </Badge>
            </div>

            <div className="hero-fade-item" style={{ animationDelay: '0.4s' }}>
              <h1 className="max-w-[10ch] text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8rem] font-bold tracking-normal mb-4 sm:mb-7 text-gradient-amber-shimmer leading-[0.9]">
                {t('hero.title')}
              </h1>
            </div>

            <div className="hero-fade-item mb-4 sm:mb-7 flex items-center gap-4" style={{ animationDelay: '0.6s' }}>
              <div className="hero-line-reveal h-[1px] bg-gradient-to-r from-primary via-primary/60 to-transparent w-20 sm:w-32" />
              <AmpStarMotif />
            </div>

            <div className="hero-fade-item" style={{ animationDelay: '0.7s' }}>
              <p className="max-w-[24rem] sm:max-w-2xl text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light text-foreground/88 mb-3 sm:mb-5 tracking-normal hero-subtitle-text">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="hero-fade-item hero-cta-block flex flex-row flex-wrap items-start sm:items-center gap-2.5 sm:gap-4" style={{ animationDelay: '0.85s' }}>
              <Button
                size="lg"
                onClick={() => scrollTo('soundlib')}
                className="w-[48%] max-w-[48%] min-w-0 flex-none shrink overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 sm:w-auto sm:max-w-none sm:px-10 py-3.5 sm:py-6 text-xs sm:text-base font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] group"
              >
                {t('hero.cta.listen')}
                <ArrowRight className="size-3.5 sm:size-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo('config')}
                className="w-[48%] max-w-[48%] min-w-0 flex-none shrink overflow-hidden border-white/[0.08] text-foreground/80 hover:bg-white/[0.06] hover:text-foreground hover:border-white/15 px-2.5 sm:w-auto sm:max-w-none sm:px-10 py-3.5 sm:py-6 text-xs sm:text-base rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] group"
              >
                {t('hero.cta.configure')}
                <Settings className="size-3.5 sm:size-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </div>

            <div className="hero-fade-item hero-description-block" style={{ animationDelay: '0.85s' }}>
              <p className="hero-mobile-description hidden sm:block text-xs sm:text-base text-muted-foreground/72 max-w-[24rem] sm:max-w-xl mt-5 mb-5 sm:mb-10 leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <div className="hero-fade-item hero-specs-block mb-6 sm:mb-10 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3" style={{ animationDelay: '0.95s' }}>
              {heroSpecs.map((spec, i) => (
                <div
                  key={i}
                  className={`min-w-0 flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.045] border border-white/[0.075] backdrop-blur-md transition-all duration-500 hover:bg-white/[0.075] hover:border-primary/20 ${
                    i === 3 ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <spec.icon className="size-3.5 sm:size-4 text-primary/80" />
                  <span className="min-w-0 truncate text-xs sm:text-sm font-medium text-foreground/72 tracking-normal">{spec.label}</span>
                </div>
              ))}
            </div>

            <p className="hero-fade-item hero-cta-note hidden sm:block mt-4 max-w-[24rem] text-[11px] leading-relaxed text-muted-foreground/48 sm:mt-5 sm:max-w-xl sm:text-xs" style={{ animationDelay: '1.18s' }}>
              {t('hero.cta.note')}
            </p>
            <div className="hero-fade-item mt-5 hidden max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.05] backdrop-blur-md sm:grid" style={{ animationDelay: '1.26s' }}>
              {heroProofs.map((proof, index) => (
                <div key={proof} className="bg-[#080808]/72 px-4 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/65">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/62">
                    {proof}
                  </p>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Refined scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 hidden sm:block hero-fade-item" style={{ animationDelay: '1.5s' }}>
        <button
          onClick={() => scrollTo('soundlib')}
          className="flex flex-col items-center gap-2 group cursor-pointer"
          aria-label={t('hero.scroll')}
        >
          <span className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.25em] group-hover:text-muted-foreground/50 transition-colors duration-300">{t('hero.scroll')}</span>
          <ChevronDown className="size-4 text-muted-foreground/25 bounce-chevron" />
        </button>
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
  const proofPoints = ['EL34', 'ECC83', 'Turret board', '12.5 kg'];
  const patternClasses = ['amp-pattern-small', 'amp-pattern-large', 'amp-pattern-medium', 'amp-pattern-wide'];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-tiger" ref={ref}>
      <div className="absolute inset-x-0 top-0 flex justify-center opacity-70" aria-hidden="true">
        <SignalPathDivider />
      </div>
      <div className="relative overflow-hidden rounded-none border-y border-white/[0.05] bg-black/20 py-8 sm:rounded-[1.75rem] sm:border sm:py-10">
        {/* Direct background image for better visibility */}
        <img
          src="/aluplex/aluplex-138.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] grayscale mix-blend-luminosity pointer-events-none"
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/96 via-[#0a0a0a]/92 to-[#0a0a0a]/86 pointer-events-none" />
        <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-20 lg:block" aria-hidden="true">
          <div className="amp-perforation-field h-full" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 lg:mb-12 fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('vp.section')}</span>
              <div className="w-8 h-[2px] bg-primary" />
            </div>
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {t('vp.headline')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t('vp.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {proofPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`fade-in-up group amp-surface amp-icon-card ${patternClasses[i % patternClasses.length]} bg-card/55 border border-[#2a2a2a]/70 rounded-2xl p-5 sm:p-6 lg:p-7 text-left card-hover backdrop-blur-sm`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <AmpStarMotif className="absolute right-4 bottom-4 opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <card.icon className="size-5 sm:size-6 text-primary" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/35">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
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
  const patternClasses = ['amp-pattern-medium', 'amp-pattern-small', 'amp-pattern-wide', 'amp-pattern-large'];

  return (
    <section id="specs" className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-cream" ref={ref}>
      <div className="absolute left-0 top-24 hidden h-72 w-40 border-y border-r border-primary/10 lg:block" aria-hidden="true">
        <div className="amp-perforation-field h-full opacity-30" />
      </div>
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
                {t('eng.headline')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm sm:text-base max-w-xl">
                {t('eng.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`fade-in-up group amp-surface amp-icon-card ${patternClasses[i % patternClasses.length]} bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-4 sm:p-5 card-hover backdrop-blur-sm`}
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
            <div className="relative amp-surface amp-pattern-wide bg-card/50 border border-[#2a2a2a]/60 rounded-3xl overflow-hidden tube-glow backdrop-blur-sm">
              <TubeGlyphCluster className="absolute right-6 top-6 z-10 opacity-70" />
              {/* Real chassis back image */}
              <div className="relative">
                <img src="/aluplex/aluplex-back-naked.jpg" alt="Vnútorné turret board zapojenie zosilňovača ALUPLEXamp" className="w-full h-auto object-cover" loading="lazy" decoding="async" />
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
    { icon: Weight, label: t('sa.weight.spec') },
    { icon: Ruler, label: t('sa.dimensions') },
  ];
  const patternClasses = ['amp-pattern-micro', 'amp-pattern-small', 'amp-pattern-large', 'amp-pattern-medium', 'amp-pattern-wide', 'amp-pattern-small', 'amp-pattern-large', 'amp-pattern-micro'];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-red" ref={ref}>
      <div className="absolute right-0 top-16 hidden h-[420px] w-[420px] opacity-20 lg:block" aria-hidden="true">
        <div className="amp-schematic-orbit" />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('sa.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('sa.subtitle')}</p>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {specs.map((spec, i) => (
            <div
              key={i}
              className={`fade-in-up group amp-surface amp-icon-card ${patternClasses[i % patternClasses.length]} bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-4 sm:p-5 lg:p-8 text-center card-hover backdrop-blur-sm`}
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
        <div className="fade-in-up relative overflow-hidden amp-surface amp-photo-panel bg-gradient-to-r from-primary/[0.04] via-primary/[0.08] to-primary/[0.04] border border-primary/15 rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm" style={{ transitionDelay: '400ms' }}>
          {/* Subtle amp photo background — right side */}
          <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full opacity-[0.12] pointer-events-none">
            <img src="/aluplex/aluplex-123.jpg" alt="" className="w-full h-full object-cover grayscale sm:mix-blend-luminosity" loading="lazy" decoding="async" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/92 to-card/35 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse,rgba(212,146,42,0.08)_0%,transparent_70%)] pointer-events-none" />
          <h3 className="relative z-10 text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)]">
            {t('sa.el34.title')}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed relative z-10">
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
  const numBars = 120;
  const seed = audioSrc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const metadataWaveform = (dur: number): WaveformData => {
    const peaks: number[] = [];
    for (let i = 0; i < numBars; i++) {
      const slow = Math.sin((i + seed) * 0.13);
      const fast = Math.sin((i + seed) * 0.47);
      const pulse = Math.sin((i + seed) * 0.031);
      const peak = 0.36 + slow * 0.22 + fast * 0.12 + pulse * 0.18;
      peaks.push(Math.max(0.08, Math.min(0.95, peak)));
    }
    return { peaks, duration: dur };
  };

  return new Promise((resolve) => {
    const metadataAudio = new Audio();
    metadataAudio.preload = 'metadata';
    metadataAudio.src = audioSrc;
    const cleanup = () => {
      metadataAudio.removeEventListener('loadedmetadata', onMeta);
      metadataAudio.removeEventListener('error', onErr);
    };
    const onMeta = () => {
      cleanup();
      resolve(metadataWaveform(metadataAudio.duration || 10));
    };
    const onErr = () => {
      cleanup();
      resolve(metadataWaveform(10));
    };
    metadataAudio.addEventListener('loadedmetadata', onMeta);
    metadataAudio.addEventListener('error', onErr);
    setTimeout(() => {
      cleanup();
      resolve(metadataWaveform(10));
    }, 5000);
  });
}

function SoundLibrary({
  t,
  audioLibrary,
}: {
  t: (k: string) => string;
  audioLibrary?: AudioLibrarySettings;
}) {
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
  const pendingPlayRef = useRef(false);
  const dragTarget = useRef<'waveform' | 'progress'>('waveform');

  const trackAccents = [
    'rgba(212,146,42,1)',
    'rgba(198,40,40,1)',
    'rgba(58,154,92,1)',
    'rgba(232,214,176,1)',
    'rgba(58,132,196,1)',
    'rgba(255,184,0,1)',
    'rgba(160,78,210,1)',
  ];
  const trackAccentsFaded = [
    'rgba(212,146,42,0.15)',
    'rgba(198,40,40,0.15)',
    'rgba(58,154,92,0.15)',
    'rgba(232,214,176,0.14)',
    'rgba(58,132,196,0.16)',
    'rgba(255,184,0,0.14)',
    'rgba(160,78,210,0.14)',
  ];
  const trackAccentsMid = [
    'rgba(212,146,42,0.5)',
    'rgba(198,40,40,0.5)',
    'rgba(58,154,92,0.5)',
    'rgba(232,214,176,0.48)',
    'rgba(58,132,196,0.52)',
    'rgba(255,184,0,0.5)',
    'rgba(160,78,210,0.48)',
  ];

  const tracks = useMemo(
    () => getAudioTracks(audioLibrary, t),
    [audioLibrary, t]
  );
  const getTrackAccent = (index: number) => trackAccents[index % trackAccents.length];
  const getTrackAccentFaded = (index: number) =>
    trackAccentsFaded[index % trackAccentsFaded.length];
  const getTrackAccentMid = (index: number) =>
    trackAccentsMid[index % trackAccentsMid.length];
  const currentTrack = tracks[activeTrack];
  const audioAvailable = Boolean(currentTrack?.src);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [waveformsInitialized, setWaveformsInitialized] = useState(false);

  useEffect(() => {
    if (activeTrack >= tracks.length) {
      setActiveTrack(0);
    }
  }, [activeTrack, tracks.length]);

  // Lazy load all waveforms when SoundLibrary section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !waveformsInitialized) {
          setWaveformsInitialized(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [waveformsInitialized]);

  // Load all waveforms when section becomes visible + set initial audio source
  useEffect(() => {
    if (!waveformsInitialized) return;
    Promise.all(tracks.map(tr => generateWaveform(tr.src))).then(data => {
      setWaveforms(data);
      setLoaded(true);
    });
  }, [tracks, waveformsInitialized]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Keep the native audio element synced with the selected track so metadata
  // loads before playback and ARIA range values have a real maximum.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioAvailable) return;

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    audio.pause();
    audio.load();
    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      audio.play().then(() => setPlaying(true)).catch((err) => {
        console.warn('Audio play failed:', err);
      });
    }
  }, [activeTrack, audioAvailable, currentTrack?.src]);

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
      const accent = getTrackAccent(activeTrack);

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barGap);
        const peak = peaks[i];
        const barH = Math.max(2, peak * (h * 0.42));

        if (i <= progressIdx) {
          const gradient = ctx.createLinearGradient(x, centerY - barH, x, centerY + barH);
          gradient.addColorStop(0, accent);
          gradient.addColorStop(0.5, getTrackAccentMid(activeTrack));
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
        ctx.shadowColor = getTrackAccentMid(activeTrack);
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
    if (!audio || !tracks[index]?.src) return;

    if (activeTrack === index && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    if (activeTrack !== index) {
      pendingPlayRef.current = true;
      setActiveTrack(index);
      return;
    }

    audio.src = tracks[index].src;
    audio.preload = 'auto';
    audio.load();
    audio.play().then(() => {
      setPlaying(true);
    }).catch((err) => {
      console.warn('Audio play failed:', err);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioAvailable) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // If no source is loaded yet, load the current track first
      if (!audio.src || audio.src === window.location.href) {
        audio.src = tracks[activeTrack].src;
        audio.preload = 'auto';
        audio.load();
      }
      audio.play().then(() => setPlaying(true)).catch(() => {
        // Autoplay blocked - not much we can do, user needs to interact
      });
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

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const step = e.shiftKey ? 10 : 5;
    let nextTime = audioRef.current.currentTime;

    if (e.key === 'ArrowRight') nextTime += step;
    else if (e.key === 'ArrowLeft') nextTime -= step;
    else if (e.key === 'Home') nextTime = 0;
    else if (e.key === 'End') nextTime = duration;
    else return;

    e.preventDefault();
    const boundedTime = Math.max(0, Math.min(duration, nextTime));
    audioRef.current.currentTime = boundedTime;
    setCurrentTime(boundedTime);
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={sectionRef}>
    <section id="soundlib" className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-blue" ref={ref}>
      <div className="absolute left-1/2 top-8 hidden -translate-x-1/2 sm:block" aria-hidden="true">
        <SignalPathDivider />
      </div>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('sl.title')}</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">{t('sl.subtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground font-medium">{t('sl.badge')}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-xs font-medium text-primary/80 backdrop-blur-sm">
              {t('sl.count')}
            </div>
          </div>
        </div>

        <div className="fade-in-up lg:flex gap-6 xl:gap-8" style={{ transitionDelay: '100ms' }}>
          {/* Track List — horizontal scroll on mobile, vertical sidebar on desktop */}
          <div className="lg:w-[300px] xl:w-[330px] flex-shrink-0 mb-4 lg:mb-0">
            {/* Mobile: horizontal scrollable track pills */}
            <div className="lg:hidden track-scroll flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== activeTrack) { setActiveTrack(i); setPlaying(false); setCurrentTime(0); } else { playTrack(i); } }}
                  aria-pressed={activeTrack === i}
                  aria-label={`${track.tag}: ${track.name}`}
                  className="flex-shrink-0 flex w-[10.25rem] items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-300"
                  style={{
                    background: activeTrack === i ? getTrackAccentFaded(i) : 'rgba(255,255,255,0.02)',
                    borderColor: activeTrack === i ? getTrackAccent(i) : 'rgba(42,42,42,0.6)',
                  }}
                >
                  {/* Playing indicator or number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                    style={{
                      background: activeTrack === i ? getTrackAccent(i) : 'rgba(255,255,255,0.04)',
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
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate" style={{ color: activeTrack === i ? getTrackAccent(i) : 'rgba(138,133,128,0.9)' }}>
                      {track.tag}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground/45">
                      {track.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {/* Desktop: vertical sidebar list */}
            <div className="sound-track-list hidden lg:block max-h-[36rem] overflow-y-auto bg-card/60 border border-[#2a2a2a]/60 rounded-2xl backdrop-blur-sm">
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== activeTrack) { setActiveTrack(i); setPlaying(false); setCurrentTime(0); } else { playTrack(i); } }}
                  aria-pressed={activeTrack === i}
                  aria-label={`${track.tag}: ${track.name}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 hover:bg-white/[0.03] group"
                  style={{
                    background: activeTrack === i ? getTrackAccentFaded(i) : undefined,
                    borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  {/* Track Number / Playing Indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: activeTrack === i ? getTrackAccent(i) : 'rgba(255,255,255,0.04)',
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
            <div className="relative amp-surface sound-player-surface bg-card/80 border border-[#2a2a2a]/80 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="absolute right-5 bottom-5 z-0 opacity-20" aria-hidden="true">
                <AmpStarMotif />
              </div>
              {/* Accent glow behind player */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[400px] h-[160px] pointer-events-none transition-colors duration-700"
                style={{ background: `radial-gradient(ellipse, ${getTrackAccentFaded(activeTrack)} 0%, transparent 70%)` }}
              />

              {/* Now Playing Header */}
              <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="inline-block w-2 h-2 rounded-full transition-colors duration-500" style={{ background: getTrackAccent(activeTrack) }} />
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{currentTrack.tag}</span>
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 font-mono text-[9px] text-muted-foreground/45">
                        {String(activeTrack + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate leading-tight">
                      {currentTrack.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1.5 truncate">
                      {currentTrack.gear}
                    </p>
                  </div>
                  <div className="hidden sm:flex min-w-[4.75rem] justify-end">
                    {playing ? (
                    <div className="flex items-end gap-[3px] h-8 sm:h-10 flex-shrink-0 mt-1 px-2">
                      {[0,1,2,3,4].map((b) => (
                        <div key={b} className="w-[3px] rounded-full transition-colors duration-500"
                          style={{ background: getTrackAccent(activeTrack), animation: `eqBar${b + 1} ${1.2 - b * 0.08}s ease-in-out infinite ${b * 0.1}s` }}
                        />
                      ))}
                    </div>
                    ) : (
                      <div className="sound-player-meter-idle mt-1" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Waveform Display */}
              <div className="relative px-4 sm:px-6">
                <div
                  ref={waveformContainerRef}
                  className={`relative w-full h-20 sm:h-24 lg:h-28 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer overflow-hidden transition-all duration-300 ${playing ? 'border-white/[0.08]' : ''}`}
                  onMouseDown={handleWaveformMouseDown}
                  onTouchStart={(e) => { isDragging.current = true; if (e.touches[0]) seekToPosition(e.touches[0] as unknown as MouseEvent); }}
                  onKeyDown={handleSeekKeyDown}
                  role="slider"
                  tabIndex={0}
                  aria-label={t('a11y.audio.seek')}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration || 0)}
                  aria-valuenow={Math.round(currentTime || 0)}
                  aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
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
                  className="audio-no-star-track relative w-full h-1 bg-white/[0.06] rounded-full mb-5 cursor-pointer group"
                  onMouseDown={(e) => {
                    dragTarget.current = 'progress';
                    isDragging.current = true;
                    seekToPosition(e);
                  }}
                >
                  <div className="absolute inset-0 h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%`, background: getTrackAccent(activeTrack) }}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    style={{ left: `calc(${progress}% - 6px)`, background: getTrackAccent(activeTrack), boxShadow: `0 0 8px ${getTrackAccentMid(activeTrack)}` }}
                  />
                </div>

                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
                  {/* Volume */}
                  <div className="hidden sm:flex items-center gap-2 justify-self-start">
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
                      aria-label={t('a11y.audio.volume')}
                    />
                  </div>

                  {/* Prev / Play / Next */}
                  <div className="flex items-center gap-2 sm:gap-3 justify-self-center">
                    <button
                      onClick={playPrev}
                      disabled={!audioAvailable}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] transition-all duration-200"
                      aria-label={t('a11y.audio.previous')}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={!audioAvailable}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                        playing
                          ? 'text-primary-foreground play-btn-pulse shadow-lg'
                          : 'text-primary-foreground hover:shadow-lg'
                      }`}
                      style={{
                        background: getTrackAccent(activeTrack),
                        boxShadow: playing ? `0 0 24px ${getTrackAccentMid(activeTrack)}` : undefined,
                      }}
                      aria-label={playing ? t('a11y.audio.pause') : t('a11y.audio.play')}
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
                      disabled={!audioAvailable}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] transition-all duration-200"
                      aria-label={t('a11y.audio.next')}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="hidden justify-self-end text-right sm:block">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/34">
                      {currentTrack.settings}
                    </p>
                  </div>
                </div>
              </div>

              {/* Track Description */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-5">
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 sm:px-4 py-3">
                  <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-1.5 sm:hidden" style={{ color: getTrackAccentMid(activeTrack) }}>
                    {audioAvailable ? currentTrack.settings : 'Ukážka sa pripravuje'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">
                    {audioAvailable ? currentTrack.desc : 'Ukážka sa pripravuje'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}

// ========== CONFIGURATOR ==========

function PurchasePathSection({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const steps = [
    {
      icon: Headphones,
      eyebrow: t('path.step1.eyebrow'),
      title: t('path.step1.title'),
      desc: t('path.step1.desc'),
    },
    {
      icon: Settings,
      eyebrow: t('path.step2.eyebrow'),
      title: t('path.step2.title'),
      desc: t('path.step2.desc'),
    },
    {
      icon: Mail,
      eyebrow: t('path.step3.eyebrow'),
      title: t('path.step3.title'),
      desc: t('path.step3.desc'),
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 section-amp-shell amp-tone-black" ref={ref}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.2fr] lg:items-end lg:gap-12">
          <div className="fade-in-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[2px] w-8 bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('path.section')}</span>
            </div>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {t('path.title')}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t('path.subtitle')}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => scrollTo('config')}
                className="rounded-xl bg-primary px-6 py-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/30"
              >
                {t('path.cta.config')}
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollTo('soundlib')}
                className="rounded-xl border-white/[0.08] bg-black/20 px-6 py-5 text-sm font-semibold text-foreground/78 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-foreground"
              >
                {t('path.cta.sound')}
                <Headphones className="ml-2 size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="fade-in-up amp-surface amp-icon-card amp-pattern-small rounded-2xl border border-[#2a2a2a]/65 bg-card/50 p-5 backdrop-blur-sm"
                style={{ transitionDelay: `${(index + 1) * 120}ms` }}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="size-5 text-primary" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/35">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                  {step.eyebrow}
                </p>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfiguratorSection({
  t,
  onInquiry,
}: {
  t: (k: string) => string;
  onInquiry: (inquiry: ConfigInquiry) => void;
}) {
  const ref = useScrollAnimation();
  const [color, setColor] = useState<string>('tiger');
  const [impedance, setImpedance] = useState<string>('8');
  const [fxLoop, setFxLoop] = useState(true);

  const colors = [
    { id: 'tiger', label: t('cfg.color.tiger'), swatch: 'swatch-tiger' },
    { id: 'black', label: t('cfg.color.black'), swatch: 'swatch-black' },
    { id: 'cream', label: t('cfg.color.cream'), swatch: 'swatch-cream' },
    { id: 'red', label: t('cfg.color.red'), swatch: 'swatch-red' },
    { id: 'blue', label: t('cfg.color.blue'), swatch: 'swatch-blue' },
  ];

  const previewClass = `config-preview-${color}`;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const sendConfiguration = () => {
    const selectedColor = colors.find((c) => c.id === color)?.label || color;
    onInquiry({
      subject: t('cfg.inquiry.subject'),
      message: [
        t('cfg.inquiry.intro'),
        '',
        `${t('cfg.summary.color')}: ${selectedColor}`,
        `${t('cfg.summary.impedance')}: ${impedance} Ohm`,
        `${t('cfg.summary.fxloop')}: ${fxLoop ? t('cfg.fxloop.on') : t('cfg.fxloop.off')}`,
        '',
        t('cfg.inquiry.details'),
      ].join('\n'),
      nonce: Date.now(),
    });
    requestAnimationFrame(() => scrollTo('contact'));
  };

  return (
    <section id="config" className={`relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-${color}`} ref={ref}>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('cfg.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('cfg.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls */}
          <div className="space-y-8 fade-in-up">
            {/* Color */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-[0.15em] mb-4">{t('cfg.color')}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
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
            <div className="amp-surface amp-icon-card amp-pattern-small bg-card/50 border border-[#2a2a2a]/60 rounded-2xl p-5 backdrop-blur-sm">
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
                  <img
                    src={color === 'red' ? '/aluplex/aluplex-red-front.jpg' : color === 'black' ? '/aluplex/aluplex-1.jpg' : color === 'cream' ? '/aluplex/aluplex-138.jpg' : color === 'blue' ? '/aluplex/DSC6790.jpg' : '/aluplex/aluplex-56.jpg'}
                    alt={`ALUPLEXamp — ${colors.find(c => c.id === color)?.label}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full max-w-sm mx-auto rounded-2xl opacity-90 object-cover aspect-[3/2] shadow-2xl shadow-black/30 transition-opacity duration-300"
                  />
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
                onClick={sendConfiguration}
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
    { label: t('gal.photo.serial'), src: '/aluplex/aluplex-1.jpg' },
    { label: t('gal.photo.redGrille'), src: '/aluplex/DSC6775.jpg' },
    { label: t('gal.photo.rearOpen'), src: '/aluplex/aluplex-back-naked.jpg' },
    { label: t('gal.photo.rearPanel'), src: '/aluplex/DSC6821.jpg' },
    { label: t('gal.photo.redAngle'), src: '/aluplex/DSC6827.jpg' },
    { label: t('gal.photo.cabinet'), src: '/aluplex/aluplex-56.jpg' },
    { label: t('gal.photo.frontRed'), src: '/aluplex/DSC6790.jpg' },
    { label: t('gal.photo.openTubes'), src: '/aluplex/aluplex-138.jpg' },
    { label: t('gal.photo.goldFront'), src: '/aluplex/aluplex-109.jpg' },
    { label: t('gal.photo.redFront'), src: '/aluplex/aluplex-123.jpg' },
  ];

  const prev = useCallback(() => {
    if (lightbox !== null) setLightbox(lightbox === 0 ? items.length - 1 : lightbox - 1);
  }, [items.length, lightbox]);

  const next = useCallback(() => {
    if (lightbox !== null) setLightbox(lightbox === items.length - 1 ? 0 : lightbox + 1);
  }, [items.length, lightbox]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, next, prev]);

  useEffect(() => {
    if (lightbox === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  return (
    <section id="gallery" className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-red" ref={ref}>
      <div className="absolute -left-24 top-1/3 hidden h-64 w-64 rotate-12 opacity-20 lg:block" aria-hidden="true">
        <div className="amp-perforation-field h-full" />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('gal.title')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('gal.subtitle')}</p>
        </div>

        {/* Gallery Grid - responsive masonry-like */}
        <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-fr gap-2 sm:gap-3 lg:gap-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`fade-in-up group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#2a2a2a]/40 cursor-pointer card-hover ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2 sm:aspect-square' : ''
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
              aria-label={`${t('a11y.gallery.open')}: ${item.label}`}
            >
              <img src={item.src} alt={item.label} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                <Maximize2 className="size-3 text-white" />
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.gallery.dialog')}
          >
            <div className="absolute top-0 left-0 right-0 z-[102] flex items-center justify-between p-4 sm:p-6">
              <button
                className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors border border-white/10"
                onClick={() => setLightbox(null)}
                aria-label={t('a11y.gallery.close')}
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
              aria-label={t('a11y.gallery.previous')}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[101] p-2.5 sm:p-3 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors border border-white/10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label={t('a11y.gallery.next')}
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="relative w-[95vw] sm:w-[85vw] max-w-5xl aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={items[lightbox].src} alt={items[lightbox].label} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
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
  const patternClasses = ['amp-pattern-micro', 'amp-pattern-small', 'amp-pattern-medium', 'amp-pattern-large', 'amp-pattern-wide'];

  return (
    <section id="faq" className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-cream" ref={ref}>
      <TubeGlyphCluster className="absolute left-[8%] top-16 hidden opacity-30 lg:flex" />
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('faq.title')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('faq.subtitle')}</p>
        </div>

        <div className="fade-in-up" style={{ transitionDelay: '100ms' }}>
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className={`amp-surface amp-icon-card ${patternClasses[i % patternClasses.length]} bg-card/50 border border-[#2a2a2a]/60 rounded-2xl px-3 sm:px-5 lg:px-6 data-[state=open]:border-primary/20 data-[state=open]:bg-card/80 transition-all duration-300 backdrop-blur-sm`}
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

function CTASection({
  t,
  contactSettings,
}: {
  t: (k: string) => string;
  contactSettings: ContactSettings;
}) {
  const ref = useScrollAnimation();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden section-amp-shell amp-tone-tiger" ref={ref}>
      {/* Background ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,184,0,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="fade-in-up">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-primary/40" />
            <Flame className="size-4 text-primary/60" />
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t('cta.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            {t('cta.subtitle')}
          </p>
        </div>

        <div className="fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6" style={{ transitionDelay: '150ms' }}>
          <Button
            size="lg"
            onClick={() => scrollTo('contact')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 sm:px-10 py-5 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] group"
          >
            {t('cta.contact')}
            <ArrowRight className="size-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <a
            href={`mailto:${contactSettings.publicEmail}`}
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-5 text-base font-semibold rounded-xl border border-white/[0.08] text-foreground/80 hover:bg-white/[0.06] hover:text-foreground hover:border-white/15 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Mail className="size-4" />
            {t('cta.order')}
          </a>
        </div>
      </div>
    </section>
  );
}

// ========== CONTACT FORM ==========

function ContactSection({
  lang,
  t,
  configInquiry,
  contactSettings,
}: {
  lang: Language;
  t: (k: string) => string;
  configInquiry: ConfigInquiry | null;
  contactSettings: ContactSettings;
}) {
  const ref = useScrollAnimation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (!configInquiry) return;
    const timer = window.setTimeout(() => {
      setStatus('idle');
      setErrors({});
      setFormData((prev) => ({
        ...prev,
        subject: configInquiry.subject,
        message: configInquiry.message,
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [configInquiry]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = t('form.required');
    if (!formData.email.trim()) errs.email = t('form.required');
    else if (!emailRegex.test(formData.email)) errs.email = t('form.email.invalid');
    if (!formData.message.trim()) errs.message = t('form.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    // Honeypot check
    const form = e.currentTarget;
    const honeypot = new FormData(form).get('cf-website');
    if (typeof honeypot === 'string' && honeypot.trim()) {
      setStatus('success');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, lang, 'cf-website': honeypot }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 section-amp-shell amp-tone-blue" ref={ref}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{t('nav.contact')}</span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t('form.title')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">{t('form.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="fade-in-up relative" style={{ transitionDelay: '100ms' }}>
          {/* Ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,146,42,0.04)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative bg-card/60 border border-[#2a2a2a]/80 rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
            {/* Success state */}
            {status === 'success' ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-6">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-foreground font-medium text-base sm:text-lg mb-4">{t('form.success')}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4 decoration-primary/30"
                >
                  {t('form.submit')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
                {/* Honeypot — hidden from real users */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="cf-website">Website</label>
                  <input id="cf-website" name="cf-website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="cf-name" className="block text-[11px] font-bold text-foreground/60 uppercase tracking-[0.15em] mb-2">
                      {t('form.name')} *
                    </label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t('form.name.placeholder')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'cf-name-error' : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                        errors.name ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/[0.07] focus:border-primary/40'
                      }`}
                    />
                    {errors.name && <p id="cf-name-error" className="text-[11px] text-red-400/80 mt-1.5" role="alert">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="cf-email" className="block text-[11px] font-bold text-foreground/60 uppercase tracking-[0.15em] mb-2">
                      {t('form.email')} *
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t('form.email.placeholder')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'cf-email-error' : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                        errors.email ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/[0.07] focus:border-primary/40'
                      }`}
                    />
                    {errors.email && <p id="cf-email-error" className="text-[11px] text-red-400/80 mt-1.5" role="alert">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="cf-subject" className="block text-[11px] font-bold text-foreground/60 uppercase tracking-[0.15em] mb-2">
                    {t('form.subject')}
                  </label>
                  <input
                    id="cf-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder={t('form.subject.placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="cf-message" className="block text-[11px] font-bold text-foreground/60 uppercase tracking-[0.15em] mb-2">
                    {t('form.message')} *
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder={t('form.message.placeholder')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'cf-message-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 resize-none focus:ring-2 focus:ring-primary/20 ${
                      errors.message ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/[0.07] focus:border-primary/40'
                    }`}
                  />
                  {errors.message && <p id="cf-message-error" className="text-[11px] text-red-400/80 mt-1.5" role="alert">{errors.message}</p>}
                </div>

                {/* Error message */}
                {status === 'error' && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.06] border border-red-500/15" role="alert">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-400/90">{t('form.error')}</p>
                  </div>
                )}

                {/* Privacy note */}
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/30 leading-relaxed">
                  {t('form.privacy')}{' '}
                  <Link href="/privacy" className="text-primary/70 hover:text-primary underline underline-offset-4">
                    {t('form.privacy.link')}
                  </Link>
                </p>

                {/* Submit */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {status === 'sending' && t('form.sending')}
                  {status === 'error' && t('form.error')}
                </div>
                <Button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 sm:py-5 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('form.sending')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {t('form.submit')}
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Alternative contact methods */}
        <div className="fade-in-up mt-8 text-center" style={{ transitionDelay: '200ms' }}>
          <p className="text-xs text-muted-foreground/40 mb-4">{t('footer.contact.title')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <a
              href={`mailto:${contactSettings.publicEmail}`}
              className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-primary transition-colors duration-200"
            >
              <Mail className="size-3.5" />
              {contactSettings.publicEmail}
            </a>
            {contactSettings.phone ? (
              <a
                href={getPhoneHref(contactSettings.phone)}
                className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <Phone className="size-3.5" />
                {contactSettings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER ==========

function Footer({
  lang,
  setLang,
  t,
  contactSettings,
}: {
  lang: Language;
  setLang: (l: Language) => void;
  t: (k: string) => string;
  contactSettings: ContactSettings;
}) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFooterClick = (event: React.MouseEvent<HTMLElement>) => {
    if (event.detail !== 3) return;

    event.preventDefault();
    window.location.assign('/admin');
  };

  const langOptions: Language[] = ['sk', 'en', 'de'];

  const socialLinks = [
    { href: contactSettings.instagram, label: 'Instagram', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg> },
    { href: contactSettings.youtube, label: 'YouTube', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M22.5 6.4a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.4a2.8 2.8 0 00-2 2A29 29 0 001 11.8a29 29 0 00.5 5.4 2.8 2.8 0 002 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 002-2 29 29 0 00.5-5.4 29 29 0 00-.5-5.4z" /><path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="currentColor" stroke="none" /></svg> },
    { href: contactSettings.facebook, label: 'Facebook', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
  ];
  const currentYear = new Date().getFullYear();
  const hasSeparateOrderEmail =
    Boolean(contactSettings.formEmail) &&
    contactSettings.formEmail !== contactSettings.publicEmail;

  return (
    <footer className="mt-auto safe-bottom" onClick={handleFooterClick}>
      {/* Top accent divider */}
      <div className="footer-divider" />

      {/* Main footer content */}
      <div className="relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(255,184,0,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">

            {/* Column 1 — Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
                {t('footer.brand.desc')}
              </p>

              {/* Social links */}
              <div className="flex items-center gap-2.5 mb-5">
                {socialLinks.map((social) => {
                  const disabled = !social.href || social.href === '#';

                  return (
                    <a
                      key={social.label}
                      href={disabled ? '#' : social.href}
                      target={disabled ? undefined : '_blank'}
                      rel={disabled ? undefined : 'noopener noreferrer'}
                      aria-label={disabled ? `${social.label} profil sa pripravuje` : social.label}
                      aria-disabled={disabled}
                      onClick={(event) => {
                        if (disabled) event.preventDefault();
                      }}
                      className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center transition-all duration-300 ${
                        disabled
                          ? 'cursor-not-allowed text-muted-foreground/25'
                          : 'text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/20'
                      }`}
                    >
                      {social.svg}
                    </a>
                  );
                })}
              </div>

              {/* Made in Slovakia badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                  <svg viewBox="0 0 36 36" className="w-full h-full"><path d="M36 27a4 4 0 01-4 4H4a4 4 0 01-4-4V9a4 4 0 014-4h28a4 4 0 014 4z" fill="#0B4EA2"/><path d="M18 5v13" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M13 10h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><path d="M18 22c6 0 9 3 9 9H9c0-6 3-9 9-9z" fill="#fff" opacity="0.9"/><path d="M4 13h28v-4H4z" fill="#EE1C25"/><path d="M4 17h28v-4H4z" fill="#0B4EA2"/><path d="M4 21h28v-4H4z" fill="#fff"/></svg>
                </div>
                <span className="text-[11px] text-muted-foreground/50 font-medium tracking-wide">{t('footer.made')}</span>
              </div>
            </div>

            {/* Column 2 — Product */}
            <div>
              <h4 className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-primary/30" />
                {t('footer.product')}
              </h4>
              <ul className="space-y-3">
                {[
                  { id: 'soundlib', label: t('footer.product.sound') },
                  { id: 'specs', label: t('footer.product.specs') },
                  { id: 'config', label: t('footer.product.config') },
                  { id: 'gallery', label: t('footer.product.gallery') },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Support */}
            <div>
              <h4 className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-primary/30" />
                {t('footer.support')}
              </h4>
              <ul className="space-y-3">
                {[
                  { id: 'faq', label: t('footer.support.faq') },
                  { id: 'contact', label: t('footer.support.contact') },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${contactSettings.formEmail || contactSettings.publicEmail}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                    {t('footer.support.order')}
                  </a>
                </li>
                {contactSettings.phone ? (
                  <li>
                    <a
                      href={getPhoneHref(contactSettings.phone)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                      {contactSettings.phone}
                    </a>
                  </li>
                ) : null}
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-[1px] bg-primary/40 transition-all duration-300" />
                    {t('footer.cookies')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h4 className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-primary/30" />
                {t('footer.contact.title')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${contactSettings.publicEmail}`}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    <Mail className="size-3.5 text-primary/40 group-hover:text-primary/60 transition-colors mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-foreground/60 text-xs mb-0.5">{t('footer.contact.info')}</span>
                      {contactSettings.publicEmail}
                    </div>
                  </a>
                </li>
                {hasSeparateOrderEmail ? (
                  <li>
                    <a
                      href={`mailto:${contactSettings.formEmail}`}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                    >
                      <Mail className="size-3.5 text-primary/40 group-hover:text-primary/60 transition-colors mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-foreground/60 text-xs mb-0.5">{t('footer.contact.order')}</span>
                        {contactSettings.formEmail}
                      </div>
                    </a>
                  </li>
                ) : null}
                {contactSettings.phone ? (
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5 text-primary/40 mt-0.5 flex-shrink-0" />
                    <a
                      href={getPhoneHref(contactSettings.phone)}
                      className="transition-colors duration-200 hover:text-foreground"
                    >
                      {contactSettings.phone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 text-primary/40 mt-0.5 flex-shrink-0" />
                  <span>{t('footer.location')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <p className="text-[11px] text-muted-foreground/30">
              {t('footer.copyright').replace('2025', String(currentYear))}
            </p>

            {/* Center: Language switcher */}
            <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
              <Globe className="size-3 text-muted-foreground/30 ml-1.5 mr-1" />
              {langOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                    lang === l
                      ? 'bg-white/[0.06] text-foreground/70'
                      : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Right: Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30 hover:text-primary/60 transition-colors duration-300 group"
              aria-label="Back to top"
            >
              <span>{t('footer.back.top')}</span>
              <ArrowUp className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ========== SCROLL TO TOP ==========

function ScrollToTop({ t }: { t: (k: string) => string }) {
  const show = useShowScrollTop(500);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-40 hidden sm:flex w-11 h-11 rounded-xl bg-primary/90 backdrop-blur-sm text-primary-foreground items-center justify-center shadow-xl shadow-primary/20 hover:bg-primary transition-all duration-300 hover:scale-105 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label={t('footer.back.top')}
    >
      <ChevronUp className="size-5" />
    </button>
  );
}

// ========== SECTION DIVIDER ==========

function SectionDivider() {
  return <div className="section-divider" />;
}

// ========== COOKIE CONSENT ==========

function CookieConsent({ t }: { t: (k: string) => string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem('aluplex-cookies');
    if (!consent) {      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  const accept = () => {
    localStorage.setItem('aluplex-cookies', 'accepted');
    setVisible(false);
  };
  const reject = () => {
    localStorage.setItem('aluplex-cookies', 'rejected');
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[55] p-3 sm:p-4 animate-in slide-in-from-bottom" role="dialog" aria-label="Cookie consent">
      <div className="max-w-3xl mx-auto bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xl shadow-black/40">
        <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed flex-1">
          <Shield className="size-4 text-primary/50 inline-block mr-2 -mt-0.5" />
          {t('cookie.text')}{' '}
          <Link href="/cookies" className="text-primary/75 hover:text-primary underline underline-offset-4">
            {t('cookie.link')}
          </Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={reject} className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200">
            {t('cookie.reject')}
          </button>
          <button onClick={accept} className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20">
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN PAGE ==========

const CONTACT_EMAIL = 'info@aluplexamp.com';

const defaultMaintenance: MaintenanceSettings = {
  enabled: false,
  eyebrow: 'ALUPLEXamp',
  title: 'Stranku prave ladime.',
  message:
    'Pripravujeme aktualizaciu webu, aby sme mohli lepsie predstavit zosilnovac ALUPLEXamp, jeho zvuk a moznosti vyroby na objednavku.',
  secondaryMessage:
    `Ak nas potrebujes kontaktovat hned, napis na ${CONTACT_EMAIL}.`,
  imageUrl: '/aluplex/aluplex-1.jpg',
  imageAlt: 'ALUPLEXamp elektronkovy gitarovy zosilnovac',
  localized: {
    sk: {
      eyebrow: 'ALUPLEXamp',
      title: 'Stranku prave ladime.',
      message:
        'Pripravujeme aktualizaciu webu, aby sme mohli lepsie predstavit zosilnovac ALUPLEXamp, jeho zvuk a moznosti vyroby na objednavku.',
      secondaryMessage: `Ak nas potrebujes kontaktovat hned, napis na ${CONTACT_EMAIL}.`,
      imageAlt: 'ALUPLEXamp elektronkovy gitarovy zosilnovac',
    },
    en: {
      eyebrow: 'ALUPLEXamp',
      title: 'The website is being tuned.',
      message:
        'We are preparing an update that will present the ALUPLEXamp amplifier, its sound and made-to-order options with more precision.',
      secondaryMessage: `For direct contact, email us at ${CONTACT_EMAIL}.`,
      imageAlt: 'ALUPLEXamp tube guitar amplifier',
    },
    de: {
      eyebrow: 'ALUPLEXamp',
      title: 'Die Website wird gerade abgestimmt.',
      message:
        'Wir bereiten ein Update vor, das den ALUPLEXamp Verstaerker, seinen Klang und die Fertigung auf Bestellung praeziser praesentiert.',
      secondaryMessage: `Fuer direkten Kontakt schreiben Sie uns an ${CONTACT_EMAIL}.`,
      imageAlt: 'ALUPLEXamp Roehren-Gitarrenverstaerker',
    },
  },
};

function MaintenancePage({
  maintenance,
  lang,
  setLang,
  contactSettings,
}: {
  maintenance: MaintenanceSettings;
  lang: Language;
  setLang: (language: Language) => void;
  contactSettings: ContactSettings;
}) {
  const serviceSpecs = ['EL34 power stage', 'ECC83 preamp', '30 W class AB', 'Turret board'];
  const copy = maintenance.localized?.[lang] ?? maintenance.localized?.sk ?? maintenance;
  const ui = {
    sk: {
      badge: 'Servisne ladenie',
      primaryCta: 'Napisat spravu',
      secondaryCta: 'Kontakt e-mailom',
      statusTitle: 'Status signalu',
      statusText: 'Ladime obsah, zvuk stranky ostava na linke',
      updateLabel: 'Aktualizacia webu',
      updateValue: 'prebieha',
      inquiriesLabel: 'Objednavky a dopyty',
      inquiriesValue: 'e-mailom',
      contactLabel: 'Kontakt',
    },
    en: {
      badge: 'Service tuning',
      primaryCta: 'Send a message',
      secondaryCta: 'Email contact',
      statusTitle: 'Signal status',
      statusText: 'We are tuning the content while the signal stays open',
      updateLabel: 'Website update',
      updateValue: 'in progress',
      inquiriesLabel: 'Orders and inquiries',
      inquiriesValue: 'by email',
      contactLabel: 'Contact',
    },
    de: {
      badge: 'Service-Abstimmung',
      primaryCta: 'Nachricht senden',
      secondaryCta: 'Kontakt per E-Mail',
      statusTitle: 'Signalstatus',
      statusText: 'Wir stimmen den Inhalt ab, das Signal bleibt offen',
      updateLabel: 'Website-Update',
      updateValue: 'laeuft',
      inquiriesLabel: 'Bestellungen und Anfragen',
      inquiriesValue: 'per E-Mail',
      contactLabel: 'Kontakt',
    },
  }[lang];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] text-foreground section-amp-shell amp-tone-tiger">
      {maintenance.imageUrl ? (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src={maintenance.imageUrl}
            alt=""
            className="h-full w-full scale-105 object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/82 to-[#050505]/42" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/88 via-[#050505]/24 to-[#050505]/82" />
          <div className="absolute inset-0 hero-vignette" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[#070707]" aria-hidden="true" />
      )}
      <div className="amp-global-motif opacity-80" aria-hidden="true" />
      <div className="hero-grid-pattern absolute inset-0 z-0 opacity-[0.025]" aria-hidden="true" />
      <div className="amp-perforation-field absolute inset-y-0 right-0 z-0 w-1/2 opacity-[0.10]" aria-hidden="true" />
      <TubeGlyphCluster className="absolute right-[9%] top-28 z-0 hidden opacity-45 lg:flex" />
      <div className="pointer-events-none absolute -right-40 top-10 z-0 h-[520px] w-[520px] bg-[radial-gradient(circle,rgba(255,184,0,0.13)_0%,transparent_62%)]" />
      <div className="pointer-events-none absolute -bottom-44 -left-32 z-0 h-[460px] w-[460px] bg-[radial-gradient(circle,rgba(198,40,40,0.10)_0%,transparent_64%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <img
            src="/aluplex/real/logo-white.png"
            alt="ALUPLEXamp"
            className="h-9 w-auto sm:h-11"
          />
          <span className="amp-badge rounded-full border border-primary/35 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-[0_0_30px_rgba(255,184,0,0.08)] backdrop-blur sm:text-[11px]">
            {ui.badge}
          </span>
        </header>
        <div className="mt-4 flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-black/35 p-1 backdrop-blur">
            {(['sk', 'en', 'de'] as Language[]).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setLang(language)}
                className={`h-9 rounded-lg px-3 text-xs font-semibold uppercase transition ${
                  lang === language
                    ? 'bg-primary text-black'
                    : 'text-white/48 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <section className="grid flex-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.62fr)] lg:gap-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_16px_rgba(255,184,0,0.75)]" />
              {copy.eyebrow}
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.72)] sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <div className="mt-7 flex items-center gap-4 text-primary/85">
              <div className="h-px w-24 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
              <AmpStarMotif />
            </div>
            <p className="mt-7 max-w-2xl text-base font-light leading-8 text-white/78 sm:text-xl sm:leading-9">
              {copy.message}
            </p>
            {copy.secondaryMessage ? (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/54 sm:text-base sm:leading-8">
                {copy.secondaryMessage}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${contactSettings.publicEmail}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-black shadow-lg shadow-primary/20 transition hover:bg-[#ffcf4d]"
              >
                <Mail className="size-4" />
                {ui.primaryCta}
              </a>
              <a
                href={`mailto:${contactSettings.publicEmail}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-black/30 px-5 text-sm font-semibold text-white/78 backdrop-blur transition hover:border-primary/35 hover:text-white"
              >
                {ui.secondaryCta}
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          <aside className="amp-surface amp-pattern-wide relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/48 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6 lg:justify-self-end">
            <div className="absolute right-5 top-5 opacity-70" aria-hidden="true">
              <TubeGlyphCluster />
            </div>
            <div className="relative z-10 border-b border-white/[0.08] pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                {ui.statusTitle}
              </p>
              <p className="mt-2 max-w-xs text-2xl font-semibold leading-tight text-white">
                {ui.statusText}
              </p>
            </div>
            <div className="relative z-10 grid gap-4 py-5 text-sm text-white/62">
              <div className="flex items-center justify-between gap-6">
                <span>{ui.updateLabel}</span>
                <span className="font-semibold text-primary">{ui.updateValue}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>{ui.inquiriesLabel}</span>
                <span className="font-semibold text-white/80">{ui.inquiriesValue}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>{ui.contactLabel}</span>
                <a
                  href={`mailto:${contactSettings.publicEmail}`}
                  className="font-semibold text-primary transition hover:text-[#ffcf4d]"
                >
                  {contactSettings.publicEmail}
                </a>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-5">
              {serviceSpecs.map((spec) => (
                <span
                  key={spec}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/58"
                >
                  {spec}
                </span>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const { lang, setLang, t, site } = useTranslation();
  const [configInquiry, setConfigInquiry] = useState<ConfigInquiry | null>(null);
  const contactSettings = getContactSettings(site.contactSettings);
  const maintenance = {
    ...defaultMaintenance,
    ...site.maintenance,
    localized: {
      ...defaultMaintenance.localized,
      ...site.maintenance?.localized,
    },
  };

  if (maintenance.enabled) {
    return (
      <MaintenancePage
        maintenance={maintenance}
        lang={lang}
        setLang={setLang}
        contactSettings={contactSettings}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground grain-overlay">
      <div className="amp-global-motif" aria-hidden="true" />
      <ScrollProgressBar />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg">
        {t('accessibility.skip')}
      </a>
      <Navigation lang={lang} setLang={setLang} t={t} />
      <main id="main-content" className="flex-1">
        <HeroSection t={t} heroBackground={site.heroBackground} />
        <SectionDivider />
        <ValueProps t={t} />
        <SectionDivider />
        <EngineeringSection t={t} />
        <SectionDivider />
        <SoundArchitecture t={t} />
        <SectionDivider />
        <SoundLibrary t={t} audioLibrary={site.audioLibrary} />
        <SectionDivider />
        <PurchasePathSection t={t} />
        <SectionDivider />
        <ConfiguratorSection t={t} onInquiry={setConfigInquiry} />
        <SectionDivider />
        <GallerySection t={t} />
        <SectionDivider />
        <FAQSection t={t} />
        <SectionDivider />
        <CTASection t={t} contactSettings={contactSettings} />
        <SectionDivider />
        <ContactSection
          lang={lang}
          t={t}
          configInquiry={configInquiry}
          contactSettings={contactSettings}
        />
      </main>
      <Footer lang={lang} setLang={setLang} t={t} contactSettings={contactSettings} />
      <CookieConsent t={t} />
      <ScrollToTop t={t} />
    </div>
  );
}
