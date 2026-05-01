import { getStreakForUser, bumpStreakForUser } from "../services/streak.service.js";
import { getUserBySub } from "../services/auth.service.js";
import logger from "../lib/logger.js";

export async function getStreak(req, res) {
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const streak = await getStreakForUser(user.id);
    res.json({
      currentStreak: streak.currentStreak,
      lastStreakDate: streak.lastStreakDate,
    });
  } catch (err) {
    logger.error("Get streak error:", err.message);
    res.status(500).json({ error: "Failed to get streak" });
  }
}

export async function recordStreak(req, res) {
  const userSub = req.cookies.user_sub;
  let accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { streak, isNewDay } = await bumpStreakForUser(user.id);
    res.json({
      currentStreak: streak.currentStreak,
      lastStreakDate: streak.lastStreakDate,
      isNewDay,
    });
  } catch (err) {
    logger.error("Record streak error:", err.message);
    res.status(500).json({ error: "Failed to record streak" });
  }
}