import type {Metadata} from "next";
import Link from "next/link";

import {Enter} from "@/components/motion";
import {PageHeading} from "@/components/pages/PageHeading";
import {ForgotPasswordForm} from "@/components/pages/LoginForm";
import {links} from "@/lib/links";

export const metadata: Metadata = {title: "Recuperar senha — Gesint", robots: {index: false}};

export default function ForgotPasswordPage() {
    return (
        <>
            <PageHeading
                eyebrow="RECUPERAR ACESSO"
                lines={["Esqueceu", "a senha?"]}
                description="Informe o seu e-mail e enviaremos um link para criar uma nova senha."
            />
            <Enter delay={0.35} className="mt-8 md:mt-10">
                <ForgotPasswordForm/>
            </Enter>
            <Enter delay={0.45} className="mt-8">
                <Link href={links.login} className="text-[14px] text-muted transition-colors hover:text-ink">
                    ← Voltar para o login
                </Link>
            </Enter>
        </>
    );
}
