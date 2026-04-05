import type { AssistantLocale } from '../assistant.types';

export const assistantSupportedLocales = ['en', 'kk', 'ru'] as const;

export const assistantDefaultLocale: AssistantLocale = 'en';

type AssistantLocaleDefinition = {
  offTopicRefusal: string;
  systemPromptInstruction: string;
};

const assistantLocaleDefinitions: Record<AssistantLocale, AssistantLocaleDefinition> = {
  en: {
    offTopicRefusal: 'I can only help with the current mission and terminal learning tasks.',
    systemPromptInstruction: [
      'The learner interface language is English.',
      'You must answer in English.',
      'Do not switch to Russian or Kazakh unless the learner explicitly asks you to do so.',
    ].join(' '),
  },
  kk: {
    offTopicRefusal:
      'Мен тек ағымдағы миссия мен терминалға қатысты оқу тапсырмалары бойынша көмектесе аламын.',
    systemPromptInstruction: [
      'The learner interface language is Kazakh.',
      'You must answer in Kazakh.',
      'Do not switch to Russian unless the learner explicitly asks you to do so.',
      'If the learner writes in Kazakh, keep the answer in natural Kazakh.',
    ].join(' '),
  },
  ru: {
    offTopicRefusal: 'Я могу помогать только с текущей миссией и обучением работе в терминале.',
    systemPromptInstruction: [
      'The learner interface language is Russian.',
      'You must answer in Russian.',
      'Do not switch to English or Kazakh unless the learner explicitly asks you to do so.',
    ].join(' '),
  },
};

export function isAssistantLocale(value: string): value is AssistantLocale {
  return assistantSupportedLocales.includes(value as AssistantLocale);
}

export function normalizeAssistantLocale(locale?: string): AssistantLocale {
  if (locale && isAssistantLocale(locale)) {
    return locale;
  }

  return assistantDefaultLocale;
}

export function getAssistantOffTopicRefusal(locale: AssistantLocale): string {
  return assistantLocaleDefinitions[locale].offTopicRefusal;
}

export function getAssistantSystemPromptInstruction(locale: AssistantLocale): string {
  return assistantLocaleDefinitions[locale].systemPromptInstruction;
}
