"use client";

import { useState } from "react";

// Shows a thumbnail until tapped, so a wall of memories doesn't load dozens of players.
export default function YouTubeEmbed({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title="YouTube video"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button type="button" className="video video-poster" onClick={() => setPlaying(true)} aria-label="Play video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
      <span className="play" aria-hidden="true" />
    </button>
  );
}
