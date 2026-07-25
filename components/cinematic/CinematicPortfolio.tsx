"use client";
import "./cinematic.css";
import { useMemo, useState, useEffect } from "react";
import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";
import { buildChapters } from "./buildChapters";
import Hero from "./Hero";
import ChapterBreak from "./ChapterBreak";
import ProjectPlate from "./plates";
import Archive from "./Archive";
import Clients from "./Clients";
import ProjectOverlay from "./ProjectOverlay";
import OverlayMenu from "./OverlayMenu";

export default function CinematicPortfolio({ projects }: { projects: Project[] }) {
  const chapters = useMemo(() => buildChapters(projects), [projects]);
  const [active, setActive] = useState<{ p: Project; color: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      const bar = document.getElementById("cin-prog");
      if (bar) bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (p: Project, color: string) => setActive({ p, color });

  return (
    <div className="cin">
      <div className="progress" id="cin-prog" />
      <header>
        <div className="logo">
          Studio<br />Flatland
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>Menü ✦</button>
      </header>

      <Hero />

      <main>
        {chapters.map((ch) => (
          <section key={ch.key} style={{ "--cc": ch.color } as CSSProperties}>
            <ChapterBreak ch={ch} />
            {ch.featured.map((p, i) => (
              <ProjectPlate
                key={p.slug}
                project={p}
                chapter={ch}
                index={i}
                onOpen={(pr) => open(pr, ch.color)}
              />
            ))}
          </section>
        ))}
        <Archive chapters={chapters} onOpen={(p) => open(p, "#2438e0")} />
      </main>

      <Clients />

      <section className="closing" id="closing">
        <div style={{ width: "100%" }}>
          <div className="reveal in">
            <h2>Let&apos;s<br />talk.</h2>
            <div className="mail">migo@mischgo.com</div>
          </div>
        </div>
        <div className="foot0">
          <span onClick={() => setMenuOpen(true)}>Kontakt</span>
          <span onClick={() => setMenuOpen(true)}>Impressum</span>
          <span onClick={() => setMenuOpen(true)}>Datenschutz</span>
          <span style={{ marginLeft: "auto" }}>© Studio Flatland 2026</span>
        </div>
      </section>

      <ProjectOverlay project={active?.p ?? null} color={active?.color ?? "#2438e0"} onClose={() => setActive(null)} />
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
