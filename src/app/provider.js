"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"  // can also be "system"
      enableSystem={true}
    >
      {children}
    </ThemeProvider>
  );
}
