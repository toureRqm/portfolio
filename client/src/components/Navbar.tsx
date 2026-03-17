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
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="font-syne font-700 text-lg text-text-primary hover:text-gold transition-colors duration-300"
          style={{ fontWeight: 700 }}
        >
          {profile?.name?.split(' ')[0] ?? 'Abdourahmane'}
          <span className="text-gold italic font-normal"> Touré</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-grotesk text-sm text-text-secondary hover:text-gold transition-colors duration-300 tracking-wide relative group"
            >
              {t(link.labelKey)}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href={profile?.cv_url ?? '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf'}
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

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text-secondary hover:text-gold transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-bg-secondary/95 backdrop-blur-md border-t border-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-grotesk text-text-secondary hover:text-gold transition-colors duration-300 py-1"
            >
              {t(link.labelKey)}
            </a>
          ))}
          <a
            href={profile?.cv_url ?? '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm w-fit"
          >
            Resume
          </a>
          {/* Language toggle mobile */}
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="text-xs font-mono border border-gold/30 hover:border-gold px-2 py-1 text-gold/60 hover:text-gold transition-all w-fit"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>
      )}
    </nav>
  );
}
