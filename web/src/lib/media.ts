import { API_BASE, getToken } from "./api";

const MAX_IMAGE_SIDE = 1200;

/* ---------------- images ---------------- */

export function compressImage(file: File): Promise<Blob> {
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
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not compress image")), keepPng ? "image/png" : "image/jpeg", 0.82);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
  const isImage = file.type.startsWith("image/");
  if (kind === "image" && !isImage) throw new Error("Please choose an image file");
  if (kind === "video" && isImage) throw new Error("Please choose a video file");

  if (file.size > 12 * 1024 * 1024) throw new Error('File exceeds the 12 MB upload limit');
  const fd = new FormData();
  fd.append("file", file);
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function isVideoSrc(src: string) { return /\.(mp4|webm|mov|m4v|ogv)$/i.test(src.split("?")[0]); }
