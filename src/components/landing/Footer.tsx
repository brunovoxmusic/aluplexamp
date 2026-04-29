'use client';

import { Sparkles, Globe, Mail, Rss } from 'lucide-react';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const socialLinks = [
  { icon: Globe, label: 'Website', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
  { icon: Rss, label: 'Blog', href: '#' },
];

export function Footer() {
  const handleNavClick = (href: string) => {
    if (href === '#') return;
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">flowd</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered productivity system that plans your day, prioritizes tasks, and builds
              habits — so you focus on what matters.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <s.icon className="size-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Flowd. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for productive people
          </p>
        </div>
      </div>
    </footer>
  );
}
