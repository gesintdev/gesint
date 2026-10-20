import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { LoginHeading } from "@/shared/components/auth/LoginShell";

export default function LoginPage() {
    return (
        <>
            <LoginHeading
                title="Bem-vindo de volta"
                subtitle="Entre com seu usuário ou e-mail para acessar o sistema."
            />
            <LoginForm />
        </>
    );
}
