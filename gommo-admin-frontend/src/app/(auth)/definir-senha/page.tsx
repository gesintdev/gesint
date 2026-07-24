"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { type FormEvent, type ReactNode, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { InputPassword } from "@/shared/components/ui/input";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

function AuthCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

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
                            {title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ga-text-muted)" }}>{subtitle}</div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

function PasswordSetupFormInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [firstAccessCompleted, setFirstAccessCompleted] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fromQuery = searchParams.get("token")?.trim() ?? "";
        if (fromQuery) setToken(fromQuery);
    }, [searchParams]);

    useEffect(() => {
        const trimmed = token.trim();
        if (trimmed.length < 8) {
            setTokenValid(null);
            return;
        }
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                const result = await publicAuthService.validatePasswordSetupToken(trimmed);
                if (cancelled) return;
                setTokenValid(result.valid);
                setFirstAccessCompleted(result.firstAccessCompleted);
            } catch {
                if (!cancelled) setTokenValid(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedToken = token.trim();
        if (!trimmedToken) {
            setError("Informe o token de acesso.");
            return;
        }
        if (password.length < 8) {
            setError("A senha deve ter no mínimo 8 caracteres.");
            return;
        }
        if (password !== passwordConfirmation) {
            setError("A senha e a confirmação não conferem.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await publicAuthService.setupPassword({
                token: trimmedToken,
                password,
                passwordConfirmation,
            });
            toast.success("Senha definida com sucesso. Faça login para continuar.");
            router.push("/login");
        } catch (err) {
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível definir a senha." });
        } finally {
            setLoading(false);
        }
    };

    const welcome = tokenValid === true && !firstAccessCompleted;

    return (
        <AuthCard
            title={welcome ? "Bem-vindo ao Gommo Admin" : "Definir senha"}
            subtitle={
                welcome
                    ? "Informe o token recebido e escolha sua senha para concluir o primeiro acesso."
                    : "Informe o token de acesso, a nova senha e a confirmação."
            }
        >
            <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <AdminInput
                    label="Token de acesso"
                    value={token}
                    onChange={(v) => setToken(v.replace(/\D/g, "").slice(0, 8))}
                    required
                    placeholder="00000000"
                />
                {tokenValid === false ? (
                    <div style={{ fontSize: 12, color: "#dc2626" }}>Token inválido.</div>
                ) : null}
                <InputPassword
                    label="Senha"
                    value={password}
                    onValueChange={setPassword}
                    autoComplete="new-password"
                    required
                />
                <InputPassword
                    label="Confirmar senha"
                    value={passwordConfirmation}
                    onValueChange={setPasswordConfirmation}
                    autoComplete="new-password"
                    required
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
                    type="submit"
                    disabled={loading}
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
                    {loading ? "Salvando..." : "Salvar senha"}
                </button>
                <Link href="/login" style={{ fontSize: 12, color: "var(--ga-primary)", textAlign: "center" }}>
                    Voltar ao login
                </Link>
            </form>
        </AuthCard>
    );
}

export default function DefinirSenhaPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
            <PasswordSetupFormInner />
        </Suspense>
    );
}
