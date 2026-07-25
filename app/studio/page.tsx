import CinematicPortfolio from "@/components/cinematic/CinematicPortfolio";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

export default function StudioPage() {
  return <CinematicPortfolio projects={projects as unknown as Project[]} />;
}
