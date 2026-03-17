import { createContext, useContext, useState } from 'react';

type Lang = 'en' | 'fr';
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; }

const LanguageContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('portfolio_lang') as Lang) || 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('portfolio_lang', l);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
