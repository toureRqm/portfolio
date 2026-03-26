import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Experience } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const ACCENTS = ['#c9a96e', '#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c'];

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

const CARD_W = 300;
const CARD_H = 270;
const STEP = 248; // distance between card centers

export default function Experiences() {
  const { data: experiences, loading, error } = useApi<Experience[]>('/api/experiences');
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t, pick } = useTranslation();

  const total = experiences?.length ?? 0;
  const goTo = (i: number) => setActiveIdx(Math.max(0, Math.min(total - 1, i)));

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(activeIdx - 1);
      if (e.key === 'ArrowRight') goTo(activeIdx + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx, total]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('experience.present');
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const activeExp = experiences?.[activeIdx] ?? null;
  const activeAccent = ACCENTS[activeIdx % ACCENTS.length];
  const activeJobTitle = activeExp ? pick(activeExp, 'job_title') : '';
  const activeDesc = activeExp ? pick(activeExp, 'description') : '';
  const activeBullets = activeDesc ? activeDesc.split('\n').filter((l) => l.trim()) : [];

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#07070e' }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Color radial following active accent */}
        <motion.div
          animate={{ background: `radial-gradient(ellipse 70% 50% at 50% 55%, ${activeAccent}0c 0%, transparent 70%)` }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        />
        {/* Left + right fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-40 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #07070e, transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-40 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #07070e, transparent)' }}
        />
      </div>

      <div className="relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 px-6"
        >
          <p className="section-label mb-4">Career</p>
          <h2 className="section-title">
            Work <span className="text-gold italic">{t('experience.section_label')}</span>
          </h2>
        </motion.div>

        {error && (
          <div className="text-center py-12 text-text-secondary px-6">
            <p>Unable to load experiences. Please try again later.</p>
          </div>
        )}

        {/* ── 3D Carousel ── */}
        {!loading && !error && experiences && experiences.length > 0 && (
          <>
            {/* Stage */}
            <div
              style={{
                perspective: '900px',
                perspectiveOrigin: '50% 55%',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: CARD_H + 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {experiences.map((exp, i) => {
                  const offset = i - activeIdx;
                  const abs = Math.abs(offset);
                  if (abs > 2) return null;

                  const accent = ACCENTS[i % ACCENTS.length];
                  const jobTitle = pick(exp, 'job_title');
                  const year = exp.date_start ? new Date(exp.date_start).getFullYear() : null;
                  const isActive = i === activeIdx;

                  return (
                    <motion.div
                      key={exp.id}
                      animate={{
                        x: offset * STEP,
                        rotateY: offset * -20,
                        scale: isActive ? 1 : 1 - abs * 0.11,
                        z: isActive ? 0 : -abs * 90,
                        opacity: isActive ? 1 : Math.max(0, 1 - abs * 0.42),
                      }}
                      transition={{ type: 'spring', stiffness: 240, damping: 26 }}
                      style={{
                        position: 'absolute',
                        width: CARD_W,
                        height: CARD_H,
                        cursor: isActive ? 'default' : 'pointer',
                      }}
                      onClick={() => !isActive && goTo(i)}
                    >
                      {/* Card face */}
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '1rem',
                          background: isActive
                            ? `linear-gradient(145deg, ${accent}1c 0%, #111120 55%, #0d0d1a 100%)`
                            : '#0d0d16',
                          border: `1px solid ${isActive ? accent + '55' : '#1c1c28'}`,
                          padding: '1.25rem 1.5rem 1.5rem',
                          boxShadow: isActive
                            ? `0 0 0 1px ${accent}18, 0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}10`
                            : '0 8px 32px rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'background 0.35s, border-color 0.35s, box-shadow 0.35s',
                        }}
                      >
                        {/* Top accent stripe */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, transparent 0%, ${accent} 40%, ${accent} 60%, transparent 100%)`,
                            opacity: isActive ? 1 : 0.2,
                            transition: 'opacity 0.3s',
                          }}
                        />

                        {/* Traffic light dots */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                          {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
                            <div
                              key={c}
                              style={{
                                width: 9, height: 9, borderRadius: '50%',
                                background: isActive ? c : c + '30',
                                transition: 'background 0.3s',
                              }}
                            />
                          ))}
                        </div>

                        {/* Year — large watermark style */}
                        <div
                          style={{
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 900,
                            fontSize: '3.2rem',
                            lineHeight: 1,
                            letterSpacing: '-0.05em',
                            color: isActive ? accent : accent + '28',
                            userSelect: 'none',
                            transition: 'color 0.35s',
                          }}
                        >
                          {year ?? '—'}
                        </div>

                        {/* Job info */}
                        <div style={{ marginTop: 'auto' }}>
                          <p
                            style={{
                              fontFamily: 'Syne, sans-serif',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              lineHeight: 1.35,
                              color: isActive ? '#f1f5f9' : '#3b4060',
                              transition: 'color 0.3s',
                            }}
                          >
                            {jobTitle}
                          </p>
                          <p
                            style={{
                              fontFamily: 'Space Grotesk, sans-serif',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: isActive ? accent : accent + '40',
                              marginTop: '0.25rem',
                              transition: 'color 0.35s',
                            }}
                          >
                            {exp.company}
                          </p>
                          <p
                            style={{
                              fontFamily: 'Space Grotesk, sans-serif',
                              fontSize: '0.7rem',
                              color: '#2e3050',
                              marginTop: '0.4rem',
                            }}
                          >
                            {formatDate(exp.date_start)} – {formatDate(exp.date_end)}
                          </p>
                        </div>

                        {/* Bottom glow line */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0, left: '20%', right: '20%',
                            height: 1,
                            background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 0.4s',
                          }}
                        />
                      </div>

                      {/* Floor reflection */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0, right: 0,
                            height: 60,
                            background: `linear-gradient(to bottom, ${accent}08 0%, transparent 100%)`,
                            transform: 'scaleY(-1)',
                            transformOrigin: 'top',
                            borderRadius: '0 0 1rem 1rem',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Navigation ── */}
            <div className="flex items-center justify-center gap-4 mt-6 px-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goTo(activeIdx - 1)}
                disabled={activeIdx === 0}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#13131e', border: '1px solid #252535',
                  color: activeIdx === 0 ? '#252535' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                <ChevronLeft size={16} />
              </motion.button>

              <div className="flex items-center gap-2">
                {experiences.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => goTo(i)}
                    animate={{
                      width: i === activeIdx ? 28 : 8,
                      background: i === activeIdx ? activeAccent : '#252535',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goTo(activeIdx + 1)}
                disabled={activeIdx === total - 1}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#13131e', border: '1px solid #252535',
                  color: activeIdx === total - 1 ? '#252535' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: activeIdx === total - 1 ? 'not-allowed' : 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            {/* ── Detail panel ── */}
            <div className="max-w-2xl mx-auto px-6 mt-12">
              <AnimatePresence mode="wait">
                {activeExp && (
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: '#0f0f1c',
                      border: `1px solid ${activeAccent}30`,
                      borderRadius: '1.25rem',
                      padding: '1.75rem',
                      boxShadow: `0 0 0 1px ${activeAccent}10, 0 16px 60px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* Detail header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <div
                            style={{ width: 3, height: 22, borderRadius: 2, background: activeAccent, flexShrink: 0 }}
                          />
                          <h3 className="font-syne font-bold text-white text-lg leading-tight">{activeJobTitle}</h3>
                        </div>
                        <p
                          className="font-grotesk font-semibold text-sm"
                          style={{ color: activeAccent, marginLeft: '1.375rem' }}
                        >
                          {activeExp.company}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-grotesk">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <Calendar size={10} style={{ color: activeAccent }} />
                          {formatDate(activeExp.date_start)} – {formatDate(activeExp.date_end)}
                        </span>
                        {activeExp.location && (
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <MapPin size={10} style={{ color: activeAccent }} />
                            {activeExp.location}
                          </span>
                        )}
                        <span
                          style={{
                            background: activeAccent + '18',
                            border: `1px solid ${activeAccent}35`,
                            color: activeAccent,
                            padding: '0.15rem 0.65rem',
                            borderRadius: '1rem',
                          }}
                        >
                          {WORK_TYPE_LABELS[activeExp.work_type] ?? activeExp.work_type}
                        </span>
                      </div>
                    </div>

                    {/* Bullets */}
                    {activeBullets.length > 0 && (
                      <ul className="space-y-2.5 mb-5">
                        {activeBullets.map((bullet, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex gap-3 text-sm text-text-secondary font-grotesk leading-relaxed"
                          >
                            <span
                              style={{
                                flexShrink: 0, marginTop: '0.45rem',
                                width: 6, height: 6, borderRadius: '50%',
                                background: activeAccent,
                              }}
                            />
                            <span>{bullet.replace(/^[•\-]\s*/, '')}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {/* Tech badges */}
                    {activeExp.technologies.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5 pt-4"
                        style={{ borderTop: '1px solid #1a1a28' }}
                      >
                        {activeExp.technologies.map((tech) => (
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
                              <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain" />
                            )}
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="flex justify-center gap-5 px-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: CARD_W, height: CARD_H,
                  borderRadius: '1rem',
                  background: '#0d0d16',
                  border: '1px solid #1c1c28',
                  opacity: i === 1 ? 1 : 0.5,
                  transform: i === 0 ? 'rotateY(20deg) scale(0.88)' : i === 2 ? 'rotateY(-20deg) scale(0.88)' : 'none',
                }}
                className="animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && !error && experiences?.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <p>No experiences to display yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
