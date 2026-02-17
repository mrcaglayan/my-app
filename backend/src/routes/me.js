import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /me
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { rows } = await query(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [userId]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

export default router;
