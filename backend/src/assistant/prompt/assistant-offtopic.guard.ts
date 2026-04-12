const obviousOffTopicKeywords = [
  'recipe',
  'cookie recipe',
  'cake recipe',
  'weather',
  'forecast',
  'football',
  'soccer',
  'movie',
  'poem',
  'joke',
  'stock price',
  'capital of',
  'girlfriend',
  'boyfriend',
  'рецепт',
  'печенье',
  'погода',
  'футбол',
  'фильм',
  'стих',
  'шутка',
  'рецепт печенья',
  'ауа райы',
  'өлең',
  'әзіл',
  'печенье рецепті',
];

export function isAssistantQuestionOffTopic(question: string): boolean {
  const normalizedQuestion = question.trim().toLowerCase();

  if (!normalizedQuestion) {
    return false;
  }

  return obviousOffTopicKeywords.some((keyword) => normalizedQuestion.includes(keyword));
}
