'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { translations, type Language } from '@/lib/translations';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Menu,
  Zap,
  Shield,
  Target,
  Music,
  Settings,
  ThermometerSun,
  Weight,
  Magnet,
  ShieldCheck,
  Mic2,
  Headphones,
  MessageCircle,
  Send,
  ChevronRight as ArrowRight,
  Star,
  Heart,
  Award,
  Wrench,
  Power,
  Palette,
  ToggleLeft,
  ToggleRight,
  Quote,
  Users,
  Trophy,
  Guitar,
  Disc3,
  ChevronUp as ChevronUpIcon,
  ImageOff,
} from 'lucide-react';

// ─── Language Context Hook ───────────────────────────
function useTranslation(lang: Language) {
  const t = useCallback(
    (key: string) => translations[lang]?.[key] || translations.en[key] || key,
    [lang]
  );
  return { t, lang };
}

// ─── useInView Hook (IntersectionObserver) ──────────
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// ─── Reveal wrapper component ────────────────────────
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Tube Glow SVG Component ─────────────────────────
function TubeGlow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="tubeGlow1" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#d4922a" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#d4922a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4922a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tubeGlow2" cx="50%" cy="60%" r="30%">
          <stop offset="0%" stopColor="#e8c080" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e8c080" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="90" rx="22" ry="35" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="50" cy="85" rx="14" ry="22" fill="url(#tubeGlow1)" className="tube-glow-slow" />
      <ellipse cx="50" cy="80" rx="8" ry="12" fill="url(#tubeGlow2)" className="tube-glow" />
      <rect x="42" y="65" width="16" height="30" rx="2" fill="none" stroke="#444" strokeWidth="1" opacity="0.4" />
      <ellipse cx="50" cy="110" rx="10" ry="6" fill="#333" opacity="0.5" />
      <rect x="44" y="122" width="12" height="14" rx="2" fill="#555" />
      <line x1="44" y1="136" x2="44" y2="140" stroke="#666" strokeWidth="1.5" />
      <line x1="50" y1="136" x2="50" y2="140" stroke="#666" strokeWidth="1.5" />
      <line x1="56" y1="136" x2="56" y2="140" stroke="#666" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Navigation Component ────────────────────────────
function Navigation({
  lang,
  setLang,
  t,
}: {
  lang: Language;
  setLang: (l: Language) => void;
  t: (k: string) => string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking with IntersectionObserver
  useEffect(() => {
    const sectionIds = ['soundlib', 'artists', 'specs', 'config', 'gallery', 'faq', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navItems = [
    { key: 'nav.soundlib', href: '#soundlib' },
    { key: 'nav.artists', href: '#artists' },
    { key: 'nav.specs', href: '#specs' },
    { key: 'nav.config', href: '#config' },
    { key: 'nav.gallery', href: '#gallery' },
    { key: 'nav.faq', href: '#faq' },
    { key: 'nav.contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.getElementById(href.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a] shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand with logo */}
          <a href="#" className="flex items-center gap-2.5">
            <img
              src="/aluplex/real/logo-white.png"
              alt="ALUPLEXamp logo"
              className="h-8 w-auto"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const sectionId = item.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`text-sm transition-colors duration-200 relative ${
                    isActive
                      ? 'text-[#d4922a]'
                      : 'text-muted-foreground hover:text-[#d4922a]'
                  }`}
                >
                  {t(item.key)}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d4922a] rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Language + Mobile Toggle - language hidden on mobile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              {(['sk', 'en', 'de'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                    lang === l
                      ? 'bg-[#d4922a] text-[#0a0a0a]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="md:hidden text-muted-foreground w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1e1e1e] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full-screen overlay with slide-in animation */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-[#2a2a2a] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-sm font-medium text-[#d4922a]">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1e1e1e] transition-colors text-muted-foreground"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const sectionId = item.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`block text-base font-medium py-3 px-4 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#d4922a] bg-[#d4922a0d]'
                      : 'text-muted-foreground hover:text-[#d4922a] hover:bg-[#1e1e1e]'
                  }`}
                >
                  {t(item.key)}
                </a>
              );
            })}
          </div>

          {/* Language switcher in mobile menu */}
          <div className="px-6 py-4 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              {(['sk', 'en', 'de'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[44px] ${
                    lang === l
                      ? 'bg-[#d4922a] text-[#0a0a0a]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#1e1e1e]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────
function HeroSection({ t }: { t: (k: string) => string }) {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/amp-56.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
      </div>

      {/* Ambient glow - responsive */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[400px] bg-[#d4922a] opacity-[0.05] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-2xl">
          <div className="space-y-6 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4922a33] bg-[#d4922a0d]">
              <Zap className="w-3.5 h-3.5 text-[#d4922a]" />
              <span className="text-xs font-medium text-[#d4922a] tracking-wider uppercase">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gradient-amber">{t('hero.headline')}</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground/90">
              {t('hero.headlineAccent')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t('hero.subheadline')}
            </p>

            {/* Vadim teaser - max-w for mobile truncation */}
            <a
              href="#soundlib"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('soundlib')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4922a33] bg-[#d4922a0d] hover:bg-[#d4922a1a] transition-all duration-300 group w-fit max-w-full"
            >
              <Guitar className="w-4 h-4 text-[#d4922a] shrink-0" />
              <span className="text-xs text-[#d4922a]/90 group-hover:text-[#d4922a] transition-colors truncate">
                {t('hero.vadim.teaser')}
              </span>
              <ArrowRight className="w-3 h-3 text-[#d4922a]/70 group-hover:text-[#d4922a] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </a>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#soundlib"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('soundlib')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#d4922a] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#e8a840] transition-all duration-200 shadow-lg shadow-[#d4922a]/20 pulse-warm active:scale-[0.98]"
              >
                <Headphones className="w-5 h-5" />
                {t('hero.cta.demos')}
              </a>
              <a
                href="#config"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('config')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#d4922a44] text-[#d4922a] font-semibold rounded-lg hover:bg-[#d4922a11] transition-all duration-200 active:scale-[0.98]"
              >
                <Settings className="w-5 h-5" />
                {t('hero.cta.config')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - only bouncing chevron, no SCROLL text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50 animate-bounce z-10">
        <ChevronDown className="w-5 h-5 text-white/60" />
      </div>
    </section>
  );
}

// ─── Value Proposition Section ───────────────────────
function ValuePropSection({ t }: { t: (k: string) => string }) {
  const items = [
    { icon: Heart, titleKey: 'vp.handmade.title', descKey: 'vp.handmade.desc' },
    { icon: Target, titleKey: 'vp.turret.title', descKey: 'vp.turret.desc' },
    { icon: Shield, titleKey: 'vp.components.title', descKey: 'vp.components.desc' },
    { icon: Music, titleKey: 'vp.tone.title', descKey: 'vp.tone.desc' },
  ];

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/dsc6798.jpg"
          alt=""
          className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-15"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a] to-[#0a0a0a]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('vp.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('vp.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Reveal key={item.titleKey} delay={i * 100}>
              <div className="h-full group p-6 rounded-xl bg-[#141414]/80 backdrop-blur-sm border border-[#2a2a2a] hover:border-[#d4922a33] transition-all duration-300 hover:shadow-lg hover:shadow-[#d4922a]/5">
                <div className="w-12 h-12 rounded-lg bg-[#d4922a11] flex items-center justify-center mb-4 group-hover:bg-[#d4922a22] transition-colors">
                  <item.icon className="w-6 h-6 text-[#d4922a]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Engineering Section ─────────────────────────────
function EngineeringSection({ t }: { t: (k: string) => string }) {
  const features = [
    { icon: ThermometerSun, titleKey: 'eng.heat.title', descKey: 'eng.heat.desc' },
    { icon: Weight, titleKey: 'eng.weight.title', descKey: 'eng.weight.desc' },
    { icon: Magnet, titleKey: 'eng.magnetic.title', descKey: 'eng.magnetic.desc' },
    { icon: ShieldCheck, titleKey: 'eng.corrosion.title', descKey: 'eng.corrosion.desc' },
  ];

  return (
    <section id="specs" className="relative py-12 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/dsc6775.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/95 via-[#0a0a0a]/90 to-[#0a0a0a]/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - order-2 on mobile, order-1 on lg */}
          <div className="order-2 lg:order-1 space-y-8">
            <Reveal>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('eng.title')}</h2>
                <p className="text-muted-foreground">{t('eng.subtitle')}</p>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <Reveal key={feature.titleKey} delay={i * 80}>
                  <div className="p-4 rounded-lg bg-[#141414]/80 backdrop-blur-sm border border-[#2a2a2a] hover:border-[#d4922a22] transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-[#d4922a] mb-2" />
                    <h3 className="text-sm font-semibold mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Detail photos - order-1 on mobile, order-2 on lg */}
          <div className="order-1 lg:order-2 space-y-6">
            <Reveal>
              <div className="rounded-2xl overflow-hidden relative group">
                <img
                  src="/aluplex/real/dsc6792.jpg"
                  alt="ALUPLEXamp boutique hand wired switches"
                  className="w-full aspect-[16/10] sm:aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-medium text-[#d4922a] bg-[#0a0a0a]/80 px-3 py-1 rounded-full backdrop-blur-sm">{t('eng.handwired')}</span>
                </div>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Reveal delay={100}>
                <div className="rounded-xl overflow-hidden relative group">
                  <img
                    src="/aluplex/real/dsc6803.jpg"
                    alt="ALUPLEXamp rear panel effects loop"
                    className="w-full aspect-square sm:aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-medium text-[#d4922a] bg-[#0a0a0a]/80 px-2.5 py-1 rounded-full backdrop-blur-sm">{t('eng.fxloop')}</span>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="rounded-xl overflow-hidden flex items-center justify-center bg-[#141414] border border-[#2a2a2a] aspect-square">
                  <div className="text-center p-4">
                    <div className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-1">12.5</div>
                    <div className="text-sm text-muted-foreground">kg</div>
                    <div className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">{t('eng.aluminium')}</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sound Architecture Section ──────────────────────
function SoundSection({ t }: { t: (k: string) => string }) {
  const specs = [
    { icon: Zap, titleKey: 'sound.class', valueKey: 'sound.class', descKey: 'sound.class.desc' },
    { icon: Power, titleKey: 'sound.power', valueKey: 'sound.power', descKey: 'sound.power.desc' },
    { icon: Mic2, titleKey: 'sound.preamp', valueKey: 'sound.preamp', descKey: 'sound.preamp.desc' },
    { icon: Volume2, titleKey: 'sound.poweramp', valueKey: 'sound.poweramp', descKey: 'sound.poweramp.desc' },
    { icon: Headphones, titleKey: 'sound.fxloop', valueKey: 'sound.fxloop', descKey: 'sound.fxloop.desc' },
    { icon: Settings, titleKey: 'sound.impedance', valueKey: 'sound.impedance', descKey: 'sound.impedance.desc' },
  ];

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/amp-1.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/93" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('sound.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('sound.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec, i) => (
            <Reveal key={spec.titleKey} delay={i * 80}>
              <div className="relative p-6 rounded-xl bg-[#141414]/80 backdrop-blur-sm border border-[#2a2a2a] hover:border-[#d4922a33] transition-all duration-300 group overflow-hidden hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4922a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4922a11] flex items-center justify-center shrink-0">
                    <spec.icon className="w-5 h-5 text-[#d4922a]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient-amber mb-1">{t(spec.valueKey)}</div>
                    <h3 className="text-sm font-semibold mb-2">{t(spec.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(spec.descKey)}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Tube visual - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex justify-center gap-8 mt-16 opacity-60">
          {[0, 1, 2, 3, 4].map((i) => (
            <TubeGlow key={i} className={`w-10 h-14 ${i >= 3 ? 'scale-110' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Expert Section ──────────────────────────────────
function ExpertSection({ t }: { t: (k: string) => string }) {
  const topics = [
    { icon: Zap, titleKey: 'expert.dynamics.title', descKey: 'expert.dynamics.desc' },
    { icon: Volume2, titleKey: 'expert.volume.title', descKey: 'expert.volume.desc' },
    { icon: MessageCircle, titleKey: 'expert.interaction.title', descKey: 'expert.interaction.desc' },
  ];

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-[#0d0d0d]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Profile Card with side image */}
          <div className="lg:col-span-2 space-y-6">
            <Reveal>
              <div className="rounded-2xl overflow-hidden relative group">
                <img
                  src="/aluplex/real/dsc6827.jpg"
                  alt="ALUPLEXamp three-quarter view"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4922a] to-transparent" />
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full bg-[#1e1e1e] border-2 border-[#d4922a44] mb-4 overflow-hidden">
                  <img
                    src="/aluplex/real/vadim.jpg"
                    alt="Vadim Bušovský"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4922a11] border border-[#d4922a33] mb-3">
                  <Star className="w-3 h-3 text-[#d4922a]" />
                  <span className="text-xs text-[#d4922a] font-medium">{t('expert.badge')}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{t('expert.name')}</h3>
                <p className="text-sm text-[#d4922a] mb-4">{t('expert.role')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('expert.intro')}</p>
              </div>
            </Reveal>
          </div>

          {/* Topics */}
          <div className="lg:col-span-3 space-y-6">
            {topics.map((topic, i) => (
              <Reveal key={topic.titleKey} delay={i * 120}>
                <div className="p-6 rounded-xl bg-[#141414] border border-[#2a2a2a] hover:border-[#d4922a22] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#d4922a11] flex items-center justify-center shrink-0 mt-0.5">
                      <topic.icon className="w-5 h-5 text-[#d4922a]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t(topic.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(topic.descKey)}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sound Library Section ───────────────────────────
function SoundLibrarySection({ t }: { t: (k: string) => string }) {
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tracks = [
    {
      nameKey: 'soundlib.track1.name',
      gearKey: 'soundlib.track1.gear',
      descKey: 'soundlib.track1.desc',
      settingsKey: 'soundlib.track1.settings',
      insightKey: 'soundlib.track1.insight',
      duration: 45,
      color: '#3a9a5c',
    },
    {
      nameKey: 'soundlib.track2.name',
      gearKey: 'soundlib.track2.gear',
      descKey: 'soundlib.track2.desc',
      settingsKey: 'soundlib.track2.settings',
      insightKey: 'soundlib.track2.insight',
      duration: 52,
      color: '#d4922a',
    },
    {
      nameKey: 'soundlib.track3.name',
      gearKey: 'soundlib.track3.gear',
      descKey: 'soundlib.track3.desc',
      settingsKey: 'soundlib.track3.settings',
      insightKey: 'soundlib.track3.insight',
      duration: 38,
      color: '#c62828',
    },
  ];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / (tracks[activeTrack].duration * 20);
        });
      }, 50);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeTrack]);

  const handleTrackChange = (index: number) => {
    setActiveTrack(index);
    setProgress(0);
    setIsPlaying(false);
  };

  const formatTime = (progress: number, duration: number) => {
    const current = Math.floor((progress / 100) * duration);
    const mins = Math.floor(current / 60);
    const secs = current % 60;
    const totalMins = Math.floor(duration / 60);
    const totalSecs = duration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} / ${totalMins}:${totalSecs.toString().padStart(2, '0')}`;
  };

  const track = tracks[activeTrack];

  return (
    <section id="soundlib" className="relative py-12 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('soundlib.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('soundlib.subtitle')}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#d4922a0d] border border-[#d4922a33]">
              <Disc3 className="w-4 h-4 text-[#d4922a]" />
              <span className="text-sm text-[#d4922a] font-medium">{t('soundlib.recorded')}</span>
            </div>
          </div>
        </Reveal>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
            {/* Player */}
            <div className="rounded-2xl bg-[#141414] border border-[#2a2a2a] overflow-hidden">
              {/* Now Playing */}
              <div className="p-4 sm:p-6 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${track.color}22` }}>
                    <Music className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: track.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate">{t(track.nameKey)}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t(track.gearKey)}</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <button
                    onClick={() => handleTrackChange(activeTrack > 0 ? activeTrack - 1 : tracks.length - 1)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Previous track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-[#d4922a] text-[#0a0a0a] flex items-center justify-center hover:bg-[#e8a840] transition-colors pulse-warm active:scale-[0.95]"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => handleTrackChange(activeTrack < tracks.length - 1 ? activeTrack + 1 : 0)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Next track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <div className="flex-1" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(progress, track.duration)}
                  </span>
                </div>

                {/* Progress bar - h-2 for better touch target */}
                <div
                  className="relative w-full h-2 bg-[#2a2a2a] rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    setProgress(Math.max(0, Math.min(100, x * 100)));
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
                    style={{ width: `${progress}%`, backgroundColor: track.color }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-100"
                    style={{ left: `${progress}%`, backgroundColor: track.color, marginLeft: '-8px' }}
                  />
                </div>

                {/* Track Description */}
                <div className="mt-6 p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                  <p className="text-sm text-muted-foreground mb-2">{t(track.descKey)}</p>
                  <p className="text-xs font-mono text-[#d4922a] mb-3">{t(track.settingsKey)}</p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[#d4922a0d] border border-[#d4922a22]">
                    <Award className="w-4 h-4 text-[#d4922a] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-[#d4922a] leading-relaxed italic">
                      <span className="font-semibold not-italic">Vadim Bušovský: </span>
                      {t(track.insightKey)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Track List - p-5 for better touch targets */}
              <div className="border-t border-[#2a2a2a]">
                {tracks.map((tr, i) => (
                  <button
                    key={i}
                    onClick={() => handleTrackChange(i)}
                    className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-200 ${
                      i === activeTrack ? 'bg-[#d4922a0d]' : 'hover:bg-[#1e1e1e]'
                    } ${i > 0 ? 'border-t border-[#2a2a2a]' : ''}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: i === activeTrack ? tr.color : '#333' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${i === activeTrack ? 'text-[#d4922a]' : 'text-foreground'}`}>
                        {t(tr.nameKey)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{t(tr.gearKey)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(tr.duration / 60)}:{(tr.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Decorative Vadim photo */}
            <div className="hidden lg:block rounded-2xl overflow-hidden border border-[#2a2a2a] sticky top-24 relative">
              <img
                src="/aluplex/real/vadim.jpg"
                alt="Vadim Bušovský playing guitar"
                className="w-full aspect-[3/4] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2">
                  <Guitar className="w-4 h-4 text-[#d4922a]" />
                  <span className="text-xs font-medium text-white/90">Vadim Bušovský</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Artists / Testimonial Section ─────────────────
function ArtistsSection({ t }: { t: (k: string) => string }) {
  return (
    <section id="artists" className="relative py-12 sm:py-20 lg:py-28 bg-[#0d0d0d] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/dsc6790.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/92" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('artist.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('artist.subtitle')}</p>
          </div>
        </Reveal>

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="rounded-2xl bg-[#141414]/90 backdrop-blur-sm border border-[#2a2a2a] overflow-hidden relative">
              <div className="h-1 bg-gradient-to-r from-transparent via-[#d4922a] to-transparent" />
              <div className="p-6 sm:p-10">
                <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-start">
                  {/* Left: Profile visual */}
                  <div className="flex flex-col items-center sm:items-start gap-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-36 rounded-full bg-[#1a1a1a] border-2 border-[#d4922a44] relative overflow-hidden">
                      <img
                        src="/aluplex/real/vadim.jpg"
                        alt="Vadim Bušovský"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4922a11] border border-[#d4922a33] mb-2">
                        <Star className="w-3 h-3 text-[#d4922a]" />
                        <span className="text-xs text-[#d4922a] font-medium">{t('artist.badge')}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{t('expert.name')}</h3>
                      <p className="text-sm text-[#d4922a] font-medium">{t('expert.role')}</p>
                    </div>
                  </div>

                  {/* Right: Bio + Credits + Quote */}
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#2a2a2a] text-xs text-muted-foreground">
                        <Music className="w-3 h-3 text-[#d4922a]" />
                        {t('artist.vadim.band1')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#2a2a2a] text-xs text-muted-foreground">
                        <Music className="w-3 h-3 text-[#d4922a]" />
                        {t('artist.vadim.band2')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4922a11] border border-[#d4922a33] text-xs text-[#d4922a] font-medium">
                        <Trophy className="w-3 h-3" />
                        {t('artist.vadim.award')}
                      </span>
                    </div>

                    <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                      {t('artist.vadim.bio')}
                    </p>

                    <div className="relative p-5 rounded-xl bg-[#d4922a0a] border border-[#d4922a22]">
                      <Quote className="absolute -top-3 -left-1.5 w-7 h-7 text-[#d4922a] opacity-60" />
                      <p className="text-sm sm:text-[15px] text-[#d4922a]/90 leading-relaxed italic pl-4">
                        „{t('artist.vadim.quote')}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4922a33]" />
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('artist.proof')}</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4922a33]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Configurator Section ────────────────────────────
function ConfiguratorSection({ t }: { t: (k: string) => string }) {
  const [color, setColor] = useState('tiger');
  const [impedance, setImpedance] = useState('8');
  const [power, setPower] = useState('eu');
  const [fxLoop, setFxLoop] = useState(true);

  const colors = [
    { id: 'tiger', labelKey: 'config.color.tiger', gradient: 'linear-gradient(135deg, #b8860b, #daa520, #8b6914)' },
    { id: 'black', labelKey: 'config.color.black', gradient: 'linear-gradient(135deg, #1a1a1a, #333, #111)' },
    { id: 'cream', labelKey: 'config.color.cream', gradient: 'linear-gradient(135deg, #f5f0e1, #e8dcc8, #d4c8a8)' },
    { id: 'red', labelKey: 'config.color.red', gradient: 'linear-gradient(135deg, #8b1a1a, #c62828, #a01010)' },
  ];

  return (
    <section id="config" className="relative py-12 sm:py-20 lg:py-28 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('config.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('config.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Preview with real photo - order-2 on mobile, order-1 on lg */}
          <div className="order-2 lg:order-1 sticky top-24">
            <div className="rounded-2xl bg-[#141414] border border-[#2a2a2a] overflow-hidden">
              <div className="relative">
                <img
                  src="/aluplex/real/hero-front.jpg"
                  alt="ALUPLEXamp front view with glowing tubes"
                  className="w-full aspect-[3/4] object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 mix-blend-overlay opacity-20 transition-all duration-500"
                  style={{ background: colors.find((c) => c.id === color)?.gradient }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-gradient-amber font-bold text-2xl tracking-widest">ALUPLEX</div>
                  <div className="text-white/60 text-sm tracking-[0.3em]">AMPLIFICATION</div>
                  <div className="mt-2 text-sm text-white/80">
                    {t(`config.color.${color}`)} &middot; {impedance} Ohm &middot; {t(`config.power.${power}`)}
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 py-4 border-t border-[#2a2a2a] bg-[#0a0a0a]/50">
                {[0, 1, 2].map((i) => (
                  <TubeGlow key={i} className="w-6 h-8" />
                ))}
              </div>
            </div>
          </div>

          {/* Options - order-1 on mobile, order-2 on lg */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Color */}
            <Reveal>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-5 h-5 text-[#d4922a]" />
                  <h3 className="font-semibold">{t('config.color')}</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`relative rounded-xl aspect-square overflow-hidden border-2 transition-all duration-200 hover:scale-105 min-w-[44px] min-h-[44px] ${
                        color === c.id ? 'border-[#d4922a] shadow-lg shadow-[#d4922a]/20' : 'border-[#2a2a2a]'
                      }`}
                    >
                      <div className="absolute inset-0" style={{ background: c.gradient }} />
                      {color === c.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[#0a0a0a]/80 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#d4922a]" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t(`config.color.${color}`)}</p>
              </div>
            </Reveal>

            {/* Impedance */}
            <Reveal delay={50}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="w-5 h-5 text-[#d4922a]" />
                  <h3 className="font-semibold">{t('config.impedance')}</h3>
                </div>
                <div className="flex gap-3">
                  {['8', '16'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setImpedance(v)}
                      className={`flex-1 py-3 min-h-[44px] rounded-lg border text-sm font-medium transition-all duration-200 ${
                        impedance === v
                          ? 'border-[#d4922a] bg-[#d4922a11] text-[#d4922a]'
                          : 'border-[#2a2a2a] text-muted-foreground hover:border-[#d4922a33]'
                      }`}
                    >
                      {v} Ohm
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Power */}
            <Reveal delay={100}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Power className="w-5 h-5 text-[#d4922a]" />
                  <h3 className="font-semibold">{t('config.power')}</h3>
                </div>
                <div className="flex gap-3">
                  {['eu', 'uk', 'us'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPower(v)}
                      className={`flex-1 py-3 min-h-[44px] rounded-lg border text-sm font-medium transition-all duration-200 ${
                        power === v
                          ? 'border-[#d4922a] bg-[#d4922a11] text-[#d4922a]'
                          : 'border-[#2a2a2a] text-muted-foreground hover:border-[#d4922a33]'
                      }`}
                    >
                      {t(`config.power.${v}`)}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* FX Loop */}
            <Reveal delay={150}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="w-5 h-5 text-[#d4922a]" />
                  <h3 className="font-semibold">{t('config.fxloop')}</h3>
                </div>
                <button
                  onClick={() => setFxLoop(!fxLoop)}
                  className="flex items-center gap-3 w-full p-4 min-h-[44px] rounded-lg border border-[#2a2a2a] hover:border-[#d4922a33] transition-all duration-200"
                >
                  {fxLoop ? (
                    <ToggleRight className="w-8 h-8 text-[#d4922a]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className={fxLoop ? 'text-[#d4922a]' : 'text-muted-foreground'}>
                    {fxLoop ? t('config.fxloop.on') : t('config.fxloop.off')}
                  </span>
                </button>
              </div>
            </Reveal>

            {/* Summary - better visual separation */}
            <Reveal delay={200}>
              <div className="p-6 rounded-xl bg-[#141414] border-2 border-[#d4922a33] shadow-lg shadow-[#d4922a]/5">
                <h3 className="font-semibold mb-4 text-gradient-amber">{t('config.summary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#2a2a2a]">
                    <span className="text-muted-foreground">{t('config.color')}</span>
                    <span className="font-medium">{t(`config.color.${color}`)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2a2a]">
                    <span className="text-muted-foreground">{t('config.impedance')}</span>
                    <span className="font-medium">{impedance} Ohm</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2a2a]">
                    <span className="text-muted-foreground">{t('config.power')}</span>
                    <span className="font-medium">{t(`config.power.${power}`)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">{t('config.fxloop')}</span>
                    <span className="font-medium">{fxLoop ? t('config.fxloop.on') : t('config.fxloop.off')}</span>
                  </div>
                </div>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d4922a] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#e8a840] transition-all duration-200 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  {t('config.contact')}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Gallery Section ─────────────────────────────────
function GallerySection({ t }: { t: (k: string) => string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = [
    { src: '/aluplex/real/amp-56.jpg', alt: 'ALUPLEXamp on speaker cabinet', caption: 'ALUPLEXamp on Cabinet' },
    { src: '/aluplex/real/hero-front.jpg', alt: 'ALUPLEXamp front view with glowing tubes', caption: 'Front View – Glowing Tubes' },
    { src: '/aluplex/real/amp-1.jpg', alt: 'ALUPLEXamp control panel close-up', caption: 'Control Panel Detail' },
    { src: '/aluplex/real/amp-109.jpg', alt: 'ALUPLEXamp star-pattern front grille', caption: 'Star-Pattern Grille' },
    { src: '/aluplex/real/amp-123.jpg', alt: 'ALUPLEXamp red variant', caption: 'Red Variant' },
    { src: '/aluplex/real/dsc6775.jpg', alt: 'ALUPLEXamp control panel detail', caption: 'Control Panel Angled' },
    { src: '/aluplex/real/dsc6790.jpg', alt: 'ALUPLEXamp red full front view', caption: 'Red – Full Front' },
    { src: '/aluplex/real/dsc6792.jpg', alt: 'ALUPLEXamp boutique hand wired switches', caption: 'Boutique Hand Wired' },
    { src: '/aluplex/real/dsc6793.jpg', alt: 'ALUPLEXamp input jacks and controls', caption: 'Input Jacks & Controls' },
    { src: '/aluplex/real/dsc6798.jpg', alt: 'ALUPLEXamp top view with handle', caption: 'Top View' },
    { src: '/aluplex/real/dsc6803.jpg', alt: 'ALUPLEXamp rear panel effects loop', caption: 'Rear – FX Loop' },
    { src: '/aluplex/real/dsc6821.jpg', alt: 'ALUPLEXamp rear panel connections', caption: 'Rear Panel Connections' },
    { src: '/aluplex/real/dsc6827.jpg', alt: 'ALUPLEXamp three-quarter view', caption: 'Three-Quarter View' },
  ];

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    const newIndex =
      direction === 'next'
        ? (lightboxIndex + 1) % images.length
        : (lightboxIndex - 1 + images.length) % images.length;
    setLightboxIndex(newIndex);
  };

  // Keyboard support for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return (
    <section id="gallery" className="relative py-12 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('gallery.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('gallery.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className={`relative group rounded-xl overflow-hidden bg-[#141414] border border-[#2a2a2a] hover:border-[#d4922a33] transition-all duration-300 ${
                i === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium text-white">{img.caption}</p>
                </div>
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#141414] text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs">Image unavailable</span></div>';
                    }
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10 rounded-full hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Navigation buttons - larger touch targets */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10 rounded-full hover:bg-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10 rounded-full hover:bg-white/10"
            aria-label="Next image"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {/* Image container - no side padding on mobile */}
          <div className="flex-1 flex items-center justify-center w-full px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Bottom info: caption + counter */}
          <div className="pb-6 pt-4 px-4 text-center z-10">
            <p className="text-white/80 text-sm sm:text-base mb-2">{images[lightboxIndex].caption}</p>
            <p className="text-white/50 text-xs">{lightboxIndex + 1} / {images.length}</p>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === lightboxIndex ? 'bg-[#d4922a] w-6' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────
function FAQSection({ t }: { t: (k: string) => string }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqItems = Array.from({ length: 10 }, (_, i) => ({
    qKey: `faq.q${i + 1}`,
    aKey: `faq.a${i + 1}`,
  }));

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section id="faq" className="relative py-12 sm:py-20 lg:py-28 bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-amber mb-4">{t('faq.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('faq.subtitle')}</p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openItems.has(i);
            return (
              <Reveal key={i} delay={i * 50}>
                <div
                  className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'border-[#d4922a44] border-l-[3px] border-l-[#d4922a] bg-[#141414]'
                      : 'border-[#2a2a2a] hover:border-[#d4922a22] bg-transparent'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(i)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left transition-colors duration-200 hover:bg-[#141414]/50"
                  >
                    <span className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#d4922a] text-[#0a0a0a]' : 'bg-[#2a2a2a] text-muted-foreground'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`font-medium text-sm sm:text-base pr-4 flex-1 transition-colors ${
                      isOpen ? 'text-[#d4922a]' : 'text-foreground'
                    }`}>{t(item.qKey)}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#d4922a] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {/* Smooth accordion using grid-template-rows */}
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-14 sm:pl-16">
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(item.aKey)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────
function CTASection({ t }: { t: (k: string) => string }) {
  return (
    <section id="contact" className="relative py-12 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/aluplex/real/dsc6790.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/85" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#d4922a] opacity-[0.06] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="section-divider mb-10 sm:mb-20" />
        <Reveal>
          <h2 className="text-3xl sm:text-5xl font-bold text-gradient-amber mb-6">{t('cta.title')}</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto">{t('cta.subtitle')}</p>
        </Reveal>
        <Reveal delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@aluplexamp.com"
              className="sm:w-auto w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#d4922a] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#e8a840] transition-all duration-200 shadow-lg shadow-[#d4922a]/20 text-lg pulse-warm active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              {t('cta.contact')}
            </a>
            <a
              href="mailto:order@aluplexamp.com"
              className="sm:w-auto w-full inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#d4922a44] text-[#d4922a] font-semibold rounded-lg hover:bg-[#d4922a11] transition-all duration-200 text-lg active:scale-[0.98]"
            >
              <ArrowRight className="w-5 h-5" />
              {t('cta.order')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Scroll to Top Button ────────────────────────────
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#d4922a] text-[#0a0a0a] shadow-lg shadow-[#d4922a]/30 flex items-center justify-center transition-all duration-300 hover:bg-[#e8a840] active:scale-95 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-5 h-5" />
    </button>
  );
}

// ─── Footer ──────────────────────────────────────────
function Footer({ t }: { t: (k: string) => string }) {
  return (
    <footer className="relative border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
          <div className="flex items-center gap-3">
            <img
              src="/aluplex/real/logo-white.png"
              alt="ALUPLEXamp logo"
              className="h-7 w-auto"
            />
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="w-4 h-4" />
            <span>{t('footer.handmade')}</span>
          </div>

          <p className="text-xs text-muted-foreground">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page Component ─────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<Language>('sk');
  const { t } = useTranslation(lang);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navigation lang={lang} setLang={setLang} t={t} />
      <main className="flex-1">
        <HeroSection t={t} />
        <ValuePropSection t={t} />
        <EngineeringSection t={t} />
        <SoundSection t={t} />
        <ExpertSection t={t} />
        <ArtistsSection t={t} />
        <SoundLibrarySection t={t} />
        <ConfiguratorSection t={t} />
        <GallerySection t={t} />
        <FAQSection t={t} />
        <CTASection t={t} />
      </main>
      <Footer t={t} />
      <ScrollToTopButton />
    </div>
  );
}
