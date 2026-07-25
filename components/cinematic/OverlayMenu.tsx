"use client";
import { useState } from "react";
import type { CSSProperties } from "react";

type Panel = "menu" | "impressum" | "datenschutz" | "kontakt";

export default function OverlayMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [panel, setPanel] = useState<Panel>("menu");
  const go = (id: string) => { onClose(); setPanel("menu"); document.getElementById(id)?.scrollIntoView(); };
  const close = () => { onClose(); setPanel("menu"); };

  const panelWrap: CSSProperties = { maxWidth: 620, maxHeight: "80vh", overflowY: "auto", lineHeight: 1.6, fontSize: 15, fontFamily: "var(--mono)" };
  const backBtn: CSSProperties = { fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", background: "none", border: "none", color: "inherit", marginBottom: 24, display: "block" };
  const heading: CSSProperties = { fontWeight: 700, marginBottom: 4 };
  const label: CSSProperties = { fontWeight: 600, marginBottom: 4, marginTop: 16 };

  return (
    <div className={`menu ${open ? "open" : ""}`}>
      <button className="mclose" onClick={close}>Schließen ✕</button>
      {panel === "menu" && (
        <>
          <a onClick={() => go("hero")}>Start</a>
          <a onClick={() => go("clients")}>Kunden</a>
          <a onClick={() => setPanel("kontakt")}>Kontakt</a>
          <a onClick={() => setPanel("impressum")}>Impressum</a>
          <a onClick={() => setPanel("datenschutz")}>Datenschutz</a>
          <div className="contact">Arnethgasse 32/7 · 1160 Wien · langosch@gmx.at</div>
        </>
      )}
      {panel === "kontakt" && (
        <div style={panelWrap}>
          <button style={backBtn} onClick={() => setPanel("menu")}>← Zurück</button>
          <p style={heading}>Büro Flatland</p>
          <p>Arnethgasse 32/7</p>
          <p>1160 Wien, Austria</p>
          <p><a href="mailto:migo@mischgo.com">migo@mischgo.com</a></p>
        </div>
      )}
      {panel === "impressum" && (
        <div style={panelWrap}>
          <button style={backBtn} onClick={() => setPanel("menu")}>← Zurück</button>
          <p style={heading}>Büro Flatland</p>
          <p>Arnethgasse 32/7</p>
          <p>1160 Wien, Austria</p>
          <p style={label}>Kontakt</p>
          <p><a href="mailto:migo@mischgo.com">migo@mischgo.com</a></p>
          <p style={label}>Unternehmensgegenstand</p>
          <p>Grafik Design, Editorial Design, Corporate Identity</p>
          <p style={label}>Inhaberin</p>
          <p>Michael Abraham</p>
          <p style={label}>Berufsrecht</p>
          <p>Gewerbliche Tätigkeit gemäß Gewerbeordnung (GewO). Zuständige Behörde: Magistratisches Bezirksamt Wien.</p>
          <p style={{ ...label, opacity: 0.6 }}>Alle Inhalte dieser Website sind urheberrechtlich geschützt. Nachdruck oder Verwendung nur mit ausdrücklicher Genehmigung.</p>
          <p style={{ opacity: 0.6 }}>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.</p>
        </div>
      )}
      {panel === "datenschutz" && (
        <div style={panelWrap}>
          <button style={backBtn} onClick={() => setPanel("menu")}>← Zurück</button>
          <p style={heading}>Datenschutzerklärung</p>
          <p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).</p>
          <p style={label}>Verantwortlicher</p>
          <p>Büro Flatland, Arnethgasse 32/7, 1160 Wien</p>
          <p><a href="mailto:migo@mischgo.com">migo@mischgo.com</a></p>
          <p style={label}>Datenerfassung</p>
          <p>Diese Website erhebt nur jene personenbezogenen Daten, die Sie uns freiwillig über das Kontaktformular mitteilen (Name, E-Mail-Adresse, Nachricht). Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.</p>
          <p style={label}>Ihre Rechte</p>
          <p>Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei der Aufsichtsbehörde beschweren.</p>
          <p>Österreichische Datenschutzbehörde: dsb.gv.at</p>
          <p style={label}>Hosting</p>
          <p>Diese Website wird über Vercel Inc. gehostet. Vercel kann dabei technische Daten (IP-Adresse, Zugriffszeitpunkt) in Server-Logs speichern. Weitere Informationen: vercel.com/legal/privacy-policy</p>
        </div>
      )}
    </div>
  );
}
