import {Reveal, RevealGroup, RevealItem} from "@/components/motion";
import {Br, Container, Eyebrow, SectionTitle} from "@/components/ui";

const steps = [
    {
        number: "01",
        title: "Vamos conhecer seu cenário",
        description: ["Conte como sua empresa trabalha e quais", "desafios fazem parte da rotina de DP e RH."],
    },
    {
        number: "02",
        title: "Encontre o caminho para o seu time",
        description: ["Conheça as soluções e entenda como a", "Gesint pode apoiar a sua operação."],
    },
    {
        number: "03",
        title: "Prepare o próximo capítulo",
        description: ["Alinhe com a nossa equipe os próximos", "passos para começar essa jornada."],
    },
];

export function HowItWorks() {
    return (
        <section id="como-funciona" className="scroll-mt-24 bg-white">
            <Container>
                <div className="pt-16 pb-16 md:pt-[66px] md:pb-[99px]">
                    <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Eyebrow>COMEÇAR PODE SER SIMPLES</Eyebrow>
                            <SectionTitle className="mt-4 md:mt-[19px]">
                                Um novo jeito de gerir.
                                <br/>
                                Um passo de cada vez.
                            </SectionTitle>
                        </div>
                        <p className="text-[15px] text-muted lg:mb-[22px] lg:w-[342px]">Da primeira conversa à sua rotina.</p>
                    </Reveal>

                    <RevealGroup as="ol" className="mt-10 grid gap-10 md:grid-cols-3 md:gap-5 lg:mt-[71px]">
                        {steps.map((step) => (
                            <RevealItem as="li" key={step.number} className="group">
                                <div className="relative h-px bg-line">
                                    <span
                                        aria-hidden
                                        className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-brand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                                    />
                                </div>
                                <p className="mt-[19px] text-[32px] font-light text-brand">{step.number}</p>
                                <h3 className="mt-3 text-[20px] font-medium text-ink md:mt-6">{step.title}</h3>
                                <p className="mt-3 text-[15px] text-muted md:mt-[19px]">
                                    {step.description[0]}
                                    <Br/> {step.description[1]}
                                </p>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </Container>
        </section>
    );
}
