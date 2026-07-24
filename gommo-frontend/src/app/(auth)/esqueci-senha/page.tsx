import { ForgotPasswordForm } from "@/app/(auth)/esqueci-senha/ForgotPasswordForm";
import { LoginShell } from "@/shared/components/auth/LoginShell";

export default function EsqueciSenhaPage() {
    return (
        <LoginShell welcomeTitle="Recuperar acesso" welcomeSubtitle="Redefina sua senha pelo e-mail">
            <ForgotPasswordForm />
        </LoginShell>
    );
}
