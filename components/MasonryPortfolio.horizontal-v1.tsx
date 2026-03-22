"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Project } from "@/data/projects";

type Props = { projects: Project[] };
type ThemeFilter = "all" | "print" | "animation" | "graphics";

function mapTheme(p: Project): Exclude<ThemeFilter, "all"> {
  const cats = p.categories.map((c) => c.toLowerCase());
  if (cats.includes("video")) return "animation";
  if (cats.includes("books") || cats.includes("magazine")) return "print";
  return "graphics";
}

function extractClients(projects: Project[]) {
  const blacklist = new Set([
    "all","print","animation","graphics","contact","clients",
    "category","about this project","tags","date","cookie-zustimmung verwalten",
  ]);
  const names = new Set<string>();
  for (const p of projects) {
    const lines = `${p.text}\n${p.excerpt}`.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (blacklist.has(lower) || lower.length < 2) continue;
      if (/cookie|zustimmung|funktional|marketing|statistiken|vorlieben|optionen verwalten|lese mehr|wp-/.test(lower)) continue;
      if (/category|about this project|clients|tags/.test(lower)) continue;
      if (line.length <= 40 && /[A-Za-zÄÖÜäöüß]/.test(line)) names.add(line);
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, "de"));
}

const MENU_ITEMS: { label: string; filter: ThemeFilter | "clients" | "contact" }[] = [
  { label: "All",       filter: "all" },
  { label: "Print",     filter: "print" },
  { label: "Animation", filter: "animation" },
  { label: "Graphics",  filter: "graphics" },
  { label: "Clients",   filter: "clients" },
  { label: "Contact",   filter: "contact" },
];

export default function MasonryPortfolio({ projects }: Props) {
  const [filter, setFilter]           = useState<ThemeFilter>("all");
  const [clientsOpen, setClientsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);

  const clientNames = useMemo(() => extractClients(projects), [projects]);

  const filtered = useMemo(() =>
    filter === "all" ? projects : projects.filter((p) => mapTheme(p) === filter),
    [projects, filter]
  );

  function handleMenu(f: ThemeFilter | "clients" | "contact") {
    if (f === "clients") { setClientsOpen((v) => !v); setContactOpen(false); }
    else if (f === "contact") { setContactOpen((v) => !v); setClientsOpen(false); }
    else { setFilter(f); setClientsOpen(false); setContactOpen(false); }
  }

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900 font-sans p-[3px]">

      {/* ── One unified horizontal masonry: logo + menu + images ── */}
      <div className="flex flex-wrap content-start gap-[3px]">

        {/* Logo tile */}
        <div
          className="bg-neutral-900 rounded-sm flex flex-col justify-between p-4 select-none shrink-0"
          style={{ height: 170, width: 160 }}
        >
          <span className="text-[7px] uppercase tracking-[0.22em] text-white/30 font-medium">
            Portfolio
          </span>
          <div className="text-white font-black uppercase leading-[0.82] tracking-tight" style={{ fontSize: "1.5rem" }}>
            Studio<br />Flat<br />Land
          </div>
        </div>

        {/* Menu tiles */}
        {MENU_ITEMS.map(({ label, filter: f }) => {
          const isActive =
            f === filter ||
            (f === "clients" && clientsOpen) ||
            (f === "contact" && contactOpen);
          return (
            <button
              key={f}
              onClick={() => handleMenu(f)}
              className={`rounded-sm flex flex-col justify-between p-4 text-left transition-colors duration-200 shrink-0 ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-900 hover:bg-neutral-100"
              }`}
              style={{ height: 170, width: 160 }}
            >
              <span className={`text-[7px] uppercase tracking-[0.2em] font-medium ${isActive ? "text-white/35" : "text-neutral-400"}`}>
                menu
              </span>
              <span className="font-bold uppercase leading-none tracking-tight" style={{ fontSize: "1.4rem" }}>
                {label}
              </span>
            </button>
          );
        })}

        <AnimatePresence>
          {filtered.map((project) => {
            const extraImages = (project.images || [])
              .filter((img) => img !== project.cover)
              .slice(0, 6);
            const hasExtras = extraImages.length > 0;
            const isExpanded = expanded === project.slug;

            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-[3px]"
                style={{ height: isExpanded ? "auto" : undefined }}
              >
                {/* Cover — fixed row height, auto width */}
                <div
                  className="relative group overflow-hidden bg-neutral-300 cursor-pointer shrink-0"
                  style={{ height: 170 }}
                  onClick={() => hasExtras && setExpanded(isExpanded ? null : project.slug)}
                >
                  <img
                    src={project.cover}
                    alt={project.title}
                    className="h-full w-auto max-w-none transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 pointer-events-none" />
                  <div className="absolute inset-0 p-2 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2 drop-shadow">
                      {project.title}
                    </p>
                  </div>
                  {hasExtras && (
                    <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm transition-colors duration-200 ${
                      isExpanded ? "bg-neutral-900 text-white" : "bg-white/80 text-neutral-800 backdrop-blur-sm"
                    }`}>
                      {isExpanded ? "×" : "+"}
                    </div>
                  )}
                </div>

                {/* Expanded detail images — stack below */}
                <AnimatePresence initial={false}>
                  {isExpanded && hasExtras && (
                    <motion.div
                      key="extras"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden flex flex-col gap-[3px]"
                    >
                      {extraImages.map((img, idx) => (
                        <motion.div
                          key={img}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.22 }}
                          className="overflow-hidden bg-neutral-300 shrink-0"
                          style={{ height: 170 }}
                        >
                          <img
                            src={img}
                            alt={`${project.title} ${idx + 1}`}
                            className="h-full w-auto max-w-none"
                            loading="lazy"
                            draggable={false}
                          />
                        </motion.div>
                      ))}
                      <button
                        onClick={() => setExpanded(null)}
                        className="text-[9px] uppercase tracking-widest text-neutral-500 hover:text-neutral-800 py-1 text-center transition-colors bg-white/60"
                      >
                        ↑ Schließen
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Clients Panel ── */}
      <AnimatePresence>
        {clientsOpen && (
          <motion.aside
            key="clients"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-72 bg-neutral-950 text-white shadow-[-32px_0_80px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-sm font-semibold tracking-widest uppercase">Clients</span>
              <button onClick={() => setClientsOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)] px-6 py-5">
              <div className="space-y-2 text-[13px] leading-snug text-white/70">
                {clientNames.map((n) => <div key={n}>{n}</div>)}
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-72 bg-white text-neutral-900 shadow-[-32px_0_80px_rgba(0,0,0,0.12)] border-l border-neutral-200"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <span className="text-sm font-semibold tracking-widest uppercase">Contact</span>
              <button onClick={() => setContactOpen(false)} className="text-neutral-400 hover:text-neutral-900 text-xl leading-none">×</button>
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
