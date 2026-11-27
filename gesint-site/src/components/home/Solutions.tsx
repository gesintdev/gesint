import {Br, Container, Divider, Eyebrow, SectionTitle} from "@/components/ui";
import {SolutionSystem} from "@/components/home/SolutionSystem";
import {Reveal} from "@/components/motion";
import {links} from "@/lib/links";

type Solution = {
    title: string;
    description: [string, string];
    items: string[];
};

/** O sistema: o que liga os produtos. Fica no meio, e os produtos saem de dentro dele. */
const system: Solution = {
    title: "Gestão integrada",
    description: ["Um só cadastro e uma só visão.", "Os produtos falam a mesma língua."],
    items: ["Visão centralizada da operação", "Acompanhamento de pendências", "Histórico fácil de consultar"],
};

/** Produtos que compõem o sistema, na ordem: esquerda, direita e abaixo. */
const products: Record<"left" | "right" | "bottom", Solution> = {
    left: {
        title: "Departamento pessoal",
        description: ["Organização para as rotinas", "que não podem esperar."],
        items: ["Admissões e documentos", "Férias e afastamentos", "Rotinas do colaborador"],
    },
    right: {
        title: "Recursos humanos",
        description: ["Mais proximidade com as pessoas.", "Mais espaço para o seu time."],
        items: ["Informações dos colaboradores", "Jornada na empresa", "Comunicação com as pessoas"],
    },
    bottom: {
        title: "Gestão de ponto",
        description: ["A jornada acompanhada de perto,", "antes de virar passivo."],
        items: ["Banco de horas e espelho de ponto", "Limites da CLT em tempo real", "Avisos ao colaborador e ao RH"],
    },
};

/** Hover dos cards: mesma duração e curva em todos os efeitos, para tudo se mover junto e com suavidade. */
const SMOOTH = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";

function ProductCard({solution, index}: {solution: Solution; index: number}) {
    return (
        <a
            href={links.contact}
            className={`group flex h-full flex-col rounded-md bg-white px-6 pt-[21px] pb-[31px] shadow-[0_1px_2px_rgba(17,29,39,0.04)] transition-[translate,box-shadow] ${SMOOTH} hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(17,29,39,0.22)] md:px-7`}
        >
            <div className="flex h-[35px] items-start justify-between">
                <span className="pt-1 text-[12px] text-muted">{String(index).padStart(2, "0")}</span>
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
    );
}

/** O card do meio: o sistema. Escuro, com o brilho da marca, para ler como o núcleo de onde os produtos saem. */
function SystemCard({solution}: {solution: Solution}) {
    return (
        <a
            href={links.contact}
            className={`group relative flex h-full flex-col overflow-hidden rounded-md bg-ink px-6 pt-[21px] pb-[31px] text-white shadow-[0_28px_60px_-28px_rgba(17,29,39,0.55)] md:px-7`}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl"
            />
            <div className="relative flex h-[35px] items-start justify-between">
                <span className="rounded-[4px] bg-white/10 px-2 py-1 text-[11px] font-medium tracking-[0.08em] text-white/80">
                    O SISTEMA
                </span>
                <span
                    aria-hidden
                    className="font-logo text-[25px] leading-none text-brand"
                >
                    G
                </span>
            </div>
            <h3 className="relative mt-6 text-[24px] font-light md:mt-8 md:text-[26px]">{solution.title}</h3>
            <p className="relative mt-[15px] text-[16px] text-white/65">
                {solution.description[0]}
                <br/>
                {solution.description[1]}
            </p>
            <div aria-hidden className="relative mt-9 h-px bg-white/12"/>
            <ul className="relative mt-[23px] flex flex-col gap-[18px]">
                {solution.items.map((item) => (
                    <li key={item} className="flex text-[14px] text-white/90">
                        <span aria-hidden className="w-[26px] shrink-0 text-brand">—</span>
                        {item}
                    </li>
                ))}
            </ul>
            <div className="relative mt-10 flex flex-wrap gap-2">
                {[products.left, products.bottom, products.right].map((product) => (
                    <span key={product.title} className="rounded-[4px] border border-white/15 px-2 py-1 text-[11px] text-white/70">
                        {product.title}
                    </span>
                ))}
            </div>
        </a>
    );
}

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

                    <SolutionSystem
                        center={<SystemCard solution={system}/>}
                        left={<ProductCard solution={products.left} index={1}/>}
                        right={<ProductCard solution={products.right} index={2}/>}
                        bottom={<ProductCard solution={products.bottom} index={3}/>}
                    />

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
