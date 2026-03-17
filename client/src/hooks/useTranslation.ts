import enStrings from '../i18n/en.json';
import frStrings from '../i18n/fr.json';
import { useLanguage } from '../context/LanguageContext';

export function useTranslation() {
  const { lang } = useLanguage();
  const strings = lang === 'fr' ? frStrings : enStrings;

  // Access by dotted path e.g. 'contact.submit'
  const t = (path: string): string => {
    const parts = path.split('.');
    let val: unknown = strings;
    for (const p of parts) {
      val = (val as Record<string, unknown>)?.[p];
    }
    return (typeof val === 'string' ? val : path);
  };

  // Returns the typewriter array
  const typewriterItems = (): string[] => {
    return strings.hero.typewriter;
  };

  // For dynamic DB content: returns _fr value if lang=fr and non-empty, else fallback to base field
  const pick = <T extends object>(obj: T | null | undefined, field: string): string => {
    if (!obj) return '';
    const rec = obj as Record<string, unknown>;
    if (lang === 'fr') {
      const frVal = rec[`${field}_fr`];
      if (typeof frVal === 'string' && frVal.trim()) return frVal;
    }
    const val = rec[field];
    return typeof val === 'string' ? val : '';
  };

  return { t, lang, typewriterItems, pick };
}
