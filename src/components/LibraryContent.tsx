"use client";

import { useState } from "react";
import Link from "next/link";

import { FlashcardDeck } from "@/components/FlashcardDeck";
import { QuizQuestions } from "@/components/QuizQuestions";
import type { StudyItem } from "@/lib/types";

interface LibraryItem extends Omit<StudyItem, "user_id"> {
  user_id?: string;
}

export function LibraryContent({
  initialItems = [],
  isSignedIn = false,
}: {
  initialItems?: LibraryItem[];
  isSignedIn?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = Array.from(new Set(initialItems.flatMap((i) => i.tags ?? [])));
  const filtered = initialItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (item.tags ?? []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="glass-panel text-xs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-rose-ink">My Library</h1>
          <p className="text-xs text-rose-muted">
            Your saved study packs. Sign in to save and access them from anywhere.
          </p>
        </div>
        <Link
          href="/"
          className="btn-secondary rounded-full px-3 py-1.5 text-xs"
        >
          New study item
        </Link>
      </div>

      {!isSignedIn && (
        <div className="mb-6 rounded-xl border border-slate-600 bg-slate-800/60 px-5 py-5 text-center">
          <p className="text-rose-muted">
            <Link
              href="/signin"
              className="font-medium text-brand-600 underline hover:text-brand-500"
            >
              Sign in
            </Link>{" "}
            to see your saved study packs and access them from any device.
          </p>
        </div>
      )}

      {isSignedIn && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles and summaries…"
            className="input-soft min-w-[220px] flex-1 text-rose-ink placeholder:text-rose-soft"
          />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input-soft text-rose-ink"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {isSignedIn && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-10 text-center">
          <p className="text-rose-muted">
            No saved items yet.{" "}
            <Link href="/" className="font-medium text-brand-600 underline hover:text-brand-500">
              Generate a study pack
            </Link>{" "}
            and save it to your library.
          </p>
        </div>
      )}

      {isSignedIn && filtered.length > 0 && (
        <ul className="divide-y divide-slate-700">
          {filtered.map((item) => (
            <li key={item.id} className="py-5">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-[10px] font-bold text-white shadow-button">
                    {item.source_type.toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-rose-ink">{item.title}</div>
                    <div className="text-[10px] text-rose-soft">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {(item.tags ?? []).map((t) => (
                    <span key={t} className="tag-soft">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mb-2 line-clamp-3 text-rose-muted">{item.summary}</p>
              <details className="details-soft mt-2">
                <summary className="cursor-pointer text-[11px] font-medium text-brand-600">
                  View key points, quiz, and flashcards
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-rose-ink">
                      Key points
                    </div>
                    <ul className="space-y-1 text-[11px] text-rose-muted">
                      {item.key_points.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-rose-ink">
                      Quiz questions
                    </div>
                    <QuizQuestions
                      questions={item.quiz_questions}
                      listClassName="space-y-1 text-[11px] text-rose-muted"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-rose-ink">
                      Flashcards
                    </div>
                    <FlashcardDeck cards={item.flashcards} compact />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
