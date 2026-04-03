export const assistantSupportedLocales = ['en', 'kk', 'ru'] as const;

export type AssistantLocale = (typeof assistantSupportedLocales)[number];

export function normalizeAssistantLocale(locale?: string): AssistantLocale {
  if (locale === 'kk' || locale === 'ru') {
    return locale;
  }

  return 'en';
}

export function getAssistantOffTopicRefusal(locale: AssistantLocale): string {
  switch (locale) {
    case 'kk':
      return 'Мен тек қазіргі миссия мен терминалды үйренуге қатысты тапсырмалар бойынша ғана көмектесе аламын.';
    case 'ru':
      return 'Я могу помогать только с текущей миссией и заданиями, связанными с изучением терминала.';
    default:
      return 'I can only help with the current mission and terminal learning tasks.';
  }
}
