import { GoogleGenerativeAI } from "@google/generative-ai";

import { parseModelJsonObject } from "./parseModelJson";

export interface MillionaireQuestion {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const MAX_CONTEXT_CHARS = 120_000;

const MILLIONAIRE_PROMPT = `You are a quiz writer for a multiple-choice study game (four options A–D). Based ONLY on the study content below, output exactly 10 questions in this EXACT JSON shape (no markdown, no code fences, only valid JSON):
{
  "questions": [
    {
      "question": "The question stem",
      "choices": ["First option", "Second option", "Third option", "Fourth option"],
      "correct_index": 0,
      "explanation": "1-3 sentences why the correct answer is right."
    }
  ]
}

Rules:
- Exactly 10 objects in "questions".
- Each "choices" array must have exactly 4 distinct, plausible strings.
- "correct_index" is an integer 0, 1, 2, or 3 (index of the correct choice in "choices").
- Questions must test understanding of the content, not trivia about formatting.
- "explanation" must not reveal letter labels; refer to the correct idea.

Return ONLY the JSON object, no other text.`;

function normalizeQuestions(raw: unknown): MillionaireQuestion[] {
  if (!raw || typeof raw !== "object" || !("questions" in raw)) return [];
  const arr = (raw as { questions: unknown }).questions;
  if (!Array.isArray(arr)) return [];

  const out: MillionaireQuestion[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const question = typeof q.question === "string" ? q.question : "";
    const choicesRaw = q.choices;
    const idxRaw =
      typeof q.correct_index === "number"
        ? q.correct_index
        : typeof q.correctIndex === "number"
          ? q.correctIndex
          : -1;
    const explanation = typeof q.explanation === "string" ? q.explanation : "";

    if (!Array.isArray(choicesRaw) || choicesRaw.length < 4) continue;
    const choices = choicesRaw.slice(0, 4).map((c) => (typeof c === "string" ? c : String(c)));
    if (choices.some((c) => !c.trim())) continue;

    let correctIndex = Math.floor(idxRaw);
    if (correctIndex < 0 || correctIndex > 3) correctIndex = 0;

    out.push({
      question: question.trim() || "Question",
      choices: choices as [string, string, string, string],
      correctIndex,
      explanation: explanation.trim() || "Review the material for more detail.",
    });
    if (out.length >= 10) break;
  }
  return out;
}

function fallbackMillionaireGame(): MillionaireQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    question: `Sample question ${i + 1} (add GEMINI_API_KEY for real quiz from your content)`,
    choices: ["Option A", "Option B", "Option C", "Option D"] as [string, string, string, string],
    correctIndex: 0,
    explanation: "Correct answer is the first option in this placeholder.",
  }));
}

function padQuestions(questions: MillionaireQuestion[]): MillionaireQuestion[] {
  const q = [...questions];
  while (q.length < 10) {
    q.push({
      question: `Bonus question ${q.length + 1}`,
      choices: ["Answer A", "Answer B", "Answer C", "Answer D"],
      correctIndex: 0,
      explanation: "Placeholder — review your study material.",
    });
  }
  return q.slice(0, 10);
}

export async function generateMillionaireGame(textContent: string): Promise<MillionaireQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const content = textContent.trim().slice(0, MAX_CONTEXT_CHARS) || "No study content provided.";

  if (!apiKey) {
    return fallbackMillionaireGame();
  }

  const fullPrompt = `${MILLIONAIRE_PROMPT}

STUDY CONTENT:

${content}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(fullPrompt);
    const text = (await result.response.text())?.trim();
    if (!text) {
      return padQuestions([]);
    }

    const parsed = parseModelJsonObject(text);
    const questions = normalizeQuestions(parsed);
    return padQuestions(questions);
  } catch (err) {
    console.error("Millionaire generation error:", err);
    throw err;
  }
}
