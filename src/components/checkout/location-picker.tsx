"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Map as MapIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(initialLat);
  const [longitude, setLongitude] = useState<number | undefined>(initialLng);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        onLocationSelect(lat, lng);
        
        // Reverse geocoding (convert coords to address)
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            const shortAddress = data.display_name.split(",").slice(0, 3).join(",");
            onLocationSelect(lat, lng, shortAddress);
            toast.success("Adresse détectée : " + shortAddress);
          } else {
            onLocationSelect(lat, lng);
          }
        } catch (e) {
          console.error("Reverse geocoding error:", e);
          onLocationSelect(lat, lng);
        }

        setIsGettingLocation(false);
        toast.success("Localisation récupérée avec succès !");
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Veuillez autoriser l'accès à votre localisation pour cette fonctionnalité.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Les informations de localisation sont indisponibles.");
            break;
          case error.TIMEOUT:
            toast.error("La demande de localisation a expiré.");
            break;
          default:
            toast.error("Une erreur inconnue est survenue.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all gap-2 font-bold"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
          {isGettingLocation ? "Récupération..." : "Ma position actuelle"}
        </Button>
        
        {/* Placeholder for Google Maps Picker */}
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all gap-2 font-bold"
          onClick={() => toast.info("Cette fonctionnalité nécessite une clé API Google Maps.")}
        >
          <MapIcon className="h-5 w-5" />
          Choisir sur la carte
        </Button>
      </div>

      {latitude && longitude && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-primary">Coordonnées enregistrées</p>
            <p className="text-muted-foreground font-mono text-[10px]">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
