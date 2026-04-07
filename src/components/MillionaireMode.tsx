"use client";

import { useEffect, useRef, useState } from "react";

import type { MillionaireQuestion } from "@/lib/millionaireGenerator";

const LABELS = ["A", "B", "C", "D"] as const;

/** Prize for each question (1–10). */
const MONEY_LADDER = [
  100, 250, 500, 1_000, 5_000, 10_000, 25_000, 100_000, 500_000, 1_000_000,
] as const;

const TOP_PRIZE = MONEY_LADDER[MONEY_LADDER.length - 1];

function formatPrize(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface MillionaireModeProps {
  questions: MillionaireQuestion[];
  onClose: () => void;
}

function performanceMessage(correctCount: number): string {
  if (correctCount <= 3) return "Keep studying";
  if (correctCount <= 7) return "Solid understanding";
  return "Expert level";
}

function countFromWinnings(securedWinnings: number): number {
  if (securedWinnings <= 0) return 0;
  const idx = MONEY_LADDER.findIndex((n) => n === securedWinnings);
  return idx >= 0 ? idx + 1 : 0;
}

/** Pick two wrong indices to eliminate (50:50); leaves correct + one wrong. */
function twoWrongToEliminate(correctIndex: number): [number, number] {
  const wrong = ([0, 1, 2, 3] as const).filter((i) => i !== correctIndex);
  const keep = wrong[Math.floor(Math.random() * wrong.length)]!;
  const eliminated = wrong.filter((i) => i !== keep) as [number, number];
  return eliminated;
}

export function MillionaireMode({ questions, onClose }: MillionaireModeProps) {
  const [phase, setPhase] = useState<"playing" | "complete">("playing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [securedWinnings, setSecuredWinnings] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [eliminatedIndices, setEliminatedIndices] = useState<Set<number>>(() => new Set());
  const [audioOn, setAudioOn] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio("/audio/suspense.mp3");
    el.loop = true;
    el.volume = 0.3;
    audioRef.current = el;
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audioOn) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [audioOn]);

  const q = questions[currentIndex];
  const isCorrect =
    selectedIndex !== null && q !== undefined && selectedIndex === q.correctIndex;

  const currentPrize =
    currentIndex < MONEY_LADDER.length ? MONEY_LADDER[currentIndex] : MONEY_LADDER[MONEY_LADDER.length - 1];

  function handleFiftyFifty() {
    if (!q || showFeedback || fiftyFiftyUsed) return;
    const [a, b] = twoWrongToEliminate(q.correctIndex);
    setEliminatedIndices(new Set([a, b]));
    setFiftyFiftyUsed(true);
  }

  function handleChoose(index: number) {
    if (showFeedback || !q || eliminatedIndices.has(index)) return;
    setSelectedIndex(index);
    setShowFeedback(true);
    if (index === q.correctIndex) {
      const rung = MONEY_LADDER[currentIndex] ?? currentPrize;
      setSecuredWinnings(rung);
    }
  }

  function handleContinue() {
    if (!isCorrect) {
      setPhase("complete");
      return;
    }
    if (currentIndex >= questions.length - 1) {
      setPhase("complete");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setShowFeedback(false);
    setEliminatedIndices(new Set());
  }

  if (phase === "complete") {
    const correctCount = countFromWinnings(securedWinnings);
    const jackpot = securedWinnings === TOP_PRIZE;

    return (
      <div className="glass-panel text-xs">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-rose-ink">Millionaire Mode — Results</h2>
          <button type="button" onClick={onClose} className="btn-secondary px-3 py-2 text-xs">
            Back to study pack
          </button>
        </div>
        <p className="mb-2 text-lg font-semibold text-amber-200">
          {jackpot ? "You won $1,000,000" : `You won ${formatPrize(securedWinnings)}`}
        </p>
        <p className="mb-6 text-sm text-brand-600">{performanceMessage(correctCount)}</p>
        <button type="button" onClick={onClose} className="btn-primary text-xs">
          Close
        </button>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="glass-panel text-xs">
        <p className="text-rose-muted">No questions loaded.</p>
        <button type="button" onClick={onClose} className="btn-secondary mt-4 text-xs">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel text-xs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-rose-ink">Millionaire Mode</h2>
          <p className="mt-0.5 text-[11px] text-rose-muted">
            Question {currentIndex + 1} of {questions.length} · Current prize:{" "}
            <span className="font-medium text-amber-200">{formatPrize(currentPrize)}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-rose-muted">
            Winnings so far:{" "}
            <span className="font-medium text-rose-ink">{formatPrize(securedWinnings)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioOn((v) => !v)}
            className="btn-secondary px-3 py-2 text-xs"
            aria-pressed={audioOn}
            title={audioOn ? "Turn suspense music off" : "Turn suspense music on"}
          >
            Sound: {audioOn ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={handleFiftyFifty}
            disabled={fiftyFiftyUsed || showFeedback}
            className="rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:border-amber-400/70 hover:bg-amber-900/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-950/40 disabled:text-rose-muted disabled:opacity-60"
            title={fiftyFiftyUsed ? "Already used this game" : "Remove two wrong answers"}
          >
            50:50
          </button>
          <button type="button" onClick={onClose} className="btn-secondary px-3 py-2 text-xs">
            Exit
          </button>
        </div>
      </div>

      <p className="mb-5 text-sm font-medium leading-relaxed text-rose-ink">{q.question}</p>

      <div className="mb-5 grid gap-2">
        {q.choices.map((choice, index) => {
          const letter = LABELS[index];
          const picked = selectedIndex === index;
          const isRight = index === q.correctIndex;
          const eliminated = eliminatedIndices.has(index);
          let btnClass =
            "w-full rounded-xl border px-4 py-3 text-left text-xs transition-colors border-white/10 bg-slate-950/40 text-rose-ink hover:border-brand-500/50";

          if (eliminated && !showFeedback) {
            btnClass =
              "w-full cursor-not-allowed rounded-xl border border-white/5 bg-slate-950/25 px-4 py-3 text-left text-xs text-rose-muted line-through opacity-40";
          }

          if (showFeedback) {
            if (isRight) {
              btnClass =
                "w-full rounded-xl border px-4 py-3 text-left text-xs border-emerald-500/60 bg-emerald-950/40 text-emerald-100";
            } else if (picked && !isRight) {
              btnClass =
                "w-full rounded-xl border px-4 py-3 text-left text-xs border-red-500/60 bg-red-950/40 text-red-100";
            } else {
              btnClass =
                "w-full rounded-xl border px-4 py-3 text-left text-xs border-white/5 bg-slate-950/20 text-rose-soft opacity-70";
            }
          }

          return (
            <button
              key={index}
              type="button"
              disabled={showFeedback || eliminated}
              onClick={() => handleChoose(index)}
              className={btnClass}
            >
              <span className="font-semibold text-brand-500">{letter}.</span> {choice}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 ${
            isCorrect
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-100"
              : "border-amber-500/40 bg-amber-950/30 text-amber-100"
          }`}
        >
          <p className="text-xs font-semibold">{isCorrect ? "Correct!" : "Not quite."}</p>
          {isCorrect && (
            <p className="mt-1 text-[11px] text-amber-200">
              Your winnings are now {formatPrize(securedWinnings)}.
            </p>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-rose-muted">{q.explanation}</p>
        </div>
      )}

      {showFeedback && (
        <button type="button" onClick={handleContinue} className="btn-primary text-xs">
          {isCorrect && currentIndex < questions.length - 1
            ? "Next question"
            : "See results"}
        </button>
      )}
    </div>
  );
}
