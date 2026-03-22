"use client";
import { FloatingNav } from "@/components/ui/floating-navbar";

const navItems = [
    { name: "Home", link: "#home" },
    { name: "Projekte", link: "#projects" },
    { name: "Kontakt", link: "#contact" },
];

export function PortfolioNavbar() {
    return (
        <FloatingNav
            navItems={navItems}
            className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-md"
        />
    );
}
