import React, { createContext, useContext, useEffect, useState } from 'react';
import { ENGLISH_CATALOG, languageNames } from './catalog';
const Context = createContext<any>(null);
export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(
    () => localStorage.getItem('gu_locale') || 'en',
  );
  const [packs, setPacks] = useState<any[]>([]);
  const reload = () =>
    fetch('/api/localization/published')
      .then((r) => r.json())
      .then((data) => setPacks(data.languages || []))
      .catch(() => {});
  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      document.documentElement.lang = 'en';
    }
    localStorage.setItem('gu_locale', locale);
  }, [locale]);
  const dictionary = packs.find((p) => p.code === locale)?.strings || {};
  const bySource = Object.fromEntries(
    Object.entries(ENGLISH_CATALOG).map(([key, source]) => [
      source,
      dictionary[key] || source,
    ]),
  );
  const t = (source: string) => bySource[source] || source;
  return (
    <Context.Provider
      value={{
        locale,
        setLocale: setLocaleState,
        t,
        reload,
        packs,
        languages: languageNames,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLocalization = () =>
  useContext(Context) || {
    locale: 'en',
    setLocale: () => {},
    t: (s: string) => s,
    packs: [],
    languages: languageNames,
    reload: () => {},
  };
export function LanguagePicker() {
  const { locale, setLocale, packs, languages } = useLocalization();
  return (
    <label className="campus-language">
      Language
      <select
        aria-label="Portal language"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
      >
        <option value="en">English</option>
        {Object.entries(languages)
          .filter(([code]) => code !== 'en')
          .map(([code, name]) => (
            <option
              key={code}
              value={code}
              disabled={!packs.some((p: any) => p.code === code)}
            >
              {String(name)}
              {packs.some((p: any) => p.code === code)
                ? ''
                : ' — awaiting reviewed pack'}
            </option>
          ))}
      </select>
    </label>
  );
}
