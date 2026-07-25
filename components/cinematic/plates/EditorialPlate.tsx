"use client";
import type { CSSProperties } from "react";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

const lines = (t: string) =>
  t.split(" ").map((w, i) => (
    <span key={i} className="l"><i>{w}</i></span>
  ));

export default function EditorialPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const num = String(index + 1).padStart(2, "0");
  return (
    <div ref={ref} className="plate t-editorial" style={{ "--cc": chapter.color } as CSSProperties}>
      <div className="ednum">{num}</div>
      <div className="ed-grid">
        <div className="ed-img" onClick={() => onOpen(project)}>
          <img src={project.cover} alt={project.title} />
        </div>
        <div>
          <div className="k">{chapter.name} — {num}</div>
          <h3>{lines(project.title)}</h3>
          {project.excerpt && <p className="pp">{project.excerpt}</p>}
          <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
        </div>
      </div>
    </div>
  );
}
