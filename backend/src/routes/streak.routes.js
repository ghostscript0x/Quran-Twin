import { Router } from "express";
import { getStreak, recordStreak } from "../controllers/streak.controller.js";

const router = Router();

router.get("/streak", getStreak);
router.post("/streak", recordStreak);

export default router;