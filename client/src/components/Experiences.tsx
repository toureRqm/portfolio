import { useRef, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Experience } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

// Fixed particles (outside component to avoid re-randomization)
const BG_PARTICLES = [
  { id: 0,  x: 8,  y: 12, s: 2, dur: 4.2, del: 0   },
  { id: 1,  x: 88, y: 25, s: 3, dur: 5.1, del: 1.2  },
  { id: 2,  x: 15, y: 55, s: 2, dur: 3.8, del: 0.5  },
  { id: 3,  x: 92, y: 68, s: 2, dur: 4.6, del: 2.1  },
  { id: 4,  x: 5,  y: 80, s: 3, dur: 5.3, del: 0.8  },
  { id: 5,  x: 82, y: 85, s: 2, dur: 3.5, del: 1.7  },
  { id: 6,  x: 22, y: 35, s: 2, dur: 4.8, del: 3.0  },
  { id: 7,  x: 75, y: 45, s: 3, dur: 4.0, del: 0.3  },
  { id: 8,  x: 50, y: 15, s: 2, dur: 5.5, del: 2.5  },
  { id: 9,  x: 60, y: 90, s: 2, dur: 3.9, del: 1.0  },
  { id: 10, x: 35, y: 70, s: 3, dur: 4.3, del: 1.5  },
  { id: 11, x: 68, y: 60, s: 2, dur: 4.7, del: 0.7  },
];

function ExperienceCard({ exp, index, isLeft }: { exp: Experience; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { t, pick } = useTranslation();

  const displayJobTitle = pick(exp, 'job_title');
  const displayDescription = pick(exp, 'description');
  const bullets = displayDescription
    ? displayDescription.split('\n').filter((l) => l.trim())
    : [];

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return t('experience.present');
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const year = exp.date_start ? new Date(exp.date_start).getFullYear() : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`relative flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-10 items-start`}
    >
      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.08 + 0.3, type: 'spring', stiffness: 300 }}
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-7 z-10 items-center justify-center"
      >
        <div className="w-4 h-4 rounded-full bg-gold border-2 border-bg-primary" />
        <div className="absolute w-8 h-8 rounded-full animate-ping" style={{ background: '#c9a96e20' }} />
      </motion.div>

      {/* Card */}
      <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
        <div className="gold-border-card p-6 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)] transition-shadow duration-500">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-syne font-bold text-text-primary text-lg leading-tight">{displayJobTitle}</h3>
              <p className="font-grotesk font-medium text-gold text-sm mt-0.5">{exp.company}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-grotesk px-2.5 py-1 rounded-full bg-bg-secondary border border-border text-text-secondary">
              {WORK_TYPE_LABELS[exp.work_type] ?? exp.work_type}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-grotesk mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} className="text-gold" />
              {formatDate(exp.date_start)} – {formatDate(exp.date_end)}
            </span>
            {exp.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={11} className="text-gold" />
                {exp.location}
              </span>
            )}
          </div>

          {bullets.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {bullets.map((bullet, i) => (
                <li key={i} className="font-grotesk text-sm text-text-secondary leading-relaxed flex gap-2">
                  <span className="text-gold mt-1.5 flex-shrink-0">·</span>
                  <span>{bullet.replace(/^[•\-]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          )}

          {exp.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
              {exp.technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="tech-badge flex items-center gap-1"
                  style={{ backgroundColor: tech.color + '20', color: tech.color, border: `1px solid ${tech.color}35` }}
                >
                  {tech.icon_url && <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />}
                  {tech.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty side decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.08 + 0.5, duration: 0.8 }}
        className={`hidden md:flex w-[calc(50%-2rem)] items-center ${isLeft ? 'md:pl-8 justify-start' : 'md:pr-8 justify-end'}`}
      >
        {year && (
          <div className="flex flex-col items-center gap-2 select-none">
            <span
              className="font-syne font-bold leading-none"
              style={{ fontSize: '5rem', color: '#c9a96e08', letterSpacing: '-0.04em' }}
            >
              {year}
            </span>
            <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e40, transparent)' }} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-6 md:gap-10 items-start">
      <div className="w-full md:w-[calc(50%-2rem)]">
        <div className="gold-border-card p-6 space-y-3">
          <div className="h-5 bg-border rounded animate-pulse w-3/4" />
          <div className="h-4 bg-border rounded animate-pulse w-1/2" />
          <div className="space-y-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-border rounded animate-pulse w-4/5" />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden md:block w-[calc(50%-2rem)]" />
    </div>
  );
}

export default function Experiences() {
  const { data: experiences, loading, error } = useApi<Experience[]>('/api/experiences');
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  // Scroll-driven zigzag dot
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });

  const dotXRaw = useMotionValue(50);
  const dotX = useSpring(dotXRaw, { stiffness: 60, damping: 18 });
  const dotXPercent = useTransform(dotX, (v) => `${v}%`);
  const dotY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const expCountRef = useRef(0);
  useMemo(() => { expCountRef.current = experiences?.length ?? 0; }, [experiences]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const n = expCountRef.current;
    if (!n) { dotXRaw.set(50); return; }
    const clamped = Math.max(0, Math.min(1, progress));
    const segIndex = Math.min(Math.floor(clamped * n), n - 1);
    const segProgress = (clamped * n) % 1;
    // Smoothstep: 0→peak→0
    const wave = segProgress < 0.5 ? segProgress * 2 : 2 - segProgress * 2;
    const smooth = wave * wave * (3 - 2 * wave);
    const isLeft = segIndex % 2 === 0;
    const target = isLeft ? 76 : 24;
    dotXRaw.set(50 + (target - 50) * smooth);
  });

  return (
    <section id="experience" ref={sectionRef} className="py-24 md:py-32 bg-bg-primary relative overflow-hidden">

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {BG_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.s,
              height: p.s,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: '#c9a96e',
            }}
            animate={{ y: [-8, 8], opacity: [0.08, 0.25, 0.08] }}
            transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* Subtle corner glow */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-4">Career</p>
          <h2 className="section-title">
            Work <span className="text-gold italic">{t('experience.section_label')}</span>
          </h2>
        </motion.div>

        {error && (
          <div className="text-center py-12 text-text-secondary">
            <p>Unable to load experiences. Please try again later.</p>
          </div>
        )}

        {/* Timeline container */}
        <div ref={timelineRef} className="relative">
          {/* Static center line */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, transparent, #c9a96e30 15%, #c9a96e30 85%, transparent)' }} />

          {/* Scroll-driven zigzag dot */}
          {!loading && experiences && experiences.length > 0 && (
            <motion.div
              className="hidden md:block absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              style={{ left: dotXPercent, top: dotY }}
            >
              <div className="relative w-5 h-5">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: '#c9a96e30' }}
                  animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-[3px] rounded-full"
                  style={{ background: '#c9a96e', boxShadow: '0 0 10px #c9a96e, 0 0 20px #c9a96e60' }} />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-10 md:gap-14">
            {loading && [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            {!loading && !error && experiences?.map((exp, i) => (
              <ExperienceCard key={exp.id} exp={exp} index={i} isLeft={i % 2 === 0} />
            ))}
          </div>
        </div>

        {!loading && !error && experiences?.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <p>No experiences to display yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
