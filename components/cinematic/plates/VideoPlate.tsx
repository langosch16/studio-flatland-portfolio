"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

/** Accepts a raw 11-char id or any YouTube URL and returns the id. */
function ytId(s: string): string {
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : s;
}

export default function VideoPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const [playing, setPlaying] = useState(false);
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  const yt = project.youtube ? ytId(project.youtube) : null;

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPlaying(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [playing]);

  const activate = () => (yt ? setPlaying(true) : onOpen(project));

  return (
    <div ref={ref} className="plate t-video" style={{ "--cc": chapter.color } as CSSProperties}>
      <div className="media" onClick={activate}>
        {project.video ? (
          <video src={project.video} muted loop playsInline autoPlay preload="metadata" />
        ) : (
          <img src={yt ? `https://img.youtube.com/vi/${yt}/maxresdefault.jpg` : project.cover} alt={project.title} loading="lazy" decoding="async" />
        )}
      </div>
      <div className="scrim" />
      {yt && (
        <button className="vplay" onClick={activate} aria-label="Video abspielen">
          <span className="vplay-ico" />
        </button>
      )}
      <span className="vtag">▶ {yt ? "Showreel" : "Bewegtbild — Loop"}</span>
      <div className="fb">
        <div className="k">{k}</div>
        <h3 className="tw">
          {project.title.split(" ").map((w, i) => (
            <span key={i} className="w">
              <i style={{ transitionDelay: `${(0.35 + i * 0.09).toFixed(2)}s` }}>{w}</i>
            </span>
          ))}
        </h3>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={(e) => { e.stopPropagation(); activate(); }}>
          {yt ? "Video ansehen →" : "Projekt ansehen →"}
        </span>
      </div>

      {yt && playing && (
        <div className="yt-light" onClick={() => setPlaying(false)}>
          <button className="yt-close" onClick={() => setPlaying(false)}>Schließen ✕</button>
          <div className="yt-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`}
              title={project.title}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
