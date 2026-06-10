import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { LoginShell } from "@/shared/components/auth/LoginShell";

export default function LoginPage() {
    return (
        <LoginShell>
            <LoginForm />
        </LoginShell>
    );
}
