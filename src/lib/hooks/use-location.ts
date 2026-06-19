"use client";
import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation({
            latitude,
            longitude,
            city: data.address?.city || data.address?.town || data.address?.state || "Unknown",
          });
        } catch {
          setLocation({ latitude, longitude, city: "Unknown" });
        }
        setLoading(false);
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  return { location, loading, error };
}
