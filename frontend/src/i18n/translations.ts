import { en } from './en';
import { kk } from './kk';
import { ru } from './ru';

export type Language = 'en' | 'ru' | 'kk';

export const fallbackLanguage: Language = 'en';

export const translations = {
  en,
  ru,
  kk,
} as const;

export type TranslationKey = DotPath<(typeof translations)[typeof fallbackLanguage]>;

type DotPath<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPath<T[K]>}`;
    }[keyof T & string];
