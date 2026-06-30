// ThemeContext — manages the app-wide light/dark mode.
// Components call useTheme() to read isDark and toggle the theme.

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read the saved preference on first render so the theme doesn't flash.
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    // Tailwind's dark mode relies on the "dark" class being present on <html>.
    document.documentElement.classList.toggle("dark", isDark);
    // Persist so the user's choice survives a page refresh.
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((p) => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
