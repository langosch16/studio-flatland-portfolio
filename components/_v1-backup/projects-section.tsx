"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

interface Project {
    title: string;
    tags: string[];
    cover: string;
    details: string[];
}

const projects: Project[] = [
    {
        title: "Logo SkillSprout",
        tags: ["Logo", "Branding"],
        cover: "/projekte/logo-skillsprout/01-cover.png",
        details: ["/projekte/logo-skillsprout/03.png", "/projekte/logo-skillsprout/04.png", "/projekte/logo-skillsprout/05.png"],
    },
    {
        title: "Athelthics Eyewear",
        tags: ["Branding", "Animation"],
        cover: "/projekte/athelthics-eyewear-ski-googles/01-cover.gif",
        details: [],
    },
    {
        title: "Digital Campus A1",
        tags: ["Branding", "Digital"],
        cover: "/projekte/digital-campus-a1/01-cover.png",
        details: ["/projekte/digital-campus-a1/03.png", "/projekte/digital-campus-a1/04.png", "/projekte/digital-campus-a1/05.png"],
    },
    {
        title: "Grafik Inserts & Animationen",
        tags: ["Animation", "Motion"],
        cover: "/projekte/grafik-inserts-animationen/01-cover.gif",
        details: [],
    },
    {
        title: "Kultur 4 Kids",
        tags: ["Branding", "Print"],
        cover: "/projekte/kultur-4-kids/01-cover.jpg",
        details: ["/projekte/kultur-4-kids/03.jpg", "/projekte/kultur-4-kids/04.jpg", "/projekte/kultur-4-kids/05.png"],
    },
];

const NUM = projects.length;

// ─── Slide ────────────────────────────────────────────────────────────────────

function Slide({ project, index, scrollYProgress }: {
    project: Project;
    index: number;
    scrollYProgress: any;
}) {
    const center = index / (NUM - 1);
    const step   = 1 / (NUM - 1);
    const lo     = Math.max(0, center - step);
    const hi     = Math.min(1, center + step);

    const scale   = useTransform(scrollYProgress, [lo, center, hi], [0.91, 1, 0.91]);
    const opacity = useTransform(scrollYProgress, [lo, center, hi], [0.45, 1, 0.45]);

    return (
        <div className="w-screen h-screen shrink-0 flex items-center justify-center">
            {/* Ghost cards stacked behind */}
            <div className="absolute pointer-events-none"
                style={{ width: "78vw", height: "76vh", borderRadius: 24, background: "#262626", transform: "translateY(14px) scale(0.96)", opacity: 0.4 }} />
            <div className="absolute pointer-events-none"
                style={{ width: "78vw", height: "76vh", borderRadius: 24, background: "#333", transform: "translateY(26px) scale(0.92)", opacity: 0.2 }} />

            {/* Main card */}
            <motion.div
                style={{ scale, opacity }}
                className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/70 border border-white/[0.06]"
                css-size="true"
                // inline size to avoid vw in motion transforms
                // We set size via className only — no motion units
            >
                {/* Force pixel size via inline style to avoid WAAPI vw issues */}
                <div style={{ width: "78vw", height: "76vh", position: "relative" }}>
                    <img
                        src={project.cover}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                        {/* Top */}
                        <div className="flex justify-between items-start">
                            <span className="text-xs uppercase tracking-[0.3em] text-white/35 tabular-nums">
                                {String(index + 1).padStart(2, "0")} / {String(NUM).padStart(2, "0")}
                            </span>
                            <div className="flex gap-2 flex-wrap justify-end">
                                {project.tags.map((tag) => (
                                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/45 uppercase tracking-wider backdrop-blur-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="flex items-end justify-between gap-4">
                            <div className="overflow-hidden">
                                <motion.h2
                                    initial={{ y: "110%" }}
                                    whileInView={{ y: 0 }}
                                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                                    viewport={{ once: false, margin: "-15%" }}
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight"
                                >
                                    {project.title}
                                </motion.h2>
                            </div>
                            {project.details.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    viewport={{ once: false, margin: "-15%" }}
                                    className="flex gap-2 shrink-0"
                                >
                                    {project.details.slice(0, 3).map((src, i) => (
                                        <div key={i} className="w-14 md:w-20 overflow-hidden rounded-xl border border-white/10 shrink-0" style={{ height: "6rem" }}>
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Progress Dot ─────────────────────────────────────────────────────────────

function ProgressDot({ index, scrollYProgress }: { index: number; scrollYProgress: any }) {
    const center  = index / (NUM - 1);
    const half    = 0.5 / (NUM - 1);
    const lo      = Math.max(0, center - half);
    const hi      = Math.min(1, center + half);
    const scaleX  = useTransform(scrollYProgress, [lo, center, hi], [1, 2.5, 1]);
    const opacity = useTransform(scrollYProgress, [lo, center, hi], [0.25, 1, 0.25]);
    return <motion.div style={{ scaleX, opacity }} className="h-[3px] w-5 rounded-full bg-white origin-left" />;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ProjectsSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef     = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: containerRef });

    // Directly set CSS transform to avoid WAAPI vw-unit issue
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${-v * (NUM - 1) * 100}vw)`;
        }
    });

    return (
        <section id="projects">
            {/* Header */}
            <div className="bg-neutral-950 py-24 px-8 md:px-16 border-b border-neutral-900">
                <motion.p
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="text-xs uppercase tracking-[0.3em] text-violet-400 mb-4"
                >
                    Ausgewählte Arbeiten
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
                    className="text-6xl md:text-8xl font-bold text-white tracking-tight"
                >
                    Projekte
                </motion.h1>
                <p className="mt-4 text-neutral-600 text-sm tracking-wide">Scroll zum Durchblättern</p>
            </div>

            {/* Scroll container */}
            <div ref={containerRef} style={{ height: `${NUM * 100}vh` }} className="relative bg-neutral-950">
                <div className="sticky top-0 h-screen overflow-hidden bg-neutral-950">

                    {/* Track — moved via direct DOM manipulation, not motion x */}
                    <div
                        ref={trackRef}
                        className="flex h-full will-change-transform"
                        style={{ transform: "translateX(0vw)" }}
                    >
                        {projects.map((project, i) => (
                            <Slide key={project.title} project={project} index={i} scrollYProgress={scrollYProgress} />
                        ))}
                    </div>

                    {/* Progress dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-50">
                        {projects.map((_, i) => (
                            <ProgressDot key={i} index={i} scrollYProgress={scrollYProgress} />
                        ))}
                    </div>

                    {/* Progress line */}
                    <motion.div
                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        className="absolute bottom-0 left-0 right-0 h-px bg-white/15 z-50"
                    />
                </div>
            </div>
        </section>
    );
}
