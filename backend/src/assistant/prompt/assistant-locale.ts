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
      'Answer only in English.',
      'Do not switch to Russian or Kazakh unless the learner explicitly asks you to do so.',
      'Even if the mission metadata or technical context is written in another language, keep your final answer in English.',
      'Keep the answer concise and focused on the current task.',
    ].join(' '),
  },
  kk: {
    offTopicRefusal:
      'Мен тек ағымдағы миссия мен терминалға қатысты оқу тапсырмалары бойынша көмектесе аламын.',
    systemPromptInstruction: [
      'Тек қазақ тілінде жауап бер.',
      'Пайдаланушы тікелей сұрамайынша орыс немесе ағылшын тіліне ауыспа.',
      'Миссия сипаттамасы, техникалық контекст немесе командалар ағылшын тілінде болса да, қорытынды жауабың қазақ тілінде болсын.',
      'Жауап қысқа, нақты және табиғи қазақ тілінде болсын.',
    ].join(' '),
  },
  ru: {
    offTopicRefusal: 'Я могу помогать только с текущей миссией и обучением работе в терминале.',
    systemPromptInstruction: [
      'Отвечай только на русском языке.',
      'Не переключайся на английский или казахский, если пользователь сам об этом не попросил.',
      'Даже если описание миссии, технический контекст или команды написаны на английском, итоговый ответ должен быть на русском языке.',
      'Пиши кратко, по делу и естественно.',
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
