"use client";
import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { MovingBorder } from "@/components/ui/moving-border";

const placeholders = [
    "Deine E-Mail-Adresse...",
    "hello@example.com",
    "Lass uns zusammenarbeiten!",
];

export function ContactSection() {
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Hier kannst du später deine Submit-Logik einfügen
        // z.B. Resend, Formspree, EmailJS etc.
        setSubmitted(true);
    };

    return (
        <section
            id="contact"
            className="relative py-32 px-4 bg-neutral-950 flex flex-col items-center"
        >
            {/* Header */}
            <p className="text-sm uppercase tracking-widest text-violet-400 mb-3">
                Zusammenarbeiten
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
                Lass uns reden
            </h2>
            <p className="mt-4 text-neutral-400 text-center max-w-md">
                Du hast ein Projekt im Kopf? Ich freue mich über jede Anfrage —
                meld dich einfach!
            </p>

            {!submitted ? (
                <div className="mt-14 w-full max-w-md flex flex-col gap-6">
                    {/* Email Input mit Vanish-Effekt */}
                    <div>
                        <label className="text-neutral-500 text-xs uppercase tracking-widest mb-2 block">
                            Deine E-Mail
                        </label>
                        <PlaceholdersAndVanishInput
                            placeholders={placeholders}
                            onChange={(e) => { }}
                            onSubmit={(e) => e.preventDefault()}
                        />
                    </div>

                    {/* Nachricht */}
                    <div>
                        <label className="text-neutral-500 text-xs uppercase tracking-widest mb-2 block">
                            Deine Nachricht
                        </label>
                        <textarea
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hallo! Ich suche einen Designer für..."
                            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 p-4 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Submit Button mit Moving Border */}
                    <button
                        onClick={() => setSubmitted(true)}
                        className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
                    >
                        Nachricht senden ✉️
                    </button>

                </div>
            ) : (
                /* Success State */
                <div className="mt-14 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-3xl">
                        ✓
                    </div>
                    <p className="text-white text-xl font-semibold">Nachricht gesendet!</p>
                    <p className="text-neutral-400 text-sm text-center">
                        Ich melde mich so schnell wie möglich bei dir.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="mt-4 text-violet-400 text-sm hover:text-violet-300 transition-colors"
                    >
                        Weitere Nachricht senden
                    </button>
                </div>
            )}

            {/* Social Links */}
            <div className="mt-16 flex gap-6">
                {[
                    { label: "Behance", href: "#" },
                    { label: "Dribbble", href: "#" },
                    { label: "LinkedIn", href: "#" },
                    { label: "Instagram", href: "#" },
                ].map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="text-neutral-500 text-sm hover:text-white transition-colors"
                    >
                        {link.label}
                    </a>
                ))}
            </div>

            {/* Footer */}
            <p className="mt-12 text-neutral-700 text-xs">
                © 2025 · Designed & built with ♥
            </p>
        </section>
    );
}
