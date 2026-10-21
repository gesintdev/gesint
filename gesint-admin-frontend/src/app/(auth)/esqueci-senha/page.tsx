"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { publicAuthService } from "@/modules/root/services/public-auth.service";
import { AdminAuthLayout } from "@/shared/components/auth/AdminAuthLayout";
import { AdminInput } from "@/shared/components/ui/admin/AdminField";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

export default function EsqueciSenhaPage() {
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
        <AdminAuthLayout
            title="Esqueci minha senha"
            subtitle="Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha."
        >
            <form className="ga-auth-form" onSubmit={(e) => void handleSubmit(e)}>
                {submitted ? (
                    <div className="ga-auth-muted">
                        Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.
                    </div>
                ) : (
                    <AdminInput label="E-mail" value={email} onChange={setEmail} type="email" required />
                )}

                {!submitted ? (
                    <button type="submit" className="ga-auth-submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar instruções"}
                    </button>
                ) : null}

                <div className="ga-auth-links ga-auth-links--center">
                    <Link href="/login">Voltar ao login</Link>
                    <Link href="/definir-senha">Já tenho um token</Link>
                </div>
            </form>
        </AdminAuthLayout>
    );
}
