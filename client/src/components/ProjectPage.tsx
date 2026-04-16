import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Github, Calendar, MapPin, User,
  Loader2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';

function formatDate(dateStr: string | null, presentLabel: string): string {
  if (!dateStr) return presentLabel;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/* ── Lightbox with zoom ─────────────────────────────────── */
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

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
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % images.length);
    resetZoom();
  }, [images.length]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft'  && zoom === 1) prev();
      if (e.key === 'ArrowRight' && zoom === 1) next();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
      if (e.key === '-') setZoom((z) => { const nz = Math.max(ZOOM_MIN, z - ZOOM_STEP); if (nz === 1) setOffset({ x: 0, y: 0 }); return nz; });
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose, prev, next, zoom]);

  // Scroll wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => {
      const nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta));
      if (nz === 1) setOffset({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  // Double-click to toggle zoom
  const onDoubleClick = useCallback(() => {
    if (zoom > 1) { resetZoom(); }
    else { setZoom(2.5); }
  }, [zoom]);

  // Drag pan when zoomed
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  }, [zoom, offset]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragStart.current = null;
    setDragging(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={zoom === 1 ? onClose : undefined}
      onWheel={onWheel}
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

      {/* Zoom controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
        <button
          className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-30"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => { const nz = Math.max(ZOOM_MIN, z - ZOOM_STEP); if (nz === 1) setOffset({ x: 0, y: 0 }); return nz; }); }}
          disabled={zoom <= ZOOM_MIN}
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-xs font-mono text-white/60 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-30"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP)); }}
          disabled={zoom >= ZOOM_MAX}
        >
          <ZoomIn size={15} />
        </button>
        {zoom > 1 && (
          <button
            className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-colors ml-1"
            onClick={(e) => { e.stopPropagation(); resetZoom(); }}
          >
            <Maximize2 size={13} />
          </button>
        )}
      </div>

      {/* Image container */}
      <div
        ref={imgRef}
        className="relative"
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            src={images[idx].image_url}
            alt={`Screenshot ${idx + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              transition: dragging ? 'none' : 'transform 0.15s ease',
            }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Prev / Next — only when zoom = 1 */}
      {images.length > 1 && zoom === 1 && (
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

      {/* Zoom hint */}
      {zoom === 1 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 text-[11px] font-mono text-white/25 pointer-events-none">
          double-click or scroll to zoom
        </div>
      )}
    </motion.div>
  );
}

/* ── Project Page ───────────────────────────────────────── */
export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  useEffect(() => { setActiveIdx(0); }, [project?.id]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  // Back: go to previous page (projects section) or home if no history
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.location.href = '/#projects';
    }
  };

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
        <button onClick={handleBack} className="text-gold hover:underline font-grotesk text-sm flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to projects
        </button>
      </div>
    );
  }

  const currentImage = allImages[activeIdx];

  return (
    <>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        {/* ── Top bar ── */}
        <div className="w-full px-[10%] pt-8 pb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors font-grotesk text-sm mb-8"
          >
            <ArrowLeft size={14} />
            {t('projects.section_label')}
          </button>

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

              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 text-white/70 rounded-lg px-2.5 py-1 text-xs font-grotesk flex items-center gap-1.5">
                <ZoomIn size={12} /> Fullscreen
              </div>

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
                    <img src={img.image_url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Details ── */}
        <div className="w-full px-[10%] pb-24">
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="font-grotesk font-medium text-text-secondary text-xs tracking-widest uppercase mb-4">Overview</h2>
              <div className="space-y-4">
                {displayDescription?.split('\n\n').map((para, i) => (
                  <p key={i} className="font-grotesk text-base text-text-secondary leading-relaxed">{para}</p>
                ))}
              </div>
            </div>

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
                      {tech.icon_url && <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(project.demo_url || project.github_url || project.other_url) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {project.demo_url   && <a href={project.demo_url}   target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><ExternalLink size={14} />{t('projects.view_demo')}</a>}
                {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4 flex items-center gap-2"><Github size={14} />{t('projects.view_code')}</a>}
                {project.other_url  && <a href={project.other_url}  target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4 flex items-center gap-2"><ExternalLink size={14} />{project.other_url_label ?? 'View More'}</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox images={allImages} startIndex={activeIdx} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
