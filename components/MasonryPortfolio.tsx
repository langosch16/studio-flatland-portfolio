"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Project } from "@/data/projects";

type Props = { projects: Project[] };
type ThemeFilter = "all" | "print" | "animation" | "graphics";

// ── Auto-matching: normalize strings for fuzzy comparison ──────────────────
function norm(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/dr\.\s*/g, "dr ").replace(/[^a-z0-9]+/g, " ").trim();
}

function clientMatchesProject(client: string, p: Project): boolean {
  if (!p.clients || p.clients.length === 0) return false;
  return p.clients.some((c) => norm(c) === norm(client));
}

function mapTheme(p: Project): Exclude<ThemeFilter, "all"> {
  const cats = p.categories.map((c) => c.toLowerCase());
  if (cats.includes("video")) return "animation";
  if (cats.includes("books") || cats.includes("magazine")) return "print";
  return "graphics";
}

const CLIENT_LIST = [
  "21erHaus",
  "A1",
  "Akademie der Steuerberater und Wirtschaftsprüfer",
  "Athletics Eyewear",
  "Bella Wagner",
  "Brandsetter",
  "Die Schönheitschirurgin",
  "Di Grillo",
  "Dotkind",
  "Double Surf Pool",
  "Dr. David Dörfler",
  "Dr. Said Albinni",
  "EOD Munitionsbergung",
  "Familiii",
  "Fratelli",
  "Hans Weigand",
  "Kneipp Magazin",
  "KSW Kammer der Steuerberater und Wirtschaftsprüfer",
  "Kultur 4 Kids",
  "KunsthausZug",
  "Land Niederösterreich",
  "MesseWien",
  "mumok",
  "newsVerlag",
  "onzoone",
  "Sammlung Falkenberg",
  "Sammlung Friedrichshof",
  "schlebrügge.editor",
  "Vermessung Loschnigg",
  "VG Getreideverarbeitung",
  "Wireg",
  "Zahntechnik Günther",
  "Österreichischer Volleyball Verband",
].sort((a, b) => a.localeCompare(b, "de"));

const MENU_ITEMS: { label: string; filter: ThemeFilter | "clients" | "contact" }[] = [
  { label: "All",       filter: "all" },
  { label: "Print",     filter: "print" },
  { label: "Animation", filter: "animation" },
  { label: "Graphics",  filter: "graphics" },
  { label: "Clients",   filter: "clients" },
  { label: "Contact",   filter: "contact" },
];

const GAP    = 22;
const RADIUS = "14px";

// ── YouTube Videos ──────────────────────────────────────────────────────────
const VIDEOS: { id: string; title: string; short: boolean; insertAfter: number; thumb?: string; aspect?: string }[] = [
  { id: "pVCKSqkJJgA", title: "Animation Reel",  short: false, insertAfter: 5, thumb: "/thumbs/thumb1.png" },
  { id: "Ev84gDJE784", title: "Short",            short: true,  insertAfter: 12 },
  { id: "mOXzKpRWEAQ", title: "Short",            short: true,  insertAfter: 22, aspect: "177.78%" },
  { id: "2koa2D241bQ", title: "Short",            short: true,  insertAfter: 35 },
  { id: "jyaEvAR5gB4", title: "Short",            short: true,  insertAfter: 48 },
  { id: "CGfufsGGl30", title: "Lips",             short: false, insertAfter: 48 },
  { id: "h_i8XMTw84I", title: "Short",            short: true,  insertAfter: 55 },
];

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export default function MasonryPortfolio({ projects }: Props) {
  const [filter, setFilter]           = useState<ThemeFilter>("all");
  const [clientsOpen, setClientsOpen]       = useState(false);
  const [contactOpen, setContactOpen]       = useState(false);
  const [impressumOpen, setImpressumOpen]   = useState(false);
  const [datenschutzOpen, setDatenschutzOpen] = useState(false);
  const [cookieOpen, setCookieOpen]         = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);

  const [splash, setSplash]               = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeClient, setActiveClient]   = useState<string | null>(null);
  const [playingVideo, setPlayingVideo]   = useState<string | null>(null);
  const [playingInlineVideo, setPlayingInlineVideo] = useState<string | null>(null);
  const [numCols, setNumCols] = useState(5);
  const [typed, setTyped]       = useState("");
  const [cursorOn, setCursorOn] = useState(true);

  const FULL_TEXT = "STUDIO\nFLAT\nLAND";

  // Typewriter — then fade out
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) {
        clearInterval(iv);
        setTimeout(() => setSplash(false), 600);
      }
    }, 85);
    return () => clearInterval(iv);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const iv = setInterval(() => setCursorOn((v) => !v), 500);
    return () => clearInterval(iv);
  }, []);

  // Responsive column count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setNumCols(w < 640 ? 1 : w < 900 ? 2 : w < 1200 ? 3 : 5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const clientNames = CLIENT_LIST;

  // Precompute which clients have matching projects
  const clientProjectMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of CLIENT_LIST) {
      const count = projects.filter((p) => clientMatchesProject(c, p)).length;
      if (count > 0) map.set(c, count);
    }
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    let base = filter === "all" ? projects : projects.filter((p) => mapTheme(p) === filter);
    if (activeClient) {
      const clientFiltered = base.filter((p) => clientMatchesProject(activeClient, p));
      // Fallback: if theme-filter gives 0 results, show all client projects
      return clientFiltered.length > 0
        ? clientFiltered
        : projects.filter((p) => clientMatchesProject(activeClient, p));
    }
    return base;
  }, [projects, filter, activeClient]);

  function closeAllPanels() {
    setClientsOpen(false); setContactOpen(false);
    setImpressumOpen(false); setDatenschutzOpen(false); setCookieOpen(false);
  }
  function handleMenu(f: ThemeFilter | "clients" | "contact") {
    if (f === "clients")  { closeAllPanels(); setClientsOpen((v) => !v); }
    else if (f === "contact") { closeAllPanels(); setContactOpen((v) => !v); }
    else { closeAllPanels(); setFilter(f); setExpanded(null); }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans" style={{ padding: GAP }}>

      {/* ── Splash Screen ── */}
      <AnimatePresence>
        {splash && (
          <motion.div
            key="splash"
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center pointer-events-none overflow-hidden"
          >
            <div
              className="text-white font-black uppercase leading-[0.85] tracking-tight select-none whitespace-pre"
              style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
            >
              {typed}
              <span style={{ opacity: typed === FULL_TEXT ? 0 : cursorOn ? 1 : 0, transition: "opacity 0.1s" }}>
                |
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Aktiver Client-Filter Banner ── */}
      <AnimatePresence>
        {activeClient && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-[12px] font-medium w-fit"
          >
            <span className="text-white/40 uppercase tracking-widest text-[9px]">Client</span>
            <span>{activeClient}</span>
            <span className="bg-white/10 text-white/50 text-[10px] px-1.5 py-0.5 rounded-full">
              {clientProjectMap.get(activeClient) ?? 0} Projekte
            </span>
            <button
              onClick={() => setActiveClient(null)}
              className="ml-1 text-white/40 hover:text-white text-base leading-none transition-colors"
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Masonry — separate Spalten-Divs (kein CSS columns reflow) ── */}
      {(() => {
        type MixedItem =
          | { kind: "project"; project: (typeof filtered)[0] }
          | { kind: "video";   video: (typeof VIDEOS)[0] };

        const showVideos = filter === "all" || filter === "animation";
        const mixed: MixedItem[] = [];
        filtered.forEach((project, idx) => {
          if (showVideos) VIDEOS.filter((v) => v.insertAfter === idx).forEach((v) =>
            mixed.push({ kind: "video", video: v })
          );
          mixed.push({ kind: "project", project });
        });
        if (showVideos) VIDEOS.filter((v) => v.insertAfter >= filtered.length).forEach((v) =>
          mixed.push({ kind: "video", video: v })
        );

        // ── Elemente aufbauen: headerItems (col 0) + projectItems (alle cols) ──
        const headerItems: React.ReactElement[] = [];
        const projectItems: React.ReactElement[] = [];
        const elements: React.ReactElement[] = []; // wird nicht mehr genutzt

        // Logo tile
        headerItems.push(
          <div
            key="logo"
            className="bg-neutral-900 flex flex-col justify-between p-5 select-none"
            style={{ borderRadius: RADIUS, height: 150 }}
          >
            <div className="flex items-start justify-between">
              <span className="text-[7px] uppercase tracking-[0.22em] text-white/30 font-medium">Portfolio</span>
              <button
                className="md:hidden flex flex-col gap-[5px] p-1 -mt-1 -mr-1"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Menü öffnen"
              >
                <span className={`block w-5 h-[2px] bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-[2px] bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </button>
            </div>
            <div className="text-white font-black uppercase leading-[0.82] tracking-tight text-2xl">
              Studio<br />Flat<br />Land
            </div>
          </div>
        );

        // Menu tiles
        MENU_ITEMS.forEach(({ label, filter: f }) => {
          const isActive = f === filter || (f === "clients" && clientsOpen) || (f === "contact" && contactOpen);
          headerItems.push(
            <button
              key={"menu-" + f}
              onClick={() => handleMenu(f)}
              className={`hidden md:flex w-full flex-col justify-between p-5 text-left transition-colors duration-200 ${
                isActive ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              }`}
              style={{ borderRadius: RADIUS, height: 150 }}
            >
              <span className={`text-[7px] uppercase tracking-[0.2em] font-medium ${isActive ? "text-white/35" : "text-neutral-400"}`}>menu</span>
              <span className="font-bold uppercase leading-none tracking-tight text-2xl">{label}</span>
            </button>
          );
        });

        // Mixed items
        mixed.forEach((item) => {
          if (item.kind === "video") {
            const { video } = item;
            const isPlaying = playingVideo === video.id;
            const isDimmedV = expanded !== null || (playingVideo !== null && !isPlaying);
            const aspectPad = video.aspect ?? (video.short ? "100%" : "56.25%");
            projectItems.push(
              <motion.div
                key={"yt-" + video.id}
                animate={{ opacity: isDimmedV ? 0.15 : 1 }}
                transition={{ duration: 0.3 }}
                className="relative group"
                style={{ borderRadius: RADIUS, overflow: "hidden", background: "#111" }}
              >
                <div style={{ position: "relative", paddingTop: aspectPad }}>
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  ) : (
                    <>
                      <img
                        src={video.thumb ?? ytThumb(video.id)}
                        alt={video.title}
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          if (el.src.includes("maxresdefault")) el.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                          else if (el.src.includes("hqdefault")) el.src = `https://img.youtube.com/vi/${video.id}/0.jpg`;
                        }}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        draggable={false}
                      />
                      <div
                        className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center cursor-pointer"
                        onClick={() => { setPlayingVideo(video.id); setExpanded(null); }}
                      >
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                          <div className="w-0 h-0 ml-1" style={{ borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "18px solid #111" }} />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white/80 text-[9px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-sm">
                        ▶ Video
                      </div>
                    </>
                  )}
                </div>
                {isPlaying && (
                  <div className="flex items-center justify-end px-3 py-2 bg-neutral-950">
                    <button onClick={() => setPlayingVideo(null)} className="text-white/40 hover:text-white text-base leading-none">×</button>
                  </div>
                )}
              </motion.div>
            );
          } else {
            const { project } = item;
            const extraImages = (project.images || []).filter((img) => img !== project.cover).slice(0, 20);
            const hasExtras = extraImages.length > 0;
            const isExpanded = expanded === project.slug;
            const isDimmed = expanded !== null && !isExpanded;
            projectItems.push(
              <motion.div
                key={project.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDimmed ? 0.15 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer bg-neutral-100"
                style={{ borderRadius: RADIUS }}
                onClick={() => hasExtras && setExpanded(isExpanded ? null : project.slug)}
              >
                <div className="relative overflow-hidden" style={{ borderRadius: RADIUS }}>
                  <img
                    src={project.cover}
                    alt={project.title}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
                  <div className="absolute inset-0 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white text-[14px] font-semibold leading-tight drop-shadow">{project.title}</p>
                  </div>
                  {hasExtras && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shadow transition-colors duration-200 ${
                      isExpanded ? "bg-neutral-900 text-white" : "bg-white/85 text-neutral-800 backdrop-blur-sm"
                    }`}>
                      {isExpanded ? "×" : "+"}
                    </div>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && hasExtras && (
                    <motion.div
                      key="extras"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col"
                      style={{ gap: GAP, paddingTop: GAP }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.excerpt && project.excerpt.trim().length > 0 && (
                        <p className="text-neutral-600 text-[12px] leading-relaxed px-1">
                          {project.excerpt.trim()}
                        </p>
                      )}
                      {extraImages.map((img, i) => {
                        const nextIsMp4 = extraImages[i + 1]?.endsWith(".mp4");
                        const isThumbForVideo = !img.endsWith(".mp4") && !img.startsWith("youtube:") && nextIsMp4;
                        const isVideoAfterThumb = img.endsWith(".mp4") && i > 0 && !extraImages[i - 1].endsWith(".mp4") && !extraImages[i - 1].startsWith("youtube:");
                        if (isVideoAfterThumb) return null;
                        return (
                          <motion.div
                            key={img}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.22 }}
                            className="overflow-hidden"
                            style={{ borderRadius: RADIUS }}
                          >
                            {img.startsWith("youtube:") ? (
                              <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: RADIUS, overflow: "hidden" }}>
                                <iframe
                                  src={`https://www.youtube.com/embed/${img.replace("youtube:", "")}?rel=0`}
                                  title={project.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                                />
                              </div>
                            ) : isThumbForVideo ? (
                              <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setPlayingInlineVideo(extraImages[i + 1]); }}>
                                {playingInlineVideo === extraImages[i + 1] ? (
                                  <video src={extraImages[i + 1]} controls autoPlay playsInline className="w-full block" style={{ borderRadius: RADIUS, backgroundColor: "#000" }} />
                                ) : (
                                  <>
                                    <img src={img} alt={`${project.title} video`} className="w-full h-auto block" draggable={false} />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><polygon points="6,3 17,10 6,17" /></svg>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : img.endsWith(".mp4") ? (
                              <video src={img} controls playsInline preload="metadata" className="w-full block" style={{ borderRadius: RADIUS, backgroundColor: "#000" }} />
                            ) : (
                              <img src={img} alt={`${project.title} ${i + 1}`} className="w-full h-auto block" loading="lazy" draggable={false} />
                            )}
                          </motion.div>
                        );
                      })}
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(null); }}
                        className="text-[9px] uppercase tracking-widest text-neutral-400 hover:text-neutral-700 py-2 text-center transition-colors"
                      >
                        ↑ Schließen
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }
        });

        // ── Spalten aufbauen: Header fix in col 0, Projekte in alle cols ──
        // Col 0 bekommt erst später Projekte um die Menü-Höhe auszugleichen
        const cols: React.ReactElement[][] = Array.from({ length: numCols }, () => []);
        headerItems.forEach((el) => cols[0].push(el));
        const skipCol0 = numCols > 1 ? headerItems.length : 0;
        projectItems.forEach((el, i) => {
          if (i < skipCol0 && numCols > 1) {
            cols[(i % (numCols - 1)) + 1].push(el);
          } else {
            cols[(i - skipCol0) % numCols].push(el);
          }
        });

        return (
          <div style={{ display: "flex", gap: GAP, alignItems: "flex-start" }}>
            {cols.map((colItems, ci) => (
              <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: GAP }}>
                {colItems}
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Mobile Menü Panel ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed top-0 left-0 z-50 w-full bg-neutral-950 text-white shadow-xl"
            style={{ borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
              <span className="font-black uppercase text-lg tracking-tight">Studio Flatland</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="flex flex-col">
              {MENU_ITEMS.map(({ label, filter: f }) => {
                const isActive = f === filter || (f === "clients" && clientsOpen) || (f === "contact" && contactOpen);
                return (
                  <button
                    key={f}
                    onClick={() => { handleMenu(f); setMobileMenuOpen(false); }}
                    className={`text-left px-5 py-4 text-xl font-bold uppercase tracking-tight border-b border-white/5 transition-colors ${
                      isActive ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clients Panel ── */}
      <AnimatePresence>
        {clientsOpen && (
          <motion.aside
            key="clients"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-72 bg-neutral-950 text-white shadow-[-32px_0_80px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <span className="text-sm font-semibold tracking-widest uppercase">Clients</span>
                <span className="ml-2 text-xs text-white/30">{clientNames.length}</span>
              </div>
              <button onClick={() => setClientsOpen(false)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)] px-6 py-5">
              <div className="space-y-[2px]">
                {clientNames.map((n) => {
                  const count     = clientProjectMap.get(n) ?? 0;
                  const hasProj   = count > 0;
                  const isActive  = activeClient === n;
                  return (
                    <div
                      key={n}
                      onClick={() => {
                        if (!hasProj) return;
                        setActiveClient(isActive ? null : n);
                        setClientsOpen(false);
                      }}
                      className={`flex items-center justify-between py-2 border-b border-white/5 transition-colors text-[13px] ${
                        hasProj
                          ? isActive
                            ? "text-white cursor-pointer"
                            : "text-white/70 hover:text-white cursor-pointer"
                          : "text-white/25 cursor-default"
                      }`}
                    >
                      <span>{n}</span>
                      {hasProj && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${
                          isActive ? "bg-white text-neutral-900 font-bold" : "bg-white/10 text-white/40"
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Contact Panel ── */}
      <AnimatePresence>
        {contactOpen && (
          <motion.aside
            key="contact"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <span className="text-sm font-semibold tracking-widest uppercase">Contact</span>
              <button onClick={() => setContactOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl">×</button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">

              {/* Adresse */}
              <div className="text-[13px] leading-relaxed text-neutral-600">
                <p className="text-neutral-900 font-bold text-base mb-1">Büro Flatland</p>
                <p>Arnethgasse 32/7</p>
                <p>1160 Wien, Austria</p>
                <a href="mailto:migo@mischgo.com" className="text-neutral-400 hover:text-neutral-900 transition-colors mt-1 block">
                  migo@mischgo.com
                </a>
              </div>

              {/* Kontaktformular */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  const name = fd.get("name") as string;
                  const email = fd.get("email") as string;
                  const msg = fd.get("message") as string;
                  window.location.href = `mailto:migo@mischgo.com?subject=${encodeURIComponent(`Kontakt von ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${msg}`)}`;
                }}
                className="flex flex-col gap-3"
              >
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Name"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-neutral-900 transition-colors"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="E-Mail"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-neutral-900 transition-colors"
                />
                <textarea
                  name="message"
                  required
                  placeholder="Nachricht"
                  rows={5}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-neutral-900 transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 text-white text-[12px] font-semibold uppercase tracking-widest py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Senden
                </button>
              </form>

              {/* Footer Links */}
              <div className="flex flex-col gap-1 text-[11px] text-neutral-400 pt-4 border-t border-neutral-100">
                <button onClick={() => { setContactOpen(false); setCookieOpen(true); }} className="text-left hover:text-neutral-900 transition-colors">Cookie Richtlinien EU</button>
                <button onClick={() => { setContactOpen(false); setImpressumOpen(true); }} className="text-left hover:text-neutral-900 transition-colors">Impressum</button>
                <button onClick={() => { setContactOpen(false); setDatenschutzOpen(true); }} className="text-left hover:text-neutral-900 transition-colors">Datenschutzerklärung</button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Impressum Panel ── */}
      <AnimatePresence>
        {impressumOpen && (
          <motion.aside key="impressum" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => { setImpressumOpen(false); setContactOpen(true); }} className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors">← Kontakt</button>
                <span className="text-sm font-semibold tracking-widest uppercase">Impressum</span>
              </div>
              <button onClick={() => setImpressumOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl">×</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 text-[13px] leading-relaxed text-neutral-600 space-y-4">
              <div>
                <p className="font-bold text-neutral-900 mb-1">Büro Flatland</p>
                <p>Arnethgasse 32/7</p>
                <p>1160 Wien, Austria</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Kontakt</p>
                <a href="mailto:migo@mischgo.com" className="hover:text-neutral-900 transition-colors">migo@mischgo.com</a>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Unternehmensgegenstand</p>
                <p>Grafik Design, Editorial Design, Corporate Identity</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Inhaberin</p>
                <p>Michael Abraham</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Berufsrecht</p>
                <p>Gewerbliche Tätigkeit gemäß Gewerbeordnung (GewO). Zuständige Behörde: Magistratisches Bezirksamt Wien.</p>
              </div>
              <div className="text-neutral-400 text-[12px] pt-2 border-t border-neutral-100">
                <p>Alle Inhalte dieser Website sind urheberrechtlich geschützt. Nachdruck oder Verwendung nur mit ausdrücklicher Genehmigung.</p>
                <p className="mt-1">Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Datenschutz Panel ── */}
      <AnimatePresence>
        {datenschutzOpen && (
          <motion.aside key="datenschutz" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => { setDatenschutzOpen(false); setContactOpen(true); }} className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors">← Kontakt</button>
                <span className="text-sm font-semibold tracking-widest uppercase">Datenschutz</span>
              </div>
              <button onClick={() => setDatenschutzOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl">×</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 text-[13px] leading-relaxed text-neutral-600 space-y-4">
              <div>
                <p className="font-bold text-neutral-900 mb-1">Datenschutzerklärung</p>
                <p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Verantwortlicher</p>
                <p>Büro Flatland, Arnethgasse 32/7, 1160 Wien</p>
                <a href="mailto:migo@mischgo.com" className="hover:text-neutral-900 transition-colors">migo@mischgo.com</a>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Datenerfassung</p>
                <p>Diese Website erhebt nur jene personenbezogenen Daten, die Sie uns freiwillig über das Kontaktformular mitteilen (Name, E-Mail-Adresse, Nachricht). Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Ihre Rechte</p>
                <p>Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei der Aufsichtsbehörde beschweren.</p>
                <p className="mt-2">Österreichische Datenschutzbehörde: <span className="text-neutral-900">dsb.gv.at</span></p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Hosting</p>
                <p>Diese Website wird über Vercel Inc. gehostet. Vercel kann dabei technische Daten (IP-Adresse, Zugriffszeitpunkt) in Server-Logs speichern. Weitere Informationen: vercel.com/legal/privacy-policy</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Cookie Panel ── */}
      <AnimatePresence>
        {cookieOpen && (
          <motion.aside key="cookie" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => { setCookieOpen(false); setContactOpen(true); }} className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors">← Kontakt</button>
                <span className="text-sm font-semibold tracking-widest uppercase">Cookie</span>
              </div>
              <button onClick={() => setCookieOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl">×</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 text-[13px] leading-relaxed text-neutral-600 space-y-4">
              <div>
                <p className="font-bold text-neutral-900 mb-1">Cookie Richtlinien (EU)</p>
                <p>Diese Website verwendet Cookies gemäß der EU-Datenschutzgrundverordnung (DSGVO) und der ePrivacy-Richtlinie.</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Was sind Cookies?</p>
                <p>Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Endgerät gespeichert werden. Sie ermöglichen es, bestimmte Einstellungen und Daten zwischen Seitenaufrufen zu speichern.</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Welche Cookies verwenden wir?</p>
                <p>Diese Website verwendet ausschließlich technisch notwendige Cookies, die für den einwandfreien Betrieb erforderlich sind. Es werden keine Analyse-, Tracking- oder Marketing-Cookies eingesetzt.</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Drittanbieter</p>
                <p>Eingebettete YouTube-Videos können beim Abspielen Cookies von Google LLC setzen. Dies unterliegt den Datenschutzbestimmungen von Google (policies.google.com/privacy).</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Cookies ablehnen</p>
                <p>Sie können Cookies in Ihrem Browser jederzeit deaktivieren. Bitte beachten Sie, dass dadurch die Funktionalität der Website eingeschränkt sein kann.</p>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Kontakt</p>
                <a href="mailto:migo@mischgo.com" className="hover:text-neutral-900 transition-colors">migo@mischgo.com</a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
