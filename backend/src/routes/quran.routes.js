import { Router } from "express";
import {
  getVerseForEmotion,
  saveNote,
  getEmotionsList,
  getUserNotes,
  editNote,
  removeNote,
} from "../controllers/quran.controller.js";

const router = Router();

router.get("/emotions", getEmotionsList);
router.post("/reflection", getVerseForEmotion);
router.post("/reflection/save", saveNote);

router.get("/notes", getUserNotes);
router.patch("/notes/:id", editNote);
router.delete("/notes/:id", removeNote);

export default router;