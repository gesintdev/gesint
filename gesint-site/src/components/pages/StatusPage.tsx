import {PageHeading} from "@/components/pages/PageHeading";
import {Enter} from "@/components/motion";
import {ArrowLink, ButtonLink, Container} from "@/components/ui";
import {links} from "@/lib/links";

/**
 * Página de recado: "em desenvolvimento" ou "não encontrada".
 * Mesmo título linha a linha do resto do site, um emoji de apoio e dois caminhos de volta.
 */
export function StatusPage({eyebrow, emoji, lines, description}: {eyebrow: string; emoji: string; lines: string[]; description: string}) {
    return (
        <Container className="flex flex-1 items-center">
            <div className="max-w-[640px] py-16 md:py-24">
                <Enter y={12}>
                    <span aria-hidden className="text-[48px] leading-none md:text-[56px]">
                        {emoji}
                    </span>
                </Enter>
                <div className="mt-8">
                    <PageHeading size="lg" eyebrow={eyebrow} lines={lines} description={description}/>
                </div>
                <Enter delay={0.45} className="mt-9 flex flex-wrap items-center gap-x-[27px] gap-y-4">
                    <ButtonLink href={links.home}>Voltar ao início</ButtonLink>
                    <ArrowLink href={links.contact}>Fale com a Gesint</ArrowLink>
                </Enter>
            </div>
        </Container>
    );
}
