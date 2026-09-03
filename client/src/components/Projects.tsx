import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Github, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { techBadgeStyle } from '../utils/color';

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-grotesk font-medium ${
        status === 'in_progress'
          ? 'bg-amber-500/15 text-amber-700'
          : 'bg-green-500/15 text-green-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
      {status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_completed')}
    </span>
  );
}

function formatDate(dateStr: string | null, presentLabel: string): string {
  if (!dateStr) return presentLabel;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t, pick } = useTranslation();
  const displayTitle = pick(project, 'title');
  const displayDescription = pick(project, 'description');
  const displayRole = pick(project, 'role');

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="gold-border-card group overflow-hidden flex flex-col relative cursor-pointer"
    >
      {/* Cover image */}
      <div className="relative overflow-hidden bg-bg-secondary aspect-video flex-shrink-0">
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-card">
            <div className="text-center">
              <div
                className="text-5xl font-syne font-bold text-gold/30 mb-2"
                aria-hidden
              >
                {displayTitle.charAt(0)}
              </div>
              <div className="text-xs text-text-secondary/70 font-grotesk">No preview</div>
            </div>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-syne font-bold text-lg text-text-primary group-hover:text-gold transition-colors duration-300 leading-tight">
            {displayTitle}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {project.date_start && (
          <div className="flex items-center gap-1.5 text-text-secondary/85 text-xs font-grotesk mb-3">
            <Calendar size={11} />
            {formatDate(project.date_start, t('projects.period'))} – {formatDate(project.date_end, t('experience.present'))}
          </div>
        )}

        <p className="font-grotesk text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2 flex-1">
          {displayDescription?.split('\n')[0]}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech.id}
              className="tech-badge flex items-center gap-1"
              style={techBadgeStyle(tech.color)}
            >
              {tech.icon_url && (
                <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
              )}
              {tech.name}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="tech-badge bg-border text-text-secondary">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-grotesk text-xs text-text-secondary/85">
            {displayRole}
          </span>
          <div className="flex items-center gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary/85 hover:text-gold transition-colors"
                aria-label={t('projects.view_code')}
              >
                <Github size={14} />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary/85 hover:text-gold transition-colors"
                aria-label={t('projects.view_demo')}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Full card is a link */}
      <Link
        to={`/projects/${project.id}`}
        className="absolute inset-0"
        aria-label={`View ${displayTitle}`}
      />
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="gold-border-card overflow-hidden">
      <div className="aspect-video bg-bg-card animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-border rounded animate-pulse w-3/4" />
        <div className="h-3 bg-border rounded animate-pulse w-full" />
        <div className="h-3 bg-border rounded animate-pulse w-4/5" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-5 w-16 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 4;

export default function Projects() {
  const { data: projects, loading, error } = useApi<Project[]>('/api/projects');
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? (projects ?? []) : (projects ?? []).slice(0, INITIAL_VISIBLE);
  const hasMore = (projects?.length ?? 0) > INITIAL_VISIBLE;

  return (
    <section id="projects" ref={sectionRef} className="py-24 md:py-32 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      <div className="w-full px-[10%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-4">{t('projects.portfolio_label')}</p>
          <h2 className="section-title">
            {t('projects.featured_label')}{' '}
            <span className="text-gold italic">{t('projects.section_label')}</span>
          </h2>
        </motion.div>

        {error && (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-lg mb-2">Unable to load projects</p>
            <p className="text-sm">Please check your connection and try again.</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && projects && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visible.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>

            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
                className="flex justify-center mt-10"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-grotesk font-medium text-sm transition-all duration-300"
                  style={{
                    background: 'transparent',
                    border: '1px solid #a8552e50',
                    color: '#a8552e',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#a8552e15';
                    (e.currentTarget as HTMLElement).style.borderColor = '#a8552e';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = '#a8552e50';
                  }}
                >
                  {showAll ? (
                    <><ChevronUp size={16} /> {t('projects.see_less')}</>
                  ) : (
                    <><ChevronDown size={16} /> {t('projects.see_more')}</>
                  )}
                </button>
              </motion.div>
            )}
          </>
        )}

        {!loading && !error && projects?.length === 0 && (
          <div className="text-center py-16 text-text-secondary/85 font-grotesk text-sm">
            <p>{t('projects.empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
