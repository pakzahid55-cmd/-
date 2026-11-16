/**
 * Media upload helpers — works in BOTH modes:
 *  - Demo (static GitHub Pages): images become compressed data-URLs; videos are
 *    stored in IndexedDB and referenced by "demo-video:<id>" markers.
 *  - Real app: files upload to POST /api/uploads (server stores under /uploads).
 */
import { isDemo } from "./mode";

const MAX_IMAGE_SIDE = 1200;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

/* ---------------- images ---------------- */

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      // PNG keeps transparency; everything else becomes JPEG for size.
      const keepPng = file.type === "image/png" || file.type === "image/svg+xml";
      resolve(canvas.toDataURL(keepPng ? "image/png" : "image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/* ---------------- demo video store (IndexedDB) ---------------- */

const DB_NAME = "kajok-media";
const STORE = "videos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function uuid(): string {
  return "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function putVideo(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video is too large (max 80 MB)");
  const db = await openDb();
  const id = uuid();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return `demo-video:${id}`;
}

export async function getVideoBlob(ref: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(ref.replace("demo-video:", ""));
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteVideo(ref: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(ref.replace("demo-video:", ""));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* ignore */
  }
}

/* ---------------- unified API ---------------- */

/** Upload one file and return a src usable by MediaVideo / <img>. */
export async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
  const isImage = file.type.startsWith("image/");
  if (kind === "image" && !isImage) throw new Error("Please choose an image file");
  if (kind === "video" && isImage) throw new Error("Please choose a video file");

  if (isDemo) {
    if (isImage) return compressImage(file);
    return putVideo(file);
  }

  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("kajok.token");
  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function isVideoSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("demo-video:") || src.startsWith("data:video/")) return true;
  const clean = src.split("?")[0] ?? "";
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(clean);
}

/** Resolve a possibly-stored demo ref into a displayable URL. */
export async function resolveMediaSrc(src: string): Promise<string> {
  if (src.startsWith("demo-video:")) {
    const blob = await getVideoBlob(src);
    return blob ? URL.createObjectURL(blob) : "";
  }
  return src;
}
