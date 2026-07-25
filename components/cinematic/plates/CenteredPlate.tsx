"use client";
import type { CSSProperties } from "react";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

const lines = (t: string) =>
  t.split(" ").map((w, i) => (
    <span key={i} className="l"><i>{w}</i></span>
  ));

export default function CenteredPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  return (
    <div ref={ref} className="plate t-centered" style={{ "--cc": chapter.color } as CSSProperties}>
      <div className="stage">
        <img className="cimg" src={project.cover} alt={project.title} onClick={() => onOpen(project)} />
        <div className="cmeta">
          <div className="k">{k}</div>
          <h3>{lines(project.title)}</h3>
        </div>
      </div>
      <div className="cfoot">
        <div>
          {project.excerpt && <p className="pp">{project.excerpt}</p>}
          <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
        </div>
      </div>
    </div>
  );
}
