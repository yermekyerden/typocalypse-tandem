import { createContext } from 'react';

import { fallbackLanguage, type Language, type TranslationKey } from './translations';
import { translate } from './translate';

type TranslateParams = Record<string, string | number | undefined>;

export type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
};

export const I18nContext = createContext<I18nContextValue>({
  language: fallbackLanguage,
  setLanguage: () => undefined,
  t: (key, params) => translate(fallbackLanguage, key, params),
});
