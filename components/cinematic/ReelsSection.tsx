"use client";
import { useEffect, useState } from "react";
import { useReveal } from "./useReveal";

// Placeholder reels (old studio shorts) — swap for the real reel ids/urls.
const DEFAULT_REELS = ["Ev84gDJE784", "mOXzKpRWEAQ", "2koa2D241bQ", "jyaEvAR5gB4"];

function ytId(s: string): string {
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : s;
}

export default function ReelsSection({ reels = DEFAULT_REELS }: { reels?: string[] }) {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState<string | null>(null);
  const ids = reels.map(ytId);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [active]);

  return (
    <section ref={ref} className="reels" id="reels">
      <div className="reels-head">
        <div className="k">Bewegtbild</div>
        <h2>Reels</h2>
        <span className="reels-sub">Hochformat fürs Social-Grid</span>
      </div>
      <div className="reels-row">
        {ids.map((id, i) => (
          <button
            key={id + i}
            className="reel"
            style={{ transitionDelay: `${Math.min(i, 8) * 0.06}s` }}
            onClick={() => setActive(id)}
            aria-label={`Reel ${i + 1} abspielen`}
          >
            <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
            <span className="reel-play"><span className="reel-play-ico" /></span>
          </button>
        ))}
      </div>

      {active && (
        <div className="reel-light" onClick={() => setActive(null)}>
          <button className="yt-close" onClick={() => setActive(null)}>Schließen ✕</button>
          <div className="reel-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${active}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Reel"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
