import express from "express";
import multer from "multer";
import path from "path";
import { createListing, deleteListing, updateListing, getListing, getListings } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
const projectRoot = path.resolve();

// Configure multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(projectRoot, "uploads")),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Create listing route with file upload + auth check
router.post("/create", verifyToken, upload.array("images", 10), createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);



export default router;
