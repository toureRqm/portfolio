# PORTFOLIO — Abdou Rahmane Touré
## Cahier des charges pour Claude Code

---

## 1. VISION GLOBALE

Portfolio de développeur Full Stack JavaScript avec panel admin pour gérer tout le contenu dynamiquement. Le site doit servir de vitrine professionnelle pour décrocher des missions remote internationales.

**Positionnement :** Full Stack JavaScript Developer | React · Node.js · TypeScript
**Cible :** Recruteurs tech internationaux, CTOs de startups/scale-ups, clients freelance
**Langue :** Anglais par défaut (audience internationale), avec possibilité de switch FR

---

## 2. DESIGN & IDENTITÉ VISUELLE

### Direction artistique
Reprendre l'esthétique de la page de maintenance existante :
- **Thème sombre** (fond #0a0a0a / #111111) — PAS de fond blanc
- **Accents dorés/gold** (#c9a84c ou similaire) pour les titres, liens, bordures actives
- **Typographie :** Police display élégante pour le nom/titres (style serif italique pour "Touré"), mono/code pour les détails techniques
- **Éléments décoratifs :** Subtle code snippets en arrière-plan (`const dev = true;`), dot grids, lignes pointillées, formes géométriques subtiles
- **Effet premium :** Pas de design générique — le portfolio doit avoir du caractère

### Palette de couleurs
```
--bg-primary: #0a0a0f
--bg-secondary: #111118
--bg-card: #16161d
--text-primary: #f0f0f0
--text-secondary: #a0a0a0
--accent-gold: #c9a84c
--accent-gold-light: #e0c878
--accent-blue: #2b6cb0  (pour les liens/boutons tech)
--border: #2a2a35
--border-hover: #c9a84c
```

### Responsive
- Mobile-first obligatoire
- Breakpoints : 480px / 768px / 1024px / 1280px
- Le portfolio DOIT être impeccable sur mobile (les recruteurs regardent souvent sur téléphone)

---

## 3. STACK TECHNIQUE

### Frontend
- **React** (Vite ou Next.js)
- **TypeScript**
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- Icônes : Lucide React ou React Icons

### Backend
- **Node.js + Express**
- **PostgreSQL** (ou SQLite pour simplifier le déploiement initial)
- **JWT** pour l'authentification admin
- **Multer** pour l'upload d'images
- API REST

### Structure du projet
```
portfolio/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── styles/
│   │   └── utils/
│   └── public/
├── server/               # Backend Node.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── uploads/          # Images uploadées
│   └── config/
├── database/
│   └── schema.sql
└── README.md
```

---

## 4. PAGES DU PORTFOLIO (Frontend public)

### 4.1 — Page d'accueil (Hero)
- Grande section hero avec :
  - Nom : "Abdourahmane Touré" (avec le style de la page maintenance — nom en grand, "Touré" en italique doré)
  - Titre : "Full Stack JavaScript Developer"
  - Sous-titre dynamique avec effet typewriter : "I build web apps with React · Node.js · TypeScript"
  - CTA : "View my work" + "Download CV" (lien vers le PDF)
  - Éléments décoratifs code en arrière-plan (subtils)
- Photo de profil optionnelle (gérable depuis l'admin)

### 4.2 — Section About
- Texte de présentation (éditable depuis l'admin)
- Compteurs animés : "4+ Years Experience", "10+ Projects Delivered", "3+ Tech Stacks"
- Les chiffres sont éditables depuis l'admin

### 4.3 — Section Skills / Tech Stack
- Grille de technos avec icônes
- Catégorisées : Frontend | Backend | Mobile | Tools
- Chaque compétence a : nom, icône, niveau (débutant/intermédiaire/avancé)
- Gérables depuis l'admin (ajout/suppression/réorganisation)

### 4.4 — Section Projets (SECTION CLÉ)
- Grille de cartes projet (2-3 colonnes desktop, 1 colonne mobile)
- Chaque carte affiche :
  - Image de couverture du projet
  - Titre du projet
  - Tags des technos utilisées (petits badges)
  - Court résumé (1-2 lignes)

**Au clic sur une carte → Popup/Modal :**
- Layout : Image à gauche (ou en haut sur mobile), description à droite
- Contenu de la modal :
  - Titre du projet
  - Image(s) du projet (carousel si plusieurs images)
  - Description complète (texte riche, supportant les paragraphes)
  - Liste des technologies utilisées (badges colorés)
  - Rôle dans le projet (ex: "Lead Developer", "Frontend", "Full Stack")
  - Liens :
    - 🔗 Live Demo (URL du site/app)
    - 💻 Code Source (GitHub)
    - 📄 Autre lien personnalisé (optionnel)
  - Durée / Dates du projet
  - Client ou contexte (ex: "Freelance", "Sonatel Innovation Challenge")
- Animation d'ouverture fluide (Framer Motion)
- Fermeture au clic hors modal ou bouton X

**Projets à pré-remplir (données initiales) :**

1. **FanFlow AR**
   - Description : Application mobile AR pour la navigation crowd et l'engagement fan aux JOJ Dakar 2026
   - Stack : Flutter, Riverpod, GoRouter, Node.js, Express, Socket.IO
   - Rôle : Full Stack Developer
   - Contexte : Sonatel JOJ Innovation Challenge
   - Status : En cours

2. **Thèmes Web Admin (×3)**
   - Description : Ensemble de 3 thèmes web professionnels avec panel d'administration intégré
   - Stack : React, Node.js, HTML, PHP, JavaScript, TypeScript, SQL
   - Rôle : Full Stack Developer
   - Contexte : Conçus pour une entreprise de développement web
   - Liens : (à remplir par Abdou depuis l'admin)

3. **Sunushop Marketplace**
   - Description : Marketplace e-commerce complète avec adaptation Android
   - Stack : PHP, JavaScript, MySQL, Android Studio
   - Rôle : Full Stack Developer (Stage)
   - Contexte : DCOM Groupe

4. **Sites clients Futur Digital**
   - Description : 10+ sites web responsives livrés pour divers clients
   - Stack : JavaScript, React, PHP, HTML5, CSS3
   - Rôle : Full Stack Web Developer
   - Contexte : Futur Digital

### 4.5 — Section Expériences
- Timeline verticale (style professionnel)
- Chaque expérience affiche :
  - Titre du poste
  - Entreprise + logo (optionnel, uploadable)
  - Dates (début – fin)
  - Lieu + type (Remote / On-site / Hybrid)
  - Description (bullets)
  - Technologies utilisées (badges)
- Ordre chronologique inversé (plus récent en haut)
- Gérables depuis l'admin

**Expériences à pré-remplir :**

1. Full Stack Web Developer — Futur Digital (Avr 2023 – Fév 2026, Dakar)
2. Mobile Developer — Sendrive (2023 – 2024, Dakar)
3. Flutter Developer — Kaybic Africa (Nov 2022 – Avr 2023, Remote)
4. Full Stack Developer (Stage) — DCOM Groupe (Mai – Août 2022, Dakar)

### 4.6 — Section Contact
- Formulaire de contact simple : Nom, Email, Message
- Envoi par email (ou stockage en BDD consultable depuis l'admin)
- Liens sociaux : LinkedIn, GitHub, Email
- Texte : "Open to remote opportunities — Let's build something together"

### 4.7 — Footer
- Copyright
- Lien vers le code source du portfolio (GitHub)
- "Built with React & Node.js"

---

## 5. PANEL ADMIN (/admin)

### 5.1 — Authentification
- Page de login simple (email + mot de passe)
- JWT stocké en httpOnly cookie
- Un seul utilisateur admin (pas de registration publique)
- Credentials par défaut : admin@touretech.dev / [à changer au premier login]

### 5.2 — Dashboard
- Vue d'ensemble : nombre de projets, expériences, messages reçus, compétences
- Derniers messages de contact reçus

### 5.3 — Gestion du Profil
- Éditer : nom, titre, sous-titre, texte About
- Upload / changer la photo de profil
- Éditer les compteurs (années d'expérience, nombre de projets, etc.)
- Lien CV (upload PDF ou URL)
- Liens sociaux (LinkedIn, GitHub, Twitter/X, email)

### 5.4 — Gestion des Projets (CRUD complet)
- Liste des projets avec drag & drop pour réordonner
- Formulaire d'ajout/édition :
  - Titre
  - Description (textarea, supporte le formatage basique)
  - Image de couverture (upload)
  - Images supplémentaires (upload multiple, carousel)
  - Technologies utilisées (tags, sélection multiple ou saisie libre)
  - Rôle
  - Contexte / Client
  - Dates (début – fin)
  - Status : Terminé / En cours
  - Liens : Live Demo URL, GitHub URL, Autre URL + label
  - Visible / Brouillon (toggle)
- Suppression avec confirmation

### 5.5 — Gestion des Expériences (CRUD complet)
- Liste avec réorganisation
- Formulaire :
  - Titre du poste
  - Entreprise
  - Logo entreprise (upload, optionnel)
  - Dates (début – fin, ou "Present")
  - Lieu
  - Type : Remote / On-site / Hybrid
  - Description (bullets, textarea)
  - Technologies (tags)
  - Visible / Masqué

### 5.6 — Gestion des Compétences (CRUD)
- Liste avec catégories (Frontend, Backend, Mobile, Tools)
- Ajouter : nom, catégorie, niveau (1-3 ou débutant/intermédiaire/avancé), icône
- Réorganiser par drag & drop dans chaque catégorie
- Supprimer

### 5.7 — Messages de Contact
- Liste des messages reçus (nom, email, message, date)
- Marquer comme lu / non lu
- Supprimer

### 5.8 — Paramètres
- Changer mot de passe admin
- Mode maintenance (toggle) — affiche la page maintenance au lieu du portfolio

---

## 6. BASE DE DONNÉES

### Schema principal

```sql
-- Admin user
CREATE TABLE admin_user (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile info
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Abdou Rahmane Touré',
  title VARCHAR(255) DEFAULT 'Full Stack JavaScript Developer',
  subtitle VARCHAR(500),
  about_text TEXT,
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
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image VARCHAR(500),
  role VARCHAR(255),
  context VARCHAR(255),
  date_start DATE,
  date_end DATE,
  status VARCHAR(50) DEFAULT 'completed', -- completed, in_progress
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
CREATE TABLE project_images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Project technologies (many-to-many)
CREATE TABLE technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#2b6cb0'  -- badge color
);

CREATE TABLE project_technologies (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Experiences
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  date_start DATE NOT NULL,
  date_end DATE,  -- NULL = present
  location VARCHAR(255),
  work_type VARCHAR(50) DEFAULT 'on-site', -- remote, on-site, hybrid
  description TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Experience technologies
CREATE TABLE experience_technologies (
  experience_id INTEGER REFERENCES experiences(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, technology_id)
);

-- Skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- frontend, backend, mobile, tools
  level INTEGER DEFAULT 2, -- 1=beginner, 2=intermediate, 3=advanced
  icon_name VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- Contact messages
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. API ENDPOINTS

### Public (pas d'auth)
```
GET    /api/profile              → Infos du profil
GET    /api/projects             → Projets visibles (triés par sort_order)
GET    /api/projects/:id         → Détail d'un projet + images + technos
GET    /api/experiences          → Expériences visibles (triées)
GET    /api/skills               → Compétences visibles (groupées par catégorie)
POST   /api/contact              → Envoyer un message de contact
```

### Admin (JWT required)
```
POST   /api/auth/login           → Login admin
POST   /api/auth/logout          → Logout
GET    /api/auth/me              → Vérifier session

PUT    /api/admin/profile        → Modifier profil
POST   /api/admin/profile/photo  → Upload photo
POST   /api/admin/profile/cv     → Upload CV

GET    /api/admin/projects       → Tous les projets (y compris brouillons)
POST   /api/admin/projects       → Créer projet
PUT    /api/admin/projects/:id   → Modifier projet
DELETE /api/admin/projects/:id   → Supprimer projet
POST   /api/admin/projects/:id/images  → Upload images projet
PUT    /api/admin/projects/reorder     → Réordonner

GET    /api/admin/experiences          → Toutes les expériences
POST   /api/admin/experiences          → Créer
PUT    /api/admin/experiences/:id      → Modifier
DELETE /api/admin/experiences/:id      → Supprimer
PUT    /api/admin/experiences/reorder  → Réordonner

GET    /api/admin/skills               → Toutes les compétences
POST   /api/admin/skills               → Créer
PUT    /api/admin/skills/:id           → Modifier
DELETE /api/admin/skills/:id           → Supprimer

GET    /api/admin/messages             → Messages de contact
PUT    /api/admin/messages/:id/read    → Marquer lu
DELETE /api/admin/messages/:id         → Supprimer

PUT    /api/admin/settings/password    → Changer mot de passe
PUT    /api/admin/settings/maintenance → Toggle maintenance
```

---

## 8. ANIMATIONS & INTERACTIONS

- **Page load :** Staggered reveal des sections au scroll (Framer Motion + Intersection Observer)
- **Hero :** Typewriter effect sur le sous-titre
- **Cartes projet :** Hover avec légère élévation + changement de bordure (gold)
- **Modal projet :** Slide-in + backdrop blur
- **Timeline expériences :** Reveal progressif au scroll
- **Skills :** Barres de niveau animées au scroll
- **Compteurs About :** Count-up animation quand visible
- **Smooth scroll :** Navigation fluide entre les sections
- **Cursor :** Custom cursor optionnel (dot + outline qui suit)
- **Transitions de page :** Fade entre accueil et admin

---

## 9. SEO & PERFORMANCE

- Balises meta dynamiques (titre, description, Open Graph)
- Lazy loading des images
- Compression des images à l'upload (sharp ou similaire côté serveur)
- Sitemap.xml
- robots.txt
- Lighthouse score > 90 sur toutes les catégories

---

## 10. DONNÉES INITIALES (SEED)

Au premier lancement, le script de seed doit pré-remplir :

### Profil
- Nom : Abdou Rahmane Touré
- Titre : Full Stack JavaScript Developer
- Sous-titre : React · Node.js · TypeScript
- About : (reprendre le texte du CV anglais)
- Email : abdourahmane.toure674@gmail.com
- LinkedIn : https://www.linkedin.com/in/abdou-rahmane-touré-986358216/
- Années d'exp : 4
- Projets : 10+

### Technologies (seed)
React, Node.js, TypeScript, JavaScript, Next.js, Express, Flutter, Dart, React Native, PostgreSQL, MySQL, MongoDB, Tailwind CSS, Redux, Socket.IO, PHP, HTML5, CSS3, Git, GitHub, Docker, Figma, REST APIs

### Skills
**Frontend :** React (avancé), Next.js (intermédiaire), TypeScript (intermédiaire), Tailwind CSS (avancé), Redux (intermédiaire), HTML5/CSS3 (avancé)
**Backend :** Node.js (avancé), Express (avancé), REST APIs (avancé), Socket.IO (intermédiaire), PostgreSQL (intermédiaire), MongoDB (intermédiaire)
**Mobile :** Flutter (intermédiaire), React Native (intermédiaire)
**Tools :** Git (avancé), Docker (débutant), Figma (intermédiaire), Postman (avancé)

### Expériences (4)
Reprendre les données exactes du CV anglais.

### Projets (4)
1. FanFlow AR (en cours)
2. Thèmes Web Admin ×3 (terminé)
3. Sunushop Marketplace (terminé)
4. Sites clients Futur Digital (terminé)

---

## 11. DÉPLOIEMENT — VPS / Cloud

### Environnement cible
Le portfolio sera déployé sur un VPS cloud (Railway, Render, ou DigitalOcean).

### Configuration requise
- **Dev :** `npm run dev` (client + serveur en parallèle avec concurrently)
- **Prod :** Build React optimisé servi par Express en static, variables d'environnement
- **Docker :** Dockerfile + docker-compose.yml (obligatoire pour faciliter le déploiement)
- **.env.example** avec toutes les variables nécessaires

### Variables d'environnement (.env.example)
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/portfolio

# Auth
JWT_SECRET=change-this-to-a-random-string
ADMIN_EMAIL=admin@touretech.dev
ADMIN_DEFAULT_PASSWORD=change-on-first-login

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Optional
SITE_URL=https://abdourahmane-toure.dev
```

### Docker (docker-compose.yml)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://portfolio:password@db:5432/portfolio
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  uploads:
```

### Déploiement sur Railway / Render (le plus simple)
1. Push le code sur GitHub
2. Connecter le repo sur Railway ou Render
3. Ajouter un service PostgreSQL
4. Configurer les variables d'environnement
5. Le déploiement est automatique à chaque push

### Déploiement sur DigitalOcean (VPS classique)
1. Créer un droplet Ubuntu 24.04 ($6/mois)
2. Installer Node.js 20+, PostgreSQL 16, Nginx
3. Cloner le repo, `npm install && npm run build`
4. Configurer PM2 pour garder le serveur Node actif
5. Configurer Nginx comme reverse proxy (port 80/443 → 3000)
6. Installer Certbot pour le SSL gratuit (Let's Encrypt)
7. Configurer un nom de domaine

### Scripts package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "nodemon server/index.ts",
    "dev:client": "cd client && vite",
    "build": "cd client && vite build",
    "start": "node dist/server/index.js",
    "db:migrate": "node database/migrate.js",
    "db:seed": "node database/seed.js"
  }
}
```

---

## 12. PRIORITÉS D'IMPLÉMENTATION

### Phase 1 (MVP — faire en premier)
1. Setup projet (Vite + Express + DB)
2. Modèle de données + migrations
3. API publique (GET profil, projets, expériences, skills)
4. Frontend : Hero + About + Projets (avec modal) + Expériences + Contact
5. Design sombre avec accents dorés
6. Responsive mobile

### Phase 2 (Admin)
7. Auth admin (login + JWT)
8. Dashboard admin
9. CRUD Projets (avec upload images)
10. CRUD Expériences
11. CRUD Skills
12. Gestion profil

### Phase 3 (Polish)
13. Animations (Framer Motion)
14. SEO + meta tags
15. Messages de contact (formulaire + liste admin)
16. Mode maintenance toggle
17. Optimisations performance

---

## 13. NOTES IMPORTANTES

- Le design doit être PREMIUM — pas un template Bootstrap générique. L'esthétique sombre + or de la page de maintenance actuelle est la référence.
- Les textes et contenus doivent être 100% éditables depuis l'admin — aucun texte hardcodé dans le frontend (sauf les labels d'interface).
- Chaque projet dans la grille doit ouvrir une MODAL au clic (pas une nouvelle page), avec image(s) à gauche et détails à droite.
- L'admin doit être simple et fonctionnel — pas besoin d'un design ultra-poussé pour l'admin, l'important c'est que ça marche bien.
- Tout le portfolio est en ANGLAIS par défaut (audience internationale).
