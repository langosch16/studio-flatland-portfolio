"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

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

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ project, index, scrollYProgress }: { project: Project; index: number; scrollYProgress: any }) {
    // Each card occupies 1/NUM of the scroll range
    const start = index / NUM;
    const end   = (index + 1) / NUM;

    // This card scales + moves up as it scrolls away
    const scale   = useTransform(scrollYProgress, [start, end], [1, 0.88]);
    const y       = useTransform(scrollYProgress, [start, end], ["0%", "-8%"]);
    const opacity = useTransform(scrollYProgress, [start, end - 0.02, end], [1, 1, 0]);
    const blur    = useTransform(scrollYProgress, [start, end], [0, 6]);

    // Next card slides in from below
    const yIn     = useTransform(scrollYProgress, [start - 1 / NUM, start], ["100%", "0%"]);

    const isFirst = index === 0;

    return (
        <motion.div
            className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden"
            style={{
                scale,
                y: isFirst ? y : yIn,
                opacity: isFirst ? opacity : undefined,
                filter: blur ? blur.get() > 0 ? `blur(${blur.get()}px)` : undefined : undefined,
                zIndex: index,
                transformOrigin: "top center",
            }}
        >
            {/* Cover image */}
            <img src={project.cover} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12">
                {/* Top row */}
                <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                        {String(index + 1).padStart(2, "0")} / {String(NUM).padStart(2, "0")}
                    </span>
                    <div className="flex gap-2">
                        {project.tags.map((tag) => (
                            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/50 uppercase tracking-wider backdrop-blur-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom: title + thumbnails */}
                <div className="flex items-end justify-between gap-6">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                        {project.title}
                    </h2>

                    {project.details.length > 0 && (
                        <div className="flex gap-2 shrink-0">
                            {project.details.slice(0, 3).map((src, i) => (
                                <div key={i} className="w-16 h-20 md:w-24 md:h-32 overflow-hidden rounded-lg border border-white/10 shrink-0">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ProjectsSectionStack() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Mini-map: thumbnails of all projects at bottom
    const miniY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

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
                <p className="mt-4 text-neutral-600 text-sm">Scroll zum Durchblättern</p>
            </div>

            {/* Stack scroll container */}
            <div ref={containerRef} style={{ height: `${(NUM + 1) * 100}vh` }} className="relative bg-neutral-950">
                <div className="sticky top-0 h-screen overflow-hidden bg-neutral-950">

                    {/* Card stack */}
                    <div className="absolute inset-0">
                        {projects.map((project, i) => (
                            <Card
                                key={project.title}
                                project={project}
                                index={i}
                                scrollYProgress={scrollYProgress}
                            />
                        ))}
                    </div>

                    {/* Progress indicator — right side */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
                        {projects.map((_, i) => {
                            const dotProgress = useTransform(
                                scrollYProgress,
                                [i / NUM, (i + 1) / NUM],
                                [0.3, 1]
                            );
                            return (
                                <motion.div
                                    key={i}
                                    style={{ opacity: dotProgress }}
                                    className="w-1 h-6 rounded-full bg-white"
                                />
                            );
                        })}
                    </div>

                    {/* Bottom progress line */}
                    <motion.div
                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        className="absolute bottom-0 left-0 right-0 h-px bg-white/30 z-50"
                    />
                </div>
            </div>
        </section>
    );
}
