-- Admin user
CREATE TABLE IF NOT EXISTS admin_user (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile info
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Abdourahmane Touré',
  title VARCHAR(255) DEFAULT 'Full Stack JavaScript Developer',
  title_fr VARCHAR(255),
  subtitle VARCHAR(500),
  subtitle_fr VARCHAR(500),
  about_text TEXT,
  about_text_fr TEXT,
  photo_url VARCHAR(500),
  cv_url VARCHAR(500),
  years_experience INTEGER DEFAULT 4,
  projects_count INTEGER DEFAULT 10,
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  twitter_url VARCHAR(500),
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255),
  description TEXT,
  description_fr TEXT,
  cover_image VARCHAR(500),
  role VARCHAR(255),
  role_fr VARCHAR(255),
  context VARCHAR(255),
  context_fr VARCHAR(255),
  date_start DATE,
  date_end DATE,
  status VARCHAR(50) DEFAULT 'completed',
  demo_url VARCHAR(500),
  github_url VARCHAR(500),
  other_url VARCHAR(500),
  other_url_label VARCHAR(100),
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project images (for carousel)
CREATE TABLE IF NOT EXISTS project_images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Technologies
CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#2b6cb0'
);

-- Project technologies (many-to-many)
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  job_title_fr VARCHAR(255),
  company VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  date_start DATE NOT NULL,
  date_end DATE,
  location VARCHAR(255),
  work_type VARCHAR(50) DEFAULT 'on-site',
  description TEXT,
  description_fr TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Experience technologies
CREATE TABLE IF NOT EXISTS experience_technologies (
  experience_id INTEGER REFERENCES experiences(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, technology_id)
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 2,
  icon_name VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
