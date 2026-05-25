import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Sparkle, ArrowUpRight } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer 
      className="relative z-20 flex flex-col justify-between min-h-[100dvh] overflow-hidden bg-[#050505] pt-20 pb-8 px-6 md:px-12 lg:px-16"
      style={{
        boxShadow: "0 -24px 48px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Background Glow matching theme (using accent color) */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-accent/10"
        style={{ width: "80vw", height: "50vh", filter: "blur(150px)" }}
      />
      <div
        className="pointer-events-none absolute top-[20%] right-[-10%] rounded-full bg-accent/5"
        style={{ width: "50vw", height: "50vh", filter: "blur(150px)" }}
      />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col flex-1 justify-between h-full">
        {/* Top Section */}
        <div className="max-w-4xl pt-8">
          <div className="flex items-center gap-2 text-accent text-sm font-semibold mb-6">
            <Sparkle size={14} />
            Contact Us
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-white mb-8">
            Interested in working together, <span className="text-white/50">elevating your content or simply learning more?</span>
          </h2>
        </div>

        <div className="flex-1" />

        {/* Middle Section (Contact & Nav) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 w-full mb-24 z-10 relative">
          {/* Contact Email */}
          <div>
            <div className="text-white/50 text-sm md:text-base mb-2">
              Contact us at:
            </div>
            <a 
              href={`mailto:${siteConfig.contact.email}`}
              className="group flex items-center gap-2 text-xl md:text-2xl lg:text-3xl text-white font-medium hover:text-accent transition-colors"
            >
              {siteConfig.contact.email}
              <ArrowUpRight size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-10 text-base md:text-lg lg:text-xl text-white font-medium">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <Link href="#work" className="hover:text-accent transition-colors">Work</Link>
            <Link href="#faq" className="hover:text-accent transition-colors">FAQ</Link>
          </div>
        </div>

        {/* Massive Logo */}
        <div className="w-full flex justify-center mt-auto mb-6">
          <h1 
            className="font-display tracking-tight select-none leading-none pt-4"
            style={{ fontSize: "clamp(4rem, 14vw, 15rem)" }}
          >
            <span className="text-white">Trench</span><span className="text-accent">Vfx</span>
          </h1>
        </div>

        {/* Very Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/50 pt-6 border-t border-white/10 gap-4 mt-auto">
          <div>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
