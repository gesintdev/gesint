import type {ReactNode} from "react";

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
            </section>
            <section className="login-page__form" aria-label="Autenticação">
                <div
                    className="login-page__glass animate-fade-up flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden">
                    <div
                        className="login-page__glass-body flex w-[92%] max-w-152 flex-col items-center justify-center px-8 py-8 text-center sm:px-12 lg:w-[82%] lg:max-w-2xl lg:px-14 lg:py-10">
                        <div className="login-page__brand">
                            {/* Ajuste o tamanho do logo do login aqui. O clamp evita que o
                                lockup (logo + bolinha + texto) estoure a largura no mobile. */}
                            <div className={'flex items-center gap-3 mb-6'}>
                                <SystemLogo size="clamp(2.25rem, 9vw, 3.5rem)"/>
                                <div className={`w-2 h-2 rounded-full bg-white`}/>
                                <span className="login-page__brand-tagline">Gestão Integrada</span>
                            </div>
                        </div>
                        {children}
                        <p className="login-page__legal">© {year} Gesint. Todos os direitos reservados.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
