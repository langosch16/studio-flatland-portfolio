# Studio Flatland — Cinematic Scroll Portfolio

**Datum:** 2026-07-25
**Status:** Design abgestimmt, bereit für Implementierungsplan
**Inspiration:** good.at (immersiver WebGL-Slider mit Curtain-Übergängen) — übertragen auf ein Portfolio mit vielen Projekten.

## Ziel

Das bestehende helle Masonry-Grid (`components/MasonryPortfolio.tsx`) durch eine **immersive, cinematische Single-Scroll-Erfahrung** ersetzen. Statt einer Galerie zum Durchblättern wird der Besucher wie durch einen Film durch die Arbeit geführt: dunkler Grundton, große Typografie, Curtain-Übergänge mit Farbwechseln.

Die Herausforderung: **78 Projekte** dürfen nicht zu 78 Vollbildern werden (niemand scrollt bis Projekt 40). Deshalb wird die Immersion über **Kapitel + Rhythmus** strukturiert, nicht über „ein Projekt pro Screen".

## Nicht-Ziele (bewusst weggelassen)

- Kein WebGL / Shader-Pixel-Melt (mobil riskant, Wartungslast für ein Solo-Projekt). Effekt wird mit motion/react + CSS erreicht.
- Kein Kategorie-Filter (Print/Animation/Graphics als klickbare Filter entfällt).
- Keine Kunden-Liste / Client-Directory mehr (die 33 Kunden mit Projekt-Zuordnung entfallen).
- Kein Preloader-Zähler (1/100) wie bei good.at.

## Grundentscheidungen (mit User abgestimmt)

| Thema | Entscheidung |
|---|---|
| Ambition | Voller immersiver Umbau, kein bloßes Aufwerten des Grids |
| Struktur | Ein durchgehender vertikaler Cinematic-Scroll |
| Optik | Dunkel mit Farbwechseln (Curtain zieht neue Hintergrundfarbe rein) |
| Technik | Solide: motion/react + CSS (clip-path/mask, IntersectionObserver). Kein WebGL. |
| Erhalten | Impressum, Datenschutz, Kontakt (als erreichbare Overlays) |
| Kapitel-Reihenfolge | Animation → Grafik → Print |
| Featured-Projekte | User markiert selbst via neues Feld `featured?: boolean` |

## Architektur

### Neue Komponente statt Umbau
- Neue Datei: `components/CinematicPortfolio.tsx`.
- `components/MasonryPortfolio.tsx` bleibt **unverändert als Backup** liegen (Projekt hält bereits Backups vor). Umschalten in `app/page.tsx` bleibt trivial möglich.
- `data/projects.ts` bleibt inhaltlich unverändert. Einzige Erweiterung: optionales Feld `featured?: boolean` im `Project`-Type + Setzen bei den gewünschten Highlights.

### Datenfluss
- `projects` werden nach Kapitel (Kategorie) gebucketet. Mapping wie bisher (`mapTheme`): `video → animation`, `books|magazine → print`, sonst `graphics`.
- Pro Kapitel: `featured === true` → Featured-Strecke; Rest → cinematisches Mini-Grid.
- Videos (`VIDEOS`-Liste, YouTube-IDs) werden dem Animation-Kapitel zugeordnet.

## Seitenaufbau (top → bottom)

### 1. Opening / Hero
- Vollbild Schwarz. „STUDIO FLATLAND" als Split-Text-Reveal (Zeilen gestaffelt).
- Darunter rotierende Disziplin-Zeile (Editorial · Grafik · Animation · Typografie).
- Dezenter Scroll-Cue. Ersetzt den bisherigen Typewriter-Splash.

### 2. Die Reise — 3 Kapitel (Animation → Grafik → Print)
Jedes Kapitel folgt demselben Rhythmus:

1. **Curtain-Break** (Vollbild): große Kapitel-Nummer + Titel (z.B. „01 — ANIMATION"). Beim Reinscrollen zieht ein Curtain (clip-path/mask) eine kapitel-eigene Hintergrundfarbe rein. Das sind die dramatischen Farbwechsel-Momente.
2. **Featured-Strecke**: `featured`-Projekte des Kapitels full-bleed / groß. Cover prominent, Titel + Excerpt als Split-Text beim Reveal, leichter Parallax auf dem Bild.
3. **Rest-Grid**: übrige Projekte des Kapitels in einem dichteren cinematischen Grid mit gestaffeltem Scroll-Reveal — alle Projekte bleiben sichtbar, ohne endloses Scrollen.
4. Im Animation-Kapitel: YouTube-Videos als große eingebettete Player (Klick-to-Play, wie bisher).

### 3. Projekt-Detail (Overlay)
- Klick auf ein Projekt → Vollbild-Overlay, Curtain zieht rein.
- Inhalt: alle `images` des Projekts, `excerpt`, `services`, `year`, ggf. `url`.
- Ersetzt das bisherige Inline-Aufklappen. Schließen via ×/ESC/Backdrop, Curtain zieht raus.

### 4. Closing / Kontakt
- Letzter Break: großes „Let's talk" + Kontaktangabe.
- Persistentes minimales Fixed-Menü (Overlay-Menü im good.at-Stil) mit **Kontakt · Impressum · Datenschutz** — jederzeit von jeder Scroll-Position erreichbar. Inhalte der drei Overlays werden aus dem bestehenden `MasonryPortfolio.tsx` übernommen.

## Persistente UI-Elemente
- **Fixed Header**: Logo (Studio Flatland) + Burger/Menü-Trigger.
- **Overlay-Menü**: Kontakt, Impressum, Datenschutz (Split-Text-Animation beim Öffnen).
- **Scroll-Fortschritt**: dezenter Indikator (optional, z.B. dünne Leiste oder Kapitel-Marker).

## Performance & Zugänglichkeit (verbindlich)
- `prefers-reduced-motion`: respektieren — bei „reduce" Curtains/Parallax/Split-Text auf simple Fades/instant reduzieren. Ohne das wird immersives Scrollen für manche Nutzer körperlich unangenehm.
- Bilder: `loading="lazy"`, sinnvolle Größen; Offscreen-Kapitel mit `content-visibility: auto`.
- Reveals über **IntersectionObserver**, nicht über High-Frequency-Scroll-Listener (siehe react-best-practices: `client-passive-event-listeners`, `rendering-content-visibility`).
- Keine neuen schweren Dependencies (motion/react ist bereits im Projekt).

## Betroffene Dateien
- **Neu:** `components/CinematicPortfolio.tsx` (+ ggf. Unterkomponenten: `Hero`, `ChapterBreak`, `FeaturedProject`, `ProjectGrid`, `ProjectOverlay`, `OverlayMenu`).
- **Geändert:** `app/page.tsx` (rendert `CinematicPortfolio` statt `MasonryPortfolio`).
- **Geändert:** `data/projects.ts` (`Project`-Type: `featured?: boolean`; Highlights markieren).
- **Unangetastet Backup:** `components/MasonryPortfolio.tsx`.

## Offene Detailfragen (im Implementierungsplan zu klären)
- Konkrete Kapitel-Farben (3 Hintergrundfarben, dunkel-kompatibel).
- Genauer Look des Rest-Grids (Spaltenzahl, Seitenverhältnisse).
- Ob Scroll-Fortschritt-Indikator rein soll.
- Welche Projekte `featured` bekommen (User markiert nach erstem Prototyp).

## Risiko / Ehrlichkeit
Das ist ein substanzieller Rebuild, keine kleine Änderung. Der Hauptrisikopunkt ist **Browsability vs. Immersion** bei 78 Projekten — das Kapitel-Rhythmus-Konzept ist die Absicherung dagegen. Umsetzung in Phasen empfohlen (Hero → 1 Kapitel als Prototyp → Rest → Overlays → Feinschliff), mit Zwischen-Reviews im Browser.
