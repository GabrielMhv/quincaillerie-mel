"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BoutiqueProvider } from "@/components/providers/boutique-provider";
import { BrandingProvider, BrandingSettings } from "@/components/providers/branding-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ 
  children,
  initialBranding
}: { 
  children: ReactNode;
  initialBranding?: BrandingSettings;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <BrandingProvider initialSettings={initialBranding}>
          <BoutiqueProvider>
            {children}
            <Toaster position="top-right" richColors />
          </BoutiqueProvider>
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
