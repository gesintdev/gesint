import {Br, Container, Divider, Logo} from "@/components/ui";
import {links} from "@/lib/links";

const columns = [
    {
        title: "Soluções",
        items: [
            {label: "Departamento pessoal", href: links.solutions},
            {label: "Recursos humanos", href: links.solutions},
            {label: "Gestão integrada", href: links.solutions},
        ],
    },
    {
        title: "A Gesint",
        items: [
            {label: "Sobre nós", href: links.about},
            {label: "Fale com a Gesint", href: links.contact},
            {label: "Acessar sistema ↗", href: links.system},
        ],
    },
];

export function SiteFooter() {
    return (
        <footer className="bg-white">
            <Container>
                <div className="pt-10 pb-8 md:pt-[33px] md:pb-[33px]">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[618fr_304fr_342fr] lg:gap-0">
                        <div className="sm:col-span-2 lg:col-span-1">
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
                                            <a href={item.href} className="text-muted hover:text-ink">
                                                {item.label}
                                            </a>
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
                            <a href="#" className="hover:text-ink sm:w-[160px]">Privacidade</a>
                            <a href="#" className="hover:text-ink sm:w-[116px]">Termos de uso</a>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
