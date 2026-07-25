"use client";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import type { Project } from "./types";

export default function ProjectOverlay({ project, color, onClose }: { project: Project | null; color: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = project ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <div className={`ov ${project ? "open" : ""}`} style={{ "--cc": color } as CSSProperties}>
      <div className="ovhead">
        <div className="logo">Studio Flatland</div>
        <button className="close" onClick={onClose}>Schließen ✕</button>
      </div>
      <div className="ovbody">
        {project && (
          <>
            <div className="k">{project.services?.length ? project.services.join(" · ") : project.categories.join(" · ")}</div>
            <h3>{project.title}</h3>
            {project.excerpt && <p>{project.excerpt}</p>}
            {project.images.map((src) => (
              <img key={src} src={src} alt={project.title} loading="lazy" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
