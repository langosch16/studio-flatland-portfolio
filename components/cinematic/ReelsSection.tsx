"use client";
import { useEffect, useState } from "react";
import { useReveal } from "./useReveal";

type Reel = { kind: "yt"; id: string } | { kind: "video"; src: string };
type Active = { kind: "yt"; id: string } | { kind: "video"; src: string } | null;

// Portrait 9:16 reels — YouTube shorts + self-hosted portrait loops.
const PORTRAIT: Reel[] = [
  { kind: "yt", id: "Ev84gDJE784" },
  { kind: "yt", id: "mOXzKpRWEAQ" },
  { kind: "yt", id: "2koa2D241bQ" },
  { kind: "yt", id: "jyaEvAR5gB4" },
  { kind: "video", src: "/projekte/wasserfall/loop.mp4" },
  { kind: "video", src: "/projekte/instagram-schoehnheitschirurgie-post/loop.mp4" },
];

// Square 1:1 animation loops.
const SQUARE: Reel[] = [
  { kind: "video", src: "/projekte/double-surf-pool/loop.mp4" },
  { kind: "video", src: "/projekte/grafik-inserts-animationen/loop.mp4" },
  { kind: "video", src: "/projekte/animierter-apfel/loop.mp4" },
  { kind: "video", src: "/projekte/volleyballanimation/loop.mp4" },
  { kind: "video", src: "/projekte/social-media-sabine-apfolterer/loop.mp4" },
];

function Tile({ reel, i, shape, onOpen }: { reel: Reel; i: number; shape: "portrait" | "square"; onOpen: (a: Active) => void }) {
  return (
    <button
      className={`reel reel-${shape}`}
      style={{ transitionDelay: `${Math.min(i, 8) * 0.05}s` }}
      onClick={() => onOpen(reel.kind === "yt" ? { kind: "yt", id: reel.id } : { kind: "video", src: reel.src })}
      aria-label="Reel abspielen"
    >
      {reel.kind === "yt" ? (
        <>
          <img src={`https://img.youtube.com/vi/${reel.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="reel-play"><span className="reel-play-ico" /></span>
        </>
      ) : (
        <video src={reel.src} muted loop autoPlay playsInline preload="metadata" />
      )}
    </button>
  );
}

export default function ReelsSection() {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState<Active>(null);

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
        <span className="reels-sub">Hochformat &amp; Social-Loops</span>
      </div>

      <div className="reels-row reels-row-portrait">
        {PORTRAIT.map((r, i) => <Tile key={i} reel={r} i={i} shape="portrait" onOpen={setActive} />)}
      </div>
      <div className="reels-row reels-row-sq">
        {SQUARE.map((r, i) => <Tile key={i} reel={r} i={i} shape="square" onOpen={setActive} />)}
      </div>

      {active && (
        <div className="reel-light" onClick={() => setActive(null)}>
          <button className="yt-close" onClick={() => setActive(null)}>Schließen ✕</button>
          {active.kind === "yt" ? (
            <div className="reel-frame" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="Reel"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video className="reel-media" src={active.src} controls autoPlay loop playsInline onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </section>
  );
}
