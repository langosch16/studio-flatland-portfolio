import type { Project, Treatment } from "@/data/projects";

export type ChapterKey = "animation" | "graphics" | "print";
export type CurtainDir = "up" | "left" | "center";

export type Chapter = {
  key: ChapterKey;
  num: string;          // "01" | "02" | "03"
  name: string;         // "Animation & Video"
  tag: string;          // subline
  color: string;        // chapter accent hex
  dir: CurtainDir;      // curtain entrance direction
  count: number;        // total projects in this chapter
  featured: Project[];  // full-screen plates
  rest: Project[];      // remaining projects (feed the archive)
};

export type { Project, Treatment };
