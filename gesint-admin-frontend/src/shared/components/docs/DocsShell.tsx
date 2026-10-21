"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { DocsSidebar } from "@/shared/components/docs/DocsSidebar";

export function DocsShell({ children }: { children: ReactNode }) {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <div className="docs-shell">
            <DocsSidebar />
            <div className="docs-shell__body">
                <header className="docs-topbar">
                    <div className="docs-topbar__title">Documentação interna</div>
                    <button
                        type="button"
                        className="docs-topbar__theme"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        title={isDark ? "Modo claro" : "Modo escuro"}
                    >
                        {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                </header>
                <div className="docs-shell__content">{children}</div>
            </div>
        </div>
    );
}
