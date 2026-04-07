import type { ContentType } from "./types";

export interface GeneratePayload {
  title: string;
  sourceType: ContentType;
  textContent: string;
  sourceUrl?: string;
  tags: string[];
}

export interface GeneratedStudyItem {
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

function simpleChunk(text: string, maxChars: number) {
  return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
}

export function generateStudyPack(payload: GeneratePayload): GeneratedStudyItem {
  const baseSummary =
    simpleChunk(payload.textContent, 600) ||
    "No content provided. Add some text or a URL to generate richer study material.";

  const keyPoints = [
    "Key ideas will appear here once you integrate an LLM.",
    "Right now, StudyBuddy stores your content, tags, and metadata.",
    "You can still use the library, search, and tagging flows.",
  ];

  const quizQuestions = Array.from({ length: 10 }).map((_, i) => ({
    question: `Sample question ${i + 1} based on your content.`,
    answer: `Sample answer ${i + 1}.`,
  }));

  const flashcards = Array.from({ length: 10 }).map((_, i) => ({
    front: `Sample flashcard front ${i + 1}.`,
    back: `Sample flashcard back ${i + 1}.`,
  }));

  return {
    title: payload.title || "Untitled",
    source_type: payload.sourceType,
    source_url: payload.sourceUrl ?? null,
    text_content: payload.textContent,
    summary: baseSummary,
    key_points: keyPoints,
    quiz_questions: quizQuestions,
    flashcards,
    tags: payload.tags,
  };
}
