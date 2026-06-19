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
    fetch(
      `https://api.aladhan.com/v1/gToH/${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.hijri) {
          const h = data.data.hijri;
          setHijri(`${h.day} ${h.month.en} ${h.year} AH`);
        }
      })
      .catch(() => {});
  }, []);

  return { hijri, gregorian };
}
