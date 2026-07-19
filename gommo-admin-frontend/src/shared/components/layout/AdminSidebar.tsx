"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { useAdminPathname } from "@/shared/hooks/useAdminPathname";
import { ADMIN_MENUS } from "@/shared/routing/admin-nav";

export function AdminSidebar() {
    const pathname = useAdminPathname();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <aside
            style={{
                width: "var(--ga-sidebar-width)",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                background: "var(--ga-surface)",
                borderRight: "1px solid var(--ga-border)",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
            }}
        >
            <div
                style={{
                    height: "var(--ga-header-h)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 16px",
                    borderBottom: "1px solid var(--ga-border)",
                }}
            >
                <GommoLogo markSize={28} />
                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "var(--ga-text)",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Gommo
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ga-text-muted)", marginTop: -1 }}>Admin</div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
                {ADMIN_MENUS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.key}
                            href={item.listHref}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "var(--ga-radius-sm)",
                                marginBottom: 2,
                                textDecoration: "none",
                                fontSize: 13,
                                background: active
                                    ? isDark
                                        ? "rgba(0,123,255,0.15)"
                                        : "var(--ga-primary-50)"
                                    : "transparent",
                                color: active ? "var(--ga-primary)" : "var(--ga-text-muted)",
                                fontWeight: active ? 600 : 400,
                            }}
                        >
                            <Icon size={15} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: "10px 8px", borderTop: "1px solid var(--ga-border)" }}>
                <button
                    type="button"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "var(--ga-radius-sm)",
                        border: "none",
                        cursor: "pointer",
                        background: "transparent",
                        color: "var(--ga-text-muted)",
                        fontSize: 13,
                    }}
                >
                    <Settings size={15} />
                    Configurações
                </button>
            </div>
        </aside>
    );
}
