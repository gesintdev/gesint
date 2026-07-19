import type { ReactNode } from "react";

import { LoginWallpaper } from "@/shared/components/auth/LoginWallpaper";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";

type LoginShellProps = {
    children: ReactNode;
    tagline?: string;
    welcomeTitle?: string;
    welcomeSubtitle?: string;
};

export function LoginShell({
    children,
    tagline = "Gestão de DP e RH",
    welcomeTitle = "Bem-vindo de volta!",
    welcomeSubtitle = "Faça login para acessar sua conta",
}: LoginShellProps) {
    const year = new Date().getFullYear();

    return (
        <div className="login-page">
            <section className="login-page__visual" aria-hidden="true">
                <LoginWallpaper />
                <div className="login-page__visual-scrim" />
            </section>
            <section className="login-page__form" aria-label="Autenticação">
                <div className="login-page__glass animate-fade-up flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden">
                    <div className="login-page__glass-body flex w-[92%] max-w-152 flex-col items-center justify-center px-8 py-8 text-center sm:px-12 lg:w-[82%] lg:max-w-2xl lg:px-14 lg:py-10">
                        <div className="login-page__brand flex w-full flex-col items-center">
                            <img
                                src="/brand/gommo-logo-blue.svg"
                                alt=""
                                className="gommo-logo__icon"
                                draggable={false}
                            />
                        </div>
                        {children}
                        <p className="login-page__legal">© {year} Gommo. Todos os direitos reservados.</p>
                    </div>
                </div>
            </section>
            <div className="login-page__theme">
                <ThemeToggle />
            </div>
        </div>
    );
}
