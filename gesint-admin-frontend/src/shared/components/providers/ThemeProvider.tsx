"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const GESINT_THEME_PROPS = {
    attribute: "class" as const,
    defaultTheme: "light",
    themes: ["light", "dark"],
    enableSystem: false,
    disableTransitionOnChange: true,
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...GESINT_THEME_PROPS} {...props}>
            {children}
        </NextThemesProvider>
    );
}
