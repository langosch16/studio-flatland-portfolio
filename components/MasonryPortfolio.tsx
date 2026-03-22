"use client";

import { useEffect, useMemo, useState } from "react";
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
  const words = norm(client).split(" ").filter((w) => w.length > 1);
  const haystack = norm(
    `${p.slug} ${p.title} ${(p.text ?? "").slice(0, 600)} ${(p.excerpt ?? "").slice(0, 400)}`
  );
  return words.length > 0 && words.every((w) => haystack.includes(w));
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
const VIDEOS: { id: string; title: string; short: boolean; insertAfter: number; thumb?: string }[] = [
  { id: "pVCKSqkJJgA", title: "Animation Reel",  short: false, insertAfter: 5, thumb: "/thumbs/thumb1.png" },
  { id: "Ev84gDJE784", title: "Short",            short: true,  insertAfter: 12 },
  { id: "mOXzKpRWEAQ", title: "Short",            short: true,  insertAfter: 22 },
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
  const [clientsOpen, setClientsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);

  const [splash, setSplash]               = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeClient, setActiveClient]   = useState<string | null>(null);
  const [playingVideo, setPlayingVideo]   = useState<string | null>(null);
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

  function handleMenu(f: ThemeFilter | "clients" | "contact") {
    if (f === "clients") { setClientsOpen((v) => !v); setContactOpen(false); }
    else if (f === "contact") { setContactOpen((v) => !v); setClientsOpen(false); }
    else { setFilter(f); setClientsOpen(false); setContactOpen(false); setExpanded(null); }
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

      {/* ── Pinterest Masonry — Logo + Menü + Projekte alle in den Columns ── */}
      <div style={{ columns: "5 200px", columnGap: GAP }}>

        {/* Logo tile — mit Burger auf Mobile */}
        <div
          className="bg-neutral-900 flex flex-col justify-between p-5 select-none"
          style={{ breakInside: "avoid", marginBottom: GAP, borderRadius: RADIUS, height: 150 }}
        >
          <div className="flex items-start justify-between">
            <span className="text-[7px] uppercase tracking-[0.22em] text-white/30 font-medium">
              Portfolio
            </span>
            {/* Burger — nur auf Mobile sichtbar */}
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

        {/* Menu tiles — auf Mobile ausgeblendet, auf Desktop in den Columns */}
        {MENU_ITEMS.map(({ label, filter: f }) => {
          const isActive =
            f === filter ||
            (f === "clients" && clientsOpen) ||
            (f === "contact" && contactOpen);
          return (
            <button
              key={f}
              onClick={() => handleMenu(f)}
              className={`hidden md:flex w-full flex-col justify-between p-5 text-left transition-colors duration-200 ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              }`}
              style={{ breakInside: "avoid", marginBottom: GAP, borderRadius: RADIUS, height: 150 }}
            >
              <span className={`text-[7px] uppercase tracking-[0.2em] font-medium ${isActive ? "text-white/35" : "text-neutral-400"}`}>
                menu
              </span>
              <span className="font-bold uppercase leading-none tracking-tight text-2xl">
                {label}
              </span>
            </button>
          );
        })}

        {/* Projekte + Videos gemischt — als kombiniertes Array */}
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
          // Videos nach dem letzten Projekt
          if (showVideos) VIDEOS.filter((v) => v.insertAfter >= filtered.length).forEach((v) =>
            mixed.push({ kind: "video", video: v })
          );

          return mixed.map((item) => {
            /* ── Video Tile ── */
            if (item.kind === "video") {
              const { video } = item;
              const isPlaying = playingVideo === video.id;
              const isDimmedV = expanded !== null || (playingVideo !== null && !isPlaying);
              const aspectPad = video.short ? "177.78%" : "56.25%";
              return (
                <motion.div
                  key={"yt-" + video.id}
                  animate={{ opacity: isDimmedV ? 0.15 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                  style={{ breakInside: "avoid", marginBottom: GAP, borderRadius: RADIUS, overflow: "hidden", background: "#111" }}
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
                            if (el.src.includes("maxresdefault")) {
                              el.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            } else if (el.src.includes("hqdefault")) {
                              el.src = `https://img.youtube.com/vi/${video.id}/0.jpg`;
                            }
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
            }

            /* ── Projekt Tile ── */
            const { project } = item;
          const extraImages = (project.images || [])
            .filter((img) => img !== project.cover)
            .slice(0, 20);
          const hasExtras  = extraImages.length > 0;
          const isExpanded = expanded === project.slug;

          const isDimmed = expanded !== null && !isExpanded;

          return (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: isDimmed ? 0.15 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative group cursor-pointer bg-neutral-100"
              style={{
                breakInside: "avoid",
                marginBottom: GAP,
                borderRadius: RADIUS,
                overflow: "hidden",
              }}
              onClick={() => hasExtras && setExpanded(isExpanded ? null : project.slug)}
            >
              {/* Cover — natural height */}
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
                  <p className="text-white text-[11px] font-semibold leading-tight drop-shadow">
                    {project.title}
                  </p>
                </div>
                {hasExtras && (
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shadow transition-colors duration-200 ${
                    isExpanded ? "bg-neutral-900 text-white" : "bg-white/85 text-neutral-800 backdrop-blur-sm"
                  }`}>
                    {isExpanded ? "×" : "+"}
                  </div>
                )}
              </div>
              {/* Expanded detail images */}
              <AnimatePresence initial={false}>
                {isExpanded && hasExtras && (
                  <motion.div
                    key="extras"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden flex flex-col"
                    style={{ gap: GAP, paddingTop: GAP }}
                  >
                    {extraImages.map((img, i) => (
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
                        ) : img.endsWith(".mp4") ? (
                          <video
                            src={img}
                            controls
                            playsInline
                            className="w-full h-auto block"
                            style={{ borderRadius: RADIUS }}
                          />
                        ) : (
                          <img
                            src={img}
                            alt={`${project.title} ${i + 1}`}
                            className="w-full h-auto block"
                            loading="lazy"
                            draggable={false}
                          />
                        )}
                      </motion.div>
                    ))}
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
          }); // end mixed.map
        })()}
      </div>

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
            className="fixed right-0 top-0 z-50 h-full w-80 bg-white shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-100"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <span className="text-sm font-semibold tracking-widest uppercase">Contact</span>
              <button onClick={() => setContactOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl">×</button>
            </div>
            <div className="px-6 py-5 text-[13px] leading-relaxed text-neutral-600 space-y-3">
              <p className="text-neutral-900 font-semibold text-base">Studio Flatland</p>
              <p>Graphic Design · Editorial · Identity</p>
              <p className="text-neutral-400 italic text-[12px]">E-Mail und weitere Kontaktdaten hier ergänzen.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
