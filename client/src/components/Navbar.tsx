import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { Profile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

interface NavbarProps {
  profile: Profile | null;
}


export default function Navbar({ profile }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();

  const navLinks = [
    { labelKey: 'nav.about', href: '#about' },
    { labelKey: 'nav.projects', href: '#projects' },
    { labelKey: 'nav.experience', href: '#experience' },
    { labelKey: 'nav.contact', href: '#contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const observers: IntersectionObserver[] = [];
    const visibleMap: Record<string, boolean> = {};

    const update = () => {
      const active = ids.find((id) => visibleMap[id]) ?? '';
      setActiveSection(active);
    };

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.isIntersecting;
          update();
        },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg-primary/90 backdrop-blur-md border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-[10%] h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center hover:opacity-80 transition-opacity duration-300"
        >
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt={profile.name} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-syne text-lg text-text-primary" style={{ fontWeight: 700 }}>
              {profile?.name?.split(' ')[0] ?? 'Abdourahmane'}
              <span className="text-gold italic font-normal"> Touré</span>
            </span>
          )}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`font-grotesk text-sm transition-colors duration-300 tracking-wide relative group ${
                  isActive ? 'text-gold' : 'text-text-secondary hover:text-gold'
                }`}
              >
                {t(link.labelKey)}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </a>
            );
          })}
          <a
            href={profile ? `/api/cv/${lang}` : '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm py-2 px-4"
          >
            Resume
          </a>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="text-xs font-mono border border-gold/30 hover:border-gold px-2 py-1 text-gold/60 hover:text-gold transition-all"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        {/* Mobile: language toggle + hamburger — always visible */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="text-xs font-mono border border-gold/30 hover:border-gold px-2 py-1 text-gold/70 hover:text-gold transition-all"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
          <button
            className="text-text-secondary hover:text-gold transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-bg-secondary/95 backdrop-blur-md border-t border-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`font-grotesk transition-colors duration-300 py-1 border-b ${
                  isActive
                    ? 'text-gold border-gold/40'
                    : 'text-text-secondary hover:text-gold border-transparent'
                }`}
              >
                {t(link.labelKey)}
              </a>
            );
          })}
          <a
            href={profile ? `/api/cv/${lang}` : '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm w-fit"
          >
            Resume
          </a>
        </div>
      )}
    </nav>
  );
}
