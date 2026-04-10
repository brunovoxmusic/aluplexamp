'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Target, Shield, Music, ThermometerSun, Weight, Magnet, ShieldCheck,
  Zap, Power, Mic2, Volume2, Headphones, Settings, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Menu, X, Play, Pause, Wrench,
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-active shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center"
          >
            <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-8 w-auto" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side: Language + Mobile toggle */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
              {langOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    lang === l
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Menu">
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#0a0a0a] border-[#2a2a2a]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-foreground flex items-center">
                    <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                {/* Mobile Language Switcher */}
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 mb-6 w-fit">
                  {langOptions.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        lang === l
                          ? 'bg-primary text-primary-foreground shadow-sm'
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
                      className="text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
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

// ========== HERO SECTION ==========

function HeroSection({ t }: { t: (k: string) => string }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Ambient glow behind content */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(ellipse_at_70%_40%,rgba(212,146,42,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse,rgba(212,146,42,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Text content */}
          <div className="order-2 lg:order-1">
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              {t('hero.badge')}
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-5 text-gradient-amber-shimmer leading-[1.1]">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg md:text-xl font-light text-muted-foreground mb-4 tracking-wide">
              {t('hero.subtitle')}
            </p>

            <p className="text-sm sm:text-base text-muted-foreground/80 max-w-lg mb-10 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                onClick={() => scrollTo('soundlib')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-lg shadow-lg shadow-primary/20"
              >
                {t('hero.cta.listen')}
                <ChevronDown className="size-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo('config')}
                className="border-[#2a2a2a] text-foreground hover:bg-white/5 hover:text-foreground px-8 py-6 text-base rounded-lg"
              >
                {t('hero.cta.configure')}
                <Settings className="size-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right — Product image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-[#2a2a2a]/50">
              <img
                src="/aluplex/aluplex-56.jpg"
                alt="ALUPLEXamp — British Roar Edition"
                className="w-full h-auto object-cover"
              />
              {/* Subtle vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/30 via-transparent to-[#0a0a0a]/10" />
              {/* Bottom amber glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </div>
            {/* Decorative floating accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bouncing scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce-chevron">
        <ChevronDown className="size-6 text-muted-foreground/40" />
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="fade-in-up bg-card border border-[#2a2a2a] rounded-xl p-5 sm:p-6 text-center card-hover"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <card.icon className="size-6 text-primary" />
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
    <section id="specs" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left */}
          <div className="fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('eng.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t('eng.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-card border border-[#2a2a2a] rounded-xl p-4 card-hover"
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <f.icon className="size-5 text-primary mb-3" />
                  <h4 className="text-sm font-semibold text-foreground mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative visual */}
          <div className="fade-in-up" style={{ transitionDelay: '200ms' }}>
            <div className="relative bg-card border border-[#2a2a2a] rounded-2xl p-8 sm:p-10 tube-glow">
              {/* Real chassis back image */}
              <div className="mb-8 rounded-xl overflow-hidden border border-[#2a2a2a] shadow-lg">
                <img src="/aluplex/aluplex-back-naked.jpg" alt="ALUPLEXamp chassis internals" className="w-full h-auto object-cover" />
              </div>

              {/* Weight display */}
              <div className="text-center mb-10">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('eng.weight.title')}</p>
                <div className="text-7xl sm:text-8xl font-bold text-gradient-amber leading-none">12.5</div>
                <p className="text-lg text-muted-foreground mt-2">{t('eng.weight.label')}</p>
              </div>

              {/* Voltage callout */}
              <div className="bg-secondary border border-[#2a2a2a] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Power className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{t('eng.voltage')}</span>
                </div>
              </div>

              {/* Chassis label */}
              <div className="text-center pt-4 border-t border-[#2a2a2a]">
                <p className="text-xs sm:text-sm font-mono text-muted-foreground/60 tracking-[0.3em] uppercase">
                  {t('eng.chassis')}
                </p>
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('sa.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('sa.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {specs.map((spec, i) => (
            <div
              key={i}
              className="fade-in-up bg-card border border-[#2a2a2a] rounded-xl p-5 sm:p-6 text-center card-hover"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <spec.icon className="size-6 text-primary mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-foreground font-medium">{spec.label}</p>
            </div>
          ))}
        </div>

        {/* EL34 + ECC83 Callout */}
        <div className="fade-in-up bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8" style={{ transitionDelay: '400ms' }}>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
            {t('sa.el34.title')}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {t('sa.el34.desc')}
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== SOUND LIBRARY ==========

interface TrackInfo {
  name: string;
  gear: string;
  settings: string;
  desc: string;
  color: string;
  trackClass: string;
}

function SoundLibrary({ t }: { t: (k: string) => string }) {
  const ref = useScrollAnimation();
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tracks: TrackInfo[] = [
    {
      name: t('sl.track1.name'),
      gear: t('sl.track1.gear'),
      settings: t('sl.track1.settings'),
      desc: t('sl.track1.desc'),
      color: '#3a9a5c',
      trackClass: 'track-green',
    },
    {
      name: t('sl.track2.name'),
      gear: t('sl.track2.gear'),
      settings: t('sl.track2.settings'),
      desc: t('sl.track2.desc'),
      color: '#d4922a',
      trackClass: 'track-amber',
    },
    {
      name: t('sl.track3.name'),
      gear: t('sl.track3.gear'),
      settings: t('sl.track3.settings'),
      desc: t('sl.track3.desc'),
      color: '#c62828',
      trackClass: 'track-red',
    },
    {
      name: t('sl.track4.name'),
      gear: t('sl.track4.gear'),
      settings: t('sl.track4.settings'),
      desc: t('sl.track4.desc'),
      color: '#7c3aed',
      trackClass: 'track-purple',
    },
    {
      name: t('sl.track5.name'),
      gear: t('sl.track5.gear'),
      settings: t('sl.track5.settings'),
      desc: t('sl.track5.desc'),
      color: '#0891b2',
      trackClass: 'track-cyan',
    },
  ];

  const togglePlay = (index: number) => {
    if (activeTrack === index && playing) {
      setPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setActiveTrack(index);
      setPlaying(true);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (pct: number) => {
    const totalSec = Math.floor((pct / 100) * 180);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <section id="soundlib" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('sl.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('sl.subtitle')}</p>
          <Badge className="px-4 py-1.5 bg-secondary border-[#2a2a2a] text-muted-foreground">
            {t('sl.badge')}
          </Badge>
        </div>

        <div className="space-y-3 max-w-4xl mx-auto">
          {tracks.map((track, i) => (
            <div
              key={i}
              className={`fade-in-up bg-card border border-[#2a2a2a] rounded-xl overflow-hidden card-hover ${track.trackClass}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Track Header */}
              <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => togglePlay(i)}
              >
                <div className="flex items-center gap-4">
                  {/* Play button */}
                  <button
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
                    style={{ backgroundColor: `${track.color}20` }}
                    aria-label={playing && activeTrack === i ? 'Pause' : 'Play'}
                  >
                    {playing && activeTrack === i ? (
                      <Pause className="size-4 sm:size-5" style={{ color: track.color }} />
                    ) : (
                      <Play className="size-4 sm:size-5 ml-0.5" style={{ color: track.color }} />
                    )}
                  </button>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">{track.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{track.gear}</p>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    {activeTrack === i ? formatTime(progress) : '3:00'}
                  </span>
                </div>

                {/* Progress bar */}
                {activeTrack === i && (
                  <div className="mt-3">
                    <div
                      className="w-full h-1 bg-[#2a2a2a] rounded-full cursor-pointer py-3 -my-3"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{ width: `${progress}%`, backgroundColor: track.color }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider">{t('sl.gear')}</span>
                    <p className="text-foreground mt-1">{track.gear}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider">{t('sl.settings')}</span>
                    <p className="text-foreground mt-1 font-mono">{track.settings}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">{track.desc}</p>
              </div>
            </div>
          ))}
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
    <section id="config" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('cfg.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('cfg.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls */}
          <div className="space-y-8 fade-in-up">
            {/* Color */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{t('cfg.color')}</h3>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                      color === c.id ? 'border-primary shadow-lg shadow-primary/10' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div className={`aspect-square ${c.swatch}`} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-[10px] sm:text-xs text-white/90 font-medium">{c.label}</span>
                    </div>
                    {color === c.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <svg className="size-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{t('cfg.impedance')}</h3>
              <div className="flex gap-3">
                {['8', '16'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setImpedance(val)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                      impedance === val
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-[#2a2a2a] text-muted-foreground hover:border-[#3a3a3a] hover:text-foreground'
                    }`}
                  >
                    {val} Ohm
                  </button>
                ))}
              </div>
            </div>

            {/* FX Loop */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t('cfg.fxloop')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fxLoop ? t('cfg.fxloop.on') : t('cfg.fxloop.off')}
                  </p>
                </div>
                <Switch checked={fxLoop} onCheckedChange={setFxLoop} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="fade-in-up" style={{ transitionDelay: '150ms' }}>
            <div className={`rounded-2xl p-8 sm:p-10 ${previewClass} min-h-[300px] flex flex-col justify-between`}>
              {/* Branding */}
              <div>
                <p className="text-xs text-muted-foreground/50 font-mono tracking-[0.4em] uppercase mb-2">
                  {t('cfg.preview.brand')}
                </p>
                <div className="w-16 h-[1px] bg-primary/30 mb-6" />
              </div>

              {/* Visual center */}
              <div className="flex-1 flex items-center justify-center my-8">
                <div className="text-center">
                  <img src="/aluplex/DSC6821.jpg" alt="ALUPLEXamp" className="w-48 sm:w-56 mx-auto mb-4 rounded-lg opacity-80 object-cover aspect-[3/2]" />
                  <p className="text-sm text-muted-foreground/50 font-mono">ALUPLEXamp</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#0a0a0a]/60 border border-[#2a2a2a] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t('cfg.summary')}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cfg.summary.color')}</span>
                    <span className="text-foreground font-medium">{colors.find(c => c.id === color)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cfg.summary.impedance')}</span>
                    <span className="text-foreground font-medium">{impedance} Ohm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cfg.summary.fxloop')}</span>
                    <span className="text-foreground font-medium">{fxLoop ? t('cfg.fxloop.on') : t('cfg.fxloop.off')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => scrollTo('contact')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5 text-base font-semibold rounded-lg"
              >
                {t('cfg.cta')}
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
    { label: t('gal.front'), src: '/aluplex/DSC6775.jpg' },
    { label: t('gal.control'), src: '/aluplex/DSC6790.jpg' },
    { label: t('gal.turret'), src: '/aluplex/DSC6792.jpg' },
    { label: t('gal.rear'), src: '/aluplex/DSC6793.jpg' },
    { label: t('gal.detail'), src: '/aluplex/DSC6798.jpg' },
    { label: t('gal.quarter'), src: '/aluplex/DSC6803.jpg' },
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
    <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('gal.title')}</h2>
          <p className="text-muted-foreground">{t('gal.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`fade-in-up group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#2a2a2a] cursor-pointer card-hover`}
              style={{ transitionDelay: `${i * 80}ms` }}
              aria-label={item.label}
            >
              {/* Real image */}
              <img src={item.src} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {/* Hover overlay with label */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/90 font-medium">{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <button
              className="absolute top-4 right-4 z-[101] p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="size-6" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[101] p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[101] p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              <ChevronRight className="size-6" />
            </button>
            <div
              className="relative w-[90vw] max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden border border-[#2a2a2a]"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={items[lightbox].src} alt={items[lightbox].label} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            {/* Counter */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/50">
              {lightbox + 1} / {items.length}
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
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('faq.title')}</h2>
          <p className="text-muted-foreground">{t('faq.subtitle')}</p>
        </div>

        <div className="fade-in-up" style={{ transitionDelay: '100ms' }}>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-[#2a2a2a] rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-foreground hover:text-primary hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {faq.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pl-10">
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
    <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className="fade-in-up relative rounded-2xl overflow-hidden border border-primary/20 p-8 sm:p-12 text-center">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,146,42,0.08)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t('cta.subtitle')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:info@aluplexamp.com">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 text-base font-semibold rounded-lg shadow-lg shadow-primary/20">
                  {t('cta.contact')}
                </Button>
              </a>
              <a href="mailto:order@aluplexamp.com">
                <Button variant="outline" className="border-[#2a2a2a] text-foreground hover:bg-white/5 hover:text-foreground px-8 py-5 text-base rounded-lg">
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
    <footer className="border-t border-[#2a2a2a] py-10 px-4 sm:px-6 lg:px-8 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/aluplex/logo.png" alt="ALUPLEXamp" className="h-7 w-auto" />
          </div>

          <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>

          {/* Handwired */}
          <div className="flex items-center gap-2 text-muted-foreground/60 text-xs">
            <Wrench className="size-3" />
            <span>{t('footer.handwired')}</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/40 mt-2">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

// ========== SCROLL TO TOP ==========

function ScrollToTop() {
  const show = useShowScrollTop(500);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105"
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
