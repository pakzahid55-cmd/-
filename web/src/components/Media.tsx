import { useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { compressImage, isVideoSrc, uploadMedia } from "../lib/media";

/** Marketplace promo and product videos. */
export function MediaVideo({
  src,
  poster,
  className = "",
  autoPlay = false,
  loop = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
}) {
  if (!src) return null;
  return (
    <video
      src={src}
      poster={poster}
      controls={!autoPlay}
      autoPlay={autoPlay}
      muted={autoPlay}
      loop={loop}
      playsInline
      preload="metadata"
      className={className}
    />
  );
}

/** Multi/single image picker with direct file upload (+ optional URL). */
export function ImagePicker({
  images,
  onChange,
  single = false,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  single?: boolean;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const next: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) {
        const blob = await compressImage(f);
        next.push(await uploadMedia(new File([blob], 'kujuk-product.jpg', { type: blob.type }), 'image'));
      }
      onChange(single ? next.slice(0, 1) : [...images, ...next].slice(0, 8));
    } catch {
      setErr(t("admin.uploadError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-line">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs text-white"
              aria-label={t("common.delete")}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-slate-500 hover:border-royal hover:text-royal"
        >
          <span className="text-xl">{busy ? "⏳" : "📷"}</span>
          {t("admin.upload")}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mt-2 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("admin.orPasteUrl")}
          className="input-kujuk"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => {
            const u = url.trim();
            if (u) onChange(single ? [u] : [...images, u]);
            setUrl("");
          }}
          className="btn-secondary whitespace-nowrap px-4"
        >
          {t("common.add")}
        </button>
      </div>
      {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
    </div>
  );
}

/** Single video picker with direct file upload (+ optional URL) and preview. */
export function VideoPicker({ video, onChange }: { video: string | null; onChange: (v: string | null) => void }) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const addFile = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadMedia(f, "video"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("admin.uploadError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {video && (
        <div className="relative mb-2 overflow-hidden rounded-lg border border-line">
          {isVideoSrc(video) ? (
            <MediaVideo src={video} className="max-h-56 w-full bg-ink object-contain" />
          ) : (
            <img src={video} alt="" className="max-h-56 w-full object-contain" />
          )}
          <button
            type="button"
            onClick={() => {
              onChange(null);
            }}
            className="absolute end-2 top-2 rounded-full bg-ink/70 px-2.5 py-1 text-xs text-white"
          >
            {t("common.remove")}
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn-secondary px-4">
          {busy ? "⏳…" : `🎬 ${t("admin.uploadVideo")}`}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            void addFile(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("admin.orPasteUrl")}
          className="input-kujuk flex-1"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => {
            const u = url.trim();
            if (u) onChange(u);
            setUrl("");
          }}
          className="btn-secondary whitespace-nowrap px-4"
        >
          {t("common.add")}
        </button>
      </div>
      {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
    </div>
  );
}
