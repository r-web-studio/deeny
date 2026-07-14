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

    let cancelled = false;
    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          if (!cancelled) {
            setLocation({
              latitude,
              longitude,
              city: data.address?.city || data.address?.town || data.address?.state || "Unknown",
            });
            setLoading(false);
          }
        } catch {
          if (!cancelled) {
            setLocation({ latitude, longitude, city: "Unknown" });
            setLoading(false);
          }
        }
      },
      () => {
        if (!cancelled) {
          setError("Location access denied");
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { location, loading, error };
}
