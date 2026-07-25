# Cinematic Portfolio (Konzept A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dark, immersive single-scroll "cinematic" portfolio (Konzept A) as a new route, without touching the live site at `mischgo.com`.

**Architecture:** New Git branch (`feature/cinematic`), never pushed to `master`. New component tree under `components/cinematic/` rendered at a NEW route `app/studio/page.tsx`. The existing homepage (`app/page.tsx` → `MasonryPortfolio`) stays exactly as-is, so `/` is unchanged even after a future merge. Data comes from the unchanged `data/projects.ts` (only additive optional fields). Animations use CSS transitions + a shared `IntersectionObserver` hook (no WebGL, mirrors the verified prototype). Reduced-motion respected throughout.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (present) + one scoped CSS Module for the animation-heavy styles, `motion` v12 (already a dep; optional). No test framework exists — **verification is done via `next build`, `next lint`, and the browser preview**, not unit tests.

**Canonical visual reference:** `docs/superpowers/reference/cinematic-prototype-v4.html` — the verified prototype. It contains the exact tokens, treatment markup, CSS, curtain directions, and animation timings. When a task says "port from the prototype", copy the corresponding CSS/markup from this file rather than inventing new values.

**Design spec:** `docs/superpowers/specs/2026-07-25-cinematic-portfolio-design.md`

---

## Safety invariants (must hold after every task)

1. `app/page.tsx` is never modified — `/` keeps rendering `MasonryPortfolio`.
2. `components/MasonryPortfolio.tsx` is never deleted or edited.
3. No commit is ever pushed to `master`. All work stays on `feature/cinematic`.
4. `data/projects.ts` changes are additive only (new optional fields), never removing or renaming existing fields.

---

## File Structure

```
app/
  studio/
    page.tsx                      # NEW — renders <CinematicPortfolio>, route = /studio
components/
  cinematic/
    CinematicPortfolio.tsx        # NEW — 'use client' orchestrator (state: overlay, menu)
    Hero.tsx                      # NEW — opening split-text hero
    ChapterBreak.tsx              # NEW — curtain break, direction per chapter index
    plates/
      index.tsx                   # NEW — <ProjectPlate> dispatcher by treatment
      FullbleedPlate.tsx          # NEW
      VideoPlate.tsx              # NEW
      SplitPlate.tsx              # NEW
      EditorialPlate.tsx          # NEW
      CenteredPlate.tsx           # NEW
    Archive.tsx                   # NEW — curated compact grid ("Weitere Arbeiten")
    Clients.tsx                   # NEW — big typographic client list
    ProjectOverlay.tsx            # NEW — fullscreen project detail (curtain in/out)
    OverlayMenu.tsx               # NEW — Kontakt / Impressum / Datenschutz
    useReveal.ts                  # NEW — IntersectionObserver hook (adds .in on enter)
    buildChapters.ts              # NEW — bucket + order projects into chapters
    types.ts                      # NEW — Chapter, Treatment, PlateItem types
    cinematic.module.css          # NEW — tokens + all treatment/animation CSS (ported)
data/
  projects.ts                     # MODIFY — add optional featured/treatment/video fields
docs/superpowers/reference/
  cinematic-prototype-v4.html     # reference only (already copied)
```

**Decomposition rationale:** each treatment is its own small file (one visual responsibility, easy to tune independently). The big animation CSS lives in one focused module so keyframes/timings sit together. State (overlay open, menu open) lives only in the orchestrator; leaf components are presentational.

---

### Task 0: Branch + `/studio` scaffold (prove the live site is untouched)

**Files:**
- Create branch: `feature/cinematic`
- Create: `app/studio/page.tsx`

- [ ] **Step 1: Create and switch to the feature branch**

```bash
cd "/Users/michaelabraham/PYTHON Projects/CLAUDE Code ORDNER/wwwMISCHGO"
git checkout -b feature/cinematic
```

- [ ] **Step 2: Create a minimal placeholder route**

Create `app/studio/page.tsx`:

```tsx
export default function StudioPage() {
  return <main style={{ minHeight: "100vh", background: "#0b0b0d", color: "#f4f1ea", display: "grid", placeItems: "center", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>Studio — Cinematic (WIP)</main>;
}
```

- [ ] **Step 3: Verify the build compiles and the homepage is unchanged**

Run: `npm run build`
Expected: build succeeds; output lists both `/` and `/studio` routes.

- [ ] **Step 4: Verify in browser (dev server via preview tooling), check `/` still shows the old grid and `/studio` shows the placeholder**

Start dev server, open `/` (old masonry unchanged) and `/studio` (dark placeholder). Confirm no console errors.

- [ ] **Step 5: Commit**

```bash
git add app/studio/page.tsx
git commit -m "chore: scaffold /studio route on feature branch (live homepage untouched)"
```

---

### Task 1: Additive data fields

**Files:**
- Modify: `data/projects.ts:1-13` (the `Project` type)

- [ ] **Step 1: Extend the `Project` type (additive, all optional)**

In `data/projects.ts`, change the type to:

```ts
export type Treatment = "fullbleed" | "video" | "split" | "editorial" | "centered";

export type Project = {
  slug: string;
  title: string;
  url: string;
  categories: string[];
  year: string;
  services: string[];
  excerpt: string;
  text: string;
  cover: string;
  images: string[];
  clients?: string[];
  featured?: boolean;      // shown as a full-screen plate in the cinematic scroll
  treatment?: Treatment;   // how a featured project is presented; default derived
  video?: string;          // optional mp4 path for the video plate (falls back to cover)
};
```

- [ ] **Step 2: Verify types compile (no data rows need changes yet — fields are optional)**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add data/projects.ts
git commit -m "feat(data): add optional featured/treatment/video fields to Project"
```

---

### Task 2: Chapter model + builder

**Files:**
- Create: `components/cinematic/types.ts`
- Create: `components/cinematic/buildChapters.ts`

- [ ] **Step 1: Define types**

Create `components/cinematic/types.ts`:

```ts
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
```

- [ ] **Step 2: Implement the builder**

Create `components/cinematic/buildChapters.ts`. Chapter ORDER is Animation → Grafik → Print. Curtain directions: animation=up, graphics=left, print=center (from prototype). `mapTheme` matches the existing logic in `MasonryPortfolio.tsx` (video→animation, books/magazine→print, else graphics).

```ts
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
  for (const p of projects) bucket[mapTheme(p)].push(p);

  return ORDER.map((key) => {
    const all = bucket[key];
    const featured = all
      .filter((p) => p.featured)
      .map((p) => ({ ...p, treatment: p.treatment ?? DEFAULT_TREATMENT[key] }));
    const rest = all.filter((p) => !p.featured);
    return { ...META[key], count: all.length, featured, rest };
  });
}
```

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/cinematic/types.ts components/cinematic/buildChapters.ts
git commit -m "feat(cinematic): chapter model + builder (Animation→Grafik→Print)"
```

---

### Task 3: `useReveal` hook

**Files:**
- Create: `components/cinematic/useReveal.ts`

- [ ] **Step 1: Implement an IntersectionObserver hook that adds an `in` class once, honoring reduced-motion by revealing immediately**

Create `components/cinematic/useReveal.ts`:

```ts
"use client";
import { useEffect, useRef } from "react";

/** Adds the `in` class when the element scrolls into view (once). */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.classList.add("in"); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/useReveal.ts
git commit -m "feat(cinematic): useReveal IntersectionObserver hook (reduced-motion aware)"
```

---

### Task 4: Scoped CSS module (tokens + all animation/treatment styles)

**Files:**
- Create: `components/cinematic/cinematic.module.css`

- [ ] **Step 1: Port the entire `<style>` block from the prototype into a CSS Module**

Open `docs/superpowers/reference/cinematic-prototype-v4.html`, copy the CSS inside `<style>…</style>`. Paste into `components/cinematic/cinematic.module.css`. Then adapt for CSS-Module + React:
- Keep `:root { --bg … }` custom properties (CSS Modules allow `:root`).
- Class selectors become module-scoped automatically; components reference them via `styles.plate` etc. Keep the class NAMES identical to the prototype (`plate`, `t-fullbleed`, `curtain`, `break`, `hero`, `line`, `tw`, `ednum`, `sp-color`, …) so the port is mechanical.
- Because CSS Modules scope class names, structural descendant selectors like `.plate.in h3 .l i` keep working as long as the same class names are applied in JSX. For the `in` toggle class and word/line reveal spans, apply the literal class strings in JSX (see later tasks) using `styles["t-fullbleed"]` for the treatment root and plain className strings for nested reveal spans that are targeted by descendant selectors. To avoid scoping mismatches on descendant-targeted helpers (`l`, `w`, `i`, `in`, `curtain`, `scrim`, `fb`, `meta`, `ednum`, `sp-color`, `sp-img`, `cimg`, `cmeta`, `cfoot`, `k`, `pp`, `view`), declare those with `:global(...)` inside the module, e.g. `.plate :global(.l) { … }`. Keep the treatment ROOT classes (`plate`, `t-*`, `hero`, `break`, `tile`, etc.) module-scoped and reference them via `styles`.

- [ ] **Step 2: Verify the module imports without build error by referencing it from the placeholder route temporarily**

Temporarily import in `app/studio/page.tsx`: `import styles from "@/components/cinematic/cinematic.module.css";` and add `className={styles.hero}` to a div. Run `npm run build`. Expected: success. Then revert the temporary edit.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/cinematic.module.css
git commit -m "feat(cinematic): scoped CSS module ported from verified prototype"
```

---

### Task 5: Hero component

**Files:**
- Create: `components/cinematic/Hero.tsx`

- [ ] **Step 1: Build the hero with split-line reveal + rotating discipline word**

Port markup/behavior from the prototype hero (`#hero`, `.line span`, `.hero-sub .rot`, rotator interval 1900ms, `.scrollcue`). Trigger `in` on mount via `requestAnimationFrame`. Rotating words: `["Editorial","Grafik","Animation","Typografie","Plakat","Branding"]`.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./cinematic.module.css";

const WORDS = ["Editorial", "Grafik", "Animation", "Typografie", "Plakat", "Branding"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [wi, setWi] = useState(0);
  useEffect(() => { requestAnimationFrame(() => ref.current?.classList.add("in")); }, []);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const iv = setInterval(() => setWi((v) => (v + 1) % WORDS.length), 1900);
    return () => clearInterval(iv);
  }, []);
  return (
    <section className={styles.hero} ref={ref} id="hero">
      <h1>
        <span className="line"><span>Studio</span></span>
        <span className="line"><span>Flat</span></span>
        <span className="line"><span>Land</span></span>
      </h1>
      <div className="hero-sub">
        <span>Wien · Grafik &amp; Bewegtbild</span><span>—</span>
        <span className="rot">{WORDS[wi]}</span>
      </div>
      <div className="scrollcue">Scroll</div>
    </section>
  );
}
```

(Class names `line`, `hero-sub`, `rot`, `scrollcue` are declared `:global` inside the module per Task 4.)

- [ ] **Step 2: Verify by rendering Hero in `/studio` and checking in the browser** (temporary import; keep for now — it becomes part of the orchestrator later). Confirm the three lines animate up on load and the word rotates. No console errors.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/Hero.tsx
git commit -m "feat(cinematic): Hero with split-line reveal and rotating disciplines"
```

---

### Task 6: ChapterBreak component

**Files:**
- Create: `components/cinematic/ChapterBreak.tsx`

- [ ] **Step 1: Build the break with per-chapter curtain direction**

Port `.break`, `.curtain`, direction classes `dir-up/dir-left/dir-center`, `.num`, `h2 .l i`, `.tag`, `.count` from the prototype. Use `useReveal` to add `in`. Split the chapter name into `.l>i` line spans.

```tsx
"use client";
import styles from "./cinematic.module.css";
import { useReveal } from "./useReveal";
import type { Chapter } from "./types";

export default function ChapterBreak({ ch }: { ch: Chapter }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${styles.break} ${styles["dir-" + ch.dir]}`} style={{ ["--cc" as string]: ch.color }}>
      <div className="curtain" />
      <div className="inner wrap">
        <div className="num">Kapitel {ch.num} / 03</div>
        <h2>{ch.name.split(" ").map((w, i) => <span key={i} className="l"><i>{w}</i></span>)}</h2>
        <div className="tag">{ch.tag} · {ch.count} Projekte</div>
      </div>
      <div className="count">{ch.num}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify** one break renders on `/studio`, curtain wipes in the correct direction per chapter (test all three colors). No console errors.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/ChapterBreak.tsx
git commit -m "feat(cinematic): ChapterBreak with per-chapter curtain direction"
```

---

### Task 7: Plate dispatcher + 5 treatment components

**Files:**
- Create: `components/cinematic/plates/index.tsx`
- Create: `components/cinematic/plates/FullbleedPlate.tsx`
- Create: `components/cinematic/plates/VideoPlate.tsx`
- Create: `components/cinematic/plates/SplitPlate.tsx`
- Create: `components/cinematic/plates/EditorialPlate.tsx`
- Create: `components/cinematic/plates/CenteredPlate.tsx`

Each treatment's markup/CSS is defined in the prototype's `plateHTML()` function and the `.t-*` CSS. Port each branch into its own component. All plates share a props shape and call `onOpen(project)` on click (the orchestrator provides it). Each root uses `useReveal` and sets `--cc`.

- [ ] **Step 1: Shared plate props + dispatcher**

Create `components/cinematic/plates/index.tsx`:

```tsx
"use client";
import type { Chapter, Project } from "../types";
import FullbleedPlate from "./FullbleedPlate";
import VideoPlate from "./VideoPlate";
import SplitPlate from "./SplitPlate";
import EditorialPlate from "./EditorialPlate";
import CenteredPlate from "./CenteredPlate";

export type PlateProps = { project: Project; chapter: Chapter; index: number; onOpen: (p: Project) => void };

export default function ProjectPlate(props: PlateProps) {
  switch (props.project.treatment) {
    case "fullbleed": return <FullbleedPlate {...props} />;
    case "video":     return <VideoPlate {...props} />;
    case "split":     return <SplitPlate {...props} />;
    case "editorial": return <EditorialPlate {...props} />;
    default:          return <CenteredPlate {...props} />;
  }
}
```

- [ ] **Step 2: FullbleedPlate** — port `.t-fullbleed` branch: media img (clip-path reveal), `.scrim`, `.fb` with kicker + word-stagger `h3.tw` + excerpt + view. Word stagger: split title into `<span class="w"><i style={{transitionDelay}}>word</i></span>`, delay `0.35 + i*0.09`s.

```tsx
"use client";
import styles from "../cinematic.module.css";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

export default function FullbleedPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  return (
    <div ref={ref} className={`${styles.plate} ${styles["t-fullbleed"]}`} style={{ ["--cc" as string]: chapter.color }}>
      <div className="media" onClick={() => onOpen(project)}><img src={project.cover} alt={project.title} /></div>
      <div className="scrim" />
      <div className="fb">
        <div className="k">{k}</div>
        <h3 className="tw">{project.title.split(" ").map((w, i) => (
          <span key={i} className="w"><i style={{ transitionDelay: `${(0.35 + i * 0.09).toFixed(2)}s` }}>{w}</i></span>
        ))}</h3>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: VideoPlate** — same as Fullbleed but renders a looping muted video when `project.video` is set, else the GIF/cover `<img>`; adds the `.vtag` badge.

```tsx
"use client";
import styles from "../cinematic.module.css";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

export default function VideoPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  return (
    <div ref={ref} className={`${styles.plate} ${styles["t-video"]}`} style={{ ["--cc" as string]: chapter.color }}>
      <div className="media" onClick={() => onOpen(project)}>
        {project.video
          ? <video src={project.video} muted loop playsInline autoPlay preload="metadata" />
          : <img src={project.cover} alt={project.title} />}
      </div>
      <div className="scrim" />
      <span className="vtag">▶ Bewegtbild — Loop</span>
      <div className="fb">
        <div className="k">{k}</div>
        <h3 className="tw">{project.title.split(" ").map((w, i) => (
          <span key={i} className="w"><i style={{ transitionDelay: `${(0.35 + i * 0.09).toFixed(2)}s` }}>{w}</i></span>
        ))}</h3>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
      </div>
    </div>
  );
}
```

Add `.t-video .media video { width:100%;height:100%;object-fit:cover;clip-path:inset(0 0 100% 0);transition:clip-path 1.3s cubic-bezier(.76,0,.24,1) }` and `.t-video.in .media video { clip-path:inset(0 0 0 0) }` to the module (mirror the img rule).

- [ ] **Step 4: SplitPlate** — port `.t-split`: `.sp-color` panel (chapter color, kicker + line-reveal `h3` + excerpt + view) and `.sp-img` (image scale-in). Title uses `.l>i` line spans (helper below).

```tsx
"use client";
import styles from "../cinematic.module.css";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

const lines = (t: string) => t.split(" ").map((w, i) => <span key={i} className="l"><i>{w}</i></span>);

export default function SplitPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  return (
    <div ref={ref} className={`${styles.plate} ${styles["t-split"]}`} style={{ ["--cc" as string]: chapter.color }}>
      <div className="sp-color">
        <div className="k">{k}</div>
        <h3>{lines(project.title)}</h3>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
      </div>
      <div className="sp-img" onClick={() => onOpen(project)}><img src={project.cover} alt={project.title} /></div>
    </div>
  );
}
```

- [ ] **Step 5: EditorialPlate** — port `.t-editorial`: giant `.ednum`, `.ed-grid` with `.ed-img` (rise-in) and meta (kicker + line-reveal `h3` + excerpt + view).

```tsx
"use client";
import styles from "../cinematic.module.css";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

const lines = (t: string) => t.split(" ").map((w, i) => <span key={i} className="l"><i>{w}</i></span>);

export default function EditorialPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const num = String(index + 1).padStart(2, "0");
  return (
    <div ref={ref} className={`${styles.plate} ${styles["t-editorial"]}`} style={{ ["--cc" as string]: chapter.color }}>
      <div className="ednum">{num}</div>
      <div className="ed-grid">
        <div className="ed-img" onClick={() => onOpen(project)}><img src={project.cover} alt={project.title} /></div>
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
```

- [ ] **Step 6: CenteredPlate** — port `.t-centered`: `.stage` with `.cimg` (scale-in) + `.cmeta` (kicker + line-reveal h3), `.cfoot` (excerpt + view).

```tsx
"use client";
import styles from "../cinematic.module.css";
import { useReveal } from "../useReveal";
import type { PlateProps } from "./index";

const lines = (t: string) => t.split(" ").map((w, i) => <span key={i} className="l"><i>{w}</i></span>);

export default function CenteredPlate({ project, chapter, index, onOpen }: PlateProps) {
  const ref = useReveal<HTMLDivElement>();
  const k = `${chapter.name} — ${String(index + 1).padStart(2, "0")}`;
  return (
    <div ref={ref} className={`${styles.plate} ${styles["t-centered"]}`} style={{ ["--cc" as string]: chapter.color }}>
      <div className="stage">
        <img className="cimg" src={project.cover} alt={project.title} onClick={() => onOpen(project)} />
        <div className="cmeta"><div className="k">{k}</div><h3>{lines(project.title)}</h3></div>
      </div>
      <div className="cfoot"><div>
        {project.excerpt && <p className="pp">{project.excerpt}</p>}
        <span className="view" onClick={() => onOpen(project)}>Projekt ansehen →</span>
      </div></div>
    </div>
  );
}
```

- [ ] **Step 7: Verify** each treatment renders correctly by temporarily mapping a few real featured projects on `/studio`. Check all five layouts, reveals, and that clicking calls `onOpen` (wire a temporary `console.log`). No console errors; `npm run build` passes.

- [ ] **Step 8: Commit**

```bash
git add components/cinematic/plates
git commit -m "feat(cinematic): 5 project plate treatments + dispatcher"
```

---

### Task 8: Archive component

**Files:**
- Create: `components/cinematic/Archive.tsx`

- [ ] **Step 1: Build the curated compact grid**

Port `.arch`, `.grid`, `.tile` from the prototype. Interleave `rest` projects across chapters, cap at 21, show "+N weitere". Each tile is clickable → `onOpen`. Tiles use `useReveal` (staggered `transitionDelay`).

```tsx
"use client";
import styles from "./cinematic.module.css";
import { useReveal } from "./useReveal";
import type { Chapter, Project } from "./types";

const CAP = 21;

export default function Archive({ chapters, onOpen }: { chapters: Chapter[]; onOpen: (p: Project) => void }) {
  const head = useReveal<HTMLDivElement>();
  const rows = chapters.map((c) => c.rest);
  const interleaved: { p: Project; color: string }[] = [];
  for (let i = 0; rows.some((r) => i < r.length); i++)
    for (let c = 0; c < rows.length; c++) if (i < rows[c].length) interleaved.push({ p: rows[c][i], color: chapters[c].color });
  const total = chapters.reduce((a, c) => a + c.count, 0);
  const shown = interleaved.slice(0, CAP);
  const more = total - shown.length - chapters.reduce((a, c) => a + c.featured.length, 0);

  return (
    <section className={styles.arch}>
      <div className="wrap">
        <div ref={head} className="head reveal"><h2>Weitere Arbeiten</h2><div className="sub">Auswahl aus {total} Projekten</div></div>
        <div className={styles.grid}>
          {shown.map(({ p, color }, i) => <ArchTile key={p.slug} p={p} color={color} i={i} onOpen={onOpen} />)}
        </div>
        {more > 0 && <div className="more reveal in">+ {more} weitere Projekte im vollständigen Archiv</div>}
      </div>
    </section>
  );
}

function ArchTile({ p, color, i, onOpen }: { p: Project; color: string; i: number; onOpen: (p: Project) => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${styles.tile} reveal`} style={{ ["--cc" as string]: color, transitionDelay: `${Math.min(i, 10) * 0.03}s` }} onClick={() => onOpen(p)}>
      <span className="n">{String(i + 1).padStart(2, "0")}</span>
      <h4>{p.title}</h4>
    </div>
  );
}
```

Note: the `reveal` class and its `.in` state must exist in the module (`:global(.reveal)` + `:global(.reveal.in)`), ported from the prototype.

- [ ] **Step 2: Verify** archive renders, tiles reveal on scroll, "+N weitere" shows, clicks open overlay. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/Archive.tsx
git commit -m "feat(cinematic): curated archive grid"
```

---

### Task 9: Clients component

**Files:**
- Create: `components/cinematic/Clients.tsx`

- [ ] **Step 1: Build the big typographic client list**

Reuse the `CLIENT_LIST` array from `components/MasonryPortfolio.tsx:30-64` (copy the array into `Clients.tsx` — do NOT import from MasonryPortfolio to keep the old file untouched and the new tree self-contained). Port `.clients`, `.clist` CSS.

```tsx
"use client";
import styles from "./cinematic.module.css";
import { useReveal } from "./useReveal";

const CLIENTS = [ /* paste the 33-name CLIENT_LIST from MasonryPortfolio.tsx, unchanged */ ];

export default function Clients() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className={styles.clients} id="clients">
      <div className="wrap">
        <div ref={ref} className="reveal"><div className="lead">Vertrauen von</div><h2>Ausgewählte<br />Kunden</h2></div>
        <div className="clist">{CLIENTS.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** all 33 clients render, heading reveals. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/Clients.tsx
git commit -m "feat(cinematic): clients section"
```

---

### Task 10: ProjectOverlay component

**Files:**
- Create: `components/cinematic/ProjectOverlay.tsx`

- [ ] **Step 1: Build the fullscreen overlay (curtain in/out) showing all project images**

Port `.ov`, `.ovhead`, `.ovbody` from the prototype. Unlike the prototype (placeholder boxes), the real overlay renders the project's actual `images`. Controlled by the orchestrator via an `open`/`project` prop; closes on ×, ESC, and locks body scroll while open.

```tsx
"use client";
import { useEffect } from "react";
import styles from "./cinematic.module.css";
import type { Project } from "./types";

export default function ProjectOverlay({ project, color, onClose }: { project: Project | null; color: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = project ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [project, onClose]);

  return (
    <div className={`${styles.ov} ${project ? "open" : ""}`} style={{ ["--cc" as string]: color }}>
      <div className="ovhead"><div className="logo">Studio Flatland</div><button className="close" onClick={onClose}>Schließen ✕</button></div>
      <div className="ovbody">
        {project && <>
          <div className="k">{project.services?.join(" · ") || project.categories.join(" · ")}</div>
          <h3>{project.title}</h3>
          {project.excerpt && <p>{project.excerpt}</p>}
          {project.images.map((src) => <img key={src} src={src} alt={project.title} loading="lazy" />)}
        </>}
      </div>
    </div>
  );
}
```

Note: the `open` toggle uses a literal class; add `:global(.ov.open)` in the module (already in the prototype CSS). `.logo`, `.close` are `:global`.

- [ ] **Step 2: Verify** clicking any plate opens the overlay with the real project images; ESC and × close it; body scroll locks. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/ProjectOverlay.tsx
git commit -m "feat(cinematic): project detail overlay with real images"
```

---

### Task 11: OverlayMenu (Kontakt / Impressum / Datenschutz)

**Files:**
- Create: `components/cinematic/OverlayMenu.tsx`

- [ ] **Step 1: Build the fullscreen menu overlay and port the legal + contact content**

Copy the actual Impressum, Datenschutz, and Kontakt content/markup from the corresponding panels in `components/MasonryPortfolio.tsx` (search for the `impressumOpen` / `datenschutzOpen` / `contactOpen` panels) so the legally-required Austrian Impressum and Datenschutz text is preserved verbatim. Port `.menu` CSS from the prototype. Menu links: Start, Kunden, Kontakt, Impressum, Datenschutz.

```tsx
"use client";
import { useState } from "react";
import styles from "./cinematic.module.css";

type Panel = "menu" | "impressum" | "datenschutz" | "kontakt";

export default function OverlayMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [panel, setPanel] = useState<Panel>("menu");
  const scrollTo = (id: string) => { onClose(); document.getElementById(id)?.scrollIntoView(); };
  return (
    <div className={`${styles.menu} ${open ? "open" : ""}`}>
      <button className="mclose" onClick={onClose}>Schließen ✕</button>
      {panel === "menu" && <>
        <a onClick={() => scrollTo("hero")}>Start</a>
        <a onClick={() => scrollTo("clients")}>Kunden</a>
        <a onClick={() => setPanel("kontakt")}>Kontakt</a>
        <a onClick={() => setPanel("impressum")}>Impressum</a>
        <a onClick={() => setPanel("datenschutz")}>Datenschutz</a>
        <div className="contact">Arnethgasse 32/7 · 1160 Wien · langosch@gmx.at</div>
      </>}
      {panel === "kontakt" && <ContactPanel onBack={() => setPanel("menu")} />}
      {panel === "impressum" && <ImpressumPanel onBack={() => setPanel("menu")} />}
      {panel === "datenschutz" && <DatenschutzPanel onBack={() => setPanel("menu")} />}
    </div>
  );
}
// ContactPanel / ImpressumPanel / DatenschutzPanel: paste the real content from MasonryPortfolio.tsx panels.
```

- [ ] **Step 2: Verify** menu opens/closes, each legal panel shows the real content ported from `MasonryPortfolio.tsx`, "Start"/"Kunden" scroll correctly. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/OverlayMenu.tsx
git commit -m "feat(cinematic): overlay menu with ported Impressum/Datenschutz/Kontakt"
```

---

### Task 12: Orchestrator + wire into `/studio`

**Files:**
- Create: `components/cinematic/CinematicPortfolio.tsx`
- Modify: `app/studio/page.tsx`

- [ ] **Step 1: Build the orchestrator (owns overlay + menu state, progress bar, header)**

```tsx
"use client";
import { useState, useMemo } from "react";
import styles from "./cinematic.module.css";
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
  const open = (p: Project, color: string) => setActive({ p, color });

  return (
    <div className={styles.root}>
      <header>
        <div className="logo">Studio<br />Flatland</div>
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>Menü ✦</button>
      </header>
      <Hero />
      <main>
        {chapters.map((ch) => (
          <section key={ch.key} style={{ ["--cc" as string]: ch.color }}>
            <ChapterBreak ch={ch} />
            {ch.featured.map((p, i) => (
              <ProjectPlate key={p.slug} project={p} chapter={ch} index={i} onOpen={(pr) => open(pr, ch.color)} />
            ))}
          </section>
        ))}
        <Archive chapters={chapters} onOpen={(p) => open(p, "#2438e0")} />
      </main>
      <Clients />
      <footer className="closing" id="closing">{/* port closing markup from prototype */}</footer>
      <ProjectOverlay project={active?.p ?? null} color={active?.color ?? "#2438e0"} onClose={() => setActive(null)} />
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
```

Add `.root` wrapper class + `header`, `.closing` CSS from the prototype to the module. (Header/closing markup ported from prototype.)

- [ ] **Step 2: Wire the route**

Replace `app/studio/page.tsx` with:

```tsx
import CinematicPortfolio from "@/components/cinematic/CinematicPortfolio";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

export default function StudioPage() {
  return <CinematicPortfolio projects={projects as unknown as Project[]} />;
}
```

- [ ] **Step 3: Verify the full page end-to-end** on `/studio`: hero → 3 chapters (breaks + featured plates) → archive → clients → closing, overlays + menu work, scroll progress if included. Confirm `/` (homepage) is STILL the old grid. `npm run build` and `npm run lint` pass, no console errors.

- [ ] **Step 4: Commit**

```bash
git add components/cinematic/CinematicPortfolio.tsx app/studio/page.tsx
git commit -m "feat(cinematic): orchestrator wired into /studio route"
```

---

### Task 13: Assign real featured projects + treatments

**Files:**
- Modify: `data/projects.ts` (add `featured`/`treatment`/`video` to chosen rows)

- [ ] **Step 1: With the user, pick the featured projects per chapter and set fields**

For each chapter choose ~2–4 strong projects. Add `"featured": true` and a `"treatment"` to those project objects. Vary treatments so no two consecutive plates share a look (e.g. per chapter: `fullbleed, split, editorial, centered`; use `video` for the one animation project that has a `video` mp4). Example edit to one row:

```ts
{
  "slug": "wasserfall",
  // …existing fields…
  "featured": true,
  "treatment": "video",
  "video": "/projekte/wasserfall/loop.mp4"
}
```

- [ ] **Step 2: Verify** `/studio` shows the chosen featured projects with varied treatments and no two identical layouts back-to-back. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add data/projects.ts
git commit -m "content: mark featured projects and assign plate treatments"
```

---

### Task 14 (optional): Convert hero animation GIF(s) to mp4

**Files:**
- Create: `public/projekte/<slug>/loop.mp4` (generated)

- [ ] **Step 1: If `ffmpeg` is available, convert the chosen animation GIF to a web-friendly mp4** (smaller + sharper than the GIF):

```bash
ffmpeg -i "public/projekte/wasserfall/01-cover.gif" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "public/projekte/wasserfall/loop.mp4"
```

- [ ] **Step 2: Verify** the VideoPlate plays the mp4 (muted, looping, autoplay) on `/studio`. If `ffmpeg` is unavailable, skip: VideoPlate falls back to the GIF cover automatically.

- [ ] **Step 3: Commit**

```bash
git add public/projekte/wasserfall/loop.mp4
git commit -m "content: mp4 loop for video plate"
```

---

### Task 15: Performance + accessibility pass

**Files:**
- Modify: `components/cinematic/cinematic.module.css` (content-visibility, focus states)
- Modify: plate components (image `loading`/`decoding` attrs)

- [ ] **Step 1: Add `loading="lazy"` and `decoding="async"` to all plate/archive/overlay `<img>` except the very first hero-visible image; keep the first chapter's first plate image eager for LCP.**

- [ ] **Step 2: Add `content-visibility: auto; contain-intrinsic-size: 100vh;` to offscreen heavy sections (plates) in the module** to cut rendering cost of the long scroll.

- [ ] **Step 3: Verify reduced-motion**: with OS "reduce motion" on, curtains/reveals resolve instantly (no transforms), page is fully usable. Confirm the `@media (prefers-reduced-motion: reduce)` block from the prototype is present in the module.

- [ ] **Step 4: Add visible keyboard focus states** for `.view`, `.menu a`, `.close`, `.menu-btn` (outline on `:focus-visible`).

- [ ] **Step 5: Verify** `npm run build` + `npm run lint` pass; scroll feels smooth; no layout shift; no console errors.

- [ ] **Step 6: Commit**

```bash
git add components/cinematic
git commit -m "perf/a11y: lazy images, content-visibility, focus states, reduced-motion"
```

---

### Task 16: Deploy preview + hand-off

- [ ] **Step 1: Final full build**

Run: `npm run build`
Expected: success, `/studio` present, `/` unchanged.

- [ ] **Step 2: Push the feature branch (NOT master) so Vercel builds a private preview**

```bash
git push -u origin feature/cinematic
```

Expected: Vercel creates a Preview Deployment. Share the preview URL. `mischgo.com` (production from `master`) is unaffected.

- [ ] **Step 3: Review the preview URL on desktop + mobile with the user.** Note the "flip switch" for later: to make this the homepage, either move the tree into `app/page.tsx` or redirect `/`; until then `/` stays the old grid. This is a deliberate, separate decision — do NOT merge to `master` without explicit approval.

---

## Self-Review notes

- **Spec coverage:** Hero ✓ (T5), 3 chapters Animation→Grafik→Print ✓ (T2/T6/T12), fullscreen plates + variety ✓ (T7/T13), video moment ✓ (T7/T14), curtain color/direction variety ✓ (T4/T6), archive "not all" ✓ (T8), clients page ✓ (T9), project overlay ✓ (T10), Impressum/Datenschutz/Kontakt preserved ✓ (T11), dark-with-color-shifts ✓ (T4), motion/react-free CSS approach ✓, reduced-motion + perf ✓ (T3/T15), live site untouched ✓ (T0 + safety invariants), `featured` field ✓ (T1/T13).
- **No unit tests** by design — this project has no test runner; verification is `next build`/`next lint`/browser. Stated up front.
- **Prototype as reference:** exhaustive CSS/markup lives in `docs/superpowers/reference/cinematic-prototype-v4.html`; tasks port from it to avoid re-inventing values.
