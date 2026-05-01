import prisma from "../lib/prisma.js";

const getTodayKey = () => {
  return new Date().toISOString().split("T")[0];
};

export const getStreakForUser = async (userId) => {
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, currentStreak: 0 },
    });
  }

  return streak;
};

export const bumpStreakForUser = async (userId) => {
  const today = getTodayKey();
  
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    streak = await prisma.streak.create({
      data: { 
        userId, 
        currentStreak: 1,
        lastStreakDate: today,
      },
    });
    return { streak, isNewDay: true };
  }

  if (streak.lastStreakDate === today) {
    return { streak, isNewDay: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  
  let newStreak = streak.currentStreak;
  
  if (streak.lastStreakDate === yesterdayKey) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const updated = await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      lastStreakDate: today,
    },
  });

  return { streak: updated, isNewDay: true };
};

export const resetStreakForUser = async (userId) => {
  return prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: 0,
      lastStreakDate: null,
    },
  });
};