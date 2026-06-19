"use client";

import { useEffect } from "react";
import { initTheme } from "@/lib/stores/theme-store";
import { initColors } from "@/lib/stores/color-store";
import { initUser } from "@/lib/stores/user-store";
import { initFonts } from "@/lib/stores/font-store";

export function ThemeInit() {
  useEffect(() => {
    initTheme();
    initColors();
    initFonts();
    initUser();
  }, []);

  return null;
}
