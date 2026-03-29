import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Download } from 'lucide-react';
import type { Profile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  profile: Profile | null;
  profileLoading: boolean;
}

function useTypewriter(texts: string[], speed = 60, pauseMs = 2000) {
  const [display, setDisplay] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx] ?? '';
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pauseMs]);

  return display;
}


export default function Hero({ profile, profileLoading }: HeroProps) {
  const { t, typewriterItems, pick } = useTranslation();
  const { lang } = useLanguage();
  const texts = typewriterItems();
  const typewriterText = useTypewriter(texts);
  const heroRef = useRef<HTMLElement>(null);

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollDown = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-bg-primary"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Dot grid top-right */}
        <div
          className="absolute top-20 right-10 w-32 h-32 animate-float opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.35) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        {/* Dot grid bottom-left */}
        <div
          className="absolute bottom-32 left-10 w-24 h-24 animate-float-slow opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.25) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        {/* Spinning circle large */}
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full border border-gold/5 animate-spin-slow"
          style={{ marginRight: '-6rem' }}
        />
        {/* Spinning circle medium */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full border border-dashed border-gold/10 animate-spin-slow-reverse" />
        {/* Rotating square */}
        <div className="absolute bottom-1/3 right-1/3 w-10 h-10 border border-gold/20 animate-float" style={{ transform: 'rotate(45deg)' }} />
        {/* Code snippets */}
        <span className="deco-code-snippet top-1/4 left-6 animate-float" style={{ animationDuration: '7s' }}>
          const dev = true;
        </span>
        <span className="deco-code-snippet bottom-1/3 left-8 animate-float-slow">
          {'<Portfolio />'}
        </span>
        <span className="deco-code-snippet top-1/2 right-8 animate-float" style={{ animationDuration: '9s' }}>
          {'{ design }'}
        </span>
        <span className="deco-code-snippet top-2/3 left-12 animate-float" style={{ animationDuration: '11s' }}>
          type Dev = {'{ passion: true }'}
        </span>
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-[10%] grid md:grid-cols-2 gap-12 md:gap-20 items-center py-20">
        {/* Left — Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="order-2 md:order-1"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="section-label mb-6"
          >
            Portfolio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-syne font-bold leading-none mb-3"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 7rem)', letterSpacing: '-0.02em' }}
          >
            {profileLoading ? (
              <div className="h-20 bg-border rounded animate-pulse" />
            ) : (
              <>
                {profile?.name?.split(' ').slice(0, -1).join(' ') ?? 'Abdourahmane'}
                <br />
                <span className="text-gold-light font-normal italic">
                  {profile?.name?.split(' ').at(-1) ?? 'Touré'}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-grotesk font-light text-text-secondary tracking-widest uppercase mb-8"
            style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.5rem)' }}
          >
            {profileLoading ? (
              <span className="block h-4 w-64 bg-border rounded animate-pulse" />
            ) : (
              pick(profile, 'title') || 'Full Stack JavaScript Developer'
            )}
          </motion.p>

          <div className="w-12 h-px bg-gradient-to-r from-gold to-transparent mb-8" />

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-grotesk text-text-secondary mb-10 min-h-[1.75rem]"
            style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.4rem)' }}
          >
            <span className="text-text-primary">{typewriterText}</span>
            <span className="inline-block w-0.5 h-5 bg-gold ml-0.5 animate-pulse align-middle" />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <button onClick={scrollToProjects} className="btn-primary">
              {t('hero.cta_work')}
              <ArrowDown size={16} />
            </button>
            <a
              href={profile ? `/api/cv/${lang}` : '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Download size={16} />
              {t('hero.cta_cv')}
            </a>
          </motion.div>
        </motion.div>

        {/* Right — Profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          className="order-1 md:order-2 flex justify-center md:justify-end"
        >
          <div className="relative">
            {/* Spinning circle behind photo */}
            <div className="absolute inset-0 -m-8 rounded-full border border-gold/10 animate-spin-slow" />
            <div className="absolute inset-0 -m-16 rounded-full border border-dashed border-gold/5 animate-spin-slow-reverse" />

            {/* Photo frame */}
            <div
              className="relative overflow-hidden bg-bg-secondary"
              style={{
                width: 'clamp(200px, 30vw, 320px)',
                aspectRatio: '3/4',
                border: '1.5px solid #c9a96e',
                boxShadow: '0 0 0 6px #0a0a0f, 0 0 0 7px rgba(201,169,110,0.18), 0 0 60px rgba(201,169,110,0.06)',
              }}
            >
              {/* Corner accents */}
              <span className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-gold-light z-10" />
              <span className="absolute top-[-1px] right-[-1px] w-4 h-4 border-t-[1.5px] border-r-[1.5px] border-gold-light z-10" />
              <span className="absolute bottom-[-1px] left-[-1px] w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-gold-light z-10" />
              <span className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-gold-light z-10" />

              {profileLoading ? (
                <div className="w-full h-full bg-bg-card animate-pulse" />
              ) : (
                <img
                  src={profile?.photo_url ?? '/static/media/moi.1534d679.png'}
                  alt={profile?.name ?? 'Abdourahmane Touré'}
                  className="w-full h-full object-cover object-top"
                  style={{ filter: 'brightness(0.85) grayscale(10%)' }}
                  loading="eager"
                />
              )}
            </div>

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-4 -right-4 bg-bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2 shadow-xl"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-grotesk text-xs text-text-secondary">Open to remote</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary hover:text-gold transition-colors group"
      >
        <span className="font-grotesk text-xs tracking-widest uppercase">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
