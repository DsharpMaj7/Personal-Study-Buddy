"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  generateMillionaireGameAction,
  generateStudyPackAction,
  generateStudyPackFromPdfAction,
  saveStudyItemAction,
} from "@/app/actions";
import { MillionaireMode } from "@/components/MillionaireMode";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { QuizQuestions } from "@/components/QuizQuestions";
import { StudyMode } from "@/components/StudyMode";
import type { MillionaireQuestion } from "@/lib/millionaireGenerator";
import type { ContentType } from "@/lib/types";

interface GeneratedItem {
  title: string;
  source_type: ContentType;
  source_url?: string | null;
  text_content?: string | null;
  summary: string;
  key_points: string[];
  quiz_questions: { question: string; answer: string }[];
  flashcards: { front: string; back: string }[];
  tags: string[];
}

export function CreateStudyForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<GeneratedItem | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "auth_required" | "success" } | null>(null);
  const [studyModeActive, setStudyModeActive] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "pdf" | "video">("text");
  const [generateError, setGenerateError] = useState<string | null>(null);

  function getFormPayload(form: HTMLFormElement) {
    const formData = new FormData(form);
    const mode = (formData.get("mode") as string) || "text";
    const title = (formData.get("title") as string) || "Untitled";
    const text = (formData.get("text") as string) || "";
    const url = (formData.get("url") as string) || "";
    const videoTranscript = (formData.get("videoTranscript") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "";

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const textContent = mode === "text" ? text : videoTranscript;

    const sourceType: ContentType =
      mode === "pdf" ? "pdf" : mode === "video" ? "video_transcript" : "text";

    return {
      title,
      sourceType,
      textContent,
      sourceUrl: mode === "video" ? url || undefined : undefined,
      tags,
    };
  }

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setGenerateError(null);
    setSaveMessage(null);

    if (inputMode === "pdf") {
      const pdfInput = form.querySelector<HTMLInputElement>('input[name="pdfFile"]');
      if (!pdfInput?.files?.length) {
        setGenerateError("Choose a PDF file.");
        return;
      }

      setIsGenerating(true);
      try {
        const fd = new FormData(form);
        const generated = await generateStudyPackFromPdfAction(fd);
        setGeneratedItem(generated);
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : "Could not process the PDF.");
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    const payload = getFormPayload(form);

    if (inputMode === "text" && !payload.textContent.trim()) {
      setGenerateError("Add some text to study.");
      return;
    }
    if (inputMode === "video" && !payload.textContent.trim()) {
      setGenerateError("Paste a video transcript.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateStudyPackAction(payload);
      setGeneratedItem(generated);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedItem) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const result = await saveStudyItemAction(generatedItem);

      if (result.ok) {
        setSaveMessage({ type: "success" });
        router.push("/library");
        return;
      }

      if (result.reason === "auth_required") {
        setSaveMessage({ type: "auth_required" });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="glass-panel">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-rose-ink">
              Create study pack
            </h1>
            <p className="text-xs text-rose-muted">
              Paste text, upload a PDF, or provide a video transcript. Generate without signing in.
            </p>
          </div>
          <Link
            href="/library"
            className="btn-secondary rounded-full px-3 py-1.5 text-xs"
          >
            My Library
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-rose-muted">Title</span>
            <input
              name="title"
              className="input-soft text-rose-ink placeholder:text-rose-soft"
              placeholder="e.g. Chapter 3 – Neural Networks"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-rose-muted">Tags</span>
            <input
              name="tags"
              className="input-soft text-rose-ink placeholder:text-rose-soft"
              placeholder="comma-separated, e.g. math, exam, week 2"
            />
          </label>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">
            <input
              type="radio"
              name="mode"
              value="text"
              checked={inputMode === "text"}
              onChange={() => {
                setGenerateError(null);
                setInputMode("text");
              }}
              className="accent-brand-500"
            />
            <span>Paste text</span>
          </label>
          <label className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">
            <input
              type="radio"
              name="mode"
              value="pdf"
              checked={inputMode === "pdf"}
              onChange={() => {
                setGenerateError(null);
                setInputMode("pdf");
              }}
              className="accent-brand-500"
            />
            <span>Upload PDF</span>
          </label>
          <label className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">
            <input
              type="radio"
              name="mode"
              value="video"
              checked={inputMode === "video"}
              onChange={() => {
                setGenerateError(null);
                setInputMode("video");
              }}
              className="accent-brand-500"
            />
            <span>Video transcript</span>
          </label>
        </div>

        {inputMode === "text" && (
          <div className="mb-5 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-rose-muted">Text / transcript</span>
              <textarea
                name="text"
                rows={12}
                className="input-soft min-h-[200px] text-rose-ink placeholder:text-rose-soft"
                placeholder="Paste the text you want to study…"
              />
            </label>
          </div>
        )}

        {inputMode === "pdf" && (
          <div className="mb-5 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-rose-muted">PDF file</span>
              <input
                type="file"
                name="pdfFile"
                accept=".pdf,application/pdf"
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-rose-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
              />
            </label>
            <p className="mt-2 text-[11px] text-rose-soft">
              Text-based PDFs work best. Scanned pages (images only) are not read unless you use
              OCR elsewhere first. Maximum size 15 MB.
            </p>
          </div>
        )}

        {inputMode === "video" && (
          <div className="mb-5 grid gap-4 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-rose-muted">Video transcript</span>
              <textarea
                name="videoTranscript"
                rows={12}
                className="input-soft min-h-[200px] text-rose-ink placeholder:text-rose-soft"
                placeholder="Paste the full or partial transcript…"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-rose-muted">Source URL (optional)</span>
              <input
                name="url"
                className="input-soft text-rose-ink placeholder:text-rose-soft"
                placeholder="Link to the video (optional)…"
              />
            </label>
          </div>
        )}

        {generateError && (
          <p className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200">
            {generateError}
          </p>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="btn-primary mt-4"
        >
          {isGenerating ? "Generating…" : "Generate study pack"}
        </button>
      </form>

      {generatedItem && (
        <GeneratedResultsPanel
          item={generatedItem}
          onSave={handleSave}
          isSaving={isSaving}
          saveMessage={saveMessage}
          studyModeActive={studyModeActive}
          onStudyModeChange={setStudyModeActive}
        />
      )}
    </div>
  );
}

function GeneratedResultsPanel({
  item,
  onSave,
  isSaving,
  saveMessage,
  studyModeActive,
  onStudyModeChange,
}: {
  item: GeneratedItem;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: { type: "auth_required" | "success" } | null;
  studyModeActive: boolean;
  onStudyModeChange: (active: boolean) => void;
}) {
  const [millionaireActive, setMillionaireActive] = useState(false);
  const [millionaireLoading, setMillionaireLoading] = useState(false);
  const [millionaireError, setMillionaireError] = useState<string | null>(null);
  const [millionaireQuestions, setMillionaireQuestions] = useState<MillionaireQuestion[] | null>(
    null
  );

  async function handlePlayMillionaire() {
    const textContent = item.text_content?.trim() ?? "";
    if (!textContent) {
      setMillionaireError("No source text available for this pack. Regenerate with content.");
      setMillionaireActive(true);
      return;
    }

    onStudyModeChange(false);
    setMillionaireActive(true);
    setMillionaireError(null);
    setMillionaireQuestions(null);
    setMillionaireLoading(true);
    try {
      const questions = await generateMillionaireGameAction(textContent);
      setMillionaireQuestions(questions);
    } catch {
      setMillionaireError("Could not load Millionaire Mode. Try again.");
    } finally {
      setMillionaireLoading(false);
    }
  }

  function handleCloseMillionaire() {
    setMillionaireActive(false);
    setMillionaireQuestions(null);
    setMillionaireError(null);
  }

  if (studyModeActive) {
    return (
      <StudyMode
        flashcards={item.flashcards}
        quizQuestions={item.quiz_questions}
        onClose={() => onStudyModeChange(false)}
      />
    );
  }

  if (millionaireActive) {
    if (millionaireLoading) {
      return (
        <div className="glass-panel text-xs">
          <p className="text-rose-muted">Preparing your quiz…</p>
        </div>
      );
    }

    if (millionaireError && !millionaireQuestions?.length) {
      return (
        <div className="glass-panel text-xs">
          <p className="text-red-200">{millionaireError}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handlePlayMillionaire} className="btn-primary text-xs">
              Try again
            </button>
            <button type="button" onClick={handleCloseMillionaire} className="btn-secondary text-xs">
              Back
            </button>
          </div>
        </div>
      );
    }

    if (millionaireQuestions?.length) {
      return (
        <MillionaireMode questions={millionaireQuestions} onClose={handleCloseMillionaire} />
      );
    }

    return (
      <div className="glass-panel text-xs">
        <p className="text-rose-muted">Starting…</p>
      </div>
    );
  }

  return (
    <div className="glass-panel text-xs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-rose-ink">Generated study pack</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMillionaireActive(false);
              setMillionaireQuestions(null);
              onStudyModeChange(true);
            }}
            className="btn-primary px-3 py-2 text-xs"
          >
            Start Study Mode
          </button>
          <button
            type="button"
            onClick={handlePlayMillionaire}
            disabled={millionaireLoading}
            className="btn-primary bg-amber-600 px-3 py-2 text-xs hover:bg-amber-500"
          >
            Play Millionaire Mode
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="btn-secondary px-3 py-2 text-xs"
          >
            {isSaving ? "Saving…" : "Save to library"}
          </button>
          <Link
            href="/library"
            className="btn-secondary px-3 py-2 text-xs"
          >
            View library
          </Link>
        </div>
      </div>

      {saveMessage?.type === "auth_required" && (
        <p className="mb-5 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-200">
          Create a free account to save this study pack and access it later.{" "}
          <Link href="/signin" className="font-medium text-brand-600 underline hover:text-brand-500">
            Sign in
          </Link>
        </p>
      )}

      {item.title.trim() && item.title !== "Untitled" && (
        <div className="mb-3 text-sm font-semibold text-rose-ink">{item.title}</div>
      )}
      <div className="mb-5">
        <div className="mb-1.5 font-medium text-rose-ink">Summary</div>
        <p className="text-rose-muted">{item.summary}</p>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 font-medium text-rose-ink">Key points</div>
        <ul className="space-y-1.5 text-rose-muted">
          {item.key_points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 font-medium text-rose-ink">
          Quiz questions ({item.quiz_questions.length})
        </div>
        <QuizQuestions questions={item.quiz_questions} />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 font-medium text-rose-ink">
          Flashcards ({item.flashcards.length})
        </div>
        <FlashcardDeck cards={item.flashcards} />
      </div>
    </div>
  );
}
