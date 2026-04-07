"use client";

import { useState } from "react";
import Link from "next/link";

interface StudyModeProps {
  flashcards: { front: string; back: string }[];
  quizQuestions: { question: string; answer: string }[];
  onClose: () => void;
}

type Phase = "choose" | "flashcard" | "quiz" | "results";
type ResultsSource = "flashcard" | "quiz";

export function StudyMode({
  flashcards,
  quizQuestions,
  onClose,
}: StudyModeProps) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [needReviewIndices, setNeedReviewIndices] = useState<Set<number>>(new Set());

  const [quizIndex, setQuizIndex] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectIndices, setIncorrectIndices] = useState<Set<number>>(new Set());

  const [resultsSource, setResultsSource] = useState<ResultsSource | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewFlashcards, setReviewFlashcards] = useState<{ front: string; back: string }[]>([]);
  const [reviewQuizQuestions, setReviewQuizQuestions] = useState<
    { question: string; answer: string }[]
  >([]);

  const totalCorrect = correctCount;
  const totalIncorrect = incorrectIndices.size;

  const handleStartFlashcards = () => {
    setPhase("flashcard");
    setFlashcardIndex(0);
    setIsFlipped(false);
    setNeedReviewIndices(new Set());
    setReviewMode(false);
  };

  const handleStartQuiz = () => {
    setPhase("quiz");
    setQuizIndex(0);
    setAnswerRevealed(false);
    setCorrectCount(0);
    setIncorrectIndices(new Set());
    setReviewMode(false);
  };

  const handleFlashcardGotIt = () => {
    if (flashcardIndex >= (reviewMode ? reviewFlashcards : flashcards).length - 1) {
      setPhase("results");
      setResultsSource("flashcard");
    } else {
      setFlashcardIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleFlashcardNeedReview = () => {
    setNeedReviewIndices((prev) => new Set([...prev, flashcardIndex]));
    const cards = reviewMode ? reviewFlashcards : flashcards;
    if (flashcardIndex >= cards.length - 1) {
      setPhase("results");
      setResultsSource("flashcard");
    } else {
      setFlashcardIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleQuizShowAnswer = () => {
    setAnswerRevealed(true);
  };

  const handleQuizCorrect = () => {
    setCorrectCount((c) => c + 1);
    if (quizIndex >= (reviewMode ? reviewQuizQuestions : quizQuestions).length - 1) {
      setPhase("results");
      setResultsSource("quiz");
    } else {
      setQuizIndex((i) => i + 1);
      setAnswerRevealed(false);
    }
  };

  const handleQuizIncorrect = () => {
    setIncorrectIndices((prev) => new Set([...prev, quizIndex]));
    if (quizIndex >= (reviewMode ? reviewQuizQuestions : quizQuestions).length - 1) {
      setPhase("results");
      setResultsSource("quiz");
    } else {
      setQuizIndex((i) => i + 1);
      setAnswerRevealed(false);
    }
  };

  const handleReviewWeakFlashcards = () => {
    const source = reviewMode ? reviewFlashcards : flashcards;
    const cards = source.filter((_, i) => needReviewIndices.has(i));
    if (cards.length === 0) return;
    setReviewFlashcards(cards);
    setReviewMode(true);
    setPhase("flashcard");
    setFlashcardIndex(0);
    setIsFlipped(false);
    setNeedReviewIndices(new Set());
  };

  const handleReviewWeakQuiz = () => {
    const source = reviewMode ? reviewQuizQuestions : quizQuestions;
    const questions = Array.from(incorrectIndices)
      .sort((a, b) => a - b)
      .map((i) => source[i]);
    if (questions.length === 0) return;
    setReviewQuizQuestions(questions);
    setReviewMode(true);
    setPhase("quiz");
    setQuizIndex(0);
    setAnswerRevealed(false);
    setCorrectCount(0);
    setIncorrectIndices(new Set());
  };

  const handleStartOver = () => {
    setReviewMode(false);
    if (resultsSource === "flashcard") {
      handleStartFlashcards();
    } else {
      handleStartQuiz();
    }
  };

  const currentFlashcards = reviewMode ? reviewFlashcards : flashcards;
  const currentQuizQuestions = reviewMode ? reviewQuizQuestions : quizQuestions;

  return (
    <div className="glass-panel text-xs">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-rose-ink">
          {phase === "choose" && "Study Mode"}
          {phase === "flashcard" && "Flashcards"}
          {phase === "quiz" && "Quiz"}
          {phase === "results" && "Results"}
        </h2>
        {phase !== "choose" && (
          <button
            type="button"
            onClick={onClose}
            className="text-rose-soft hover:text-rose-ink underline"
          >
            Exit
          </button>
        )}
      </div>

      {phase === "choose" && (
        <div className="space-y-4">
          <p className="text-rose-muted">
            Choose how you want to study. Practice with flashcards or test yourself with the quiz.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleStartFlashcards}
              className="btn-primary flex-1 py-3"
              disabled={flashcards.length === 0}
            >
              Flashcards ({flashcards.length})
            </button>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="btn-secondary flex-1 py-3"
              disabled={quizQuestions.length === 0}
            >
              Quiz ({quizQuestions.length})
            </button>
          </div>
        </div>
      )}

      {phase === "flashcard" && currentFlashcards.length > 0 && (
        <div className="space-y-6">
          <p className="text-rose-muted">
            Card {flashcardIndex + 1} of {currentFlashcards.length}
          </p>
          <div
            className="min-h-[140px] cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-6 text-center transition-all duration-200 hover:bg-slate-800"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <p className="text-rose-ink">
              {isFlipped
                ? currentFlashcards[flashcardIndex].back
                : currentFlashcards[flashcardIndex].front}
            </p>
            {!isFlipped && (
              <p className="mt-2 text-[10px] text-rose-soft">Click to reveal back</p>
            )}
          </div>
          {isFlipped && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleFlashcardGotIt}
                className="btn-primary flex-1 py-2.5"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleFlashcardNeedReview}
                className="btn-secondary flex-1 py-2.5"
              >
                Need review
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "quiz" && currentQuizQuestions.length > 0 && (
        <div className="space-y-6">
          <p className="text-rose-muted">
            Question {quizIndex + 1} of {currentQuizQuestions.length}
            {!reviewMode && ` · ${totalCorrect} correct`}
          </p>
          <div className="rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-5 transition-all duration-200">
            <p className="font-medium text-rose-ink">
              {currentQuizQuestions[quizIndex].question}
            </p>
            {answerRevealed && (
              <div className="mt-4 rounded-lg border border-slate-600/50 bg-slate-800/60 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wide text-rose-soft">Answer</p>
                <p className="mt-1 text-rose-muted">
                  {currentQuizQuestions[quizIndex].answer}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!answerRevealed ? (
              <button
                type="button"
                onClick={handleQuizShowAnswer}
                className="btn-primary flex-1 py-2.5"
              >
                Show answer
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleQuizCorrect}
                  className="flex-1 rounded-xl border-2 border-green-400/60 bg-green-50 py-2.5 text-sm font-medium text-green-800"
                >
                  Correct
                </button>
                <button
                  type="button"
                  onClick={handleQuizIncorrect}
                  className="flex-1 rounded-xl border-2 border-red-400/50 bg-red-50 py-2.5 text-sm font-medium text-red-800"
                >
                  Incorrect
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="space-y-6">
          {resultsSource === "flashcard" && (
            <div className="rounded-xl border border-slate-600 bg-slate-800/60 px-5 py-4">
              <p className="text-rose-ink">
                <span className="font-semibold">{needReviewIndices.size}</span> card
                {needReviewIndices.size !== 1 ? "s" : ""} marked &quot;Need review&quot;
              </p>
            </div>
          )}
          {resultsSource === "quiz" && (
            <div className="rounded-xl border border-slate-600 bg-slate-800/60 px-5 py-4">
              <p className="text-rose-ink">
                <span className="font-semibold text-green-600">{totalCorrect}</span> correct ·{" "}
                <span className="font-semibold text-red-600">{totalIncorrect}</span> incorrect
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {resultsSource === "flashcard" && needReviewIndices.size > 0 && (
              <button
                type="button"
                onClick={handleReviewWeakFlashcards}
                className="btn-primary w-full py-2.5"
              >
                Review weak items
              </button>
            )}
            {resultsSource === "quiz" && incorrectIndices.size > 0 && (
              <button
                type="button"
                onClick={handleReviewWeakQuiz}
                className="btn-primary w-full py-2.5"
              >
                Review weak items
              </button>
            )}
            <button
              type="button"
              onClick={handleStartOver}
              className="btn-secondary w-full py-2.5"
            >
              Start over
            </button>
            <Link
              href="/"
              className="btn-secondary block w-full py-2.5 text-center"
            >
              Back to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
