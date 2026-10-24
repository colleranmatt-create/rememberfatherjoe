"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { relationships } from "@/site.config";
import { MAX_PHOTOS } from "@/lib/limits";
import { createPhotoUploads, submitMemory, type SubmitInput } from "./actions";

type Photo = { id: string; file: File; preview: string };

const MAX_EDGE = 1600;

// Shrinks phone photos (often 4–12 MB) to a ~300 KB JPEG before upload.
async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.85),
  );
}

export default function ShareForm({ college }: { college: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [relationship, setRelationship] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/") || f.name.match(/\.(heic|heif)$/i));
    if (picked.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);
    else setError(null);
    setPhotos((prev) => [
      ...prev,
      ...picked.slice(0, room).map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })),
    ]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const field = (k: string) => String(fd.get(k) ?? "");

    try {
      let photoPaths: string[] = [];
      if (photos.length) {
        setStatus("Preparing photos…");
        const blobs: Blob[] = [];
        for (const p of photos) {
          try {
            blobs.push(await toJpeg(p.file));
          } catch {
            throw new Error(`We couldn't read "${p.file.name}". Please try a different photo, or a JPEG.`);
          }
        }
        const res = await createPhotoUploads(blobs.length);
        if ("error" in res) throw new Error(res.error);
        for (const [i, u] of res.uploads.entries()) {
          setStatus(`Uploading photo ${i + 1} of ${blobs.length}…`);
          const put = await fetch(u.signedUrl, {
            method: "PUT",
            headers: { "content-type": "image/jpeg", "cache-control": "max-age=31536000", "x-upsert": "false" },
            body: blobs[i],
          });
          if (!put.ok) throw new Error("A photo didn't upload. Please check your connection and try again.");
        }
        photoPaths = res.uploads.map((u) => u.path);
      }

      setStatus("Saving your memory…");
      const input: SubmitInput = {
        name: field("name"),
        relationship: field("relationship"),
        relationshipDetail: field("relationshipDetail"),
        yearFrom: field("yearFrom"),
        yearTo: field("yearTo"),
        location: field("location"),
        memory: field("memory"),
        youtubeUrl: field("youtubeUrl"),
        email: field("email"),
        website: field("website"),
        photoPaths,
      };
      const result = await submitMemory(input);
      if (!result.ok) throw new Error(result.error);
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setStatus(null);
    }
  }

  if (done) {
    return (
      <div className="thanks" role="status">
        <h2>Thank you for sharing.</h2>
        <p>Your memory has been received. It will appear on the memory wall once it has been reviewed, usually within a day.</p>
        <div className="thanks-actions">
          <Link href="/#memories" className="button">
            Read memories
          </Link>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => {
              setDone(false);
              photos.forEach((p) => URL.revokeObjectURL(p.preview));
              setPhotos([]);
              setRelationship("");
            }}
          >
            Share another
          </button>
        </div>
      </div>
    );
  }

  const busy = status !== null;
  const detailLabel =
    relationship === "other"
      ? "Tell us how"
      : relationship === "sacrament"
        ? "Which sacrament?"
        : relationship === "student" || relationship === "campus-ministry"
          ? "School or class (optional)"
          : "Anything to add? (optional)";

  return (
    <form onSubmit={onSubmit} className="share-form">
      <label className="field">
        <span>Your name</span>
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>

      <label className="field">
        <span>How did you know him?</span>
        <select name="relationship" required value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option value="" disabled>
            Choose one
          </option>
          {relationships.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      {relationship && (
        <label className="field">
          <span>{detailLabel}</span>
          <input
            name="relationshipDetail"
            maxLength={120}
            required={relationship === "other"}
            placeholder={
              relationship === "student" || relationship === "campus-ministry"
                ? `e.g. ${college === "the college" ? "Class of 1998" : `${college}, Class of 1998`}`
                : relationship === "sacrament"
                  ? "e.g. First Communion, Confirmation"
                  : ""
            }
          />
        </label>
      )}

      <fieldset className="field years">
        <legend>Years you knew him (optional)</legend>
        <div className="row">
          <input name="yearFrom" inputMode="numeric" pattern="\d{4}" placeholder="From, e.g. 1995" aria-label="From year" />
          <span aria-hidden="true">–</span>
          <input name="yearTo" inputMode="numeric" pattern="\d{4}" placeholder="To, e.g. 1999" aria-label="To year" />
        </div>
      </fieldset>

      <label className="field">
        <span>Where do you live now? (optional)</span>
        <input name="location" maxLength={120} placeholder="City, State or Country" autoComplete="address-level2" />
      </label>

      <label className="field">
        <span>Your memory</span>
        <textarea name="memory" required minLength={2} maxLength={10000} rows={8} placeholder="A story, something he said, a moment you'll never forget…" />
      </label>

      <div className="field">
        <span>Photos (optional, up to {MAX_PHOTOS})</span>
        {photos.length > 0 && (
          <ul className="photo-previews">
            {photos.map((p) => (
              <li key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" />
                <button type="button" onClick={() => removePhoto(p.id)} aria-label="Remove photo" disabled={busy}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {photos.length < MAX_PHOTOS && (
          <label className="button button-quiet file-button">
            {photos.length ? "Add more photos" : "Add photos"}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} disabled={busy} />
          </label>
        )}
      </div>

      <label className="field">
        <span>YouTube link (optional)</span>
        <input name="youtubeUrl" type="url" inputMode="url" maxLength={300} placeholder="https://youtube.com/watch?v=…" />
      </label>

      <label className="field">
        <span>Your email (optional)</span>
        <input name="email" type="email" maxLength={254} autoComplete="email" />
        <small>Never shown publicly. Only used if we need to reach you about your memory.</small>
      </label>

      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button button-large" disabled={busy}>
        {status ?? "Share memory"}
      </button>
      <p className="fine-print">Memories are reviewed before they appear on the site.</p>
    </form>
  );
}
