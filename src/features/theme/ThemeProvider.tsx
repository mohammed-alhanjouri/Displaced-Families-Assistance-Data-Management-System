import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type Theme } from "./themeStore";

const themeStorageKey = "awn-theme";

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark";

const getSystemTheme = (): Theme => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);

  return isTheme(savedTheme) ? savedTheme : getSystemTheme();
};

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  };

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === themeStorageKey && isTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
