import crypto from "crypto";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

const QURAN_API_BASE = process.env.QURAN_API_BASE || "https://api.quran.com/api/v4";
const QURAN_CONTENT_API = process.env.QURAN_CONTENT_API || "https://apis.quran.foundation/content/api/v4";
const QURAN_NOTES_API = process.env.QURAN_NOTES_API || "https://apis-prelive.quran.foundation/auth/v1/notes";
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

async function callGroqAI(messages) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_completion_tokens: 50,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  return response.json();
}

const AVAILABLE_EMOTIONS = [
  "Calm", "Anxious", "Confused", "Grateful", "Overwhelmed", "Hope",
  "Sadness", "Patience", "Strength", "Forgiveness", "Guidance", "Fear",
  "Motivation", "Trust in Allah", "Loneliness", "Peace of heart", "Stress relief"
];

async function analyzeEmotionWithAI(userInput) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "gsk_your_key_here_replace_me") {
    return null;
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are an emotion analyzer. Analyze the user's input and match it to one of these emotions: ${AVAILABLE_EMOTIONS.join(", ")}.

Return ONLY the emotion name, nothing else. If unsure, choose the closest match.`
      },
      {
        role: "user",
        content: `User said: "${userInput}"

What emotion best matches this?`
      }
    ];

    const result = await callGroqAI(messages);
    const emotion = result.choices[0]?.message?.content?.trim();

    if (emotion && AVAILABLE_EMOTIONS.some(e => e.toLowerCase() === emotion.toLowerCase())) {
      return AVAILABLE_EMOTIONS.find(e => e.toLowerCase() === emotion.toLowerCase());
    }
    return emotion;
  } catch (err) {
    console.error("AI emotion analysis error:", err.message);
    return null;
  }
}

async function findMatchingEmotion(input) {
  const inputLower = input.toLowerCase().trim();

  const exact = await prisma.emotion.findFirst({
    where: { name: { contains: inputLower, mode: "insensitive" } },
  });
  if (exact) return exact.name;

  const patterns = {
    calm: ["calm", "peace", "relaxed", "serene", "tranquil", "at ease", "rest", "content", "balanced"],
    anxious: ["anxious", "anxiety", "worried", "nervous", "uneasy", "panic", "tense", "overthinking", "racing mind"],
    stress: ["stress", "stressed", "burden", "pressure", "overwhelmed", "heavy", "exhausted", "burnout", "drained"],
    sad: ["sad", "sadness", "sorrow", "grief", "heartbroken", "down", "blue", "lonely", "empty", "hurt", "crying", "tears"],
    depressed: ["depressed", "hopeless", "helpless", "worthless", "empty", "numb", "disconnected"],
    grateful: ["grateful", "thankful", "blessed", "appreciative", "happy", "joy", "excited", "wonderful"],
    hope: ["hope", "hopeful", "optimistic", "looking forward", "positive", "excited about"],
    lost: ["lost", "confused", "uncertain", "direction", "purpose", "unclear", "stuck", "don't know"],
    confused: ["confused", "confusion", "puzzled", "perplexed", "unsure", "mixed up", "dazed"],
    guidance: ["guidance", "guide", "lead", "show me the way", "need help", "lost", "need direction"],
    fear: ["fear", "afraid", "scared", "frightened", "terrified", "dread", "horror", "phobia"],
    strength: ["strength", "strong", "power", "powerful", "brave", "courage", "confident", "capable"],
    patience: ["patience", "patient", "waiting", "frustrated", "impatient", "endure", "persevere"],
    forgiveness: ["forgive", "forgiveness", "sorry", "apologize", "regret", "guilt", "guilty", "remorse"],
    overwhelmed: ["overwhelmed", "too much", "can't handle", "flooded", "swamped", "snowed under"],
    loneliness: ["lonely", "alone", "abandoned", "isolated", "rejected", "left out", "no one"],
    "peace of heart": ["peace", "inner peace", "serenity", "calm heart", "comfort", "reassurance"],
    "trust in allah": ["trust", "rely on", "tawakkul", "faith", "belief", "surrender", "rest in allah"],
    motivation: ["motivation", "inspired", "driven", "ambition", "goal", "focus", "energized", "determined"],
  };

  for (const [emotion, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (inputLower.includes(keyword)) {
        return emotion.charAt(0).toUpperCase() + emotion.slice(1);
      }
    }
  }

  const aiEmotion = await analyzeEmotionWithAI(input);
  if (aiEmotion) {
    return aiEmotion;
  }

  return "Calm";
}

async function getRandomVerse(emotionName) {
  const matchedEmotion = await findMatchingEmotion(emotionName);

  const emotion = await prisma.emotion.findUnique({
    where: { name: matchedEmotion },
  });

  if (!emotion || !emotion.verses || emotion.verses.length === 0) {
    const defaultEmotion = await prisma.emotion.findUnique({
      where: { name: "Calm" },
    });
    const verses = defaultEmotion?.verses || ["2:286"];
    return verses[crypto.randomInt(verses.length)];
  }

  const randomIndex = crypto.randomInt(emotion.verses.length);
  return emotion.verses[randomIndex];
}

export async function getEmotions() {
  const emotions = await prisma.emotion.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return emotions.map((e) => e.name);
}

function normalizeVerseKey(verseKey) {
  if (!verseKey.includes(":")) {
    return verseKey;
  }

  if (verseKey.includes("-")) {
    const [chapter, verses] = verseKey.split(":");
    if (verses.includes("-")) {
      const [start] = verses.split("-").map(Number);
      return `${chapter}:${start}`;
    }
  }

  return verseKey;
}

export async function getVerseData(verseKey, accessToken, clientId) {
  const normalizedKey = normalizeVerseKey(verseKey);

  const verseRes = await fetch(`${QURAN_API_BASE}/verses/by_key/${normalizedKey}?fields=text_uthmani,chapter_id`, {
    headers: { Accept: "application/json" },
  });

  if (!verseRes.ok) {
    throw new Error(`Failed to fetch verse: ${verseRes.status}`);
  }

  const verseData = await verseRes.json();
  const verse = verseData.verse;

  let translation = "No translation available";
  let tafsir = "No tafsir available";

  try {
    const [translationRes, tafsirRes] = await Promise.all([
      fetch(`${QURAN_API_BASE}/quran/translations/149?verse_key=${normalizedKey}`, {
        headers: { Accept: "application/json" },
      }),
      fetch(`${QURAN_API_BASE}/tafsirs/169/by_ayah/${normalizedKey}`, {
        headers: { Accept: "application/json" },
      }),
    ]);

    if (translationRes.ok) {
      const transData = await translationRes.json();
      translation = transData.translations?.[0]?.text || translation;
    }

    if (tafsirRes.ok) {
      const tafsirData = await tafsirRes.json();
      tafsir = tafsirData.tafsir?.text || tafsir;
    }
  } catch (err) {
    console.error("Error fetching content from Quran API:", err.message);
  }

  return {
    verse_key: verseKey,
    chapter: verse.chapter_id,
    verse_number: verse.verse_number,
    arabic: verse.text_uthmani,
    translation: translation,
    tafsir: tafsir,
  };
}

export async function getVerseForEmotion(emotion, accessToken, clientId) {
  const verseKey = await getRandomVerse(emotion);
  const verseData = await getVerseData(verseKey, accessToken, clientId);

  return {
    emotion,
    ...verseData,
  };
}

export async function getNotes(accessToken, clientId) {
  const response = await fetch(QURAN_NOTES_API, {
    headers: {
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": clientId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`Get notes failed: ${response.status}`);
    throw new Error(errorText || "Failed to fetch notes");
  }

  return response.json();
}

export async function createNote(noteText, verseKey, accessToken, clientId) {
  let rangeKey = verseKey;
  if (verseKey.includes("-")) {
    rangeKey = verseKey.replace(/^(\d+):(\d+)-(\d+)$/, "$1:$2-$1:$3");
  } else if (!verseKey.includes("-") && verseKey.match(/^\d+:\d+$/)) {
    rangeKey = `${verseKey}-${verseKey}`;
  }
  
  try {
    const response = await fetch(QURAN_NOTES_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-auth-token": accessToken,
        "x-client-id": clientId,
      },
      body: JSON.stringify({
        body: noteText,
        saveToQR: true,
        ranges: [rangeKey],
        attachedEntity: {
          entityType: "reflection",
          entityId: verseKey,
          entityMetadata: {
            source: "Quran Twin",
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Create note failed: ${response.status}`, { status: response.status, body: errorText });
      throw new Error(errorText || `Failed to create note: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    logger.error(`saveNoteToQuran error: ${err.message}`, { verseKey, rangeKey });
    throw err;
  }
}

export async function updateNote(noteId, noteText, accessToken, clientId) {
  const response = await fetch(`${QURAN_NOTES_API}/${noteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": clientId,
    },
    body: JSON.stringify({
      body: noteText,
      saveToQR: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error = {};
    try {
      error = JSON.parse(errorText);
    } catch {}
    logger.error(`Update note error: ${response.status}`, errorText);
    throw new Error(error.message || `Failed to update note: ${response.status}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function deleteNote(noteId, accessToken, clientId) {
  const response = await fetch(`${QURAN_NOTES_API}/${noteId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": clientId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete note");
  }

  return response.json();
}

export async function saveNoteToQuran(noteText, verseKey, accessToken, clientId) {
  try {
    return await createNote(noteText, verseKey, accessToken, clientId);
  } catch (err) {
    logger.error(`saveNoteToQuran error: ${err.message}`);
    throw err;
  }
}