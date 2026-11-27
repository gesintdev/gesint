import {Br, Container, Divider, Eyebrow, SectionTitle} from "@/components/ui";
import {SolutionDeck} from "@/components/home/SolutionDeck";
import {Reveal} from "@/components/motion";
import {links} from "@/lib/links";

/** Ordem de exibição: Departamento pessoal, Gestão de ponto, Recursos humanos e, por fim, a Gestão integrada que liga os três. */
const solutions = [
    {
        title: "Departamento pessoal",
        description: ["Organização para as rotinas", "que não podem esperar."],
        items: ["Admissões e documentos", "Férias e afastamentos", "Rotinas do colaborador"],
    },
    {
        title: "Gestão de ponto",
        description: ["A jornada acompanhada de perto,", "antes de virar passivo."],
        items: ["Banco de horas e espelho de ponto", "Limites da CLT em tempo real", "Avisos ao colaborador e ao RH"],
    },
    {
        title: "Recursos humanos",
        description: ["Mais proximidade com as pessoas.", "Mais espaço para o seu time."],
        items: ["Informações dos colaboradores", "Jornada na empresa", "Comunicação com as pessoas"],
    },
    {
        title: "Gestão integrada",
        description: ["Informações conectadas.", "Decisões com mais contexto."],
        items: ["Visão centralizada da operação", "Acompanhamento de pendências", "Histórico fácil de consultar"],
    },
];

/** Hover dos cards: mesma duração e curva em todos os efeitos, para tudo se mover junto e com suavidade. */
const SMOOTH = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";

export function Solutions() {
    return (
        <section id="solucoes" className="scroll-mt-24">
            <Container>
                <div className="pt-16 pb-14 md:pt-[65px] md:pb-[49px]">
                    <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Eyebrow>SOLUÇÕES QUE TRABALHAM JUNTAS</Eyebrow>
                            <SectionTitle className="mt-4 md:mt-[18px]">
                                Do operacional ao humano.
                                <br/>
                                Tudo se conecta.
                            </SectionTitle>
                        </div>
                        <p className="text-[16px] text-muted lg:mr-[7px] lg:mb-[15px] lg:w-[330px]">
                            Uma gestão mais simples começa
                            <Br/> com uma rotina bem organizada.
                        </p>
                    </Reveal>

                    <SolutionDeck className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-[60px] lg:gap-5 xl:grid-cols-4">
                        {solutions.map((solution, index) => (
                            <a
                                key={solution.title}
                                href={links.contact}
                                className={`group flex h-full flex-col rounded-md bg-white px-6 pt-[21px] pb-[31px] transition-[translate,box-shadow] ${SMOOTH} hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(17,29,39,0.22)] md:px-7`}
                            >
                                <div className="flex h-[35px] items-start justify-between">
                                    <span className="pt-1 text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                                    <span
                                        aria-hidden
                                        className={`mr-[-2px] text-[25px] text-brand transition-transform ${SMOOTH} group-hover:-translate-y-1 group-hover:translate-x-1`}
                                    >
                                        ↗
                                    </span>
                                </div>
                                <h3 className="mt-6 text-[24px] font-light text-ink md:mt-8 md:text-[26px]">{solution.title}</h3>
                                <p className="mt-[15px] text-[16px] text-muted">
                                    {solution.description[0]}
                                    <br/>
                                    {solution.description[1]}
                                </p>
                                <Divider className="mt-9"/>
                                <ul className="mt-[23px] flex flex-col gap-[18px]">
                                    {solution.items.map((item) => (
                                        <li key={item} className="flex text-[14px] text-ink">
                                            <span aria-hidden className="w-[26px] shrink-0 text-brand">—</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <span className={`mt-10 text-[13px] font-medium text-ink transition-colors ${SMOOTH} group-hover:text-brand`}>
                                    Conhecer solução
                                    <span aria-hidden className={`ml-1.5 inline-block -translate-x-1 opacity-0 transition-[opacity,translate] ${SMOOTH} group-hover:translate-x-0 group-hover:opacity-100`}>
                                        →
                                    </span>
                                </span>
                            </a>
                        ))}
                    </SolutionDeck>

                    <Reveal>
                        <p className="mt-10 text-[14px] text-muted md:mt-[43px]">
                            Uma experiência pensada para conectar quem cuida da empresa a quem faz parte dela.
                        </p>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
