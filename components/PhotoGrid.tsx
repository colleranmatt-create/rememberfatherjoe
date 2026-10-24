"use client";

import { useRef, useState } from "react";

export default function PhotoGrid({ photos, name }: { photos: string[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const step = (d: number) => setIndex((i) => (i + d + photos.length) % photos.length);

  return (
    <>
      <div className={`photos photos-${Math.min(photos.length, 3)}`}>
        {photos.map((src, i) => (
          <button key={src} type="button" onClick={() => open(i)} aria-label={`View photo ${i + 1} from ${name}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[index]} alt={`Photo ${index + 1} of ${photos.length} shared by ${name}`} />
        <div className="lightbox-controls">
          {photos.length > 1 && (
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo">
              ‹
            </button>
          )}
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close">
            Close
          </button>
          {photos.length > 1 && (
            <button type="button" onClick={() => step(1)} aria-label="Next photo">
              ›
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
