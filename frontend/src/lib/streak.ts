const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("Missing required environment variable VITE_BACKEND_URL");
}

export type StreakData = {
  currentStreak: number;
  lastStreakDate: string | null;
  isNewDay?: boolean;
};

export const getStreak = async (): Promise<StreakData> => {
  const res = await fetch(`${BACKEND_URL}/user/streak`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to get streak");
  }

  return res.json();
};

export const recordStreak = async (): Promise<StreakData> => {
  const res = await fetch(`${BACKEND_URL}/user/streak`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to record streak");
  }

  return res.json();
};