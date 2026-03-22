import MasonryPortfolio from "@/components/MasonryPortfolio";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

export default function Home() {
  return <MasonryPortfolio projects={projects as unknown as Project[]} />;
}
