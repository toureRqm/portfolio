import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import type { SkillsGrouped, Skill } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const LEVEL_CONFIG: Record<number, { bg: string; border: string; text: string }> = {
  3: { bg: '#c9a96e18', border: '#c9a96e50', text: '#c9a96e' },
  2: { bg: '#60a5fa18', border: '#60a5fa50', text: '#60a5fa' },
  1: { bg: '#ffffff0a', border: '#ffffff20', text: '#9ca3af' },
};

const CATEGORY_CONFIG = [
  { key: 'frontend', label: 'Frontend',           accent: '#c9a96e' },
  { key: 'backend',  label: 'Backend',            accent: '#60a5fa' },
  { key: 'mobile',   label: 'Mobile',             accent: '#a78bfa' },
  { key: 'ai',       label: 'IA & Automatisation', accent: '#34d399' },
];

/* ─── Single skill row with level badge ─── */
function SkillRow({
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
  const { t } = useTranslation();
  const level = skill.level ?? 1;
  const lvlConfig = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];
  const levelLabel = t(`skills.levels.${level}`);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
      className="flex items-center justify-between gap-3"
    >
      {/* Icon + Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        {skill.icon_url ? (
          <img
            src={skill.icon_url}
            alt={skill.name}
            style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
          />
        ) : (
          <span
            style={{
              width: 18, height: 18, borderRadius: 4,
              background: accent + '25', border: `1px solid ${accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 700, color: accent, flexShrink: 0,
            }}
          >
            {skill.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span
          className="font-grotesk truncate"
          style={{ fontSize: 'clamp(0.82rem, 0.95vw, 1rem)', color: 'rgba(255,255,255,0.75)' }}
        >
          {skill.name}
        </span>
      </div>

      {/* Level badge */}
      <span
        className="font-grotesk flex-shrink-0"
        style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
          padding: '0.2rem 0.6rem',
          borderRadius: 4,
          background: lvlConfig.bg,
          border: `1px solid ${lvlConfig.border}`,
          color: lvlConfig.text,
        }}
      >
        {levelLabel}
      </span>
    </motion.div>
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

      {/* Skill rows */}
      <div className="flex flex-col gap-4">
        {skills.map((skill, i) => (
          <SkillRow key={skill.id} skill={skill} accent={accent} index={i} inView={inView} />
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
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-border rounded animate-pulse flex-shrink-0" />
              <div className="h-3 bg-border rounded animate-pulse" style={{ width: '7rem' }} />
            </div>
            <div className="h-5 w-20 bg-border rounded animate-pulse" />
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
        <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
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
          <p className="section-label mb-4">{t('skills.section_label')}</p>
          <h2 className="section-title mb-3">
            {t('skills.title_prefix')}{' '}
            <span className="text-gold italic">{t('skills.title_italic')}</span>
          </h2>
          <p
            className="font-grotesk"
            style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.15rem)', color: 'rgba(255,255,255,0.32)' }}
          >
            {t('skills.subtitle')}
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
              {t('skills.always_learning')}
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #c9a96e)' }} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
