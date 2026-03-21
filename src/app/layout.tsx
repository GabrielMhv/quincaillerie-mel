import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "branding")
    .single();

  const branding = data?.value || {
    name: "Ets La Championne",
    description: "Votre quincaillerie de confiance.",
  };

  return {
    title: {
      default: branding.name,
      template: `%s | ${branding.name}`,
    },
    description: branding.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "branding")
    .single();

  const branding = data?.value || {
    name: "Ets La Championne",
    description: "Votre quincaillerie de confiance.",
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} font-outfit antialiased`}
      >
        <Providers initialBranding={branding}>{children}</Providers>
      </body>
    </html>
  );
}
