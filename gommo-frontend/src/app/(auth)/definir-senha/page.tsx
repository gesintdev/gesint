import { PasswordSetupFormClient } from "@/app/(auth)/definir-senha/PasswordSetupForm";
import { LoginShell } from "@/shared/components/auth/LoginShell";

export default function DefinirSenhaPage() {
    return (
        <LoginShell welcomeTitle="Definir senha" welcomeSubtitle="Conclua o acesso com seu token">
            <PasswordSetupFormClient />
        </LoginShell>
    );
}
