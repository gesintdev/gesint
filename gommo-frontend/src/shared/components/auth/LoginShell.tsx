import type {ReactNode} from "react";
import {GommoLogo} from "@/shared/components/layout/GommoLogo";
import {ThemeToggle} from "@/shared/components/layout/ThemeToggle";

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
                <picture>
                    <source media="(min-width: 1024px)" srcSet="/brand/gommo-login-bg-4k.png"/>
                    <img
                        src="/brand/gommo-login-bg.png"
                        alt=""
                        className="login-page__visual-img"
                        fetchPriority="high"
                        decoding="async"
                    />
                </picture>
                <div className="login-page__visual-scrim"/>
            </section>

            <section className="login-page__form" aria-label="Autenticação">
                <div
                    className="login-page__glass animate-fade-up flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden backdrop-blur-[72px] backdrop-brightness-110 backdrop-contrast-[1.02] backdrop-saturate-[1.85]">
                    <div
                        className="login-page__glass-body flex w-[92%] max-w-152 flex-col items-center justify-center px-8 py-8 text-center sm:px-12 lg:w-[82%] lg:max-w-[42rem] lg:px-14 lg:py-10">
                        <div className="login-page__brand flex w-full flex-col items-center">
                            <GommoLogo onBrand className="mx-auto h-10 max-w-42"/>
                            <p className="login-page__tagline">{tagline}</p>
                        </div>

                        <div className="login-page__copy">
                            <h1 className="login-page__title">{welcomeTitle}</h1>
                            <p className="login-page__subtitle">{welcomeSubtitle}</p>
                        </div>

                        {children}

                        <p className="login-page__legal">
                            © {year} Gommo. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </section>

            <div className="login-page__theme">
                <ThemeToggle/>
            </div>
        </div>
    );
}
