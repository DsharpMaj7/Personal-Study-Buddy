"use client";

import { useEffect, useState } from "react";

export interface FlashcardItem {
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  cards: FlashcardItem[];
  /** Tighter sizing for library / narrow columns */
  compact?: boolean;
}

export function FlashcardDeck({ cards, compact = false }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  if (!cards.length) {
    return <p className="text-rose-muted">No flashcards.</p>;
  }

  const card = cards[currentIndex]!;
  const atStart = currentIndex === 0;
  const atEnd = currentIndex === cards.length - 1;

  const padding = compact ? "px-4 py-5" : "px-6 py-8";
  const textMain = compact ? "text-[11px]" : "text-sm";
  const labelSize = compact ? "text-[9px]" : "text-[10px]";
  const faceArea = compact ? "min-h-[7rem]" : "min-h-[9rem]";

  function goPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
    setIsFlipped(false);
  }

  return (
    <div className={`mx-auto w-full ${compact ? "max-w-full" : "max-w-lg"}`}>
      <p className={`mb-3 text-center ${compact ? "text-[10px] text-rose-muted" : "text-[11px] text-rose-muted"}`}>
        Card {currentIndex + 1} of {cards.length}
      </p>

      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className={`relative w-full rounded-xl border border-white/10 bg-slate-950/40 ${padding} text-center shadow-sm outline-none transition-all duration-300 hover:border-brand-500/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500/50 cursor-pointer select-none`}
        aria-label={isFlipped ? "Show front of card" : "Show back of card"}
      >
        <p className={`${labelSize} font-medium uppercase tracking-wide text-rose-soft`}>
          {isFlipped ? "Answer" : "Prompt"}
        </p>

        <div className={`relative mt-3 ${faceArea}`}>
          <p
            className={`absolute inset-0 flex items-center justify-center px-1 text-center font-medium leading-relaxed text-rose-ink transition-opacity duration-300 ease-out ${textMain} ${isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            {card.front}
          </p>
          <p
            className={`absolute inset-0 flex items-center justify-center px-1 text-center leading-relaxed text-rose-muted transition-opacity duration-300 ease-out ${textMain} ${isFlipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {card.back}
          </p>
        </div>

        <p className={`mt-3 ${labelSize} text-rose-soft`}>
          Click card to {isFlipped ? "show front" : "reveal answer"}
        </p>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={atStart}
          className="btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={atEnd}
          className="btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
