"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

export interface BrandingSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  linkedin?: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: BrandingSettings = {
  name: "Ets La Championne",
  description: "Votre partenaire pour tous vos travaux de quincaillerie.",
  address: "Ségbé & Sanguera, Lomé, Togo",
  phone: "+228 00 00 00 00",
  email: "contact@lachampionne.com",
  logo_url: "",
  facebook: "",
  instagram: "",
  whatsapp: "",
  linkedin: "",
};

const BrandingContext = createContext<BrandingContextType>({
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: async () => {},
});

interface SiteSettingRow {
  id: string;
  key: string;
  value: BrandingSettings;
  updated_at: string;
}

export function BrandingProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: BrandingSettings;
}) {
  const [settings, setSettings] = useState<BrandingSettings>(
    initialSettings || defaultSettings,
  );
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "branding")
        .single();

      if (data?.value) {
        setSettings(data.value as BrandingSettings);
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (initialSettings) return;
    fetchSettings();

    // Subscribe to real-time changes in site_settings
    const channel = supabase
      .channel("site_settings_branding")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_settings",
          filter: "key=eq.branding",
        },
        (payload: RealtimePostgresUpdatePayload<SiteSettingRow>) => {
          if (payload.new && payload.new.value) {
            setSettings(payload.new.value);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, initialSettings, fetchSettings]);

  return (
    <BrandingContext.Provider
      value={{ settings, isLoading, refreshSettings: fetchSettings }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
