"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { AdminBreadcrumb } from "@/shared/components/layout/AdminBreadcrumb";
import { signOutToLogin } from "@/shared/lib/sign-out.client";

export function AdminHeader() {
    const { resolvedTheme, setTheme } = useTheme();
    const { data } = useSession();
    const isDark = resolvedTheme === "dark";
    const displayName = data?.user?.name || data?.user?.email || "Administrador";
    const initials = displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <header
            style={{
                height: "var(--ga-header-h)",
                position: "fixed",
                top: 0,
                left: "var(--ga-sidebar-width)",
                right: 0,
                background: "var(--ga-surface)",
                borderBottom: "1px solid var(--ga-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                gap: 16,
                zIndex: 90,
            }}
        >
            <AdminBreadcrumb />

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <button
                    type="button"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    title={isDark ? "Modo Claro" : "Modo Escuro"}
                    style={{
                        background: "var(--ga-surface-2)",
                        border: "1px solid var(--ga-border)",
                        borderRadius: "var(--ga-radius-sm)",
                        padding: "5px 7px",
                        cursor: "pointer",
                        color: "var(--ga-text-muted)",
                        display: "flex",
                    }}
                >
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                <div style={{ width: 1, height: 22, background: "var(--ga-border)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--ga-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials || "AD"}</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ga-text)", lineHeight: 1.2 }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ga-text-muted)" }}>Administrador</div>
                    </div>
                </div>

                <div style={{ width: 1, height: 22, background: "var(--ga-border)" }} />

                <button
                    type="button"
                    onClick={() => void signOutToLogin()}
                    title="Sair"
                    style={{
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: "var(--ga-radius-sm)",
                        padding: "5px 7px",
                        cursor: "pointer",
                        color: "var(--ga-text-muted)",
                        display: "flex",
                    }}
                >
                    <LogOut size={14} />
                </button>
            </div>
        </header>
    );
}
