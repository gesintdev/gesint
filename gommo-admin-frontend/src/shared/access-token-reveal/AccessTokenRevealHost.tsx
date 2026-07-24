"use client";

import { Copy, KeyRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    useAccessTokenRevealStore,
} from "@/shared/access-token-reveal/access-token-reveal.store";
import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";

const CLOSE_AFTER_COPY_MS = 900;

export function AccessTokenRevealHost() {
    const current = useAccessTokenRevealStore((s) => s.current);
    const dismiss = useAccessTokenRevealStore((s) => s.dismiss);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        if (current) setCopying(false);
    }, [current]);

    if (!current) return null;

    const handleClose = () => {
        dismiss();
    };

    const handleCopy = async () => {
        if (copying) return;
        setCopying(true);
        try {
            await navigator.clipboard.writeText(current.token);
            toast.success("Token Copiado");
            window.setTimeout(() => {
                handleClose();
            }, CLOSE_AFTER_COPY_MS);
        } catch {
            setCopying(false);
            toast.error("Não foi possível copiar o token.");
        }
    };

    const title = current.context === "create" ? "Usuário cadastrado" : "Novo token gerado";

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55"
            onClick={(e) => {
                if (e.target === e.currentTarget && !copying) handleClose();
            }}
        >
            <div
                style={{
                    width: "90vw",
                    maxWidth: 440,
                    background: "var(--ga-surface)",
                    border: "1px solid var(--ga-border)",
                    borderRadius: "var(--ga-radius)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        padding: "16px 16px 12px",
                        background: "#eff6ff",
                        position: "relative",
                    }}
                >
                    <span style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }}>
                        <KeyRound size={20} strokeWidth={2} />
                    </span>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 28 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ga-text)" }}>{title}</div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ga-text-muted)" }}>
                            Copie o token e compartilhe com o usuário. Ele não será exibido novamente. Se
                            perder, use Gerar novo token.
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        disabled={copying}
                        onClick={() => handleClose()}
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            border: "none",
                            background: "transparent",
                            cursor: copying ? "not-allowed" : "pointer",
                            color: "var(--ga-text-muted)",
                            padding: 4,
                            opacity: copying ? 0.5 : 1,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--ga-text)" }}>
                        Token de acesso
                    </div>
                    <code
                        style={{
                            display: "block",
                            wordBreak: "break-all",
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: 18,
                            letterSpacing: "0.12em",
                            padding: "10px 12px",
                            borderRadius: "var(--ga-radius-sm)",
                            border: "1px solid var(--ga-border)",
                            background: "var(--ga-page, #f8fafc)",
                            color: "var(--ga-text)",
                        }}
                    >
                        {current.token}
                    </code>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        padding: "0 16px 16px",
                    }}
                >
                    <AdminBtn variant="ghost" onClick={() => handleClose()} disabled={copying}>
                        Fechar
                    </AdminBtn>
                    <AdminBtn
                        variant="primary"
                        icon={<Copy size={12} />}
                        onClick={() => void handleCopy()}
                        disabled={copying}
                    >
                        {copying ? "Copiando..." : "Copiar token"}
                    </AdminBtn>
                </div>
            </div>
        </div>
    );
}
