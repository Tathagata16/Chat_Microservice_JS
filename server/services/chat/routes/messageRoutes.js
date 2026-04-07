import { getMessages } from "../controller/messageController.js";
import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/messages/:id", authMiddleware, getMessages);

export default router;