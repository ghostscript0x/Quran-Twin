import type { Ayah } from "./mockApi";

export type HistoryEntry = {
  id: string;
  emotion: string;
  ayah: Ayah;
  reflection?: string;
  date: string;
};

const KEY = "qt_history";

export const getHistory = (): HistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveHistory = (entry: HistoryEntry) => {
  const list = getHistory();
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
};