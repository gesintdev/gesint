import {Reveal, RevealGroup, RevealItem} from "@/components/motion";
import {Container} from "@/components/ui";

const pillars = [
    {label: "01 / CENTRALIZE", text: "Informações em um só lugar"},
    {label: "02 / SIMPLIFIQUE", text: "Processos que fluem melhor"},
    {label: "03 / ACOMPANHE", text: "Clareza para decidir"},
];

export function ContextStrip() {
    return (
        <section>
            <Container>
                <div className="grid gap-8 pt-8 pb-14 md:pt-[27px] md:pb-[53px] lg:grid-cols-[452fr_285fr_285fr_242fr] lg:gap-0">
                    <Reveal>
                        <p className="text-[22px] font-light text-ink md:text-[25px]">
                            Menos tarefas dispersas.
                            <br/>
                            Mais gestão de verdade.
                        </p>
                    </Reveal>
                    <RevealGroup className="grid gap-6 sm:grid-cols-3 lg:contents">
                        {pillars.map((pillar) => (
                            <RevealItem key={pillar.label} className="lg:pt-px">
                                <p className="text-[11px] font-medium text-muted">{pillar.label}</p>
                                <p className="mt-2 text-[16px] text-ink md:mt-[14px]">{pillar.text}</p>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </Container>
        </section>
    );
}
