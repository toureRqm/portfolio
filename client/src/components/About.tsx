import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Profile } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AboutProps {
  profile: Profile | null;
  profileLoading: boolean;
}

function CountUp({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function About({ profile, profileLoading }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t, pick } = useTranslation();

  const stats = [
    { labelKey: 'about.years_exp', value: profile?.years_experience ?? 4, suffix: '+' },
    { labelKey: 'about.projects_delivered', value: profile?.projects_count ?? 10, suffix: '+' },
    { labelKey: 'about.tech_stacks', value: 3, suffix: '+' },
  ];

  const aboutText = pick(profile, 'about_text');
  const paragraphs = aboutText ? aboutText.split('\n\n').filter(Boolean) : [];

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 bg-bg-secondary relative overflow-hidden">
      {/* Background deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.2) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-4">{t('about.section_label')}</p>
            <h2 className="section-title mb-8">
              Building the web,{' '}
              <span className="text-gold italic">one stack at a time</span>
            </h2>

            {profileLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-border rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
                ))}
              </div>
            ) : paragraphs.length > 0 ? (
              <div className="space-y-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="font-grotesk text-text-secondary leading-relaxed text-base">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="font-grotesk text-text-secondary leading-relaxed">
                Passionate Full Stack JavaScript Developer with 4+ years of experience building modern web and mobile applications.
                I specialize in React, Node.js, and TypeScript, crafting scalable solutions from concept to deployment.
              </p>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-3 md:grid-cols-1 gap-6 md:gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="gold-border-card p-6 md:p-8"
              >
                <div
                  className="font-syne font-bold text-gold mb-2"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                >
                  {inView ? (
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <p className="font-grotesk text-text-secondary text-sm tracking-wide">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
