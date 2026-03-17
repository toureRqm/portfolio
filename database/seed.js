require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('Seeding database...');

  try {
    // Admin user
    const passwordHash = await bcrypt.hash('Admin2024!', 12);
    await pool.query(`
      INSERT INTO admin_user (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@touretech.dev', passwordHash]);
    console.log('Admin user created.');

    // Profile
    await pool.query(`
      INSERT INTO profile (
        name, title, title_fr, subtitle, subtitle_fr, about_text, about_text_fr, photo_url, cv_url,
        years_experience, projects_count,
        email, linkedin_url, github_url
      ) VALUES (
        'Abdourahmane Touré',
        'Full Stack JavaScript Developer',
        'Développeur Full Stack JavaScript',
        'React · Node.js · TypeScript',
        'React · Node.js · TypeScript',
        $1,
        $2,
        '/static/media/moi.1534d679.png',
        '/static/media/CV-Abdourahmane-Toure-2.461aefb3.pdf',
        4, 10,
        'abdourahmane.toure674@gmail.com',
        'https://www.linkedin.com/in/abdou-rahmane-touré-986358216/',
        'https://github.com/abdourahmane'
      )
      ON CONFLICT DO NOTHING
    `, [
      `Passionate Full Stack JavaScript Developer with 4+ years of experience building modern web and mobile applications. I specialize in React, Node.js, and TypeScript, crafting scalable solutions from concept to deployment. My experience spans from freelance client work to startup environments, delivering 10+ responsive websites and web applications across diverse industries.\n\nI thrive in remote-first environments and love working with international teams. Whether it's architecting a Node.js backend, building interactive UIs with React, or developing cross-platform mobile apps with Flutter, I bring precision and passion to every project.`,
      `Développeur Full Stack JavaScript passionné avec 4+ ans d'expérience dans la création d'applications web et mobiles modernes. Je me spécialise en React, Node.js et TypeScript, en concevant des solutions évolutives de la conception au déploiement. Mon expérience couvre aussi bien le travail en freelance que les environnements startup, avec plus de 10 sites web et applications livrés dans des secteurs variés.\n\nJ'évolue dans des environnements remote-first et j'aime travailler avec des équipes internationales. Que ce soit pour architecturer un backend Node.js, construire des interfaces interactives avec React, ou développer des applications mobiles cross-platform avec Flutter, j'apporte précision et passion à chaque projet.`
    ]);
    console.log('Profile created.');

    // Technologies
    const technologies = [
      ['React', '#61DAFB'],
      ['Node.js', '#339933'],
      ['TypeScript', '#3178C6'],
      ['JavaScript', '#F7DF1E'],
      ['Next.js', '#000000'],
      ['Express', '#404d59'],
      ['Flutter', '#02569B'],
      ['Dart', '#0175C2'],
      ['React Native', '#61DAFB'],
      ['PostgreSQL', '#336791'],
      ['MySQL', '#4479A1'],
      ['MongoDB', '#47A248'],
      ['Tailwind CSS', '#38B2AC'],
      ['Redux', '#764ABC'],
      ['Socket.IO', '#010101'],
      ['PHP', '#777BB4'],
      ['HTML5', '#E34F26'],
      ['CSS3', '#1572B6'],
      ['Git', '#F05032'],
      ['GitHub', '#181717'],
      ['Docker', '#2496ED'],
      ['Figma', '#F24E1E'],
      ['REST APIs', '#2b6cb0'],
      ['Riverpod', '#02569B'],
      ['GoRouter', '#02569B'],
      ['Android Studio', '#3DDC84'],
      ['Postman', '#FF6C37'],
    ];

    for (const [name, color] of technologies) {
      await pool.query(
        `INSERT INTO technologies (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [name, color]
      );
    }
    console.log('Technologies seeded.');

    // Helper: get tech id by name
    const getTechId = async (name) => {
      const res = await pool.query('SELECT id FROM technologies WHERE name = $1', [name]);
      return res.rows[0]?.id;
    };

    // Projects
    const projects = [
      {
        title: 'FanFlow AR',
        title_fr: 'FanFlow AR',
        description: `FanFlow AR is an innovative augmented reality mobile application developed for the Sonatel JOJ Innovation Challenge in preparation for the Jeux Olympiques de la Jeunesse (JOJ) Dakar 2026.\n\nThe app provides real-time crowd navigation and immersive fan engagement features using AR overlays within sports venues. It helps spectators find their seats, explore event schedules, and interact with digital content anchored to their physical environment.\n\nKey features include AR wayfinding through complex stadium layouts, live fan engagement overlays, real-time socket-based updates, and cross-platform performance optimized for both Android and iOS.`,
        description_fr: `FanFlow AR est une application mobile de réalité augmentée innovante développée pour le Sonatel JOJ Innovation Challenge en préparation des Jeux Olympiques de la Jeunesse (JOJ) Dakar 2026.\n\nL'application offre une navigation en temps réel dans les foules et des fonctionnalités d'engagement des fans grâce à des superpositions AR dans les enceintes sportives. Elle aide les spectateurs à trouver leurs places, consulter les programmes et interagir avec des contenus numériques ancrés dans leur environnement physique.\n\nFonctionnalités clés : navigation AR dans les stades, superpositions d'engagement en direct, mises à jour en temps réel via sockets, et performances cross-platform optimisées pour Android et iOS.`,
        role: 'Full Stack Developer',
        role_fr: 'Développeur Full Stack',
        context: 'Sonatel JOJ Innovation Challenge',
        context_fr: 'Sonatel JOJ Innovation Challenge',
        date_start: '2024-06-01',
        date_end: null,
        status: 'in_progress',
        techs: ['Flutter', 'Riverpod', 'GoRouter', 'Node.js', 'Express', 'Socket.IO'],
        sort_order: 0,
      },
      {
        title: 'Web Admin Themes (×3)',
        title_fr: 'Thèmes Web avec Admin (×3)',
        description: `A suite of 3 professional-grade web themes, each bundled with a fully integrated administration panel. Built to serve as white-label solutions for businesses needing a modern web presence with backend content management.\n\nEach theme features a distinct visual identity while sharing a common admin architecture: user management, content CRUD, media uploads, and settings. The themes cover a corporate landing page, an agency portfolio, and an e-commerce storefront.\n\nThe admin panels are built with React and TypeScript for the frontend, Node.js/Express APIs on the backend, and SQL databases for data persistence.`,
        description_fr: `Une suite de 3 thèmes web professionnels, chacun accompagné d'un panel d'administration entièrement intégré. Conçus comme des solutions white-label pour les entreprises nécessitant une présence web moderne avec gestion de contenu backend.\n\nChaque thème possède une identité visuelle distincte tout en partageant une architecture admin commune : gestion des utilisateurs, CRUD de contenu, upload de médias et paramètres. Les thèmes couvrent une landing page corporate, un portfolio d'agence et une boutique e-commerce.\n\nLes panels admin sont construits avec React et TypeScript côté frontend, Node.js/Express pour les APIs, et des bases de données SQL pour la persistance.`,
        role: 'Full Stack Developer',
        role_fr: 'Développeur Full Stack',
        context: 'Web Development Agency',
        context_fr: 'Agence de développement web',
        date_start: '2023-06-01',
        date_end: '2024-12-01',
        status: 'completed',
        techs: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PHP', 'HTML5', 'CSS3'],
        sort_order: 1,
      },
      {
        title: 'Sunushop Marketplace',
        title_fr: 'Sunushop Marketplace',
        description: `Sunushop is a full-featured e-commerce marketplace built during an internship at DCOM Groupe. The platform enables multiple vendors to list products, manage inventory, and process orders through a unified storefront.\n\nThe project includes a responsive web application and a companion Android app, providing a seamless shopping experience across devices. Key features include product catalog with search and filters, vendor dashboards, shopping cart and checkout flow, order tracking, and an admin panel for platform management.\n\nThe Android app was developed with Android Studio, mirroring core web functionality for mobile-first users.`,
        description_fr: `Sunushop est une marketplace e-commerce complète développée lors d'un stage chez DCOM Groupe. La plateforme permet à plusieurs vendeurs de lister des produits, gérer les stocks et traiter les commandes via une vitrine unifiée.\n\nLe projet inclut une application web responsive et une app Android compagnon, offrant une expérience d'achat fluide sur tous les appareils. Fonctionnalités clés : catalogue produits avec recherche et filtres, tableaux de bord vendeurs, panier et tunnel d'achat, suivi des commandes et panel admin.\n\nL'app Android a été développée avec Android Studio, reproduisant les fonctionnalités web essentielles pour les utilisateurs mobile.`,
        role: 'Full Stack Developer (Intern)',
        role_fr: 'Développeur Full Stack (Stagiaire)',
        context: 'DCOM Groupe — Internship',
        context_fr: 'DCOM Groupe — Stage',
        date_start: '2022-05-01',
        date_end: '2022-08-01',
        status: 'completed',
        techs: ['PHP', 'JavaScript', 'MySQL', 'Android Studio', 'HTML5', 'CSS3'],
        sort_order: 2,
      },
      {
        title: 'Client Websites — Futur Digital',
        title_fr: 'Sites Clients — Futur Digital',
        description: `During my tenure at Futur Digital, I designed and developed 10+ responsive client websites spanning various sectors: corporate, hospitality, healthcare, and services.\n\nEach project involved the full delivery lifecycle — from initial client brief and wireframing in Figma, through development, to production deployment. Sites were built to be fast, accessible, and SEO-optimized.\n\nTechnologies varied per project, including React SPAs, PHP-based CMS integrations, and static HTML/CSS/JS builds. All projects were delivered on time and exceeded client expectations for design quality and performance.`,
        description_fr: `Durant mon poste chez Futur Digital, j'ai conçu et développé 10+ sites web clients responsive couvrant divers secteurs : corporate, hôtellerie, santé et services.\n\nChaque projet impliquait le cycle de livraison complet — du brief initial et wireframing sous Figma, jusqu'au développement et au déploiement en production. Les sites ont été construits pour être rapides, accessibles et optimisés SEO.\n\nLes technologies variaient selon les projets : SPAs React, intégrations CMS en PHP, et builds HTML/CSS/JS statiques. Tous les projets ont été livrés dans les délais et ont dépassé les attentes des clients en termes de qualité design et de performance.`,
        role: 'Full Stack Web Developer',
        role_fr: 'Développeur Web Full Stack',
        context: 'Futur Digital',
        context_fr: 'Futur Digital',
        date_start: '2023-04-01',
        date_end: '2026-02-01',
        status: 'completed',
        techs: ['JavaScript', 'React', 'PHP', 'HTML5', 'CSS3', 'Figma'],
        sort_order: 3,
      },
    ];

    for (const p of projects) {
      const res = await pool.query(`
        INSERT INTO projects (title, title_fr, description, description_fr, role, role_fr, context, context_fr, date_start, date_end, status, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
        RETURNING id
      `, [p.title, p.title_fr, p.description, p.description_fr, p.role, p.role_fr, p.context, p.context_fr, p.date_start, p.date_end, p.status, p.sort_order]);

      const projectId = res.rows[0].id;
      for (const techName of p.techs) {
        const techId = await getTechId(techName);
        if (techId) {
          await pool.query(
            `INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [projectId, techId]
          );
        }
      }
    }
    console.log('Projects seeded.');

    // Experiences
    const experiences = [
      {
        job_title: 'Full Stack Web Developer',
        job_title_fr: 'Développeur Web Full Stack',
        company: 'Futur Digital',
        date_start: '2023-04-01',
        date_end: '2026-02-01',
        location: 'Dakar, Senegal',
        work_type: 'on-site',
        description: `• Designed and developed 10+ responsive client websites across diverse industries\n• Led frontend architecture using React and TypeScript for SPA projects\n• Built RESTful APIs with Node.js/Express and integrated third-party services\n• Collaborated directly with clients to gather requirements and deliver solutions\n• Mentored junior developers on React best practices and code review`,
        description_fr: `• Conception et développement de 10+ sites web clients responsive dans divers secteurs\n• Direction de l'architecture frontend avec React et TypeScript pour des projets SPA\n• Création d'APIs RESTful avec Node.js/Express et intégration de services tiers\n• Collaboration directe avec les clients pour recueillir les besoins et livrer des solutions\n• Accompagnement de développeurs juniors sur les bonnes pratiques React et la revue de code`,
        techs: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PHP', 'HTML5', 'CSS3', 'Figma'],
        sort_order: 0,
      },
      {
        job_title: 'Mobile Developer',
        job_title_fr: 'Développeur Mobile',
        company: 'Sendrive',
        date_start: '2023-01-01',
        date_end: '2024-01-01',
        location: 'Dakar, Senegal',
        work_type: 'on-site',
        description: `• Developed and maintained the Sendrive mobile application using Flutter\n• Implemented real-time location tracking and ride-booking features\n• Integrated payment gateway and push notification systems\n• Optimized app performance and reduced crash rate by 40%\n• Collaborated with the backend team to design and consume REST APIs`,
        description_fr: `• Développement et maintenance de l'application mobile Sendrive avec Flutter\n• Implémentation du suivi de localisation en temps réel et des fonctionnalités de réservation de trajets\n• Intégration de la passerelle de paiement et des systèmes de notifications push\n• Optimisation des performances de l'app et réduction du taux de crash de 40%\n• Collaboration avec l'équipe backend pour concevoir et consommer des APIs REST`,
        techs: ['Flutter', 'Dart', 'Node.js', 'REST APIs'],
        sort_order: 1,
      },
      {
        job_title: 'Flutter Developer',
        job_title_fr: 'Développeur Flutter',
        company: 'Kaybic Africa',
        date_start: '2022-11-01',
        date_end: '2023-04-01',
        location: 'Remote',
        work_type: 'remote',
        description: `• Built cross-platform mobile features for Kaybic Africa's fintech application\n• Implemented state management with Riverpod and navigation with GoRouter\n• Worked in an Agile team with bi-weekly sprint cycles\n• Wrote unit and widget tests to maintain code quality\n• Contributed to UI/UX improvements based on user feedback`,
        description_fr: `• Développement de fonctionnalités mobiles cross-platform pour l'application fintech de Kaybic Africa\n• Implémentation de la gestion d'état avec Riverpod et de la navigation avec GoRouter\n• Travail en équipe Agile avec des cycles de sprint bi-hebdomadaires\n• Écriture de tests unitaires et de widget tests pour maintenir la qualité du code\n• Contribution aux améliorations UI/UX basées sur les retours utilisateurs`,
        techs: ['Flutter', 'Dart', 'Riverpod', 'GoRouter', 'REST APIs'],
        sort_order: 2,
      },
      {
        job_title: 'Full Stack Developer',
        job_title_fr: 'Développeur Full Stack',
        company: 'DCOM Groupe',
        date_start: '2022-05-01',
        date_end: '2022-08-01',
        location: 'Dakar, Senegal',
        work_type: 'on-site',
        description: `• Developed Sunushop, a multi-vendor e-commerce marketplace from scratch\n• Built the web application with PHP/MySQL backend and a responsive frontend\n• Created a companion Android app using Android Studio\n• Implemented product management, cart, checkout, and order tracking systems\n• Delivered full documentation and handover to the operations team`,
        description_fr: `• Développement de Sunushop, une marketplace e-commerce multi-vendeurs from scratch\n• Construction de l'application web avec un backend PHP/MySQL et un frontend responsive\n• Création d'une app Android compagnon avec Android Studio\n• Implémentation de la gestion des produits, du panier, du tunnel d'achat et du suivi des commandes\n• Livraison de la documentation complète et transfert de compétences à l'équipe opérationnelle`,
        techs: ['PHP', 'JavaScript', 'MySQL', 'Android Studio', 'HTML5', 'CSS3'],
        sort_order: 3,
      },
    ];

    for (const e of experiences) {
      const res = await pool.query(`
        INSERT INTO experiences (job_title, job_title_fr, company, date_start, date_end, location, work_type, description, description_fr, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
        RETURNING id
      `, [e.job_title, e.job_title_fr, e.company, e.date_start, e.date_end, e.location, e.work_type, e.description, e.description_fr, e.sort_order]);

      const expId = res.rows[0].id;
      for (const techName of e.techs) {
        const techId = await getTechId(techName);
        if (techId) {
          await pool.query(
            `INSERT INTO experience_technologies (experience_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [expId, techId]
          );
        }
      }
    }
    console.log('Experiences seeded.');

    // Skills
    const skills = [
      // Frontend
      { name: 'React', category: 'frontend', level: 3, icon_name: 'react', sort_order: 0 },
      { name: 'TypeScript', category: 'frontend', level: 2, icon_name: 'typescript', sort_order: 1 },
      { name: 'JavaScript', category: 'frontend', level: 3, icon_name: 'javascript', sort_order: 2 },
      { name: 'Next.js', category: 'frontend', level: 2, icon_name: 'nextjs', sort_order: 3 },
      { name: 'Tailwind CSS', category: 'frontend', level: 3, icon_name: 'tailwind', sort_order: 4 },
      { name: 'Redux', category: 'frontend', level: 2, icon_name: 'redux', sort_order: 5 },
      { name: 'HTML5 / CSS3', category: 'frontend', level: 3, icon_name: 'html5', sort_order: 6 },
      // Backend
      { name: 'Node.js', category: 'backend', level: 3, icon_name: 'nodejs', sort_order: 0 },
      { name: 'Express', category: 'backend', level: 3, icon_name: 'express', sort_order: 1 },
      { name: 'REST APIs', category: 'backend', level: 3, icon_name: 'api', sort_order: 2 },
      { name: 'PostgreSQL', category: 'backend', level: 2, icon_name: 'postgresql', sort_order: 3 },
      { name: 'MongoDB', category: 'backend', level: 2, icon_name: 'mongodb', sort_order: 4 },
      { name: 'Socket.IO', category: 'backend', level: 2, icon_name: 'socketio', sort_order: 5 },
      { name: 'PHP', category: 'backend', level: 2, icon_name: 'php', sort_order: 6 },
      // Mobile
      { name: 'Flutter', category: 'mobile', level: 2, icon_name: 'flutter', sort_order: 0 },
      { name: 'React Native', category: 'mobile', level: 2, icon_name: 'react-native', sort_order: 1 },
      { name: 'Dart', category: 'mobile', level: 2, icon_name: 'dart', sort_order: 2 },
      // Tools
      { name: 'Git', category: 'tools', level: 3, icon_name: 'git', sort_order: 0 },
      { name: 'Docker', category: 'tools', level: 1, icon_name: 'docker', sort_order: 1 },
      { name: 'Figma', category: 'tools', level: 2, icon_name: 'figma', sort_order: 2 },
      { name: 'Postman', category: 'tools', level: 3, icon_name: 'postman', sort_order: 3 },
    ];

    for (const s of skills) {
      await pool.query(`
        INSERT INTO skills (name, category, level, icon_name, sort_order, is_visible)
        VALUES ($1, $2, $3, $4, $5, true)
      `, [s.name, s.category, s.level, s.icon_name, s.sort_order]);
    }
    console.log('Skills seeded.');

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
