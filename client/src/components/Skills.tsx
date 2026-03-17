import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import type { SkillsGrouped, Skill } from '../types';
import { useTranslation } from '../hooks/useTranslation';

function LevelBars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1 w-4 rounded-full transition-all duration-300"
          style={{
            background: i <= level ? '#c9a96e' : 'rgba(201,169,110,0.15)',
          }}
        />
      ))}
    </div>
  );
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="gold-border-card p-4 flex flex-col gap-1 group cursor-default"
    >
      <span className="font-grotesk font-medium text-text-primary text-sm group-hover:text-gold transition-colors duration-300">
        {skill.name}
      </span>
      <LevelBars level={skill.level} />
      <span className="font-grotesk text-xs text-text-secondary/60 mt-0.5">
        {t(`skills.levels.${skill.level}`)}
      </span>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="gold-border-card p-4 space-y-2">
      <div className="h-3 bg-border rounded animate-pulse w-3/4" />
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1 w-4 rounded-full bg-border animate-pulse" />
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

  const categories = ['frontend', 'backend', 'mobile', 'tools'];

  return (
    <section id="skills" ref={sectionRef} className="py-24 md:py-32 bg-bg-primary relative overflow-hidden">
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
          <p className="section-label mb-4">{t('skills.section_label')}</p>
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

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="h-5 bg-border rounded animate-pulse w-24 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && skills && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, catIdx) => {
              const catSkills = skills[cat] ?? [];
              if (catSkills.length === 0) return null;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: catIdx * 0.1 }}
                >
                  <h3 className="font-syne font-bold text-gold text-lg mb-5 pb-2 border-b border-border">
                    {t(`skills.categories.${cat}`) || cat}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {catSkills.map((skill, i) => (
                      <SkillCard key={skill.id} skill={skill} index={i} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
