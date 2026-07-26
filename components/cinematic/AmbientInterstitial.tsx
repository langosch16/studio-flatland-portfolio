"use client";
import { useEffect, useState } from "react";
import { useReveal } from "./useReveal";

export default function AmbientInterstitial({
  youtube,
  statement,
  sub,
}: {
  youtube: string;
  statement: string;
  sub?: string;
}) {
  const ref = useReveal<HTMLElement>();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const params =
    `autoplay=1&mute=1&controls=0&loop=1&playlist=${youtube}` +
    `&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3`;

  return (
    <section ref={ref} className="ambient">
      <div className="av-bg">
        {reduce ? (
          <img className="av-poster" src={`https://img.youtube.com/vi/${youtube}/maxresdefault.jpg`} alt="" />
        ) : (
          <iframe
            className="av-frame"
            src={`https://www.youtube-nocookie.com/embed/${youtube}?${params}`}
            title="Motion"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="av-scrim" />
      <div className="av-content">
        <div className="av-eyebrow">Bewegtbild</div>
        <h2>{statement}</h2>
        {sub && <p>{sub}</p>}
      </div>
    </section>
  );
}
