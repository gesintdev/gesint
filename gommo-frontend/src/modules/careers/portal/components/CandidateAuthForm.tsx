"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { GoogleSignInButton } from "@/modules/careers/portal/components/GoogleSignInButton";
import {
    candidatePortalKeys,
    candidatePortalService,
} from "@/modules/careers/portal/services/candidate-portal.service";
import { Button } from "@/shared/components/ui/Button";
import { InputPassword, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

export function CandidateAuthForm({ mode }: { mode: "login" | "register" }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/careers/portal";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const providersQuery = useQuery({
        queryKey: candidatePortalKeys.providers,
        queryFn: () => candidatePortalService.getProviders(),
        staleTime: 60_000,
    });

    const finish = useCallback(() => {
        router.replace(nextPath.startsWith("/") ? nextPath : "/careers/portal");
    }, [nextPath, router]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (mode === "register") {
                if (!fullName.trim()) {
                    setError("Informe o nome completo.");
                    return;
                }
                if (password.length < 8) {
                    setError("A senha precisa ter pelo menos 8 caracteres.");
                    return;
                }
                await candidatePortalService.register({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    password,
                    phone: phone.trim() || undefined,
                });
            } else {
                await candidatePortalService.login({ email: email.trim(), password });
            }
            finish();
        } catch (err) {
            setError(
                ExceptionCapture.displayMessage(
                    err,
                    mode === "register" ? "Nao foi possivel criar a conta." : "E-mail ou senha invalidos.",
                ),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = useCallback(
        async (idToken: string) => {
            setError(null);
            setSubmitting(true);
            try {
                await candidatePortalService.loginWithGoogle(idToken);
                finish();
            } catch (err) {
                setError(ExceptionCapture.displayMessage(err, "Falha no login com Google."));
            } finally {
                setSubmitting(false);
            }
        },
        [finish],
    );

    const googleEnabled = Boolean(providersQuery.data?.google && providersQuery.data.googleClientId);
    const alternateHref =
        mode === "login"
            ? `/careers/portal/register?next=${encodeURIComponent(nextPath)}`
            : `/careers/portal/login?next=${encodeURIComponent(nextPath)}`;

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            {mode === "register" ? (
                <>
                    <InputString
                        label="Nome completo"
                        required
                        value={fullName}
                        onValueChange={setFullName}
                        autoComplete="name"
                    />
                    <InputPhone label="Telefone / WhatsApp" value={phone} onValueChange={setPhone} />
                </>
            ) : null}
            <InputString
                label="E-mail"
                required
                type="email"
                value={email}
                onValueChange={setEmail}
                autoComplete="email"
            />
            <InputPassword
                label="Senha"
                required
                value={password}
                onValueChange={setPassword}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>

            <div className="relative my-1 text-center text-xs text-base-content/45">
                <span className="bg-base-100 px-2 relative z-10">ou</span>
                <div className="absolute inset-x-0 top-1/2 border-t border-base-content/10" />
            </div>

            <GoogleSignInButton
                enabled={googleEnabled}
                clientId={providersQuery.data?.googleClientId ?? ""}
                onCredential={(token) => void handleGoogle(token)}
                onError={setError}
            />

            <p className="text-center text-sm text-base-content/60">
                {mode === "login" ? "Nao tem conta?" : "Ja tem conta?"}{" "}
                <Link href={alternateHref} className="font-semibold text-primary">
                    {mode === "login" ? "Criar conta" : "Entrar"}
                </Link>
            </p>
        </form>
    );
}
