"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { AdminAuthLayout } from "@/shared/components/auth/AdminAuthLayout";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { InputPassword } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

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
        <AdminAuthLayout
            title={welcome ? "Bem-vindo ao Gesint Admin" : "Definir senha"}
            subtitle={
                welcome
                    ? "Informe o token recebido e escolha sua senha para concluir o primeiro acesso."
                    : "Informe o token de acesso, a nova senha e a confirmação."
            }
        >
            <form className="ga-auth-form" onSubmit={(e) => void handleSubmit(e)}>
                <AdminInput
                    label="Token de acesso"
                    value={token}
                    onChange={(v) => setToken(v.replace(/\D/g, "").slice(0, 8))}
                    required
                    placeholder="00000000"
                />
                {tokenValid === false ? <div className="ga-auth-error-inline">Token inválido.</div> : null}
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
                {error ? <div className="ga-callout-error">{error}</div> : null}
                <button type="submit" className="ga-auth-submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar senha"}
                </button>
                <Link href="/login" style={{ fontSize: 12, color: "var(--ga-primary)", textAlign: "center" }}>
                    Voltar ao login
                </Link>
            </form>
        </AdminAuthLayout>
    );
}

export default function DefinirSenhaPage() {
    return (
        <Suspense fallback={<div className="ga-auth-page" />}>
            <PasswordSetupFormInner />
        </Suspense>
    );
}
