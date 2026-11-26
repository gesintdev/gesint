import {Reveal} from "@/components/motion";
import {ButtonLink, Container, Eyebrow} from "@/components/ui";
import {links} from "@/lib/links";

export function ContactCta() {
    return (
        <section id="contato" className="scroll-mt-24">
            <Container>
                <div className="pt-[12px] pb-14 md:pb-[56px]">
                    <Reveal y={32} className="grid gap-8 rounded-lg bg-brand-soft px-6 pt-8 pb-9 md:px-10 md:pt-[35px] md:pb-[39px] lg:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                            <Eyebrow>SEU PRÓXIMO PASSO</Eyebrow>
                            <p className="mt-4 text-[34px] font-light leading-[1.15] tracking-[-0.032em] text-ink md:mt-[23px] md:text-[42px] lg:text-[47px]">
                                Mais fluidez na gestão.
                                <br/>
                                Mais tempo para pessoas.
                            </p>
                            <p className="mt-6 text-[16px] text-muted md:mt-[28px]">Conheça o que faz sentido para o seu time.</p>
                        </div>
                        <ButtonLink href={links.contact} className="h-[52px] w-fit self-start px-[22px] lg:mt-[76px]">
                            Vamos conversar  ↗
                        </ButtonLink>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
