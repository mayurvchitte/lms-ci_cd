import express from "express";
import Note from "../models/Note.js";
import isAuth from "../middlewares/isAuth.js";

const notesRouter = express.Router();

/**
 * ✅ Get notes for a lecture
 */
notesRouter.post("/get", isAuth, async (req, res) => {
  const { courseId, lectureId } = req.body;

  if (!courseId || !lectureId) {
    return res.status(400).json({ success: false, message: "Missing courseId or lectureId" });
  }

  try {
    const note = await Note.findOne({
      userId: req.user.id,
      courseId,
      lectureId,
    });

    res.json({
      success: true,
      notes: note?.notes || "",
    });
  } catch (error) {
    console.error("Notes GET error:", error);
    res.status(500).json({ success: false, message: "Error fetching notes" });
  }
});

/**
 * ✅ Save or update notes
 */
notesRouter.post("/save", isAuth, async (req, res) => {
  const { courseId, lectureId, notes } = req.body;

  if (!courseId || !lectureId) {
    return res.status(400).json({ success: false, message: "Missing courseId or lectureId" });
  }

  try {
    let note = await Note.findOne({
      userId: req.user.id,
      courseId,
      lectureId,
    });

    // ✅ Update
    if (note) {
      note.notes = notes;
      await note.save();
    } 
    // ✅ Create new
    else {
      await Note.create({
        userId: req.user.id,
        courseId,
        lectureId,
        notes,
      });
    }

    res.json({ success: true, message: "Notes saved successfully!" });

  } catch (error) {
    console.error("Notes SAVE error:", error);
    res.status(500).json({ success: false, message: "Error saving notes" });
  }
});

export default notesRouter;
