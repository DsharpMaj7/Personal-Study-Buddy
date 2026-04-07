export type ContentType = "text" | "url" | "pdf" | "video_transcript";

export interface StudyItem {
  id: string;
  user_id: string;
  title: string;
  source_type: ContentType;
  source_url?: string | null;
  text_content?: string | null;
  summary: string;
  key_points: string[];
  quiz_questions: {
    question: string;
    answer: string;
  }[];
  flashcards: {
    front: string;
    back: string;
  }[];
  tags: string[];
  created_at: string;
}

