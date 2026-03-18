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

const AUTO_SLIDE_MS = 4000;

export default function ProjectModal({ projectId, onClose }: ProjectModalProps) {
  const { data: project, loading } = useApi<Project>(`/api/projects/${projectId}`);
  const [imgIdx, setImgIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const { t, pick } = useTranslation();

  const allImages = project
    ? [
        ...(project.cover_image ? [{ id: 0, image_url: project.cover_image, sort_order: -1 }] : []),
        ...(project.images ?? []),
      ]
    : [];

  const goNext = () => {
    if (allImages.length <= 1) return;
    setDirection(1);
    setImgIdx((i) => (i + 1) % allImages.length);
    setTimerKey((k) => k + 1);
  };

  const goPrev = () => {
    if (allImages.length <= 1) return;
    setDirection(-1);
    setImgIdx((i) => (i - 1 + allImages.length) % allImages.length);
    setTimerKey((k) => k + 1);
  };

  // Preload all images as soon as they're available
  useEffect(() => {
    allImages.forEach(({ image_url }) => {
      const img = new Image();
      img.src = image_url;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages.length]);

  // Auto-slide
  useEffect(() => {
    if (allImages.length <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setImgIdx((i) => (i + 1) % allImages.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerKey, allImages.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, imgIdx, allImages.length]);

  const currentImage = allImages[imgIdx];
  const displayTitle       = pick(project, 'title');
  const displayDescription = pick(project, 'description');
  const displayRole        = pick(project, 'role');
  const displayContext     = pick(project, 'context');

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return t('experience.present');
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(10,10,15,0.85)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="relative bg-bg-card border border-border rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
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
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">

              {/* Left — Image slider */}
              <div
                className="md:w-1/2 flex-shrink-0 bg-bg-secondary relative overflow-hidden"
                style={{ minHeight: '240px' }}
              >
                {currentImage ? (
                  <>
                    <div className="absolute inset-0 overflow-hidden">
                      <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img
                          key={imgIdx}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.28, ease: 'easeInOut' }}
                          src={currentImage.image_url}
                          alt={`${displayTitle} screenshot ${imgIdx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                        />
                      </AnimatePresence>
                    </div>

                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={goPrev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/70 hover:border-gold/50 hover:text-gold transition-all duration-200"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={goNext}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/70 hover:border-gold/50 hover:text-gold transition-all duration-200"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <div
                          className="absolute bottom-3 right-3 z-10 text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.55)', color: '#c9a96e' }}
                        >
                          {imgIdx + 1} / {allImages.length}
                        </div>
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
                          <motion.div
                            key={`${imgIdx}-${timerKey}`}
                            className="h-full bg-gold"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: AUTO_SLIDE_MS / 1000, ease: 'linear' }}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-7xl font-syne font-bold text-gold/10 select-none">{displayTitle.charAt(0)}</div>
                  </div>
                )}
              </div>

              {/* Right — Details */}
              <div className="md:w-1/2 overflow-y-auto p-6 md:p-8 flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-grotesk font-medium px-2 py-0.5 rounded-full ${
                        project.status === 'in_progress' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                      {project.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_completed')}
                    </span>
                  </div>
                  <h2 className="font-syne font-bold text-2xl md:text-3xl text-text-primary">{displayTitle}</h2>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-text-secondary font-grotesk">
                  {project.date_start && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gold" />
                      {formatDate(project.date_start)} – {formatDate(project.date_end)}
                    </div>
                  )}
                  {displayRole    && <div className="flex items-center gap-1.5"><User   size={13} className="text-gold" />{displayRole}</div>}
                  {displayContext && <div className="flex items-center gap-1.5"><MapPin size={13} className="text-gold" />{displayContext}</div>}
                </div>

                <div className="h-px bg-border" />

                <div>
                  <h3 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-3">Overview</h3>
                  <div className="space-y-3">
                    {displayDescription?.split('\n\n').map((para, i) => (
                      <p key={i} className="font-grotesk text-sm text-text-secondary leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>

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

                {(project.demo_url || project.github_url || project.other_url) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {project.demo_url   && <a href={project.demo_url}   target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-4"><ExternalLink size={14} />{t('projects.view_demo')}</a>}
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4"><Github size={14} />{t('projects.view_code')}</a>}
                    {project.other_url  && <a href={project.other_url}  target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4"><ExternalLink size={14} />{project.other_url_label ?? 'View More'}</a>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-secondary">
              <p>Project not found.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
