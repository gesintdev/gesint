import type {ReactNode} from "react";

import {LoginStage} from "@/shared/components/auth/LoginStage";
import {LoginWallpaper} from "@/shared/components/auth/LoginWallpaper";
import {SystemLogo} from "@/shared/components/brand/SystemLogo";

type LoginShellProps = {
    children: ReactNode;
    tagline?: string;
    welcomeTitle?: string;
    welcomeSubtitle?: string;
};

export function LoginShell({children}: LoginShellProps) {
    const year = new Date().getFullYear();

    return (
        <div className="login-page">
            <section className="login-page__visual" aria-hidden="true">
                <LoginWallpaper/>
                <div className="login-page__visual-scrim"/>
                <LoginStage/>
            </section>
            <section className="login-page__form" aria-label="Autenticação">
                <div
                    className="login-page__glass animate-fade-up flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden">
                    <div
                        className="login-page__glass-body flex w-[92%] max-w-152 flex-col items-center justify-center px-4 py-6 text-center sm:px-8 sm:py-8 lg:w-[82%] lg:max-w-2xl lg:px-14 lg:py-10">
                        <div className="login-page__brand">
                            <SystemLogo size="clamp(1.75rem, 8vw, 3.5rem)"/>
                            <span className="login-page__brand-dot" aria-hidden="true"/>
                            <span className="login-page__brand-tagline">Gestão Integrada</span>
                        </div>
                        {children}
                        <p className="login-page__legal">© {year} Gesint. Todos os direitos reservados.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
