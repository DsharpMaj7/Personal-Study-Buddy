"use client";

import { useEffect, useState } from "react";

export interface QuizQuestionItem {
  question: string;
  answer: string;
}

interface QuizQuestionsProps {
  questions: QuizQuestionItem[];
  /** List wrapper classes (spacing, text size); defaults match generated study pack. */
  listClassName?: string;
}

export function QuizQuestions({
  questions,
  listClassName = "space-y-2.5 text-rose-muted",
}: QuizQuestionsProps) {
  const [answerOpen, setAnswerOpen] = useState<boolean[]>(() => questions.map(() => false));

  useEffect(() => {
    setAnswerOpen(questions.map(() => false));
  }, [questions]);

  function toggleAnswer(index: number) {
    setAnswerOpen((prev) => {
      const next = questions.map((_, i) => prev[i] ?? false);
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <ol className={listClassName}>
      {questions.map((q, i) => {
        const open = answerOpen[i] ?? false;
        return (
          <li key={i}>
            <div className="font-medium text-rose-ink">
              Q{i + 1}. {q.question}
            </div>
            <button
              type="button"
              onClick={() => toggleAnswer(i)}
              className="mt-1.5 text-left text-[11px] font-medium text-brand-600 hover:text-brand-500"
            >
              {open ? "Hide Answer ▲" : "Show Answer ▼"}
            </button>
            {open && (
              <div className="mt-1 text-[10px] text-rose-soft">Answer: {q.answer}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
