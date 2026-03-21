"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BoutiqueProvider } from "@/components/providers/boutique-provider";
import { BrandingProvider } from "@/components/providers/branding-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ 
  children,
  initialBranding
}: { 
  children: React.ReactNode;
  initialBranding?: any;
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
