"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { InputCheckbox, InputPassword } from "@/shared/components/ui/input";
import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";
import { applyDocumentTheme, resolveThemePreference } from "@/shared/lib/theme-preference";

export function LoginForm() {
    const router = useRouter();
    const [tenantSlugHint, setTenantSlugHint] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTenantSlugHint(resolveTenantSlugFromHostname());
    }, []);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        const login = username.trim();
        const tenantSlug = resolveTenantSlugFromHostname();
        const result = await signIn("credentials", {
            username: login,
            password,
            tenantSlug: tenantSlug ?? "",
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            const code = result.code ?? result.error;
            if (code === "AUTH_NO_ACTIVE_SYSTEM") {
                toast.error(
                    "Não foi possível acessar o sistema. Entre em contato com seu departamento administrativo",
                );
            } else if (
                code === "AUTH_INVALID_CREDENTIALS" ||
                code === "credentials" ||
                code === "CredentialsSignin"
            ) {
                toast.error("Usuário ou senha inválidos");
            } else if (tenantSlug) {
                // Ambiente não READY, suspenso, etc. — não é erro de senha.
                toast.error(
                    "Não foi possível acessar o sistema. Entre em contato com seu departamento administrativo",
                );
            } else {
                toast.error("Usuário ou senha inválidos");
            }
            return;
        }
        toast.success("Bem-vindo ao Gommo");
        applyDocumentTheme(resolveThemePreference());
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
        >
            <Input
                label="Usuário ou e-mail"
                type="text"
                autoComplete="username"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
            />
            <InputPassword
                label="Senha"
                autoComplete="current-password"
                value={password}
                onValueChange={setPassword}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
            />
            <div className="login-form__meta">
                <InputCheckbox
                    checked={remember}
                    onCheckedChange={setRemember}
                    label="Lembrar de mim"
                    size="sm"
                    className="login-remember"
                />
                <Link href="/esqueci-senha" className="login-forgot">
                    Esqueceu sua senha?
                </Link>
            </div>
            <Button type="submit" size="lg" className="gommo-btn--block login-submit mt-1" loading={loading}>
                Entrar
            </Button>
            <p className="mt-3 text-sm text-base-content/60">
                <Link href="/definir-senha" className="login-forgot">
                    Definir senha / primeiro acesso
                </Link>
            </p>
            {process.env.NODE_ENV === "development" && (
                <p className="login-dev-hint">
                    {tenantSlugHint
                        ? `Tenant: ${tenantSlugHint} — use o usuário provisionado no Admin`
                        : "Platform: use as credenciais do .env (admin)"}
                </p>
            )}
        </motion.form>
    );
}
