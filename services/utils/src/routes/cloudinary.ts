import express from "express";
import cloudinary from "cloudinary";
import { uploadLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/upload", uploadLimiter, async (req, res) => {
  try {
    const { buffer } = req.body;
    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
