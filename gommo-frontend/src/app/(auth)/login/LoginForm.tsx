"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { FormInput } from "@/shared/components/ui/FormInput";
import { InputCheckbox, InputPassword } from "@/shared/components/ui/input/index";
import { buildTenantRequestHeaders, resolveTenantSlugFromHostname } from "@/shared/lib/tenant";
import { applyDocumentTheme, resolveThemePreference } from "@/shared/lib/theme-preference";

export function LoginForm() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [tenantSlugHint, setTenantSlugHint] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTenantSlugHint(resolveTenantSlugFromHostname());
    }, []);

    // Cookies Auth.js ficam em AUTH_URL (localhost). Sessão comercial (ex.: posto-sjb)
    // sobra ao abrir localhost — limpa só se o slug NÃO for o tenant sintético de dev.
    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }
        const hostSlug = resolveTenantSlugFromHostname();
        const sessionSlug = session?.tenantSlug?.trim() || null;
        const devPublicSlug = (process.env.NEXT_PUBLIC_DEV_TENANT_SLUG ?? "dev-public").trim();
        if (!hostSlug && sessionSlug && sessionSlug !== devPublicSlug) {
            void signOut({ redirect: false });
        }
    }, [session?.tenantSlug, status]);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        const login = username.trim();
        const tenantSlug = resolveTenantSlugFromHostname();
        try {
            // Browser → HR API (mesmo padrão do definir-senha). Evita fetch
            // server→api.gommo.local que falha no Coolify lab (DNS/TLS).
            // Fallback: proxy same-origin com API_INTERNAL_URL.
            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
            let loginResponse = apiBase
                ? await fetch(`${apiBase}/api/v1/auth/login`, {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          Accept: "application/json",
                          ...buildTenantRequestHeaders(tenantSlug),
                      },
                      body: JSON.stringify({ username: login, password }),
                  })
                : null;
            if (!loginResponse || loginResponse.status >= 500 || loginResponse.status === 0) {
                loginResponse = await fetch("/api/auth/client-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: login,
                        password,
                        tenantSlug: tenantSlug ?? "",
                    }),
                });
            }
            if (!loginResponse.ok) {
                let code = "AUTH_INVALID_CREDENTIALS";
                try {
                    const payload = (await loginResponse.json()) as { code?: string };
                    if (payload.code) {
                        code = payload.code;
                    }
                } catch {
                    // sem JSON
                }
                if (code === "AUTH_NO_ACTIVE_SYSTEM" || (loginResponse.status >= 500 && tenantSlug)) {
                    toast.error(
                        "Não foi possível acessar o sistema. Entre em contato com seu departamento administrativo",
                    );
                } else if (tenantSlug && code !== "AUTH_INVALID_CREDENTIALS") {
                    toast.error(
                        "Não foi possível acessar o sistema. Entre em contato com seu departamento administrativo",
                    );
                } else {
                    toast.error("Usuário ou senha inválidos");
                }
                return;
            }
            const tokens = (await loginResponse.json()) as {
                accessToken: string;
                refreshToken: string;
                expiresInSeconds: number;
                name?: string;
                username?: string;
                email?: string;
                collaboratorId?: string;
                photoObjectId?: string;
                jobPositionId?: string;
                jobPositionName?: string;
                departmentId?: string;
                departmentName?: string;
                permissions?: string[];
                platformAdmin?: boolean;
                tenantSlug?: string;
                tenantName?: string;
                contractedSystemKeys?: string[] | null;
                contractedSystemKeyOverrides?: Record<string, string[]> | null;
                branches?: { id: string; name: string; cnpj?: string | null; headquarters: boolean }[];
            };
            const result = await signIn("credentials", {
                username: tokens.username ?? login,
                password: "",
                tenantSlug: tokens.tenantSlug ?? tenantSlug ?? "",
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresInSeconds: String(tokens.expiresInSeconds),
                name: tokens.name ?? "",
                email: tokens.email ?? "",
                collaboratorId: tokens.collaboratorId ?? "",
                photoObjectId: tokens.photoObjectId ?? "",
                jobPositionId: tokens.jobPositionId ?? "",
                jobPositionName: tokens.jobPositionName ?? "",
                departmentId: tokens.departmentId ?? "",
                departmentName: tokens.departmentName ?? "",
                platformAdmin: String(tokens.platformAdmin ?? false),
                tenantName: tokens.tenantName ?? "",
                contractedSystemKeys: JSON.stringify(tokens.contractedSystemKeys ?? null),
                contractedSystemKeyOverrides: JSON.stringify(tokens.contractedSystemKeyOverrides ?? null),
                branches: JSON.stringify(tokens.branches ?? []),
                redirect: false,
            });
            if (result?.error) {
                toast.error("Usuário ou senha inválidos");
                return;
            }
            toast.success("Bem-vindo ao Gommo");
            applyDocumentTheme(resolveThemePreference());
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Usuário ou senha inválidos");
        } finally {
            setLoading(false);
        }
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
            <FormInput
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
