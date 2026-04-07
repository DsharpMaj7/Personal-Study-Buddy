"use client";

import type { StudyItem } from "./types";

const STORAGE_KEY = "studybuddy-items";

export function getLocalStudyItems(): StudyItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalStudyItem(item: StudyItem): void {
  const items = getLocalStudyItems();
  const index = items.findIndex((i) => i.id === item.id);
  const next = index >= 0
    ? items.map((i) => (i.id === item.id ? item : i))
    : [item, ...items];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function addLocalStudyItem(item: Omit<StudyItem, "id" | "created_at">): StudyItem {
  const full: StudyItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: "", // not used in local mode
  };
  saveLocalStudyItem(full);
  return full;
}
