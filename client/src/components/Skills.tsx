import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import type { SkillsGrouped, Skill } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORY_CONFIG = [
  { key: 'frontend', label: 'Frontend', accent: '#c9a96e' },
  { key: 'backend',  label: 'Backend',  accent: '#60a5fa' },
  { key: 'mobile',   label: 'Mobile',   accent: '#a78bfa' },
];

/* ─── Single skill row with animated progress bar ─── */
function SkillBar({
  skill,
  accent,
  index,
  inView,
}: {
  skill: Skill;
  accent: string;
  index: number;
  inView: boolean;
}) {
  const pct = skill.level_percent ?? (skill.level === 3 ? 92 : skill.level === 2 ? 80 : 65);

  return (
    <div className="flex items-center gap-4">
      {/* Icon + Name */}
      <div className="flex items-center gap-2 flex-shrink-0" style={{ width: 'clamp(7rem, 11vw, 12rem)' }}>
        {skill.icon_url ? (
          <img
            src={skill.icon_url}
            alt={skill.name}
            style={{ width: 'clamp(16px, 1.4vw, 22px)', height: 'clamp(16px, 1.4vw, 22px)', objectFit: 'contain', flexShrink: 0 }}
          />
        ) : (
          <span
            style={{
              width: 'clamp(16px, 1.4vw, 22px)',
              height: 'clamp(16px, 1.4vw, 22px)',
              borderRadius: 4,
              background: accent + '25',
              border: `1px solid ${accent}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: 700,
              color: accent,
              flexShrink: 0,
            }}
          >
            {skill.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span
          className="font-grotesk truncate"
          style={{
            fontSize: 'clamp(0.78rem, 0.95vw, 1rem)',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {skill.name}
        </span>
      </div>

      {/* Progress track */}
      <div
        className="flex-1 relative"
        style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.07 }}
          style={{
            height: '100%',
            borderRadius: 2,
            background: `linear-gradient(90deg, ${accent}55, ${accent})`,
            position: 'relative',
          }}
        >
          {/* Glowing tip dot */}
          <div
            style={{
              position: 'absolute',
              right: -3,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 8px ${accent}, 0 0 16px ${accent}70`,
            }}
          />
        </motion.div>
      </div>

      {/* Percentage */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4 + index * 0.07 }}
        className="font-mono flex-shrink-0 tabular-nums"
        style={{
          fontSize: 'clamp(0.72rem, 0.88vw, 0.95rem)',
          color: accent,
          width: '2.8rem',
          textAlign: 'right',
        }}
      >
        {pct}%
      </motion.span>
    </div>
  );
}

/* ─── Category column ─── */
function CategoryColumn({
  label,
  accent,
  skills,
  catIndex,
  inView,
}: {
  label: string;
  accent: string;
  skills: Skill[];
  catIndex: number;
  inView: boolean;
}) {
  if (skills.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: catIndex * 0.14 }}
    >
      {/* Category header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          style={{
            width: 'clamp(36px, 3vw, 48px)',
            height: 'clamp(36px, 3vw, 48px)',
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
            border: `1px solid ${accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 'clamp(0.8rem, 1vw, 1.1rem)', fontWeight: 700, color: accent }}>
            {label.charAt(0)}
          </span>
        </div>
        <div>
          <h3
            className="font-syne font-bold text-white leading-none"
            style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.8rem)' }}
          >
            {label}
          </h3>
          <div
            style={{
              height: 2,
              marginTop: 6,
              borderRadius: 1,
              width: 'clamp(24px, 2.5vw, 36px)',
              background: accent,
            }}
          />
        </div>
      </div>

      {/* Skill bars */}
      <div className="flex flex-col gap-5">
        {skills.map((skill, i) => (
          <SkillBar key={skill.id} skill={skill} accent={accent} index={i} inView={inView} />
        ))}
      </div>

      {/* Tags */}
      <div
        className="flex flex-wrap gap-2 mt-7 pt-5"
        style={{ borderTop: `1px solid ${accent}15` }}
      >
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="font-grotesk uppercase transition-all duration-200 cursor-default"
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: 4,
              border: `1px solid ${accent}28`,
              color: `${accent}70`,
              fontSize: 'clamp(0.6rem, 0.72vw, 0.78rem)',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = accent;
              (e.currentTarget as HTMLElement).style.borderColor = accent + '60';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = accent + '70';
              (e.currentTarget as HTMLElement).style.borderColor = accent + '28';
            }}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ─── */
function SkeletonColumn() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-border animate-pulse" />
        <div className="h-6 w-28 bg-border rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-border rounded animate-pulse" style={{ width: '9rem' }} />
            <div className="flex-1 h-0.5 bg-border rounded animate-pulse" />
            <div className="h-3 w-8 bg-border rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section ─── */
export default function Skills() {
  const { data: skills, loading, error } = useApi<SkillsGrouped>('/api/skills');
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { t } = useTranslation();

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#07070e' }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,169,110,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />
        {/* Color halos */}
        <div className="absolute -top-32 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[280px] h-[280px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        {/* Top line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #c9a96e30, transparent)' }} />
      </div>

      <div className="w-full px-[10%] relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-4">{t('skills.section_label') || 'TECH STACK'}</p>
          <h2 className="section-title mb-3">
            Skills &amp;{' '}
            <span className="text-gold italic">Technologies</span>
          </h2>
          <p
            className="font-grotesk"
            style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.15rem)', color: 'rgba(255,255,255,0.32)' }}
          >
            {t('skills.subtitle') || '4 years of Full Stack experience — from pixel to server.'}
          </p>
        </motion.div>

        {error && (
          <div className="py-12 text-text-secondary">
            <p>Unable to load skills. Please try again later.</p>
          </div>
        )}

        {/* Category grid: 2 cols on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20">
          {loading ? (
            <>
              <SkeletonColumn />
              <SkeletonColumn />
              <SkeletonColumn />
            </>
          ) : (
            skills &&
            CATEGORY_CONFIG.map((cat, i) => (
              <CategoryColumn
                key={cat.key}
                label={cat.label}
                accent={cat.accent}
                skills={skills[cat.key] ?? []}
                catIndex={i}
                inView={inView}
              />
            ))
          )}
        </div>

        {/* ALWAYS LEARNING footer */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4 mt-16"
            style={{ opacity: 0.28 }}
          >
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #c9a96e)' }} />
            <span
              className="font-mono tracking-widest uppercase"
              style={{ fontSize: 'clamp(0.6rem, 0.75vw, 0.78rem)', color: '#c9a96e' }}
            >
              Always Learning
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #c9a96e)' }} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
