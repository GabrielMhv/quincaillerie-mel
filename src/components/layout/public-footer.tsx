import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Sparkles,
  Store,
  ArrowUpRight,
} from "lucide-react";
import { useBranding } from "@/components/providers/branding-provider";

export function PublicFooter() {
  const { settings } = useBranding();

  const socialLinks = [
    { icon: Facebook, href: settings.facebook, label: "Facebook" },
    { icon: Instagram, href: settings.instagram, label: "Instagram" },
    { icon: MessageCircle, href: settings.whatsapp, label: "WhatsApp" },
    { icon: Linkedin, href: settings.linkedin, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="w-full bg-indigo-950 text-white/50 border-t border-white/5 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full bg-premium-grid opacity-5 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-150 w-150 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary/20 transition-all duration-500">
                  <Store className="h-7 w-7 text-primary" />
                </div>
                <span className="font-black text-3xl tracking-tighter text-white leading-none">
                  {settings.name}
                </span>
              </div>
              <p className="text-[11px] tracking-tight font-bold text-blue-400 opacity-60 pl-1">
                {settings.address}
              </p>
            </Link>
            <p className="text-base font-medium leading-relaxed max-w-sm text-white/40">
              {settings.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <Link
                  key={i}
                  href={social.href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-500 backdrop-blur-md"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="mb-6 text-[11px] font-bold tracking-tight text-primary">
                Navigation
              </h4>
              <ul className="space-y-4 text-[14px] font-bold tracking-tight text-white/60 leading-none">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-primary flex items-center gap-2 group transition-all"
                  >
                    <span>Catalogue</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-primary flex items-center gap-2 group transition-all"
                  >
                    <span>L&apos;histoire</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-primary flex items-center gap-2 group transition-all"
                  >
                    <span>Contact</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-primary flex items-center gap-2 group transition-all"
                  >
                    <span>E-Panier Digital</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-[11px] font-bold tracking-tight text-primary">
                Points de vente
              </h4>
              <ul className="space-y-5 text-[14px] font-bold tracking-tight leading-snug text-white/50">
                <li className="flex items-start gap-3 group cursor-default">
                  <div className="mt-1 p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-white block">Lomé Headquarter</span>
                    <span className="text-[10px] font-medium opacity-50 tracking-tight">
                      Division Centrale
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 group cursor-default">
                  <div className="mt-1 p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-white block">Ségbé & Sanguera</span>
                    <span className="text-[10px] font-medium opacity-50 tracking-tight">
                      Boutiques de Proximité
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-[11px] font-bold tracking-tight text-primary">
                Accès Privé
              </h4>
              <Link
                href="/auth/login"
                className="group relative glass p-6 rounded-4xl border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all text-center overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Store className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[12px] font-black tracking-tight text-white block mb-0.5">
                    Console Admin
                  </span>
                  <span className="text-[9px] font-bold tracking-tight text-primary opacity-60">
                    Espace Gestion
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-tight text-white/20">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary/40" />
            </div>
            <p className="opacity-60">
              &copy; {new Date().getFullYear()} Ets La Championne • Excellence &
              Innovation au Togo.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {["Ségbé", "Sanguera", "Lomé"].map((loc) => (
              <span
                key={loc}
                className="hover:text-primary transition-colors cursor-pointer font-bold tracking-tight text-[9px] opacity-40 hover:opacity-100"
              >
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
