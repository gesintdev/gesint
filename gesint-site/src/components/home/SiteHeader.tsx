import {ButtonLink, Container, Divider, Logo} from "@/components/ui";
import {StickyHeader} from "@/components/motion";
import {links} from "@/lib/links";

const navItems = [
    {label: "Soluções", href: links.solutions},
    {label: "Como funciona", href: links.howItWorks},
    {label: "Sobre a Gesint", href: links.about},
];

export function SiteHeader() {
    return (
        <StickyHeader>
            <Container>
                <div className="flex h-[72px] items-center justify-between whitespace-nowrap lg:h-[95px] xl:grid xl:grid-cols-[382fr_530fr_352fr]">
                    <a href="#" aria-label="Gesint — início">
                        <Logo className="h-7 lg:h-[34px]"/>
                    </a>

                    <nav aria-label="Principal" className="hidden items-center gap-10 lg:flex xl:gap-[66px]">
                        {navItems.map((item) => (
                            <a key={item.href} href={item.href} className="text-[15px] text-ink hover:text-brand">
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center justify-between gap-8 lg:flex">
                        <a href={links.system} className="text-[14px] text-muted hover:text-ink">
                            Acessar sistema ↗
                        </a>
                        <ButtonLink href={links.contact}>Fale com a Gesint</ButtonLink>
                    </div>

                    <details className="group relative lg:hidden">
                        <summary
                            aria-label="Abrir menu"
                            className="flex size-11 cursor-pointer items-center justify-center rounded-[5px] text-ink"
                        >
                            <span className="relative block h-3 w-5">
                                <span className="absolute inset-x-0 top-0 h-px bg-current transition-transform group-open:translate-y-1.5 group-open:rotate-45"/>
                                <span className="absolute inset-x-0 bottom-0 h-px bg-current transition-transform group-open:-translate-y-[5px] group-open:-rotate-45"/>
                            </span>
                        </summary>
                        <div className="absolute right-0 top-full z-20 mt-2 flex w-64 flex-col gap-1 rounded-md bg-white p-3 shadow-[0_12px_32px_rgba(17,29,39,0.12)]">
                            {navItems.map((item) => (
                                <a key={item.href} href={item.href} className="rounded px-3 py-2.5 text-[15px] text-ink hover:bg-surface">
                                    {item.label}
                                </a>
                            ))}
                            <a href={links.system} className="rounded px-3 py-2.5 text-[14px] text-muted hover:bg-surface">
                                Acessar sistema ↗
                            </a>
                            <ButtonLink href={links.contact} className="mt-1 justify-center">
                                Fale com a Gesint
                            </ButtonLink>
                        </div>
                    </details>
                </div>
                <Divider/>
            </Container>
        </StickyHeader>
    );
}
