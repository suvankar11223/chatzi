import { Router } from "express";
import { registerUser, loginUser } from "../controller/auth.controller.js";

const router = Router();

// Test endpoint for connection verification
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Server is reachable" });
});

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
