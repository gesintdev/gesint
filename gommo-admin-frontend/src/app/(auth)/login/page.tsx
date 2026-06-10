import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";

export default function LoginPage() {
    return (
        <div
            className="relative flex min-h-screen items-center justify-center px-4 py-10"
            style={{ background: "var(--gommo-primary-100)" }}
        >
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-[22rem]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <GommoLogo className="h-9 max-w-[140px] object-contain" />
                    <p className="mt-3 text-sm font-medium text-base-content/70">Painel administrativo</p>
                </div>
                <div className="surface-card border border-base-200/80 p-7 shadow-sm">
                    <h1 className="text-lg font-bold tracking-tight text-base-content">Entrar</h1>
                    <p className="mt-1 text-sm text-base-content/55">Acesso restrito à equipe de operação Gommo</p>
                    <div className="mt-5">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
