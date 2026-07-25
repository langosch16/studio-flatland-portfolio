"use client";
import type { CSSProperties } from "react";
import { useReveal } from "./useReveal";
import type { Chapter } from "./types";

export default function ChapterBreak({ ch }: { ch: Chapter }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`break dir-${ch.dir}`} style={{ "--cc": ch.color } as CSSProperties}>
      <div className="curtain" />
      <div className="inner wrap">
        <div className="num">Kapitel {ch.num} / 03</div>
        <h2>
          {ch.name.split(" ").map((w, i) => (
            <span key={i} className="l"><i>{w}</i></span>
          ))}
        </h2>
        <div className="tag">{ch.tag} · {ch.count} Projekte</div>
      </div>
      <div className="count">{ch.num}</div>
    </div>
  );
}
