import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure "uploads" folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Upload endpoint
router.post("/", upload.array("files", 6), (req, res) => {
  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({ success: true, files: filePaths });
});

export default router;
