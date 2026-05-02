import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { SkillsGrouped, Skill } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const LEVEL_CONFIG: Record<number, { bg: string; border: string; text: string }> = {
  3: { bg: '#c9a96e18', border: '#c9a96e50', text: '#c9a96e' },
  2: { bg: '#60a5fa18', border: '#60a5fa50', text: '#60a5fa' },
  1: { bg: '#ffffff0a', border: '#ffffff20', text: '#9ca3af' },
};

const CATEGORY_CONFIG = [
  { key: 'frontend', label: 'Frontend',            accent: '#c9a96e' },
  { key: 'backend',  label: 'Backend',             accent: '#60a5fa' },
  { key: 'mobile',   label: 'Mobile',              accent: '#a78bfa' },
  { key: 'ai',       label: 'IA & Automatisation', accent: '#34d399' },
];

const INITIAL_VISIBLE = 4;

function SkillRow({ skill, accent, index, inView }: { skill: Skill; accent: string; index: number; inView: boolean }) {
  const { t } = useTranslation();
  const level = skill.level ?? 1;
  const lvlConfig = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
      className="flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 min-w-0">
        {skill.icon_url ? (
          <img src={skill.icon_url} alt={skill.name} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
        ) : (
          <span style={{
            width: 16, height: 16, borderRadius: 3,
            background: accent + '25', border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.5rem', fontWeight: 700, color: accent, flexShrink: 0,
          }}>
            {skill.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-grotesk truncate" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
          {skill.name}
        </span>
      </div>
      <span className="font-grotesk flex-shrink-0" style={{
        fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.03em',
        padding: '0.15rem 0.5rem', borderRadius: 3,
        background: lvlConfig.bg, border: `1px solid ${lvlConfig.border}`, color: lvlConfig.text,
      }}>
        {t(`skills.levels.${level}`)}
      </span>
    </motion.div>
  );
}

function CategoryColumn({ label, accent, skills, catIndex, inView }: {
  label: string; accent: string; skills: Skill[]; catIndex: number; inView: boolean;
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  if (skills.length === 0) return null;

  const visible = showAll ? skills : skills.slice(0, INITIAL_VISIBLE);
  const hasMore = skills.length > INITIAL_VISIBLE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: catIndex * 0.1 }}
      className="flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #111120 0%, #0d0d18 100%)',
        border: `1px solid ${accent}20`,
        borderRadius: 16,
        padding: '1.25rem',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
          border: `1px solid ${accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accent }}>
            {label.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-syne font-bold text-white leading-none" style={{ fontSize: '1rem' }}>
            {label}
          </h3>
          <div style={{ height: 2, marginTop: 4, borderRadius: 1, width: 20, background: accent }} />
        </div>
      </div>

      {/* Skill rows */}
      <div className="flex flex-col gap-3 flex-1">
        {visible.map((skill, i) => (
          <SkillRow key={skill.id} skill={skill} accent={accent} index={i} inView={inView} />
        ))}
      </div>

      {/* Voir plus */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center justify-center gap-1 mt-4 pt-3 w-full font-grotesk transition-colors"
          style={{
            borderTop: `1px solid ${accent}15`,
            fontSize: '0.72rem',
            color: accent + '90',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = accent + '90')}
        >
          {showAll ? (
            <><ChevronUp size={13} /> {t('skills.see_less')}</>
          ) : (
            <><ChevronDown size={13} /> {t('skills.see_more')} ({skills.length - INITIAL_VISIBLE})</>
          )}
        </button>
      )}
    </motion.div>
  );
}

function SkeletonColumn() {
  return (
    <div style={{ background: '#111120', border: '1px solid #1e1e2e', borderRadius: 16, padding: '1.25rem' }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-border animate-pulse" />
        <div className="h-4 w-20 bg-border rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-border rounded animate-pulse flex-shrink-0" />
              <div className="h-3 bg-border rounded animate-pulse w-24" />
            </div>
            <div className="h-4 w-16 bg-border rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const { data: skills, loading, error } = useApi<SkillsGrouped>('/api/skills');
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { t } = useTranslation();

  return (
    <section id="skills" ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#07070e' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(201,169,110,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }} />
        <div className="absolute -top-32 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[280px] h-[280px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e30, transparent)' }} />
      </div>

      <div className="w-full px-5 md:px-[10%] relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="section-label mb-4">{t('skills.section_label')}</p>
          <h2 className="section-title mb-3">
            {t('skills.title_prefix')}{' '}
            <span className="text-gold italic">{t('skills.title_italic')}</span>
          </h2>
          <p className="font-grotesk" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.15rem)', color: 'rgba(255,255,255,0.32)' }}>
            {t('skills.subtitle')}
          </p>
        </motion.div>

        {error && <p className="py-12 text-text-secondary">Unable to load skills.</p>}

        {/* 4 colonnes sur desktop, 2 sur tablette, 1 sur mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonColumn key={i} />)
          ) : (
            skills && CATEGORY_CONFIG.map((cat, i) => (
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

        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4 mt-12"
            style={{ opacity: 0.28 }}
          >
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #c9a96e)' }} />
            <span className="font-mono tracking-widest uppercase" style={{ fontSize: '0.65rem', color: '#c9a96e' }}>
              {t('skills.always_learning')}
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #c9a96e)' }} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
