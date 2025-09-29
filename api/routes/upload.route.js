import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Absolute path for listing images
const uploadDir = path.join(process.cwd(), "uploads/listings");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB per file

// Accept multiple files named "files"
router.post("/", upload.array("files", 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const fileUrls = req.files.map(file => `/uploads/listings/${file.filename}`);
    res.json({ success: true, files: fileUrls });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
});

export default router;
