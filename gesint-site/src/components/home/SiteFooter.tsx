import {SmartLink} from "@/components/SmartLink";

import {Br, Container, Divider, Logo} from "@/components/ui";
import {links} from "@/lib/links";

const columns = [
    {
        title: "Soluções",
        items: [
            {label: "Departamento pessoal", href: links.features},
            {label: "Recursos humanos", href: links.features},
            {label: "Admissão digital", href: links.admission},
            {label: "Assistente I.A.", href: links.assistant},
        ],
    },
    {
        title: "Conheça",
        items: [
            {label: "Segurança e privacidade", href: links.security},
            {label: "Como funciona", href: links.howItWorks},
            {label: "Dúvidas frequentes", href: links.about},
        ],
    },
    {
        title: "A Gesint",
        items: [
            {label: "Fale com a Gesint", href: links.contact},
            {label: "Entrar", href: links.login},
        ],
    },
];

export function SiteFooter() {
    return (
        <footer className="bg-white">
            <Container>
                <div className="pt-10 pb-8 md:pt-[33px] md:pb-[33px]">
                    <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[520fr_248fr_248fr_248fr] lg:gap-0">
                        <div className="sm:col-span-3 lg:col-span-1">
                            <div className="flex h-[62px] items-center">
                                <Logo className="h-9 md:h-10"/>
                            </div>
                            <p className="mt-[11px] text-[15px] text-muted">
                                Gestão que conecta.
                                <Br/> Pessoas que transformam.
                            </p>
                        </div>
                        {columns.map((column) => (
                            <div key={column.title} className="lg:pt-[15px]">
                                <p className="text-[13px] font-medium text-ink">{column.title}</p>
                                <ul className="mt-[18px] flex flex-col gap-[13px] text-[13px]">
                                    {column.items.map((item) => (
                                        <li key={item.label}>
                                            <SmartLink href={item.href} className="text-muted transition-colors hover:text-ink">
                                                {item.label}
                                            </SmartLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <Divider className="mt-10 lg:mt-[51px]"/>
                    <div className="mt-6 flex flex-col gap-3 text-[12px] text-muted sm:flex-row sm:items-center">
                        <p>© 2026 Gesint. Todos os direitos reservados.</p>
                        <div className="flex gap-6 sm:ml-auto sm:gap-0">
                            <SmartLink href={links.privacy} className="hover:text-ink sm:w-[160px]">
                                Privacidade
                            </SmartLink>
                            <SmartLink href={links.terms} className="hover:text-ink sm:w-[116px]">
                                Termos de uso
                            </SmartLink>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
