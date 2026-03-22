"use client";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

const words = [
    { text: "Hi," },
    { text: "ich" },
    { text: "bin" },
    { text: "Max —", className: "text-violet-500 dark:text-violet-400" },
    { text: "Designer.", className: "text-violet-500 dark:text-violet-400" },
];

export function HeroSection() {
    return (
        <section
            id="home"
            className="relative h-screen w-full flex flex-col items-center justify-center antialiased overflow-hidden bg-neutral-950"
        >
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-8 z-10">
                Portfolio 2025
            </p>

            <div className="z-10">
                <TypewriterEffect
                    words={words}
                    className="text-white"
                />
            </div>

            <p className="mt-6 text-neutral-400 text-center max-w-lg text-base z-10 px-6">
                Ich gestalte digitale Erlebnisse, die Menschen begeistern —
                von Brand Identity bis interaktivem UI/UX Design.
            </p>

            <div className="flex gap-4 mt-10 z-10">
                <a
                    href="#projects"
                    className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                    Meine Projekte →
                </a>
                <a
                    href="#contact"
                    className="px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 text-sm font-medium hover:border-neutral-500 hover:text-white transition-colors"
                >
                    Kontakt
                </a>
            </div>

            <BackgroundBeams />
        </section>
    );
}
