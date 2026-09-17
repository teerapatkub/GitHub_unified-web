export const normalizeQuizAnswer = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim().replace(/\s+/g, " ");
};

export const isQuizAnswerCorrect = (question, userAnswer) => {
  if (!question || !userAnswer) return false;

  const expected = normalizeQuizAnswer(question.answer);
  const actual = normalizeQuizAnswer(userAnswer);

  return expected !== "" && actual === expected;
};
