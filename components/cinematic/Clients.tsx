"use client";
import { useReveal } from "./useReveal";

const CLIENTS = [
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

export default function Clients() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="clients" id="clients">
      <div className="wrap">
        <div ref={ref} className="reveal">
          <div className="lead">Vertrauen von</div>
          <h2>Ausgewählte<br />Kunden</h2>
        </div>
        <div className="clist">
          {CLIENTS.map((c) => <span key={c}>{c}</span>)}
        </div>
      </div>
    </section>
  );
}
