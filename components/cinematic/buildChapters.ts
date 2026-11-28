import type { Project } from "@/data/projects";
import type { Chapter, ChapterKey } from "./types";

const META: Record<ChapterKey, Omit<Chapter, "count" | "featured" | "rest">> = {
  animation: { key: "animation", num: "01", name: "Animation & Video", tag: "Bewegtbild", color: "#2438e0", dir: "up" },
  graphics:  { key: "graphics",  num: "02", name: "Grafik & Design",   tag: "Marken · Social · Plakat", color: "#c5541e", dir: "left" },
  print:     { key: "print",     num: "03", name: "Print & Editorial", tag: "Katalog · Folder · Magazin", color: "#177a68", dir: "center" },
};

const ORDER: ChapterKey[] = ["animation", "graphics", "print"];

function mapTheme(p: Project): ChapterKey {
  const c = p.categories.map((x) => x.toLowerCase());
  if (c.includes("video")) return "animation";
  if (c.includes("books") || c.includes("magazine")) return "print";
  return "graphics";
}

const DEFAULT_TREATMENT: Record<ChapterKey, Project["treatment"]> = {
  animation: "fullbleed",
  graphics: "split",
  print: "editorial",
};

export function buildChapters(projects: Project[]): Chapter[] {
  const bucket: Record<ChapterKey, Project[]> = { animation: [], graphics: [], print: [] };
  for (const p of projects) {
    if (p.hidden) continue;
    bucket[p.forceChapter ?? mapTheme(p)].push(p);
  }

  return ORDER.map((key) => {
    const all = bucket[key];
    const featured = all
      .filter((p) => p.featured)
      .map((p) => ({ ...p, treatment: p.treatment ?? DEFAULT_TREATMENT[key] }));
    const rest = all.filter((p) => !p.featured);
    return { ...META[key], count: all.length, featured, rest };
  });
}
