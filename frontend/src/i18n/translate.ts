import { translations, type Language, type TranslationKey } from './translations';

type TranslateParams = Record<string, string | number | undefined>;

export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslateParams,
) {
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
