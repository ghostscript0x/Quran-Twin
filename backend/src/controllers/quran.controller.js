import {
  getVerseForEmotion as fetchVerseForEmotion,
  saveNoteToQuran,
  getEmotions,
  getNotes,
  updateNote,
  deleteNote,
} from "../services/quran.service.js";
import { refreshTokenIfNeeded, getUserBySub } from "../services/auth.service.js";
import { bumpStreakForUser } from "../services/streak.service.js";
import logger from "../lib/logger.js";

function validateString(value, fieldName, maxLength = 1000) {
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }
  if (value.trim().length === 0) {
    return `${fieldName} cannot be empty`;
  }
  if (value.length > maxLength) {
    return `${fieldName} exceeds maximum length of ${maxLength}`;
  }
  return null;
}

export async function getEmotionsList(req, res) {
  try {
    const emotions = await getEmotions();
    res.json(emotions);
  } catch (err) {
    logger.error("Get emotions error:", err.message);
    res.status(500).json({ error: "Failed to get emotions" });
  }
}

export async function getVerseForEmotion(req, res) {
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { emotion } = req.body;

  const validationError = validateString(emotion, "Emotion", 50);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

try {
    const user = await getUserBySub(userSub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);
    if (tokenResult?.needsRefresh) {
      accessToken = tokenResult.accessToken;

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const clientId = process.env.QURAN_CLIENT_ID;
    const verseData = await fetchVerseForEmotion(emotion, accessToken, clientId);
    res.json(verseData);
  } catch (err) {
    logger.error("Get verse error:", err.message);
    res.status(500).json({ error: "Failed to get verse data" });
  }
}

export async function saveNote(req, res) {
  const { note, verse_key } = req.body;
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const validationError = validateString(note, "Note", 5000);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const validationError2 = validateString(verse_key, "Verse key", 20);
  if (validationError2) {
    return res.status(400).json({ error: validationError2 });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);
    if (tokenResult?.needsRefresh) {
      accessToken = tokenResult.accessToken;

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const clientId = process.env.QURAN_CLIENT_ID;
    const result = await saveNoteToQuran(note, verse_key, accessToken, clientId);
    
    const { streak, isNewDay } = await bumpStreakForUser(user.id);
    
    res.json({ success: true, note: result, streak: streak.currentStreak, isNewDay });
  } catch (err) {
    logger.error(`Save note error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: "Failed to save note to Quran account" });
  }
}

export async function getUserNotes(req, res) {
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) return res.status(401).json({ error: "User not found" });

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);
    if (tokenResult?.needsRefresh) {
      accessToken = tokenResult.accessToken;
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const clientId = process.env.QURAN_CLIENT_ID;
    const notes = await getNotes(accessToken, clientId);
    logger.info("Notes API Response:", JSON.stringify(notes).slice(0, 500));
    res.json(notes);
  } catch (err) {
    logger.error("Get notes error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

export async function editNote(req, res) {
  const { id } = req.params;
  const { body } = req.body;
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) return res.status(401).json({ error: "User not found" });

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);
    if (tokenResult?.needsRefresh) {
      accessToken = tokenResult.accessToken;
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const clientId = process.env.QURAN_CLIENT_ID;
    const result = await updateNote(id, body, accessToken, clientId);
    res.json(result);
  } catch (err) {
    logger.error("Edit note error:", err.message);
    res.status(500).json({ error: "Failed to update note" });
  }
}

export async function removeNote(req, res) {
  const { id } = req.params;
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) return res.status(401).json({ error: "User not found" });

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);
    if (tokenResult?.needsRefresh) {
      accessToken = tokenResult.accessToken;
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const clientId = process.env.QURAN_CLIENT_ID;
    await deleteNote(id, accessToken, clientId);
    res.json({ success: true });
  } catch (err) {
    logger.error("Remove note error:", err.message);
    res.status(500).json({ error: "Failed to delete note" });
  }
}