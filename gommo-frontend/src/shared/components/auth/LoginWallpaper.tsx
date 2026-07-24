"use client";

import clsx from "clsx";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Aguarda o next-themes reabilitar transitions (`disableTransitionOnChange`). */
const THEME_TRANSITION_RESUME_MS = 40;

export function LoginWallpaper() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const active = theme === "system" ? resolvedTheme : theme;
        const nextDark = active === "dark";
        const handle = window.setTimeout(() => setIsDark(nextDark), THEME_TRANSITION_RESUME_MS);
        return () => window.clearTimeout(handle);
    }, [mounted, resolvedTheme, theme]);

    return (
        <>
            <img
                src="/brand/gommo-login-bg-light.png"
                alt=""
                className={clsx(
                    "login-page__visual-img login-page__visual-img--light",
                    !isDark && "login-page__visual-img--visible",
                )}
                fetchPriority="high"
                decoding="async"
            />
            <img
                src="/brand/gommo-login-bg-dark.png"
                alt=""
                className={clsx(
                    "login-page__visual-img login-page__visual-img--dark",
                    isDark && "login-page__visual-img--visible",
                )}
                decoding="async"
            />
        </>
    );
}
