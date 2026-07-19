"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const GOMMO_THEME_PROPS = {
    attribute: "class" as const,
    defaultTheme: "light",
    themes: ["light", "dark"],
    enableSystem: false,
    disableTransitionOnChange: true,
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...GOMMO_THEME_PROPS} {...props}>
            {children}
        </NextThemesProvider>
    );
}
