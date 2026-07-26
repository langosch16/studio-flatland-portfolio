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
  const title = project.caseTitle ?? project.title;
  const yt = project.youtube ? ytId(project.youtube) : null;
  const playable = !!(yt || project.video);
  const poster = yt ? `https://img.youtube.com/vi/${yt}/maxresdefault.jpg` : project.cover;

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPlaying(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [playing]);

  const activate = () => (playable ? setPlaying(true) : onOpen(project));

  return (
    <div ref={ref} className="plate t-video" style={{ "--cc": chapter.color } as CSSProperties}>
      <div className="media" onClick={activate}>
        <img src={poster} alt={title} loading="lazy" decoding="async" />
      </div>
      <div className="scrim" />
      {playable && (
        <button className="vplay" onClick={activate} aria-label="Video abspielen">
          <span className="vplay-ico" />
        </button>
      )}
      <span className="vtag">▶ {yt ? "Showreel" : "Video"}</span>
      <div className="fb">
        <div className="k">{k}</div>
        <h3 className="tw">
          {title.split(" ").map((w, i) => (
            <span key={i} className="w">
              <i style={{ transitionDelay: `${(0.35 + i * 0.09).toFixed(2)}s` }}>{w}</i>
            </span>
          ))}
        </h3>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={(e) => { e.stopPropagation(); activate(); }}>
          {playable ? "Video ansehen →" : "Projekt ansehen →"}
        </span>
      </div>

      {playing && (
        <div className="yt-light" onClick={() => setPlaying(false)}>
          <button className="yt-close" onClick={() => setPlaying(false)}>Schließen ✕</button>
          {yt ? (
            <div className="yt-frame" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video className="reel-media" src={project.video} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
}
