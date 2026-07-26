"use client";
import type { CSSProperties } from "react";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

export default function FullbleedPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  const title = project.caseTitle ?? project.title;
  return (
    <div ref={ref} className={`plate t-fullbleed${project.slim ? " slim" : ""}`} style={{ "--cc": chapter.color } as CSSProperties}>
      <div className="media" onClick={() => onOpen(project)}>
        <img src={project.cover} alt={title}  loading="lazy" decoding="async" />
      </div>
      <div className="scrim" />
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
        <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
      </div>
    </div>
  );
}
