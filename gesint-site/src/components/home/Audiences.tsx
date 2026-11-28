import {Reveal, RevealGroup, RevealItem} from "@/components/motion";
import {Br, Container, SectionHeader} from "@/components/ui";

const audiences = [
    {
        title: "Quem cuida do DP",
        description: "Prazos à vista, documentos organizados e a rotina de admissão, ponto e férias num só lugar.",
        items: ["Avisos antes de cada prazo", "Holerites separados sozinhos", "Relatórios prontos"],
    },
    {
        title: "Quem cuida do RH",
        description: "Vagas, candidatos e desenvolvimento das pessoas conectados ao cadastro que o DP já usa.",
        items: ["Página de carreiras própria", "Experiência e PDI", "Feedbacks registrados"],
    },
    {
        title: "Quem decide",
        description: "Um painel que mostra o movimento da semana e o que precisa de atenção, filial por filial.",
        items: ["Painel ao vivo", "Indicadores por módulo", "Trilha de auditoria"],
    },
    {
        title: "Quem faz parte",
        description: "Colaboradores e candidatos resolvem o que é deles sem depender de e-mail ou papel.",
        items: ["Ponto pelo celular, com foto", "Documentos enviados pelo portal", "Candidatura online"],
    },
];

/** Para quem é: cada pessoa da empresa ganha algo diferente. */
export function Audiences() {
    return (
        <section className="scroll-mt-24">
            <Container>
                <div className="pt-16 pb-16 md:pt-[66px] md:pb-[90px]">
                    <Reveal>
                        <SectionHeader
                            eyebrow="PARA CADA PESSOA DA EMPRESA"
                            title={
                                <>
                                    Feito para quem gere.
                                    <br/>
                                    Pensado para quem faz parte.
                                </>
                            }
                            aside={
                                <>
                                    Cada perfil enxerga o que precisa,
                                    <Br/> do jeito que precisa.
                                </>
                            }
                        />
                    </Reveal>

                    <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-[60px] lg:grid-cols-4 lg:gap-5">
                        {audiences.map((audience, index) => (
                            <RevealItem
                                as="li"
                                key={audience.title}
                                className="group relative overflow-hidden rounded-md bg-white px-6 pt-[21px] pb-7 transition-[translate,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(17,29,39,0.22)]"
                            >
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                                />
                                <span className="text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                                <h3 className="mt-6 text-[22px] font-light text-ink">{audience.title}</h3>
                                <p className="mt-3 text-[14px] text-muted">{audience.description}</p>
                                <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
                                    {audience.items.map((item) => (
                                        <li key={item} className="flex text-[13px] text-ink">
                                            <span aria-hidden className="w-[22px] shrink-0 text-brand">—</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </Container>
        </section>
    );
}
