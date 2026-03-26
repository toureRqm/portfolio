import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Experience } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

function ExperienceCard({ exp, index, isLeft }: { exp: Experience; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { t, pick } = useTranslation();

  const displayJobTitle = pick(exp, 'job_title');
  const displayDescription = pick(exp, 'description');

  const bullets = displayDescription
    ? displayDescription.split('\n').filter((l) => l.trim())
    : [];

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return t('experience.present');
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-10 items-start`}
    >
      {/* Timeline dot — center (hidden on mobile) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 w-3 h-3 rounded-full bg-gold border-2 border-bg-primary z-10" />

      {/* Content card */}
      <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
        <div className="gold-border-card p-6 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-syne font-bold text-text-primary text-lg leading-tight">
                {displayJobTitle}
              </h3>
              <p className="font-grotesk font-medium text-gold text-sm mt-0.5">
                {exp.company}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs font-grotesk px-2.5 py-1 rounded-full bg-bg-secondary border border-border text-text-secondary">
              {WORK_TYPE_LABELS[exp.work_type] ?? exp.work_type}
            </span>
          </div>

          {/* Meta */}
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

          {/* Description bullets */}
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

          {/* Technologies */}
          {exp.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
              {exp.technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="tech-badge flex items-center gap-1"
                  style={{ backgroundColor: tech.color + '20', color: tech.color, border: `1px solid ${tech.color}35` }}
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
      </div>

      {/* Spacer for the other side */}
      <div className="hidden md:block w-[calc(50%-2rem)]" />
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
              <div key={i} className="h-3 bg-border rounded animate-pulse" style={{ width: `${80 + Math.random() * 20}%` }} />
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
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  return (
    <section id="experience" ref={sectionRef} className="py-24 md:py-32 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-4">Career</p>
          <h2 className="section-title">
            Work{' '}
            <span className="text-gold italic">{t('experience.section_label')}</span>
          </h2>
        </motion.div>

        {error && (
          <div className="text-center py-12 text-text-secondary">
            <p>Unable to load experiences. Please try again later.</p>
          </div>
        )}

        <div className="relative">
          {/* Vertical timeline line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          <div className="flex flex-col gap-10 md:gap-14">
            {loading &&
              [...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}

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
