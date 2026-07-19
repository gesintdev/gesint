"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";

export function LoginPage() {
    const router = useRouter();
    const { status } = useSession();
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/clients/listagem");
        }
    }, [status, router]);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Preencha usuário e senha.");
            return;
        }
        setLoading(true);
        setError("");
        const result = await signIn("credentials", {
            username: username.trim(),
            password,
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            setError("Usuário ou senha inválidos.");
            return;
        }
        router.replace("/clients/listagem");
        router.refresh();
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark
                    ? "linear-gradient(135deg, #0a1b2e 0%, #0d1117 60%, #0f1923 100%)"
                    : "linear-gradient(135deg, #e6f4ff 0%, #f0f4f8 60%, #edf2fb 100%)",
            }}
        >
            <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                style={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    background: "var(--ga-surface)",
                    border: "1px solid var(--ga-border)",
                    borderRadius: "var(--ga-radius-sm)",
                    padding: "6px 8px",
                    cursor: "pointer",
                    color: "var(--ga-text-muted)",
                }}
            >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div
                style={{
                    width: 360,
                    background: "var(--ga-surface)",
                    border: "1px solid var(--ga-border)",
                    borderRadius: "var(--ga-radius)",
                    boxShadow: "var(--ga-shadow)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        padding: "20px 28px 18px",
                        borderBottom: "1px solid var(--ga-border)",
                        background: isDark ? "rgba(0,123,255,0.06)" : "var(--ga-primary-50)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <GommoLogo markSize={32} />
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: "var(--ga-text)",
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Gommo Admin
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ga-text-muted)" }}>
                                Sistema Administrativo
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        padding: "24px 28px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ga-text)", marginBottom: 2 }}>
                            Entrar na plataforma
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ga-text-muted)" }}>
                            Acesso restrito a usuários autorizados
                        </div>
                    </div>

                    <AdminInput
                        label="Usuário ou e-mail"
                        value={username}
                        onChange={setUsername}
                        placeholder="usuario@empresa.com.br"
                    />
                    <AdminInput
                        label="Senha"
                        value={password}
                        onChange={setPassword}
                        type="password"
                        placeholder="••••••••"
                    />

                    {error ? (
                        <div
                            style={{
                                fontSize: 12,
                                color: "#dc2626",
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "var(--ga-radius-sm)",
                                padding: "8px 10px",
                            }}
                        >
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => void handleLogin()}
                        disabled={loading || status === "loading"}
                        style={{
                            padding: "9px 0",
                            background: "var(--ga-primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--ga-radius-sm)",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            marginTop: 4,
                        }}
                    >
                        {loading ? "Autenticando..." : "Entrar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
