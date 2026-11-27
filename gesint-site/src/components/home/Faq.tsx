import {Br, Container, Eyebrow, SectionTitle} from "@/components/ui";
import {Reveal} from "@/components/motion";
import {links} from "@/lib/links";

const questions = [
    {
        question: "O que é a Gesint?",
        answer: (
            <>
                A Gesint é uma solução para a gestão de departamento pessoal
                <Br/> e recursos humanos, com foco em organizar processos, conectar
                <Br/> informações e simplificar o dia a dia das equipes.
            </>
        ),
    },
    {
        question: "Como conhecer as soluções para a minha empresa?",
        answer:
            "Fale com a nossa equipe. Vamos entender a rotina da sua empresa e apresentar as soluções que fazem sentido para o seu time.",
    },
    {
        question: "A Gesint atende DP e RH na mesma experiência?",
        answer:
            "Sim. Departamento pessoal e recursos humanos ficam conectados na mesma experiência, com as informações organizadas em um só lugar.",
    },
    {
        question: "A Gesint também faz a gestão de ponto?",
        answer:
            "Sim. A Gestão de Ponto usa o mesmo cadastro de colaboradores e as escalas que você já configurou: mostra quem está trabalhando, calcula o banco de horas, fecha o espelho de ponto e avisa sobre os limites da CLT.",
    },
    {
        question: "Como funciona o primeiro contato?",
        answer:
            "Começa com uma conversa. Nossa equipe conhece o seu cenário, esclarece as dúvidas e alinha com você os próximos passos.",
    },
];

export function Faq() {
    return (
        <section id="duvidas" className="scroll-mt-24">
            <Container>
                <div className="grid gap-10 pt-16 pb-16 md:pt-[77px] md:pb-[90px] lg:grid-cols-[minmax(0,516fr)_minmax(0,748fr)] lg:gap-0">
                    <Reveal>
                        <Eyebrow>VAMOS ESCLARECER</Eyebrow>
                        <SectionTitle className="mt-4 md:mt-[19px]">
                            Antes da
                            <br/>
                            próxima etapa.
                        </SectionTitle>
                        <p className="mt-6 text-[16px] text-muted md:mt-[37px]">
                            Ainda tem alguma dúvida?
                            <Br/> A gente conversa sobre ela.
                        </p>
                        <a href={links.contact} className="mt-6 inline-block text-[15px] font-medium text-brand hover:text-brand-hover md:mt-8">
                            Fale com a Gesint ↗
                        </a>
                    </Reveal>

                    <Reveal delay={0.1} className="border-t border-line lg:mt-[5px]">
                        {questions.map((item, index) => (
                            <details key={item.question} name="faq" open={index === 0} className="group border-b border-line">
                                <summary className="flex cursor-pointer items-start justify-between gap-6 pt-[27px] pb-[33px] group-open:pt-6 group-open:pb-0">
                                    <span className="text-[17px] text-ink group-open:text-[19px] group-open:font-medium">
                                        {item.question}
                                    </span>
                                    <span aria-hidden className="relative mt-[5px] mr-[9px] size-[14px] shrink-0 text-muted group-open:mt-[6px]">
                                        <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-current"/>
                                        <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rotate-90 rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-0"/>
                                    </span>
                                </summary>
                                <p className="max-w-[710px] pt-[17px] pb-[30px] text-[15px] text-muted">{item.answer}</p>
                            </details>
                        ))}
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
