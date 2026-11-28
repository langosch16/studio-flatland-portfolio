"use client";
import { useEffect, useRef, useState } from "react";

const WORDS = ["Editorial", "Grafik", "Animation", "Typografie", "Plakat", "Branding"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [wi, setWi] = useState(0);
  useEffect(() => {
    requestAnimationFrame(() => ref.current?.classList.add("in"));
  }, []);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const iv = setInterval(() => setWi((v) => (v + 1) % WORDS.length), 1900);
    return () => clearInterval(iv);
  }, []);
  return (
    <section className="hero" ref={ref} id="hero">
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
