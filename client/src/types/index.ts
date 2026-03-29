export interface Technology {
  id: number;
  name: string;
  color: string;
  icon_url?: string | null;
}

export interface ProjectImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface Project {
  id: number;
  title: string;
  title_fr: string | null;
  description: string;
  description_fr: string | null;
  cover_image: string | null;
  role: string;
  role_fr: string | null;
  context: string;
  context_fr: string | null;
  date_start: string | null;
  date_end: string | null;
  status: 'completed' | 'in_progress';
  demo_url: string | null;
  github_url: string | null;
  other_url: string | null;
  other_url_label: string | null;
  is_visible: boolean;
  sort_order: number;
  technologies: Technology[];
  images?: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  job_title: string;
  job_title_fr: string | null;
  company: string;
  company_logo: string | null;
  date_start: string;
  date_end: string | null;
  location: string;
  work_type: 'remote' | 'on-site' | 'hybrid';
  description: string;
  description_fr: string | null;
  is_visible: boolean;
  sort_order: number;
  technologies: Technology[];
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'tools';
  level: 1 | 2 | 3;
  level_percent: number;
  icon_name: string;
  sort_order: number;
  is_visible: boolean;
  technology_id?: number | null;
  icon_url?: string | null;
  color?: string | null;
}

export interface SkillsGrouped {
  frontend?: Skill[];
  backend?: Skill[];
  mobile?: Skill[];
  tools?: Skill[];
  [key: string]: Skill[] | undefined;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  title_fr: string | null;
  subtitle: string;
  subtitle_fr: string | null;
  about_text: string;
  about_text_fr: string | null;
  photo_url: string | null;
  cv_url: string | null;
  cv_url_fr: string | null;
  years_experience: number;
  projects_count: number;
  email: string;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  maintenance_message_fr: string | null;
  updated_at: string;
}

export interface ContactFormData {
  sender_name: string;
  sender_email: string;
  message: string;
}
