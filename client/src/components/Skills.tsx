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

function SkillChip({ skill, index }: { skill: Skill; index: number }) {
  const color = skill.color ?? '#c9a96e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ scale: 1.1, y: -4 }}
      className="flex flex-col items-center gap-2 cursor-default group"
    >
      {/* Icon container */}
      <motion.div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1px solid ${color}30`,
        }}
        whileHover={{
          boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}15`,
          borderColor: color + '70',
        }}
        transition={{ duration: 0.2 }}
      >
        {skill.icon_url ? (
          <img
            src={skill.icon_url}
            alt={skill.name}
            className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span
            className="text-xl font-syne font-bold transition-all duration-300"
            style={{ color }}
          >
            {skill.name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Shimmer on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${color}15 0%, transparent 60%)`,
          }}
        />
      </motion.div>

      {/* Name */}
      <span
        className="text-xs font-grotesk font-medium text-center leading-tight transition-colors duration-300 group-hover:text-white"
        style={{ color: '#9ca3af', maxWidth: '4rem' }}
      >
        {skill.name}
      </span>
    </motion.div>
  );
}

function CategoryColumn({
  label,
  accent,
  skills,
  catIndex,
  inView,
}: {
  catKey?: string;
  label: string;
  accent: string;
  skills: Skill[];
  catIndex: number;
  inView: boolean;
}) {
  if (skills.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: catIndex * 0.15 }}
      className="flex flex-col"
    >
      {/* Category header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '20', border: `1px solid ${accent}40` }}>
          <span className="text-xs font-bold" style={{ color: accent }}>
            {label.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-syne font-bold text-white text-lg leading-none">{label}</h3>
          <div className="h-0.5 mt-1.5 rounded-full w-8" style={{ background: accent }} />
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-4 gap-4">
        {skills.map((skill, i) => (
          <SkillChip key={skill.id} skill={skill} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function SkeletonColumn() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-border animate-pulse" />
        <div className="h-5 w-24 bg-border rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-border animate-pulse" />
            <div className="h-3 w-10 bg-border rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const { data: skills, loading, error } = useApi<SkillsGrouped>('/api/skills');
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#0d0d14' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #c9a96e08 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #60a5fa08 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #a78bfa05 0%, transparent 70%)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
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
          <h2 className="section-title">
            Skills &{' '}
            <span className="text-gold italic">Technologies</span>
          </h2>
        </motion.div>

        {error && (
          <div className="text-center py-12 text-text-secondary">
            <p>Unable to load skills. Please try again later.</p>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {loading ? (
            <>
              <SkeletonColumn />
              <SkeletonColumn />
              <SkeletonColumn />
            </>
          ) : skills && (
            CATEGORY_CONFIG.map((cat, catIdx) => (
              <CategoryColumn
                key={cat.key}
                catKey={cat.key}
                label={cat.label}
                accent={cat.accent}
                skills={skills[cat.key] ?? []}
                catIndex={catIdx}
                inView={inView}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
