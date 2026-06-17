"use client";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

export function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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
            toast.error("Usuário ou senha inválidos");
            return;
        }
        toast.success("Bem-vindo ao Gommo");
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
            <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="gommo-field--login"
                wrapperClassName="login-field"
                rightSlot={
                    <button
                        type="button"
                        className="login-password-toggle"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShowPassword((v) => !v)}
                    >
                        {showPassword ? (
                            <EyeOff className="size-4" strokeWidth={2} />
                        ) : (
                            <Eye className="size-4" strokeWidth={2} />
                        )}
                    </button>
                }
            />
            <div className="login-form__meta">
                <label className="login-remember">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="login-remember__input"
                    />
                    <span>Lembrar de mim</span>
                </label>
                <Link href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                    Esqueceu sua senha?
                </Link>
            </div>
            <Button type="submit" size="lg" className="gommo-btn--block login-submit mt-1" loading={loading}>
                Entrar
            </Button>
            {process.env.NODE_ENV === "development" && (
                <p className="login-dev-hint">Desenvolvimento: credenciais do seu arquivo .env</p>
            )}
        </motion.form>
    );
}
