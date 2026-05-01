import { getBackendUrl } from "./auth";

const BACKEND_URL = getBackendUrl();

export type Reflection = {
  emotion: string;
  verse_key: string;
  chapter: number;
  verse_number: number;
  arabic: string;
  translation: string;
  tafsir: string;
};

export const getReflectionByEmotion = async (emotion: string): Promise<Reflection> => {
  const res = await fetch(`${BACKEND_URL}/quran/reflection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ emotion }),
  });

  if (!res.ok) {
    throw new Error("Failed to get reflection");
  }

  return res.json();
};

export const saveReflectionToQuran = async (note: string, verseKey: string) => {
  const res = await fetch(`${BACKEND_URL}/quran/reflection/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ note, verse_key: verseKey }),
  });

  if (!res.ok) {
    throw new Error("Failed to save reflection to Quran account");
  }

  return res.json();
};

export const getEmotions = async (): Promise<string[]> => {
  const res = await fetch(`${BACKEND_URL}/quran/emotions`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to get emotions");
  }

  return res.json();
};

export type Note = {
  id: string;
  body: string;
  ranges: string[];
  createdAt: string;
  updatedAt: string;
};

export const fetchNotes = async (): Promise<Note[]> => {
  const res = await fetch(`${BACKEND_URL}/quran/notes`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  return res.json();
};

export const updateNote = async (id: string, body: string): Promise<Note> => {
  const res = await fetch(`${BACKEND_URL}/quran/notes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    throw new Error("Failed to update note");
  }

  return res.json();
};

export const deleteNote = async (id: string): Promise<void> => {
  const res = await fetch(`${BACKEND_URL}/quran/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
};