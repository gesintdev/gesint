import type { LucideIcon } from "lucide-react";
import { Calculator, FolderOpen, Users } from "lucide-react";
import type { ReactNode } from "react";

import { LoginStage } from "@/shared/components/auth/LoginStage";
import { SystemLogo } from "@/shared/components/brand/SystemLogo";

type LoginShellProps = {
    children: ReactNode;
};

type BrandModule = {
    icon: LucideIcon;
    title: string;
    description: string;
};

/** Sistemas do produto (rail: DP / RH / CTB) — texto do painel da marca. */
const BRAND_MODULES: BrandModule[] = [
    {
        icon: FolderOpen,
        title: "Departamento Pessoal",
        description: "Admissões, ponto, férias, afastamentos e desligamentos",
    },
    {
        icon: Users,
        title: "Recursos Humanos",
        description: "Recrutamento, experiência, PDI e feedback",
    },
    {
        icon: Calculator,
        title: "Contabilidade",
        description: "Folha de pagamento e holerites",
    },
];

/** Título + subtítulo da coluna do formulário (ex.: "Bem-vindo de volta" no login). */
export function LoginHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <header className="login-main__header">
            <h1 className="login-main__title">{title}</h1>
            {subtitle ? <p className="login-main__subtitle">{subtitle}</p> : null}
        </header>
    );
}

/**
 * Layout das telas de autenticação: marca | formulário (regra do projeto).
 * Montado uma vez no layout do grupo `(auth)`: trocar entre login / esqueci / definir senha
 * substitui só o conteúdo do formulário (template.tsx anima a entrada), sem recriar a marca.
 * O painel da marca só aparece a partir de 1024px; abaixo disso o logo vai para o topo do formulário.
 */
export function LoginShell({ children }: LoginShellProps) {
    const year = new Date().getFullYear();

    return (
        <div className="login-page">
            <section className="login-brand" aria-label="Gesint — Gestão Integrada">
                <LoginStage />
                <div className="login-brand__inner">
                    <div className="login-brand__lockup">
                        <SystemLogo size="2rem" color="currentColor" />
                        <span className="login-brand__dot" aria-hidden="true" />
                        <span className="login-brand__tagline">Gestão Integrada</span>
                    </div>

                    <div className="login-brand__copy">
                        <p className="login-brand__eyebrow">Plataforma de gestão de pessoas</p>
                        <h2 className="login-brand__headline">DP, RH e Contabilidade em uma só plataforma.</h2>
                        <p className="login-brand__lead">
                            Da admissão à folha de pagamento, com cada processo no lugar certo.
                        </p>
                        <ul className="login-brand__modules">
                            {BRAND_MODULES.map(({ icon: Icon, title, description }, index) => (
                                <li
                                    key={title}
                                    className="login-brand__module"
                                    style={{ animationDelay: `${0.25 + index * 0.08}s` }}
                                >
                                    <span className="login-brand__module-icon">
                                        <Icon className="size-4" strokeWidth={2} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="login-brand__module-title">{title}</span>
                                        <span className="login-brand__module-desc">{description}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="login-brand__legal">© {year} Gesint. Todos os direitos reservados.</p>
                </div>
            </section>

            <section className="login-main" aria-label="Autenticação">
                <div className="login-main__inner">
                    <div className="login-main__logo">
                        <SystemLogo size="2rem" />
                        <span className="login-brand__dot" aria-hidden="true" />
                        <span className="login-main__logo-tagline">Gestão Integrada</span>
                    </div>
                    {children}
                    <p className="login-main__legal">© {year} Gesint. Todos os direitos reservados.</p>
                </div>
            </section>
        </div>
    );
}
