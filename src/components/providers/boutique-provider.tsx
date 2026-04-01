"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function initBoutiques() {
      try {
        const { data, error } = await supabase
          .from("boutiques")
          .select("*")
          .order("name");

        if (error) throw error;
        setBoutiques(data || []);

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
          } catch (e) {
            if (data.length > 0) setSelectedBoutiqueState(data[0]);
          }
        } else if (data && data.length > 0) {
          setSelectedBoutiqueState(data[0]);
        }
      } catch (err) {
        console.error("Error fetching boutiques:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initBoutiques();
  }, []); // stable ref — runs once on mount

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
