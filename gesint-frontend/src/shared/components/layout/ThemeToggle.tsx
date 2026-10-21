"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="gesint-btn gesint-btn--ghost gesint-btn--icon-only opacity-60" />;
    }

    const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

    return (
        <button
            type="button"
            aria-label="Alternar tema"
            onClick={() => setTheme(isDark ? "gesint" : "dark")}
            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/55"
        >
            {isDark ? <Sun className="size-4" strokeWidth={2} /> : <Moon className="size-4" strokeWidth={2} />}
        </button>
    );
}
