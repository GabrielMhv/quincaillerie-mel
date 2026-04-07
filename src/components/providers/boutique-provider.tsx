"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Boutique {
  id: string;
  name: string;
  address: string | null;
}

interface BoutiqueContextType {
  selectedBoutique: Boutique | null;
  boutiques: Boutique[];
  setSelectedBoutique: (boutique: Boutique | null) => void;
  isLoading: boolean;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(
  undefined,
);

export function BoutiqueProvider({ children }: { children: React.ReactNode }) {
  const [selectedBoutique, setSelectedBoutiqueState] =
    useState<Boutique | null>(null);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function initBoutiques() {
      try {
        const { data, error } = await supabase
          .from("boutiques")
          .select("*")
          .order("name");

        if (error) {
          console.error("Supabase Error fetching boutiques:", error);
          throw error;
        }
        setBoutiques(data || []);

        if (user && user.role !== "admin" && user.boutique_id) {
          const userBoutique = data?.find(
            (b: Boutique) => b.id === user.boutique_id,
          );
          if (userBoutique) {
            setSelectedBoutiqueState(userBoutique);

            // Enforce boutiqueId in URL for non-admins if it's missing or wrong
            const currentBoutiqueId = searchParams.get("boutiqueId");
            if (currentBoutiqueId !== user.boutique_id) {
              const params = new URLSearchParams(searchParams.toString());
              params.set("boutiqueId", user.boutique_id);
              router.replace(`${pathname}?${params.toString()}`);
            }
          }
        } else {
          // Check URL first for admins
          const currentBoutiqueId = searchParams.get("boutiqueId");
          if (currentBoutiqueId) {
            const urlBoutique = data?.find(
              (b: Boutique) => b.id === currentBoutiqueId,
            );
            if (urlBoutique) {
              setSelectedBoutiqueState(urlBoutique);
              return;
            }
          }

          const saved = localStorage.getItem("selectedBoutique");
          if (saved && data) {
            try {
              const parsed = JSON.parse(saved);
              const exists = data.find(
                (b: Boutique) =>
                  b.id === (typeof parsed === "string" ? parsed : parsed.id),
              );
              if (exists) {
                setSelectedBoutiqueState(exists);
              } else if (data.length > 0) {
                setSelectedBoutiqueState(data[0]);
              }
            } catch {
              if (data.length > 0) setSelectedBoutiqueState(data[0]);
            }
          } else if (data && data.length > 0) {
            setSelectedBoutiqueState(data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching boutiques:", {
          message: err instanceof Error ? err.message : "Unknown error",
          error: err,
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      initBoutiques();
    }
  }, [user, authLoading, pathname, router, searchParams]); // Added missing dependencies to follow exhaustive-deps rule

  const setSelectedBoutique = (boutique: Boutique | null) => {
    setSelectedBoutiqueState(boutique);
    if (boutique) {
      localStorage.setItem("selectedBoutique", JSON.stringify(boutique));
    } else {
      localStorage.removeItem("selectedBoutique");
    }
  };

  return (
    <BoutiqueContext.Provider
      value={{ selectedBoutique, boutiques, setSelectedBoutique, isLoading }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
}

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (context === undefined) {
    throw new Error("useBoutique must be used within a BoutiqueProvider");
  }
  return context;
};
