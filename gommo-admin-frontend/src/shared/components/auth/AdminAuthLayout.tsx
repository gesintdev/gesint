"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { GommoLogo } from "@/shared/components/layout/GommoLogo";

function AdminAuthThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            className="ga-auth-theme-toggle"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
        >
            <Sun size={15} className="ga-auth-theme-toggle__sun" aria-hidden />
            <Moon size={15} className="ga-auth-theme-toggle__moon" aria-hidden />
        </button>
    );
}

export function AdminAuthLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <div className="ga-auth-page">
            <AdminAuthThemeToggle />

            <div className="ga-auth-card">
                <div className="ga-auth-card__header">
                    <div className="ga-auth-card__brand-row">
                        <GommoLogo markSize={32} />
                        <div>
                            <div className="ga-auth-card__brand-title">Gesint Admin</div>
                            <div className="ga-auth-card__brand-subtitle">Sistema Administrativo</div>
                        </div>
                    </div>
                </div>

                <div className="ga-auth-card__body">
                    <div>
                        <div className="ga-auth-card__heading">{title}</div>
                        <div className="ga-auth-card__subheading">{subtitle}</div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
