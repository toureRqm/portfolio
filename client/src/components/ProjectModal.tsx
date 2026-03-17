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

export default function ProjectModal({ projectId, onClose }: ProjectModalProps) {
  const { data: project, loading } = useApi<Project>(`/api/projects/${projectId}`);
  const [imgIdx, setImgIdx] = useState(0);
  const { t, pick } = useTranslation();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const allImages = project
    ? [
        ...(project.cover_image ? [{ id: 0, image_url: project.cover_image, sort_order: -1 }] : []),
        ...(project.images ?? []),
      ]
    : [];

  const currentImage = allImages[imgIdx];

  const displayTitle = pick(project, 'title');
  const displayDescription = pick(project, 'description');
  const displayRole = pick(project, 'role');
  const displayContext = pick(project, 'context');

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return t('experience.present');
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
          {/* Close button */}
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
              {/* Left — Image */}
              <div className="md:w-1/2 flex-shrink-0 bg-bg-secondary flex items-center justify-center relative overflow-hidden"
                style={{ minHeight: '240px' }}>
                {currentImage ? (
                  <>
                    <img
                      src={currentImage.image_url}
                      alt={`${displayTitle} screenshot`}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '60vh' }}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-card/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-gold transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-card/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-gold transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {allImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImgIdx(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                i === imgIdx ? 'bg-gold w-4' : 'bg-text-secondary/40'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-7xl font-syne font-bold text-gold/10 select-none">
                    {displayTitle.charAt(0)}
                  </div>
                )}
              </div>

              {/* Right — Details */}
              <div className="md:w-1/2 overflow-y-auto p-6 md:p-8 flex flex-col gap-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-grotesk font-medium px-2 py-0.5 rounded-full ${
                        project.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-green-500/15 text-green-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                      {project.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_completed')}
                    </span>
                  </div>
                  <h2 className="font-syne font-bold text-2xl md:text-3xl text-text-primary">
                    {displayTitle}
                  </h2>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary font-grotesk">
                  {project.date_start && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gold" />
                      {formatDate(project.date_start)} – {formatDate(project.date_end)}
                    </div>
                  )}
                  {displayRole && (
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-gold" />
                      {displayRole}
                    </div>
                  )}
                  {displayContext && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gold" />
                      {displayContext}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Description */}
                <div>
                  <h3 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-3">
                    Overview
                  </h3>
                  <div className="space-y-3">
                    {displayDescription?.split('\n\n').map((para, i) => (
                      <p key={i} className="font-grotesk text-sm text-text-secondary leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies.length > 0 && (
                  <div>
                    <h3 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-3">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="tech-badge"
                          style={{ backgroundColor: tech.color + '25', color: tech.color, border: `1px solid ${tech.color}40` }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(project.demo_url || project.github_url || project.other_url) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <ExternalLink size={14} />
                        {t('projects.view_demo')}
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4"
                      >
                        <Github size={14} />
                        {t('projects.view_code')}
                      </a>
                    )}
                    {project.other_url && (
                      <a
                        href={project.other_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4"
                      >
                        <ExternalLink size={14} />
                        {project.other_url_label ?? 'View More'}
                      </a>
                    )}
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
