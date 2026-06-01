"use client";

import {ThemeProvider as NextThemesProvider} from "next-themes";
import type {ThemeProviderProps} from "next-themes";

const GOMMO_THEME_PROPS = {
    attribute: "data-theme" as const,
    defaultTheme: "gommo",
    themes: ["gommo", "dark"],
    enableSystem: false,
    disableTransitionOnChange: true,
};

/**
 * React 19 / Next 16: next-themes injeta <script> no tree — não executa no client.
 * Init do tema via ThemeInitScript (useServerInsertedHTML); aqui neutralizamos o script interno.
 */
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
