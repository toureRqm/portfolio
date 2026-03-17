import type { Profile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface MaintenancePageProps {
  profile?: Profile | null;
}

export default function MaintenancePage({ profile }: MaintenancePageProps) {
  const { t } = useTranslation();
  const { lang, setLang } = useLanguage();
  const photoUrl = profile?.photo_url || '/static/media/moi.1534d679.png';

  // Use DB content if set, otherwise fall back to JSON translations
  const messageHtml = lang === 'fr'
    ? (profile?.maintenance_message_fr || t('maintenance.message'))
    : (profile?.maintenance_message || t('maintenance.message'));

  return (
    <>
      <style>{`
        @keyframes drawLine {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0% 0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.6); opacity: 0.3; }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDeco {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .maint-scene {
          display: flex;
          width: 100vw;
          height: 100vh;
          background: #0b0b0f;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }

        .maint-left {
          position: relative;
          width: 50%;
          height: 100vh;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .maint-v-line {
          position: absolute;
          left: 50%;
          top: 0;
          height: 100%;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom, transparent 0%, #c9a96e 10%, #c9a96e 90%, transparent 100%);
          z-index: 2;
          animation: drawLine 1.2s ease 0.2s both;
        }

        .maint-photo-frame {
          position: relative;
          z-index: 3;
          height: 52vh;
          aspect-ratio: 3 / 4;
          border: 1.5px solid #c9a96e;
          overflow: hidden;
          background: #0b0b0f;
          box-shadow: 0 0 0 6px #0b0b0f, 0 0 0 7px rgba(201,169,110,0.18), 0 0 60px rgba(201,169,110,0.06);
          animation: scaleIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both;
        }

        .maint-photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 5%;
          display: block;
          filter: brightness(0.82) grayscale(12%);
          pointer-events: none;
          -webkit-user-drag: none;
        }

        .maint-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          z-index: 4;
        }
        .maint-corner-tl { top: -1px; left: -1px; border-top: 1.5px solid #c9a96e; border-left: 1.5px solid #c9a96e; }
        .maint-corner-tr { top: -1px; right: -1px; border-top: 1.5px solid #c9a96e; border-right: 1.5px solid #c9a96e; }
        .maint-corner-bl { bottom: -1px; left: -1px; border-bottom: 1.5px solid #c9a96e; border-left: 1.5px solid #c9a96e; }
        .maint-corner-br { bottom: -1px; right: -1px; border-bottom: 1.5px solid #c9a96e; border-right: 1.5px solid #c9a96e; }

        .maint-circle-lg {
          position: absolute;
          width: 52vh;
          height: 52vh;
          border: 1px solid rgba(201,169,110,0.07);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: spinSlow 50s linear infinite, fadeInDeco 0.8s ease 0.4s both;
          z-index: 1;
        }

        .maint-circle-md {
          position: absolute;
          width: 30vh;
          height: 30vh;
          border: 1px dashed rgba(201,169,110,0.18);
          border-radius: 50%;
          top: 12%;
          left: 8%;
          animation: spinSlowReverse 30s linear infinite, fadeInDeco 0.8s ease 0.5s both;
          z-index: 1;
        }

        .maint-dots {
          position: absolute;
          right: 7%;
          top: 14%;
          width: 72px;
          height: 72px;
          background-image: radial-gradient(circle, rgba(201,169,110,0.45) 1px, transparent 1px);
          background-size: 12px 12px;
          animation: floatY 6s ease-in-out infinite, fadeInDeco 0.7s ease 0.55s both;
          z-index: 1;
        }

        .maint-dots-2 {
          position: absolute;
          left: 7%;
          bottom: 16%;
          width: 54px;
          height: 54px;
          background-image: radial-gradient(circle, rgba(201,169,110,0.3) 1px, transparent 1px);
          background-size: 10px 10px;
          animation: floatY 8s ease-in-out infinite reverse, fadeInDeco 0.7s ease 0.65s both;
          z-index: 1;
        }

        .maint-sq-1 {
          position: absolute;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(201,169,110,0.18);
          bottom: 22%;
          right: 9%;
          animation: floatY 7s ease-in-out infinite, spinSlow 18s linear infinite, fadeInDeco 0.7s ease 0.6s both;
          z-index: 1;
        }

        .maint-sq-2 {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 1px solid rgba(201,169,110,0.25);
          top: 24%;
          left: 9%;
          transform: rotate(30deg);
          animation: floatY 9s ease-in-out infinite, fadeInDeco 0.7s ease 0.7s both;
          z-index: 1;
        }

        .maint-h {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,110,0.18), transparent);
          animation: floatY 7s ease-in-out infinite, fadeInDeco 0.7s ease 0.75s both;
          z-index: 1;
        }
        .maint-h-1 { width: 50px; top: 32%; left: 4%; }
        .maint-h-2 { width: 35px; bottom: 30%; right: 4%; animation-direction: reverse; animation-duration: 5s, 0.7s; }

        .maint-zigzag { position: absolute; bottom: 14%; right: 5%; opacity: 0.28; animation: floatY 10s ease-in-out infinite, fadeInDeco 0.7s ease 0.8s both; z-index: 1; }
        .maint-zigzag-2 { position: absolute; top: 18%; left: 4%; opacity: 0.2; animation: floatY 8s ease-in-out infinite reverse, fadeInDeco 0.7s ease 0.85s both; z-index: 1; }

        .maint-code {
          position: absolute;
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(0.55rem, 0.7vw, 0.72rem);
          font-weight: 300;
          color: rgba(201,169,110,0.2);
          animation: floatY 8s ease-in-out infinite, fadeInDeco 0.7s ease 0.9s both;
          white-space: nowrap;
          z-index: 1;
        }
        .maint-code-1 { top: 12%; left: 6%; animation-duration: 7s, 0.7s; }
        .maint-code-2 { bottom: 18%; left: 5%; animation-duration: 9s, 0.7s; animation-direction: reverse, normal; }
        .maint-code-3 { top: 56%; right: 7%; animation-duration: 6s, 0.7s; }
        .maint-code-4 { top: 38%; left: 4%; animation-duration: 11s, 0.7s; animation-direction: reverse, normal; }

        .maint-right {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 7% 0 4%;
          animation: fadeInRight 1s ease 1.2s both;
          margin-left: -8vw;
        }

        .maint-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 70% 50%, rgba(201,169,110,0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .maint-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.7rem, 1vw, 1rem);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 1.2em;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .maint-label::before {
          content: '';
          width: 36px;
          height: 1px;
          background: #c9a96e;
          flex-shrink: 0;
        }

        .maint-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(2.8rem, 5.5vw, 7rem);
          line-height: 1.0;
          margin-bottom: 0.2em;
          color: #e8e3dc;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .maint-h1 span {
          color: #e2c99a;
          font-weight: 400;
          font-style: italic;
        }

        .maint-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 1.6vw, 1.7rem);
          color: #6b6560;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 2em;
        }

        .maint-divider {
          width: 52px;
          height: 1.5px;
          background: linear-gradient(90deg, #c9a96e, transparent);
          margin-bottom: 1.8em;
        }

        .maint-message {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.9rem, 1.2vw, 1.3rem);
          line-height: 1.85;
          color: #9e9892;
          font-weight: 300;
        }
        .maint-message strong {
          color: #e8e3dc;
          font-weight: 500;
        }

        .maint-progress {
          margin-top: 2.4em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .maint-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c9a96e;
          animation: pulseDot 1.8s ease-in-out infinite;
        }
        .maint-dot:nth-child(2) { animation-delay: 0.3s; }
        .maint-dot:nth-child(3) { animation-delay: 0.6s; }

        .maint-progress-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.7rem, 0.9vw, 0.9rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #6b6560;
          margin-left: 8px;
        }

        @media (max-width: 640px) {
          .maint-scene {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .maint-left {
            width: 100%;
            height: 52vh;
            flex-shrink: 0;
          }
          .maint-photo-frame { height: 36vh; }
          .maint-right {
            flex: none;
            width: 100%;
            padding: 6% 10% 10%;
            align-items: flex-start;
            margin-left: 0;
          }
          .maint-h1 { white-space: normal; }
        }
      `}</style>

      <div className="maint-scene">
        {/* Language switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.5rem',
            zIndex: 10,
            background: 'rgba(201,169,110,0.08)',
            border: '1px solid rgba(201,169,110,0.3)',
            color: '#c9a96e',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,169,110,0.16)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(201,169,110,0.08)')}
        >
          {lang === 'en' ? 'FR' : 'EN'}
        </button>

        {/* LEFT */}
        <div className="maint-left">
          <div className="maint-v-line" />
          <div className="maint-circle-lg" />
          <div className="maint-circle-md" />
          <div className="maint-dots" />
          <div className="maint-dots-2" />
          <div className="maint-sq-1" />
          <div className="maint-sq-2" />
          <div className="maint-h maint-h-1" />
          <div className="maint-h maint-h-2" />

          <svg className="maint-zigzag" width="44" height="36" viewBox="0 0 44 36" fill="none">
            <polyline points="0,8  11,0  22,8  33,0  44,8"  stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <polyline points="0,20 11,12 22,20 33,12 44,20" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <polyline points="0,32 11,24 22,32 33,24 44,32" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
          </svg>
          <svg className="maint-zigzag-2" width="36" height="28" viewBox="0 0 36 28" fill="none">
            <polyline points="0,6  9,0  18,6  27,0  36,6"   stroke="#c9a96e" strokeWidth="1.2" fill="none"/>
            <polyline points="0,16 9,10 18,16 27,10 36,16"  stroke="#c9a96e" strokeWidth="1.2" fill="none"/>
            <polyline points="0,26 9,20 18,26 27,20 36,26"  stroke="#c9a96e" strokeWidth="1.2" fill="none"/>
          </svg>

          <span className="maint-code maint-code-1">const dev = true;</span>
          <span className="maint-code maint-code-2">&lt;Portfolio /&gt;</span>
          <span className="maint-code maint-code-3">{'{ design }'}</span>
          <span className="maint-code maint-code-4">01001</span>

          <div className="maint-photo-frame">
            <span className="maint-corner maint-corner-tl" />
            <span className="maint-corner maint-corner-tr" />
            <span className="maint-corner maint-corner-bl" />
            <span className="maint-corner maint-corner-br" />
            <img src={photoUrl} alt="Abdourahmane Touré" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="maint-right">
          <div>
            <p className="maint-label">{t('maintenance.label')}</p>
            <h1 className="maint-h1">
              Abdourahmane<br />
              <span>Touré</span>
            </h1>
            <p className="maint-subtitle">{t('maintenance.subtitle')}</p>
            <div className="maint-divider" />
            <p
              className="maint-message"
              dangerouslySetInnerHTML={{ __html: messageHtml }}
            />
            <div className="maint-progress">
              <span className="maint-dot" />
              <span className="maint-dot" />
              <span className="maint-dot" />
              <span className="maint-progress-label">{t('maintenance.status')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
