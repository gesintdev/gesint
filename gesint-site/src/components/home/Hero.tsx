import Image from "next/image";

import painelDp from "@/assets/painel-dp.png";
import {Enter, LineReveal, Parallax, Reveal} from "@/components/motion";
import {Br, ButtonLink, Container, Divider, Eyebrow} from "@/components/ui";
import {links} from "@/lib/links";

function OperationPreview() {
    return (
        // Mesmo card branco das outras seções (ex.: "Cada etapa, no seu tempo."): o hero não ganha uma massa escura
        // só dele, e o título do card fica menor que o da página para não competir com ele.
        <div className="group flex flex-col rounded-md bg-white px-5 pt-6 pb-5 md:px-8 md:pt-[28px] md:pb-6 lg:h-[572px]">
            <Eyebrow>UMA ROTINA MAIS CONECTADA</Eyebrow>
            <LineReveal
                as="p"
                lines={["Tudo em seu lugar.", "Seu time à frente."]}
                delay={0.55}
                className="mt-3 text-[22px] font-light leading-[1.3] text-ink md:text-[24px]"
            />
            <Divider className="mt-[25px]"/>

            <Enter delay={0.75} y={24} className="mt-6 overflow-hidden rounded-[5px] border border-line bg-white">
                <Image
                    src={painelDp}
                    alt="Painel DP do Gesint com os indicadores de colaboradores, admissões e férias e o gráfico de movimentação da semana"
                    sizes="(min-width: 1024px) 528px, 100vw"
                    placeholder="blur"
                    preload
                    className="block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                />
            </Enter>

            <p className="mt-auto pt-5 text-[11px] text-muted">Exemplo ilustrativo da experiência Gesint</p>
        </div>
    );
}

export function Hero() {
    return (
        <section>
            <Container>
                <div className="grid gap-12 pt-10 md:pt-[50px] lg:grid-cols-[minmax(0,660fr)_minmax(0,584fr)] lg:gap-5">
                    <div>
                        <Enter y={8}>
                            <Eyebrow>GESTÃO DE DP E RH, COM MAIS CLAREZA</Eyebrow>
                        </Enter>
                        <LineReveal
                            lines={["Menos rotina.", "Mais espaço", "para pessoas."]}
                            delay={0.1}
                            className="mt-5 text-[46px] font-light leading-[1.05] tracking-[-0.046em] text-ink md:mt-[27px] md:text-[64px] xl:text-[76px]"
                        />
                        <div className="md:pl-1">
                            <Enter delay={0.45}>
                                <p className="mt-6 max-w-[584px] text-[17px] text-muted md:mt-[33px] md:text-[18px]">
                                    Conecte processos, organize informações e dê ao seu
                                    <Br/> time a tranquilidade de cuidar do que realmente importa.
                                </p>
                            </Enter>
                            <Enter delay={0.55} className="mt-8 flex flex-wrap items-center gap-x-[27px] gap-y-4 md:mt-[42px]">
                                <ButtonLink href={links.contact}>Conheça a Gesint  ↗</ButtonLink>
                                <a href={links.solutions} className="group/link text-[15px] font-medium text-ink hover:text-brand">
                                    Explore as soluções{" "}
                                    <span className="inline-block transition-transform duration-300 group-hover/link:translate-y-0.5">↓</span>
                                </a>
                            </Enter>
                            <Enter delay={0.65}>
                                <p className="mt-8 text-[13px] text-muted md:mt-[39px]">
                                    Do departamento pessoal à gestão de pessoas.
                                    <Br/> Uma visão integrada para o dia a dia da sua empresa.
                                </p>
                            </Enter>
                        </div>
                    </div>

                    <Enter delay={0.3} y={40}>
                        <Parallax distance={18}>
                            <OperationPreview/>
                        </Parallax>
                    </Enter>
                </div>

                <Reveal y={12}>
                    <Divider className="mt-12 md:mt-[68px]"/>
                    <p className="pt-[23px] pb-[26px] text-[14px] text-muted md:pl-1">
                        Mais organização para quem gere. Mais cuidado para quem faz parte.
                    </p>
                </Reveal>
            </Container>
        </section>
    );
}
