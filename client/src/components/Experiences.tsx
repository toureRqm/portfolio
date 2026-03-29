import { useRef } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Experience } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

/* ─────────────────────────────────────────
   Single experience card (left or right)
───────────────────────────────────────── */
function ExperienceCard({
  exp,
  index,
  isLeft,
}: {
  exp: Experience;
  index: number;
  isLeft: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { t, pick } = useTranslation();

  const displayJobTitle = pick(exp, 'job_title');
  const displayDescription = pick(exp, 'description');
  const bullets = displayDescription
    ? displayDescription.split('\n').filter((l) => l.trim())
    : [];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('experience.present');
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const dateRange = `${formatDate(exp.date_start)} – ${formatDate(exp.date_end)}`;

  return (
    /* Row: on desktop alternates, on mobile always single-col */
    <div
      ref={ref}
      className={`
        relative flex items-start gap-0
        md:grid md:grid-cols-[1fr_auto_1fr]
      `}
    >
      {/* ── Left slot ── */}
      <div
        className={`
          hidden md:flex
          ${isLeft ? 'justify-end pr-10' : 'justify-start'}
        `}
      >
        {isLeft && (
          <CardBody
            exp={exp}
            isLeft
            inView={inView}
            index={index}
            dateRange={dateRange}
            displayJobTitle={displayJobTitle}
            bullets={bullets}
          />
        )}
      </div>

      {/* ── Centre: dot ── */}
      <div className="hidden md:flex flex-col items-center justify-start pt-5">
        <TimelineDot inView={inView} index={index} />
      </div>

      {/* ── Right slot ── */}
      <div
        className={`
          hidden md:flex
          ${!isLeft ? 'justify-start pl-10' : 'justify-end'}
        `}
      >
        {!isLeft && (
          <CardBody
            exp={exp}
            isLeft={false}
            inView={inView}
            index={index}
            dateRange={dateRange}
            displayJobTitle={displayJobTitle}
            bullets={bullets}
          />
        )}
      </div>

      {/* ── Mobile: always left-dot + right-card ── */}
      <div className="md:hidden flex items-start gap-5 w-full">
        <div className="flex flex-col items-center pt-5 flex-shrink-0">
          <TimelineDot inView={inView} index={index} />
        </div>
        <div className="flex-1">
          <CardBody
            exp={exp}
            isLeft={false}
            inView={inView}
            index={index}
            dateRange={dateRange}
            displayJobTitle={displayJobTitle}
            bullets={bullets}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Timeline dot with pulse
───────────────────────────────────────── */
function TimelineDot({ inView, index }: { inView: boolean; index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 320, damping: 20 }}
      className="relative z-10 flex items-center justify-center"
      style={{ width: 18, height: 18 }}
    >
      {/* Pulse ring */}
      {inView && (
        <motion.div
          className="absolute rounded-full"
          style={{ inset: -6, border: '1px solid #c9a96e' }}
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.2, delay: index * 0.1 + 0.4 }}
        />
      )}
      {/* Core dot */}
      <div
        className="w-3.5 h-3.5 rounded-full border-2"
        style={{
          background: '#c9a96e',
          borderColor: '#07070e',
          boxShadow: '0 0 10px #c9a96e80, 0 0 24px #c9a96e30',
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Card content
───────────────────────────────────────── */
function CardBody({
  exp,
  isLeft,
  inView,
  index,
  dateRange,
  displayJobTitle,
  bullets,
}: {
  exp: Experience;
  isLeft: boolean;
  inView: boolean;
  index: number;
  dateRange: string;
  displayJobTitle: string;
  bullets: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -3 }}
      className="group relative rounded-2xl cursor-default w-full"
      style={{
        background: 'linear-gradient(135deg, #111120 0%, #0d0d18 100%)',
        border: '1px solid #c9a96e22',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        padding: 'clamp(1rem, 1.8vw, 2rem)',
      }}
    >
      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          border: '1px solid #c9a96e55',
          boxShadow: '0 0 30px #c9a96e18, inset 0 0 20px #c9a96e08',
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-px rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)' }}
      />

      {/* Date badge */}
      <div className="inline-flex items-center gap-1.5 mb-3">
        <Calendar size={13} style={{ color: '#c9a96e' }} />
        <span
          className="font-grotesk font-medium"
          style={{ color: '#c9a96e', fontSize: 'clamp(0.72rem, 0.9vw, 1rem)' }}
        >
          {dateRange}
        </span>
      </div>

      {/* Job title */}
      <h3
        className="font-syne font-bold text-white leading-tight mb-1.5"
        style={{ fontSize: 'clamp(1rem, 1.5vw, 1.7rem)' }}
      >
        {displayJobTitle}
      </h3>

      {/* Company */}
      <p
        className="font-grotesk font-semibold mb-3"
        style={{ color: '#c9a96e', fontSize: 'clamp(0.85rem, 1.05vw, 1.15rem)' }}
      >
        {exp.company}
      </p>

      {/* Meta: location + work type */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {exp.location && (
          <span
            className="flex items-center gap-1.5 font-grotesk text-text-secondary"
            style={{ fontSize: 'clamp(0.72rem, 0.85vw, 0.95rem)' }}
          >
            <MapPin size={11} style={{ color: '#c9a96e80' }} />
            {exp.location}
          </span>
        )}
        {exp.work_type && (
          <span
            className="font-grotesk px-2.5 py-0.5 rounded-full"
            style={{
              background: '#c9a96e14',
              border: '1px solid #c9a96e30',
              color: '#c9a96e',
              fontSize: 'clamp(0.72rem, 0.85vw, 0.95rem)',
            }}
          >
            {WORK_TYPE_LABELS[exp.work_type] ?? exp.work_type}
          </span>
        )}
      </div>

      {/* Bullets */}
      {bullets.length > 0 && (
        <ul className="space-y-2 mb-5">
          {bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex gap-2.5 font-grotesk text-text-secondary leading-relaxed"
              style={{ fontSize: 'clamp(0.8rem, 0.95vw, 1.05rem)' }}
            >
              <span className="flex-shrink-0 mt-[0.45em] w-1.5 h-1.5 rounded-full" style={{ background: '#c9a96e80' }} />
              <span>{bullet.replace(/^[•\-]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Tech badges */}
      {exp.technologies.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 pt-3"
          style={{ borderTop: '1px solid #ffffff08' }}
        >
          {exp.technologies.map((tech) => (
            <span
              key={tech.id}
              className="tech-badge flex items-center gap-1"
              style={{
                backgroundColor: tech.color + '20',
                color: tech.color,
                border: `1px solid ${tech.color}35`,
                fontSize: 'clamp(0.68rem, 0.8vw, 0.88rem)',
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
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
function SkeletonCard({ isLeft }: { isLeft: boolean }) {
  return (
    <div className="relative md:grid md:grid-cols-[1fr_auto_1fr] flex items-start gap-5">
      <div className={`hidden md:block ${isLeft ? '' : ''}`}>
        {isLeft && (
          <div className="flex justify-end pr-10 w-full">
            <div
              className="rounded-2xl p-5 animate-pulse space-y-3 w-full"
              style={{ background: '#111120', border: '1px solid #1e1e2e' }}
            >
              <div className="h-3 bg-border rounded w-2/5" />
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="h-3 bg-border rounded w-1/2" />
              <div className="space-y-2 mt-3">
                {[...Array(2)].map((_, i) => <div key={i} className="h-2.5 bg-border rounded w-4/5" />)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="hidden md:flex flex-col items-center pt-5">
        <div className="w-3.5 h-3.5 rounded-full bg-border animate-pulse" />
      </div>
      <div>
        {!isLeft && (
          <div className="pl-10 w-full">
            <div
              className="rounded-2xl p-5 animate-pulse space-y-3 w-full"
              style={{ background: '#111120', border: '1px solid #1e1e2e' }}
            >
              <div className="h-3 bg-border rounded w-2/5" />
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="h-3 bg-border rounded w-1/2" />
            </div>
          </div>
        )}
      </div>
      {/* Mobile skeleton */}
      <div className="md:hidden flex gap-5 w-full">
        <div className="w-3.5 h-3.5 rounded-full bg-border animate-pulse flex-shrink-0 mt-5" />
        <div className="flex-1 rounded-2xl p-5 animate-pulse space-y-2" style={{ background: '#111120', border: '1px solid #1e1e2e' }}>
          <div className="h-3 bg-border rounded w-2/5" />
          <div className="h-4 bg-border rounded w-3/4" />
          <div className="h-3 bg-border rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Section
───────────────────────────────────────── */
export default function Experiences() {
  const { data: experiences, loading, error } = useApi<Experience[]>('/api/experiences');
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  /* Scroll-driven line draw */
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#07070e' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute -top-32 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full px-[10%] relative">
        {/* Header */}
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

          {/* ── Vertical line (desktop) ── */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px overflow-hidden">
            {/* track (faint) */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent, #c9a96e18 15%, #c9a96e18 85%, transparent)' }}
            />
            {/* animated fill */}
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top"
              style={{
                scaleY: lineScaleY,
                background: 'linear-gradient(to bottom, transparent, #c9a96e 10%, #c9a96e 90%, transparent)',
                filter: 'drop-shadow(0 0 6px #c9a96e)',
                height: '100%',
              }}
            />
          </div>

          {/* ── Mobile vertical line ── */}
          <div className="md:hidden absolute left-[1.6rem] top-0 bottom-0 w-px overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent, #c9a96e28 15%, #c9a96e28 85%, transparent)' }}
            />
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top"
              style={{
                scaleY: lineScaleY,
                background: 'linear-gradient(to bottom, transparent, #c9a96e 10%, #c9a96e 90%, transparent)',
                height: '100%',
              }}
            />
          </div>

          {/* ── Cards ── */}
          <div className="flex flex-col gap-12 md:gap-16">
            {loading &&
              [...Array(4)].map((_, i) => <SkeletonCard key={i} isLeft={i % 2 === 0} />)}

            {!loading &&
              !error &&
              experiences?.map((exp, i) => (
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
