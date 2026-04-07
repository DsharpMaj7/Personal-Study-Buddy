import { GoogleGenerativeAI } from "@google/generative-ai";

import { parseModelJsonObject } from "./parseModelJson";
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

const STRUCTURED_PROMPT = `You are a study assistant. Given the following content, generate a study pack in this EXACT JSON format (no markdown, no code block wrapper, only valid JSON):
{
  "summary": "A concise 2-4 sentence summary of the content.",
  "key_points": ["Bullet 1", "Bullet 2", ...],
  "quiz_questions": [{"question": "...", "answer": "..."}, ...],
  "flashcards": [{"front": "Term or question", "back": "Definition or answer"}, ...]
}

Requirements:
- summary: 2-4 sentences, concise
- key_points: 5-8 bullet points capturing main ideas
- quiz_questions: exactly 10 items, mix of question types, test understanding
- flashcards: exactly 10 items, front = term/question, back = definition/answer

Return ONLY the JSON object, no other text.`;

function fallbackStudyPack(payload: GeneratePayload): GeneratedStudyItem {
  const text = payload.textContent.slice(0, 300) || "No content provided.";
  return {
    title: payload.title || "Untitled",
    source_type: payload.sourceType,
    source_url: payload.sourceUrl ?? null,
    text_content: payload.textContent,
    summary: text + (payload.textContent.length > 300 ? "…" : ""),
    key_points: ["Content stored. Key points will appear when Gemini API is configured."],
    quiz_questions: Array.from({ length: 10 }, (_, i) => ({
      question: `Question ${i + 1} (add GEMINI_API_KEY to enable)`,
      answer: `Answer ${i + 1}`,
    })),
    flashcards: Array.from({ length: 10 }, (_, i) => ({
      front: `Card ${i + 1} front`,
      back: `Card ${i + 1} back`,
    })),
    tags: payload.tags,
  };
}

export async function generateStudyPackWithGemini(
  payload: GeneratePayload
): Promise<GeneratedStudyItem> {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("DEBUG GEMINI_API_KEY exists:", !!apiKey, "length", apiKey?.length);

  if (!apiKey) {
    return fallbackStudyPack(payload);
  }

  const content =
    payload.textContent.trim() ||
    "No meaningful content. Please add text to study.";

  const fullPrompt = `${STRUCTURED_PROMPT}

CONTENT TO ANALYZE:

${content}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = await response.text();

    if (!text) {
      return fallbackStudyPack(payload);
    }

    const parsed = parseModelJsonObject(text) as {
      summary?: string;
      key_points?: string[];
      quiz_questions?: { question: string; answer: string }[];
      flashcards?: { front: string; back: string }[];
    };

    const keyPoints = Array.isArray(parsed.key_points) ? parsed.key_points.slice(0, 8) : [];
    const quizQuestions = Array.isArray(parsed.quiz_questions)
      ? parsed.quiz_questions.slice(0, 10)
      : [];
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards.slice(0, 10) : [];

    while (quizQuestions.length < 10) {
      quizQuestions.push({
        question: `Supplementary question ${quizQuestions.length + 1}`,
        answer: "See content for details.",
      });
    }
    while (flashcards.length < 10) {
      flashcards.push({
        front: `Flashcard ${flashcards.length + 1}`,
        back: "See content for definition.",
      });
    }

    return {
      title: payload.title || "Untitled",
      source_type: payload.sourceType,
      source_url: payload.sourceUrl ?? null,
      text_content: payload.textContent,
      summary: parsed.summary || content.slice(0, 200) + "…",
      key_points: keyPoints.length ? keyPoints : ["Main ideas extracted from content."],
      quiz_questions: quizQuestions,
      flashcards,
      tags: payload.tags,
    };
  } catch (err) {
    console.error("Gemini generation error:", err);
    throw err;
  }
}
