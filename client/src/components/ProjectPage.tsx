import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Github, Calendar, MapPin, User,
  Loader2, X, ChevronLeft, ChevronRight, ZoomIn,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';

function formatDate(dateStr: string | null, presentLabel: string): string {
  if (!dateStr) return presentLabel;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/* ── Lightbox ───────────────────────────────────────────── */
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: { id: number; image_url: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50 z-20">
        {idx + 1} / {images.length}
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          src={images[idx].image_url}
          alt={`Screenshot ${idx + 1}`}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </motion.div>
  );
}

/* ── Project Page ───────────────────────────────────────── */
export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, loading } = useApi<Project>(`/api/projects/${id}`);
  const { t, pick } = useTranslation();

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages = project
    ? [
        ...(project.cover_image ? [{ id: 0, image_url: project.cover_image }] : []),
        ...(project.images ?? []),
      ]
    : [];

  const displayTitle       = pick(project, 'title');
  const displayDescription = pick(project, 'description');
  const displayRole        = pick(project, 'role');
  const displayContext     = pick(project, 'context');

  // Reset index when project loads
  useEffect(() => { setActiveIdx(0); }, [project?.id]);

  // Scroll to top
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 size={36} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 text-text-secondary">
        <p className="font-grotesk text-lg">Project not found.</p>
        <Link to="/#projects" className="text-gold hover:underline font-grotesk text-sm flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to projects
        </Link>
      </div>
    );
  }

  const currentImage = allImages[activeIdx];

  return (
    <>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        {/* ── Top bar ── */}
        <div className="w-full px-[10%] pt-8 pb-6">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors font-grotesk text-sm mb-8"
          >
            <ArrowLeft size={14} />
            {t('projects.section_label')}
          </Link>

          {/* Status + title */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-grotesk font-medium px-2.5 py-0.5 rounded-full ${
                project.status === 'in_progress'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-green-500/15 text-green-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
              {project.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_completed')}
            </span>
          </div>

          <h1 className="font-syne font-bold text-3xl md:text-4xl text-text-primary mb-4">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-text-secondary font-grotesk">
            {project.date_start && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gold" />
                {formatDate(project.date_start, t('projects.period'))} – {formatDate(project.date_end, t('experience.present'))}
              </div>
            )}
            {displayRole    && <div className="flex items-center gap-1.5"><User   size={13} className="text-gold" />{displayRole}</div>}
            {displayContext && <div className="flex items-center gap-1.5"><MapPin size={13} className="text-gold" />{displayContext}</div>}
          </div>
        </div>

        {/* ── Gallery ── */}
        {allImages.length > 0 && (
          <div className="w-full px-[10%] mb-10">
            {/* Main image */}
            <div
              className="relative bg-bg-card border border-border rounded-xl overflow-hidden flex items-center justify-center cursor-zoom-in group"
              style={{ maxHeight: '65vh' }}
              onClick={() => setLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={currentImage.image_url}
                  alt={`${displayTitle} — screenshot ${activeIdx + 1}`}
                  className="w-full object-contain"
                  style={{ maxHeight: '65vh' }}
                  draggable={false}
                />
              </AnimatePresence>

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 text-white/70 rounded-lg px-2.5 py-1 text-xs font-grotesk flex items-center gap-1.5">
                <ZoomIn size={12} /> Fullscreen
              </div>

              {/* Nav arrows (if multiple) */}
              {allImages.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:border-gold/50 hover:text-gold transition-all duration-200"
                    onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length); }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:border-gold/50 hover:text-gold transition-all duration-200"
                    onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i + 1) % allImages.length); }}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div
                    className="absolute bottom-3 left-3 text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#c9a96e' }}
                  >
                    {activeIdx + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveIdx(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      i === activeIdx
                        ? 'border-gold opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Details ── */}
        <div className="w-full px-[10%] pb-24">
          <div className="max-w-3xl space-y-8">

            {/* Overview */}
            <div>
              <h2 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-4">Overview</h2>
              <div className="space-y-4">
                {displayDescription?.split('\n\n').map((para, i) => (
                  <p key={i} className="font-grotesk text-base text-text-secondary leading-relaxed">{para}</p>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            {project.technologies.length > 0 && (
              <div>
                <h2 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-4">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech.id}
                      className="tech-badge flex items-center gap-1.5"
                      style={{ backgroundColor: tech.color + '25', color: tech.color, border: `1px solid ${tech.color}40` }}
                    >
                      {tech.icon_url && (
                        <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                      )}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(project.demo_url || project.github_url || project.other_url) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {project.demo_url   && (
                  <a href={project.demo_url}   target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                    <ExternalLink size={14} />{t('projects.view_demo')}
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                    <Github size={14} />{t('projects.view_code')}
                  </a>
                )}
                {project.other_url  && (
                  <a href={project.other_url}  target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                    <ExternalLink size={14} />{project.other_url_label ?? 'View More'}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={allImages}
            startIndex={activeIdx}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
