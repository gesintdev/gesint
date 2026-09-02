"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { AdminAuthLayout } from "@/shared/components/auth/AdminAuthLayout";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { InputPassword } from "@/shared/components/ui/input/index";

type AdminLoginTokenResponse = {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
    username?: string;
    email?: string;
};

export function LoginPage() {
    const router = useRouter();
    const { status } = useSession();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/clients/list");
        }
    }, [status, router]);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Preencha usuário e senha.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const loginResponse = await fetch("/api/auth/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim(), password }),
            });
            if (!loginResponse.ok) {
                setError("Usuário ou senha inválidos.");
                return;
            }
            const tokens = (await loginResponse.json()) as AdminLoginTokenResponse;
            const result = await signIn("credentials", {
                username: tokens.username ?? username.trim(),
                email: tokens.email ?? "",
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresInSeconds: String(tokens.expiresInSeconds),
                redirect: false,
            });
            if (result?.error) {
                setError("Usuário ou senha inválidos.");
                return;
            }
            router.replace("/clients/list");
            router.refresh();
        } catch {
            setError("Usuário ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminAuthLayout
            title="Entrar na plataforma"
            subtitle="Acesso restrito a usuários autorizados"
        >
            <AdminInput
                label="Usuário ou e-mail"
                value={username}
                onChange={setUsername}
                placeholder="usuario@empresa.com.br"
            />
            <InputPassword
                label="Senha"
                value={password}
                onValueChange={setPassword}
                autoComplete="current-password"
                placeholder="••••••••"
                required
            />

            {error ? <div className="ga-callout-error">{error}</div> : null}

            <div className="ga-auth-links">
                <Link href="/esqueci-senha">Esqueceu sua senha?</Link>
                <Link href="/definir-senha">Definir senha</Link>
            </div>

            <button
                type="button"
                className="ga-auth-submit"
                onClick={() => void handleLogin()}
                disabled={loading || status === "loading"}
            >
                {loading ? "Autenticando..." : "Entrar"}
            </button>
        </AdminAuthLayout>
    );
}
