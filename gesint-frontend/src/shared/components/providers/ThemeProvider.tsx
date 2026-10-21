"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

import { isPublicPontoPath } from "@/shared/auth/public-app-path";

const GESINT_THEME_PROPS = {
    attribute: "data-theme" as const,
    defaultTheme: "gesint",
    themes: ["gesint", "dark"],
    enableSystem: true,
    disableTransitionOnChange: true,
    storageKey: "theme",
};

/**
 * React 19 / Next 16: next-themes injeta script no tree — não executa no client.
 * Init do tema via ThemeInitScript (useServerInsertedHTML no head); aqui neutralizamos o script interno.
 * `/ponto` força light (`gesint`) e ignora preferência/sistema.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const pathname = usePathname();
    const forcePontoLight = isPublicPontoPath(pathname);

    return (
        <NextThemesProvider
            {...GESINT_THEME_PROPS}
            {...props}
            forcedTheme={forcePontoLight ? "gesint" : props.forcedTheme}
            enableSystem={forcePontoLight ? false : (props.enableSystem ?? GESINT_THEME_PROPS.enableSystem)}
            scriptProps={{
                type: "application/json",
                "data-gesint-theme-init": "disabled",
            }}
        >
            {children}
        </NextThemesProvider>
    );
}
