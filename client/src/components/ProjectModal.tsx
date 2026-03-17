import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Calendar, MapPin, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectModalProps {
  projectId: number;
  onClose: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
};

const AUTO_DELAY = 4500;

export default function ProjectModal({ projectId, onClose }: ProjectModalProps) {
  const { data: project, loading } = useApi<Project>(`/api/projects/${projectId}`);
  const [imgIdx, setImgIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const { t, pick } = useTranslation();

  const allImages = project
    ? [
        ...(project.cover_image ? [{ id: 0, image_url: project.cover_image, sort_order: -1 }] : []),
        ...(project.images ?? []),
      ]
    : [];

  // Auto-slide
  useEffect(() => {
    if (allImages.length <= 1 || paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setImgIdx((i) => (i + 1) % allImages.length);
    }, AUTO_DELAY);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages.length, paused, timerKey]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { setDirection(1);  setImgIdx((i) => (i + 1) % allImages.length); setTimerKey((k) => k + 1); }
      if (e.key === 'ArrowLeft')  { setDirection(-1); setImgIdx((i) => (i - 1 + allImages.length) % allImages.length); setTimerKey((k) => k + 1); }
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, allImages.length]);

  const handleNext = () => { setDirection(1);  setImgIdx((i) => (i + 1) % allImages.length); setTimerKey((k) => k + 1); };
  const handlePrev = () => { setDirection(-1); setImgIdx((i) => (i - 1 + allImages.length) % allImages.length); setTimerKey((k) => k + 1); };

  const currentImage = allImages[imgIdx];
  const displayTitle       = pick(project, 'title');
  const displayDescription = pick(project, 'description');
  const displayRole        = pick(project, 'role');
  const displayContext     = pick(project, 'context');

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : t('experience.present');

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(10,10,15,0.88)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="relative bg-bg-card border border-border rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-bg-secondary border border-border text-text-secondary hover:text-gold hover:border-gold transition-all duration-300"
          >
            <X size={16} />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="text-gold animate-spin" />
            </div>
          ) : project ? (
            <div className="flex flex-col md:flex-row" style={{ maxHeight: '90vh' }}>

              {/* ── LEFT: Image slider ── */}
              <div
                className="relative overflow-hidden bg-black flex-shrink-0"
                style={{ width: '100%', height: '260px' }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* On desktop override to 50% width & full height via injected style */}
                <style>{`
                  @media (min-width: 768px) {
                    .pm-img-side { width: 50% !important; height: 90vh !important; max-height: 90vh !important; }
                  }
                `}</style>
                <div className="pm-img-side absolute inset-0 overflow-hidden">
                  {currentImage ? (
                    <>
                      <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img
                          key={imgIdx}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                          src={currentImage.image_url}
                          alt={`${displayTitle} ${imgIdx + 1}`}
                          className="absolute inset-0 w-full h-full"
                          style={{ objectFit: 'cover', objectPosition: 'center top' }}
                          draggable={false}
                        />
                      </AnimatePresence>

                      {/* Vignette */}
                      <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                        style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />

                      {allImages.length > 1 && (
                        <>
                          <button onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                            style={{ background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }}
                            onMouseEnter={(e)=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='rgba(201,169,110,0.25)'; b.style.borderColor='#c9a96e'; b.style.color='#c9a96e'; }}
                            onMouseLeave={(e)=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='rgba(0,0,0,0.55)'; b.style.borderColor='rgba(255,255,255,0.1)'; b.style.color='#fff'; }}
                          ><ChevronLeft size={16} /></button>

                          <button onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                            style={{ background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }}
                            onMouseEnter={(e)=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='rgba(201,169,110,0.25)'; b.style.borderColor='#c9a96e'; b.style.color='#c9a96e'; }}
                            onMouseLeave={(e)=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='rgba(0,0,0,0.55)'; b.style.borderColor='rgba(255,255,255,0.1)'; b.style.color='#fff'; }}
                          ><ChevronRight size={16} /></button>

                          {/* Progress + counter */}
                          <div className="absolute bottom-3 left-0 right-0 z-10 flex flex-col items-center gap-1.5 px-4">
                            <div className="w-full h-px rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.15)' }}>
                              {!paused && (
                                <motion.div
                                  key={`${imgIdx}-${timerKey}`}
                                  className="h-full rounded-full"
                                  style={{ background:'#c9a96e' }}
                                  initial={{ width:'0%' }}
                                  animate={{ width:'100%' }}
                                  transition={{ duration: AUTO_DELAY / 1000, ease:'linear' }}
                                />
                              )}
                            </div>
                            <span className="text-xs font-mono" style={{ color:'rgba(255,255,255,0.55)' }}>
                              {imgIdx + 1} / {allImages.length}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-card">
                      <div className="text-7xl font-syne font-bold text-gold/10 select-none">{displayTitle.charAt(0)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Project details ── */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-5" style={{ minWidth: 0 }}>
                {/* Status + title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-grotesk font-medium px-2 py-0.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                      {project.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_completed')}
                    </span>
                  </div>
                  <h2 className="font-syne font-bold text-2xl md:text-3xl text-text-primary">{displayTitle}</h2>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary font-grotesk">
                  {project.date_start && (
                    <div className="flex items-center gap-1.5"><Calendar size={13} className="text-gold" />{formatDate(project.date_start)} – {formatDate(project.date_end)}</div>
                  )}
                  {displayRole    && <div className="flex items-center gap-1.5"><User    size={13} className="text-gold" />{displayRole}</div>}
                  {displayContext && <div className="flex items-center gap-1.5"><MapPin  size={13} className="text-gold" />{displayContext}</div>}
                </div>

                <div className="h-px bg-border" />

                {/* Description */}
                <div>
                  <h3 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-3">Overview</h3>
                  <div className="space-y-3">
                    {displayDescription?.split('\n\n').map((para, i) => (
                      <p key={i} className="font-grotesk text-sm text-text-secondary leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies.length > 0 && (
                  <div>
                    <h3 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech.id} className="tech-badge"
                          style={{ backgroundColor: tech.color + '25', color: tech.color, border: `1px solid ${tech.color}40` }}>
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(project.demo_url || project.github_url || project.other_url) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {project.demo_url   && <a href={project.demo_url}   target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-4"><ExternalLink size={14}/>{t('projects.view_demo')}</a>}
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4"><Github size={14}/>{t('projects.view_code')}</a>}
                    {project.other_url  && <a href={project.other_url}  target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4"><ExternalLink size={14}/>{project.other_url_label ?? 'View More'}</a>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-secondary"><p>Project not found.</p></div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
