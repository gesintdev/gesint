"use client";

import { Bot, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { useAdminPathname } from "@/shared/hooks/useAdminPathname";
import {
    ADMIN_MENUS,
    assistantErrorsPath,
    emailSettingsPath,
    SETTINGS_BASE_PATH,
} from "@/shared/routing/admin-nav";

export function AdminSidebar() {
    const pathname = useAdminPathname();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const settingsActive = pathname === SETTINGS_BASE_PATH || pathname.startsWith(`${SETTINGS_BASE_PATH}/`);

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
                        Gesint
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 10px",
                        marginBottom: 2,
                        fontSize: 11,
                        fontWeight: 600,
                        color: settingsActive ? "var(--ga-primary)" : "var(--ga-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                    }}
                >
                    <Settings size={13} />
                    Configurações
                </div>
                <Link
                    href={emailSettingsPath()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "var(--ga-radius-sm)",
                        textDecoration: "none",
                        marginBottom: 2,
                        background:
                            pathname === emailSettingsPath() || pathname.startsWith(`${emailSettingsPath()}/`)
                                ? isDark
                                    ? "rgba(0,123,255,0.15)"
                                    : "var(--ga-primary-50)"
                                : "transparent",
                        color:
                            pathname === emailSettingsPath() || pathname.startsWith(`${emailSettingsPath()}/`)
                                ? "var(--ga-primary)"
                                : "var(--ga-text-muted)",
                        fontWeight:
                            pathname === emailSettingsPath() || pathname.startsWith(`${emailSettingsPath()}/`)
                                ? 600
                                : 400,
                        fontSize: 13,
                    }}
                >
                    <Mail size={15} />
                    E-mail (SMTP)
                </Link>
                <Link
                    href={assistantErrorsPath()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "var(--ga-radius-sm)",
                        textDecoration: "none",
                        background:
                            pathname === assistantErrorsPath()
                                || pathname.startsWith(`${assistantErrorsPath()}/`)
                                ? isDark
                                    ? "rgba(0,123,255,0.15)"
                                    : "var(--ga-primary-50)"
                                : "transparent",
                        color:
                            pathname === assistantErrorsPath()
                                || pathname.startsWith(`${assistantErrorsPath()}/`)
                                ? "var(--ga-primary)"
                                : "var(--ga-text-muted)",
                        fontWeight:
                            pathname === assistantErrorsPath()
                                || pathname.startsWith(`${assistantErrorsPath()}/`)
                                ? 600
                                : 400,
                        fontSize: 13,
                    }}
                >
                    <Bot size={15} />
                    Logs do Assistente
                </Link>
            </div>
        </aside>
    );
}
