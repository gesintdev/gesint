import {SmartLink} from "@/components/SmartLink";

import {MobileNav} from "@/components/home/MobileNav";
import {StickyHeader} from "@/components/motion";
import {ButtonLink, Container, Divider, Logo} from "@/components/ui";
import {links, navItems} from "@/lib/links";

export function SiteHeader() {
    return (
        <StickyHeader>
            <Container>
                <div className="flex h-[72px] items-center justify-between whitespace-nowrap lg:h-[95px] xl:grid xl:grid-cols-[300fr_612fr_352fr]">
                    <SmartLink href={links.home} aria-label="Gesint — início">
                        <Logo className="h-7 lg:h-[34px]"/>
                    </SmartLink>

                    <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex xl:justify-center xl:gap-11">
                        {navItems.map((item) => (
                            <SmartLink key={item.href} href={item.href} className="group relative py-1 text-[15px] text-ink transition-colors hover:text-brand">
                                {item.label}
                                {/* Filete que cresce da esquerda no hover. */}
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                                />
                            </SmartLink>
                        ))}
                    </nav>

                    <div className="hidden items-center justify-end gap-8 lg:flex">
                        <SmartLink href={links.login} className="text-[14px] text-muted transition-colors hover:text-ink">
                            Entrar
                        </SmartLink>
                        <ButtonLink href={links.contact}>Fale com a Gesint</ButtonLink>
                    </div>

                    <MobileNav/>
                </div>
                <Divider/>
            </Container>
        </StickyHeader>
    );
}
