"use client";

export default function HeroTile() {
  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* Typo */}
      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: "2%" }}>
        {["MAX", "ABRA", "HAM"].map((word) => (
          <div
            key={word}
            className="uppercase whitespace-nowrap text-neutral-900"
            style={{
              fontSize: "clamp(2rem, 7vw, 7vw)",
              lineHeight: 0.72,
              letterSpacing: "-0.02em",
              fontWeight: 900,
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* GRAPHIC DESIGN — klein, mittig */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500/60 font-medium">
          Graphic Design · Brand · Motion
        </span>
      </div>
    </div>
  );
}
