import type { Metadata } from "next";
import MasonryPortfolio from "@/components/MasonryPortfolio";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

export const metadata: Metadata = {
  title: "Print & Editorial",
  description:
    "Magazine, Kunstkataloge, Bücher und Drucksorten — Layout, Satz, Reinzeichnung und druckfertige Ausgabe.",
};

// Gleiche Seite wie die Startseite, nur mit vorgewaehltem Print-Filter:
// die Filterleiste bleibt voll funktionsfaehig, man kann zu Animation
// und Graphics weiterklicken.
export default function PrintPage() {
  return (
    <MasonryPortfolio
      projects={projects as unknown as Project[]}
      initialFilter="print"
    />
  );
}
