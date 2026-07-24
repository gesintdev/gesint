"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ExceptionCapture } from "@/shared/exceptions";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: FormEvent) {
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
            <div className="mb-4 text-left">
                <h1 className="text-lg font-semibold text-base-content">Esqueci minha senha</h1>
                <p className="mt-1 text-sm text-base-content/60">
                    Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.
                </p>
            </div>
            {submitted ? (
                <p className="mb-4 text-left text-sm text-base-content/70">
                    Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.
                </p>
            ) : (
                <Input
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="gommo-field--login"
                    wrapperClassName="login-field"
                />
            )}
            {!submitted ? (
                <Button type="submit" size="lg" className="gommo-btn--block login-submit mt-1" loading={loading}>
                    Enviar instruções
                </Button>
            ) : null}
            <p className="mt-3 text-sm text-base-content/60">
                <Link href="/login" className="login-forgot">
                    Voltar ao login
                </Link>
                {" · "}
                <Link href="/definir-senha" className="login-forgot">
                    Já tenho um token
                </Link>
            </p>
        </motion.form>
    );
}
