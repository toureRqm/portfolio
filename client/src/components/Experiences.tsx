import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronDown, Briefcase } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Experience } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

// Accent colors cycling per card
const ACCENTS = ['#c9a96e', '#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c'];

function ExperienceCard({
  exp,
  index,
  accent,
}: {
  exp: Experience;
  index: number;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [expanded, setExpanded] = useState(false);
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
      initial={{ opacity: 0, x: -32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-0"
    >
      {/* ── Left gutter: year + line + dot ── */}
      <div className="relative flex flex-col items-center" style={{ width: '5.5rem', flexShrink: 0 }}>
        {/* Year badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.09 + 0.15, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative z-10 flex items-center justify-center rounded-xl font-syne font-black text-sm select-none"
          style={{
            width: '4rem',
            height: '2rem',
            background: `linear-gradient(135deg, ${accent}28, ${accent}10)`,
            border: `1px solid ${accent}55`,
            color: accent,
            letterSpacing: '0.04em',
          }}
        >
          {year ?? '—'}
        </motion.div>

        {/* Vertical colored bar */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: index * 0.09 + 0.25, duration: 0.5, ease: 'easeOut' }}
          className="flex-1 w-0.5 origin-top my-2"
          style={{ background: `linear-gradient(to bottom, ${accent}80, ${accent}10)` }}
        />

        {/* Bottom dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.09 + 0.35, type: 'spring', stiffness: 350 }}
          className="relative z-10 w-2 h-2 rounded-full mb-2"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
        />
      </div>

      {/* ── Card ── */}
      <div className="flex-1 pb-8 pt-0.5">
        <motion.div
          className="rounded-2xl overflow-hidden cursor-pointer select-none"
          style={{
            background: '#13131a',
            border: `1px solid ${expanded ? accent + '55' : '#2a2a35'}`,
            boxShadow: expanded ? `0 0 32px ${accent}12` : 'none',
            transition: 'border-color 0.25s, box-shadow 0.25s',
          }}
          onClick={() => setExpanded((v) => !v)}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
        >
          {/* Card header — always visible */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
            <div className="flex items-start gap-3 min-w-0">
              {/* Accent icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
              >
                <Briefcase size={16} style={{ color: accent }} />
              </div>

              <div className="min-w-0">
                <h3 className="font-syne font-bold text-white text-base leading-tight truncate">
                  {displayJobTitle}
                </h3>
                <p className="font-grotesk font-semibold text-sm mt-0.5" style={{ color: accent }}>
                  {exp.company}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-text-secondary font-grotesk mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={10} style={{ color: accent }} />
                    {formatDate(exp.date_start)} – {formatDate(exp.date_end)}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={10} style={{ color: accent }} />
                      {exp.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
              <span
                className="text-xs font-grotesk px-2.5 py-1 rounded-full border"
                style={{
                  background: `${accent}12`,
                  borderColor: `${accent}35`,
                  color: accent,
                }}
              >
                {WORK_TYPE_LABELS[exp.work_type] ?? exp.work_type}
              </span>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                style={{ color: '#4b5563' }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </div>
          </div>

          {/* Expandable body */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="px-5 pb-5"
                  style={{ borderTop: `1px solid ${accent}25` }}
                >
                  {/* Description bullets */}
                  {bullets.length > 0 && (
                    <ul className="space-y-2 mt-4 mb-4">
                      {bullets.map((bullet, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="font-grotesk text-sm text-text-secondary leading-relaxed flex gap-2.5"
                        >
                          <span
                            className="flex-shrink-0 mt-[0.45rem] w-1.5 h-1.5 rounded-full"
                            style={{ background: accent }}
                          />
                          <span>{bullet.replace(/^[•\-]\s*/, '')}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {/* Tech badges */}
                  {exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: `1px solid #2a2a35` }}>
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="tech-badge flex items-center gap-1"
                          style={{
                            backgroundColor: tech.color + '20',
                            color: tech.color,
                            border: `1px solid ${tech.color}35`,
                          }}
                        >
                          {tech.icon_url && (
                            <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                          )}
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-0">
      <div style={{ width: '5.5rem', flexShrink: 0 }}>
        <div className="w-16 h-8 rounded-xl bg-border animate-pulse" />
      </div>
      <div className="flex-1 pb-8">
        <div className="rounded-2xl p-5 space-y-3" style={{ background: '#13131a', border: '1px solid #2a2a35' }}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-border animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border rounded animate-pulse w-2/3" />
              <div className="h-3 bg-border rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Experiences() {
  const { data: experiences, loading, error } = useApi<Experience[]>('/api/experiences');
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  const accentsMap = useMemo(
    () => Object.fromEntries((experiences ?? []).map((exp, i) => [exp.id, ACCENTS[i % ACCENTS.length]])),
    [experiences]
  );

  return (
    <section id="experience" ref={sectionRef} className="py-24 md:py-32 bg-bg-primary relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div
          className="absolute -top-40 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute top-0 left-0 w-48 h-full opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c9a96e 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 relative">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="section-label mb-4">Career</p>
          <h2 className="section-title">
            Work <span className="text-gold italic">{t('experience.section_label')}</span>
          </h2>
          <p className="font-grotesk text-text-secondary text-sm mt-3">
            Click any card to reveal details
          </p>
        </motion.div>

        {error && (
          <div className="text-center py-12 text-text-secondary">
            <p>Unable to load experiences. Please try again later.</p>
          </div>
        )}

        {/* Timeline list */}
        <div>
          {loading && [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          {!loading && !error && experiences?.map((exp, i) => (
            <ExperienceCard
              key={exp.id}
              exp={exp}
              index={i}
              accent={accentsMap[exp.id] ?? '#c9a96e'}
            />
          ))}
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
