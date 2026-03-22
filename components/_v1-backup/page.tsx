import { PortfolioNavbar } from "@/components/ui/portfolio-navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { ProjectsSection } from "@/components/ui/projects-section";
import { ContactSection } from "@/components/ui/contact-section";

export default function Home() {
  return (
    <main className="bg-neutral-950 min-h-screen">
      <PortfolioNavbar />
      <HeroSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
