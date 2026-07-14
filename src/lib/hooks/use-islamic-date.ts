"use client";
import { useState, useEffect } from "react";

export function useIslamicDate() {
  const [hijri, setHijri] = useState<string>("");
  const [gregorian, setGregorian] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setGregorian(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    let cancelled = false;
    const controller = new AbortController();

    fetch(
      `https://api.aladhan.com/v1/gToH/${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.data?.hijri) {
          const h = data.data.hijri;
          setHijri(`${h.day} ${h.month.en} ${h.year} AH`);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { hijri, gregorian };
}
