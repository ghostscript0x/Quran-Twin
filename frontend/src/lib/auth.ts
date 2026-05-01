const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://quran-twin-backend.pxxl.click";

export type User = {
  sub: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
};

export const checkAuth = async (): Promise<{ authenticated: boolean; user?: User; tokenRefreshed?: boolean } | false> => {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/status`, {
      credentials: "include",
    });
    if (!res.ok) return false;
    return res.json();
  } catch {
    return false;
  }
};

export const logout = async () => {
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      credentials: "include",
    });
  } catch {
  }
  window.location.href = "/";
};

export const getBackendUrl = () => BACKEND_URL;