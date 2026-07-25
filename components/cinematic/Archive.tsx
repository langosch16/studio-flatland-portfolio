"use client";
import type { CSSProperties } from "react";
import { useReveal } from "./useReveal";
import type { Chapter, Project } from "./types";

const CAP = 21;

export default function Archive({ chapters, onOpen }: { chapters: Chapter[]; onOpen: (p: Project) => void }) {
  const head = useReveal<HTMLDivElement>();
  const rows = chapters.map((c) => c.rest);
  const interleaved: { p: Project; color: string }[] = [];
  for (let i = 0; rows.some((r) => i < r.length); i++)
    for (let c = 0; c < rows.length; c++)
      if (i < rows[c].length) interleaved.push({ p: rows[c][i], color: chapters[c].color });
  const total = chapters.reduce((a, c) => a + c.count, 0);
  const shown = interleaved.slice(0, CAP);
  const more = total - shown.length - chapters.reduce((a, c) => a + c.featured.length, 0);

  return (
    <section className="arch">
      <div className="wrap">
        <div ref={head} className="head reveal">
          <h2>Weitere Arbeiten</h2>
          <div className="sub">Auswahl aus {total} Projekten</div>
        </div>
        <div className="grid">
          {shown.map(({ p, color }, i) => (
            <ArchTile key={p.slug} p={p} color={color} i={i} onOpen={onOpen} />
          ))}
        </div>
        {more > 0 && <div className="more">+ {more} weitere Projekte im vollständigen Archiv</div>}
      </div>
    </section>
  );
}

function ArchTile({ p, color, i, onOpen }: { p: Project; color: string; i: number; onOpen: (p: Project) => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="tile reveal"
      style={{ "--cc": color, transitionDelay: `${Math.min(i, 10) * 0.03}s` } as CSSProperties}
      onClick={() => onOpen(p)}
    >
      <span className="n">{String(i + 1).padStart(2, "0")}</span>
      <h4>{p.title}</h4>
    </div>
  );
}
