"use client";

import type {ThemeProviderProps} from "next-themes";
import {ThemeProvider as NextThemesProvider} from "next-themes";

const GOMMO_THEME_PROPS = {
    attribute: "data-theme" as const,
    defaultTheme: "gommo",
    themes: ["gommo", "dark"],
    enableSystem: false,
    disableTransitionOnChange: true,
};

export function ThemeProvider({children, ...props}: ThemeProviderProps) {
    return (
        <NextThemesProvider
            {...GOMMO_THEME_PROPS}
            {...props}
            scriptProps={{
                type: "application/json",
                "data-gommo-theme-init": "disabled",
            }}
        >
            {children}
        </NextThemesProvider>
    );
}
