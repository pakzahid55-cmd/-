import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

/**
 * POST /api/uploads — admin-only file upload (images & videos).
 * Files land in ./uploads and are served statically at /uploads/<name>.
 */
const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    cb(null, `${Date.now().toString(36)}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image and video files are allowed"));
  },
});

const uploadsRouter = Router();

uploadsRouter.post("/", requireAuth, requireAdmin, (req, res) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
      return;
    }
    const f = req.file;
    if (!f) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    res.status(201).json({ url: `/uploads/${f.filename}`, size: f.size, type: f.mimetype });
  });
});

export default uploadsRouter;
