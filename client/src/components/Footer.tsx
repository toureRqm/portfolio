import { Heart } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-bg-primary border-t border-border py-8">
      <div className="w-full px-[10%] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-syne font-bold text-text-primary">
          Abdourahmane <span className="text-gold italic font-normal">Touré</span>
        </div>

        <div className="flex items-center gap-1.5 font-grotesk text-text-secondary text-sm">
          <span>Built with</span>
          <Heart size={12} className="text-gold fill-gold" />
          <span>{t('footer.built_with')}</span>
        </div>

        <p className="font-grotesk text-text-secondary/60 text-sm">
          © {year} Abdourahmane Touré. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
