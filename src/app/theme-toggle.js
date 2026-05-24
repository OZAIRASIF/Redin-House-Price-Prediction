"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    className="
      px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-800 shadow
      text-lg md:text-base
       top-3 left-1/2 transform -translate-x-[20%]
      z-50
    "
  >
    {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
