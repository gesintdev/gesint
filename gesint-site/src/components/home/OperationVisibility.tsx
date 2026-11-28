import {Reveal, RevealGroup, RevealItem} from "@/components/motion";
import {Br, Container, Divider, Eyebrow, SectionTitle, StatusBadge} from "@/components/ui";

const steps = [
    {number: "01", title: "Organize as informações", description: "Documentos e dados reunidos.", status: "Concluído", tone: "success"},
    {number: "02", title: "Acompanhe as pendências", description: "Saiba o que precisa da sua atenção.", status: "Em andamento", tone: "info"},
    {number: "03", title: "Siga para o próximo passo", description: "Histórico e contexto sempre por perto.", status: "A seguir", tone: "neutral"},
] as const;

const outcomes = ["Menos ruído entre pessoas e processos.", "Mais clareza sobre o que vem a seguir."];

export function OperationVisibility() {
    return (
        <section>
            <Container>
                <div className="grid gap-12 pt-16 pb-16 md:pt-[88px] md:pb-[94px] xl:grid-cols-[minmax(0,620fr)_minmax(0,552fr)] xl:gap-[92px]">
                    <Reveal className="order-2 rounded-md bg-white px-5 pt-6 pb-10 md:px-8 md:pt-[28px] md:pb-[72px] xl:order-1">
                        <p className="text-[22px] font-light text-ink md:text-[24px]">Cada etapa, no seu tempo.</p>
                        <p className="mt-1.5 text-[13px] text-muted">Um fluxo claro do início ao próximo passo.</p>
                        <Divider className="mt-[25px]"/>

                        <RevealGroup as="ol" className="mt-7">
                            {steps.map((step, index) => (
                                <RevealItem as="li" key={step.number}>
                                    {index > 0 && <Divider className="my-[23px] ml-14"/>}
                                    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-5 gap-y-3 sm:grid-cols-[36px_minmax(0,1fr)_auto]">
                                        <span className="mt-px flex size-9 items-center justify-center rounded-[5px] bg-surface text-[12px] text-muted">
                                            {step.number}
                                        </span>
                                        <div>
                                            <p className="text-[15px] font-medium text-ink">{step.title}</p>
                                            <p className="mt-1.5 text-[12px] text-muted">{step.description}</p>
                                        </div>
                                        <StatusBadge
                                            tone={step.tone}
                                            className="col-start-2 h-7 w-fit px-2.5 text-[11px] sm:col-start-3 sm:mt-1 sm:w-[139px]"
                                        >
                                            {step.status}
                                        </StatusBadge>
                                    </div>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </Reveal>

                    <Reveal delay={0.1} className="order-1 xl:order-2 xl:pt-[9px]">
                        <Eyebrow>CLAREZA EM CADA ETAPA</Eyebrow>
                        <SectionTitle className="mt-4 md:mt-[23px]">
                            O dia a dia flui.
                            <br/>
                            A gestão evolui.
                        </SectionTitle>
                        <p className="mt-6 text-[17px] text-muted md:mt-[30px]">
                            Troque informações espalhadas por uma visão
                            <Br/> mais organizada da sua operação. Com a Gesint,
                            <Br/> seu time ganha contexto para seguir em frente.
                        </p>
                        <Divider className="mt-8 max-w-[508px] md:mt-9"/>
                        <RevealGroup as="ul" className="mt-[22px] flex flex-col gap-6">
                            {outcomes.map((outcome, index) => (
                                <RevealItem as="li" key={outcome} className="flex items-baseline text-[14px] text-ink">
                                    <span className="w-[45px] shrink-0 text-[12px] text-muted">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    {outcome}
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
