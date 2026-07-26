"use client";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

export default function LogoWallPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  const logos = project.images.filter((src) => !src.includes("01-cover"));

  return (
    <div ref={ref} className="plate t-logowall">
      <div className="lw-head">
        <div className="k">{k}</div>
        <h3>{project.title}</h3>
        <span className="lw-count">{logos.length} Entwürfe</span>
      </div>
      <div className="lw-grid">
        {logos.map((src, i) => (
          <button
            key={src}
            className="lw-cell"
            style={{ transitionDelay: `${Math.min(i, 24) * 0.02}s` }}
            onClick={() => onOpen(project)}
            aria-label={`${project.title} — Logo ${i + 1} ansehen`}
          >
            <span className="lw-idx">{i + 1}</span>
            <img src={src} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
