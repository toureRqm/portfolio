import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Profile } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AboutProps {
  profile: Profile | null;
  profileLoading: boolean;
}

function CountUp({ target, suffix = '', duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      className="inline-block w-0.5 h-4 ml-0.5 align-middle"
      style={{ background: '#c9a96e' }}
    />
  );
}

export default function About({ profile, profileLoading }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t, pick } = useTranslation();

  const stats = [
    { labelKey: 'about.years_exp',         value: profile?.years_experience ?? 4,  suffix: '+' },
    { labelKey: 'about.projects_delivered', value: profile?.projects_count ?? 10,   suffix: '+' },
    { labelKey: 'about.tech_stacks',        value: 3,                               suffix: '+' },
  ];

  const aboutText = pick(profile, 'about_text');
  const paragraphs = aboutText ? aboutText.split('\n\n').filter(Boolean) : [];

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.2) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute -top-20 right-1/3 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }} />
      </div>

      <div className="w-full px-[10%] relative">
        <div className="grid md:grid-cols-2 gap-16 items-stretch">

          {/* ─── Left column: stats + code card ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 h-full"
          >
            {/* Compact stats — 3 in a row */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.labelKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="gold-border-card p-4 flex flex-col items-center text-center"
                >
                  <div className="font-syne font-bold text-gold" style={{ fontSize: '2.25rem', lineHeight: 1 }}>
                    {inView ? <CountUp target={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
                  </div>
                  <p className="font-grotesk text-text-secondary text-xs mt-2 leading-tight">{t(stat.labelKey)}</p>
                </motion.div>
              ))}
            </div>

            {/* Code snippet card — flex-1 fills remaining height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="rounded-xl overflow-hidden flex flex-col flex-1"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a35' }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #2a2a35' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                <span className="ml-2 text-xs font-mono" style={{ color: '#4b5563' }}>stack.ts</span>
              </div>

              {/* Code — flex-1 grows to fill card */}
              <div className="p-5 font-mono text-sm leading-relaxed flex-1 flex flex-col justify-center">
                <div style={{ color: '#6b7280' }}>{'// my tech stack'}</div>
                <div className="mt-1">
                  <span style={{ color: '#60a5fa' }}>const </span>
                  <span style={{ color: '#c9a96e' }}>stack </span>
                  <span style={{ color: '#e5e7eb' }}>= {'{'}</span>
                </div>
                {[
                  { key: 'frontend', val: "'React, TypeScript, Tailwind'",  color: '#86efac' },
                  { key: 'backend',  val: "'Node.js, Express, PostgreSQL'", color: '#86efac' },
                  { key: 'mobile',   val: "'Flutter, Dart'",                color: '#86efac' },
                  { key: 'tools',    val: "'Git, Docker, Figma'",           color: '#86efac' },
                ].map((line, i) => (
                  <motion.div
                    key={line.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="pl-5"
                  >
                    <span style={{ color: '#a78bfa' }}>{line.key}</span>
                    <span style={{ color: '#e5e7eb' }}>: </span>
                    <span style={{ color: line.color }}>{line.val}</span>
                    <span style={{ color: '#6b7280' }}>,</span>
                  </motion.div>
                ))}
                <div>
                  <span style={{ color: '#e5e7eb' }}>{'}'}</span>
                  <BlinkingCursor />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── Right column: text ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="section-label mb-4">{t('about.section_label')}</p>
            <h2 className="section-title mb-8">
              {t('about.title')}{' '}
              <span className="text-gold italic">{t('about.title_italic')}</span>
            </h2>

            {profileLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-border rounded animate-pulse" style={{ width: `${80 + i * 4}%` }} />
                ))}
              </div>
            ) : paragraphs.length > 0 ? (
              <div
                className="space-y-4 overflow-y-auto pr-2"
                style={{
                  flex: 1,
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#2a2a35 transparent',
                }}
              >
                {paragraphs.map((para, i) => (
                  <p key={i} className="font-grotesk text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.2rem)' }}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="font-grotesk text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.2rem)' }}>
                Passionate Full Stack JavaScript Developer with 4+ years of experience building modern web
                and mobile applications. I specialize in React, Node.js, and TypeScript, crafting scalable
                solutions from concept to deployment.
              </p>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
