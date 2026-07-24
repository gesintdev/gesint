"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

export default function EsqueciSenhaPage() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed) {
            toast.error("Informe o e-mail.");
            return;
        }
        setLoading(true);
        try {
            await publicAuthService.forgotPassword(trimmed);
            setSubmitted(true);
            toast.success("Se o e-mail existir, enviaremos instruções para redefinir a senha.");
        } catch (err) {
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível solicitar a redefinição de senha.",
            });
        } finally {
            setLoading(false);
        }
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

                <form
                    onSubmit={(e) => void handleSubmit(e)}
                    style={{
                        padding: "24px 28px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ga-text)", marginBottom: 2 }}>
                            Esqueci minha senha
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ga-text-muted)" }}>
                            Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.
                        </div>
                    </div>

                    {submitted ? (
                        <div style={{ fontSize: 12, color: "var(--ga-text-muted)" }}>
                            Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.
                        </div>
                    ) : (
                        <AdminInput label="E-mail" value={email} onChange={setEmail} type="email" required />
                    )}

                    {!submitted ? (
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
                            {loading ? "Enviando..." : "Enviar instruções"}
                        </button>
                    ) : null}

                    <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 12 }}>
                        <Link href="/login" style={{ color: "var(--ga-primary)" }}>
                            Voltar ao login
                        </Link>
                        <Link href="/definir-senha" style={{ color: "var(--ga-primary)" }}>
                            Já tenho um token
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
