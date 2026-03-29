import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { I18nContext } from './I18nContext';
import {
  fallbackLanguage,
  translations,
  type Language,
  type TranslationKey,
} from './translations';

const LANGUAGE_STORAGE_KEY = 'typocalypse.language';

type TranslateParams = Record<string, string | number | undefined>;

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(language, key, params),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return fallbackLanguage;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === 'ru' || storedLanguage === 'en' || storedLanguage === 'kk') {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith('ru')) {
    return 'ru';
  }
  if (browserLanguage.startsWith('kk')) {
    return 'kk';
  }

  return 'en';
}

function translate(language: Language, key: TranslationKey, params?: TranslateParams) {
  const template = getTranslationValue(language, key);

  if (!params) {
    return template;
  }

  return template.replaceAll(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? '' : String(value);
  });
}

function getTranslationValue(language: Language, key: TranslationKey) {
  const path = key.split('.');
  let currentValue: unknown = translations[language];

  for (const segment of path) {
    if (!currentValue || typeof currentValue !== 'object' || !(segment in currentValue)) {
      return key;
    }

    currentValue = (currentValue as Record<string, unknown>)[segment];
  }

  return typeof currentValue === 'string' ? currentValue : key;
}
