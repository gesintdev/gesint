"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { InputPassword } from "@/shared/components/ui/input";
import { ExceptionCapture } from "@/shared/exceptions";

function PasswordSetupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [firstAccessCompleted, setFirstAccessCompleted] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        const fromQuery = searchParams.get("token")?.trim() ?? "";
        if (fromQuery) {
            setToken(fromQuery);
        }
    }, [searchParams]);

    useEffect(() => {
        const trimmed = token.trim();
        if (trimmed.length < 8) {
            setTokenValid(null);
            return;
        }
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            setValidating(true);
            try {
                const result = await publicAuthService.validatePasswordSetupToken(trimmed);
                if (cancelled) return;
                setTokenValid(result.valid);
                setFirstAccessCompleted(result.firstAccessCompleted);
            } catch {
                if (!cancelled) {
                    setTokenValid(false);
                }
            } finally {
                if (!cancelled) {
                    setValidating(false);
                }
            }
        }, 400);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [token]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const trimmedToken = token.trim();
        if (!trimmedToken) {
            toast.error("Informe o token de acesso.");
            return;
        }
        if (password.length < 8) {
            toast.error("A senha deve ter no mínimo 8 caracteres.");
            return;
        }
        if (password !== passwordConfirmation) {
            toast.error("A senha e a confirmação não conferem.");
            return;
        }
        setLoading(true);
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
    }

    const welcome = tokenValid === true && !firstAccessCompleted;

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
        >
            <div className="mb-4 text-left">
                <h1 className="text-lg font-semibold text-base-content">
                    {welcome ? "Bem-vindo ao Gommo" : "Definir senha"}
                </h1>
                <p className="mt-1 text-sm text-base-content/60">
                    {welcome
                        ? "Informe o token recebido e escolha sua senha para concluir o primeiro acesso."
                        : "Informe o token de acesso, a nova senha e a confirmação."}
                </p>
            </div>
            <Input
                label="Token de acesso"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
                placeholder="00000000"
            />
            {validating ? (
                <p className="text-left text-xs text-base-content/50">Validando token...</p>
            ) : null}
            {tokenValid === false ? (
                <p className="text-left text-xs text-error">Token inválido.</p>
            ) : null}
            <InputPassword
                label="Senha"
                autoComplete="new-password"
                value={password}
                onValueChange={setPassword}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
            />
            <InputPassword
                label="Confirmar senha"
                autoComplete="new-password"
                value={passwordConfirmation}
                onValueChange={setPasswordConfirmation}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
            />
            <Button type="submit" size="lg" className="gommo-btn--block login-submit mt-1" loading={loading}>
                Salvar senha
            </Button>
            <p className="mt-3 text-sm text-base-content/60">
                <Link href="/login" className="login-forgot">
                    Voltar ao login
                </Link>
            </p>
        </motion.form>
    );
}

export function PasswordSetupFormClient() {
    return (
        <Suspense fallback={<div className="login-form skeleton-shimmer h-64 w-full rounded-lg" />}>
            <PasswordSetupForm />
        </Suspense>
    );
}
