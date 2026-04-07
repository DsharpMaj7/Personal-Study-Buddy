"use server";

import { revalidatePath } from "next/cache";
import { extractTextFromPdfBuffer } from "@/lib/extractPdfText";
import { generateStudyPackWithGemini } from "@/lib/geminiGenerator";
import { generateMillionaireGame } from "@/lib/millionaireGenerator";
import { createSupabaseAuthClient, createSupabaseServerClient } from "@/lib/supabaseClient";
import type { ContentType } from "@/lib/types";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export interface GeneratePayload {
  title: string;
  sourceType: ContentType;
  textContent: string;
  sourceUrl?: string;
  tags: string[];
}

export async function generateStudyPackAction(payload: GeneratePayload) {
  return generateStudyPackWithGemini(payload);
}

export async function generateMillionaireGameAction(textContent: string) {
  return generateMillionaireGame(textContent);
}

export async function generateStudyPackFromPdfAction(formData: FormData) {
  const mode = formData.get("mode");
  if (mode !== "pdf") {
    throw new Error("Form must be submitted in PDF mode.");
  }

  const title = (formData.get("title") as string) || "Untitled";
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const file = formData.get("pdfFile");
  if (!(file instanceof File)) {
    throw new Error("Choose a PDF file to upload.");
  }
  if (file.size === 0) {
    throw new Error("The PDF file is empty.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF is too large (maximum size 15 MB).");
  }

  const looksPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksPdf) {
    throw new Error("Please upload a PDF file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const textContent = await extractTextFromPdfBuffer(buffer);

  return generateStudyPackWithGemini({
    title,
    sourceType: "pdf",
    textContent,
    tags,
  });
}

export type SaveResult = { ok: true } | { ok: false; reason: "auth_required" | "error"; message?: string };

export async function saveStudyItemAction(item: {
  title: string;
  source_type: ContentType;
  source_url?: string | null;
  text_content?: string | null;
  summary: string;
  key_points: string[];
  quiz_questions: { question: string; answer: string }[];
  flashcards: { front: string; back: string }[];
  tags: string[];
}): Promise<SaveResult> {
  try {
    const supabase = createSupabaseAuthClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, reason: "auth_required" };
    }

    const { error } = await createSupabaseServerClient()
      .from("study_items")
      .insert({
        user_id: user.id,
        title: item.title || "Untitled",
        source_type: item.source_type,
        source_url: item.source_url ?? null,
        text_content: item.text_content ?? null,
        summary: item.summary,
        key_points: item.key_points,
        quiz_questions: item.quiz_questions,
        flashcards: item.flashcards,
        tags: item.tags || []
      });

    if (error) {
      console.error("Save error:", error);
      return { ok: false, reason: "error", message: error.message };
    }

    revalidatePath("/library");
    return { ok: true };
  } catch (err) {
    console.error("Save error:", err);
    return { ok: false, reason: "error", message: "Failed to save." };
  }
}

export async function getStudyItemsAction(): Promise<
  | { ok: true; items: Awaited<ReturnType<typeof fetchStudyItems>> }
  | { ok: false; items: never[] }
> {
  try {
    const supabase = createSupabaseAuthClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, items: [] };
    }

    const items = await fetchStudyItems(user.id);
    return { ok: true, items };
  } catch {
    return { ok: false, items: [] };
  }
}

async function fetchStudyItems(userId: string) {
  const { data, error } = await createSupabaseServerClient()
    .from("study_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    return [];
  }
  return data ?? [];
}
