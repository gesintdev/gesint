import {CountUp, Reveal, RevealGroup, RevealItem, ScrollLine} from "@/components/motion";
import {Br, Container, Divider, SectionHeader} from "@/components/ui";

/** As etapas da esteira de admissão, na ordem do sistema. */
const steps = [
    {title: "Pré-admissão", description: "A pessoa recebe um código e preenche os dados pelo portal."},
    {title: "Documentos", description: "RG, CPF, CTPS e comprovantes enviados direto, sem papel."},
    {title: "ASO", description: "Exame admissional agendado e acompanhado até o resultado."},
    {title: "Contrato", description: "Cargo, salário e jornada conferidos antes da assinatura."},
    {title: "Registro", description: "Cadastro completo do colaborador, pronto para o DP."},
    {title: "eSocial", description: "Evento S-2200 com o certificado digital da empresa."},
    {title: "Integração", description: "Primeiro dia preparado, com o time sabendo quem chega."},
];

const facts = [
    {value: 7, label: "etapas acompanhadas, do convite ao primeiro dia"},
    {value: 19, label: "tipos de afastamento já previstos no sistema"},
    {value: 3, label: "áreas conectadas: DP, RH e gestão"},
];

function Step({index, title, description}: {index: number; title: string; description: string}) {
    return (
        <>
            <span className="relative z-10 flex size-9 items-center justify-center rounded-full border border-line bg-white text-[12px] text-muted transition-colors duration-500 group-hover:border-brand group-hover:text-brand">
                {String(index + 1).padStart(2, "0")}
            </span>
            <div>
                <p className="text-[16px] font-medium text-ink lg:mt-5">{title}</p>
                <p className="mt-1.5 text-[14px] text-muted">{description}</p>
            </div>
        </>
    );
}

/** Admissão digital: as 7 etapas numa linha que se preenche com a rolagem. */
export function AdmissionFlow() {
    return (
        <section id="admissao" className="scroll-mt-24 bg-white">
            <Container>
                <div className="pt-16 pb-16 md:pt-[66px] md:pb-[90px]">
                    <Reveal>
                        <SectionHeader
                            eyebrow="ADMISSÃO DIGITAL"
                            title={
                                <>
                                    Do convite ao primeiro dia.
                                    <br/>
                                    Sem papel, sem prazo perdido.
                                </>
                            }
                            aside={
                                <>
                                    O sistema avisa antes de cada prazo
                                    <Br/> legal vencer e mostra o que falta.
                                </>
                            }
                        />
                    </Reveal>

                    {/* Desktop: linha horizontal atrás dos números. */}
                    <div className="relative mt-[70px] hidden lg:block">
                        {/* Do centro do 1º círculo ao centro do 7º: 6 passos de (largura + gap) / 7. */}
                        <ScrollLine className="absolute top-[17px] left-[18px] h-px w-[calc((100%+20px)*6/7)]"/>
                        <RevealGroup as="ol" className="relative grid grid-cols-7 gap-5">
                            {steps.map((step, index) => (
                                <RevealItem as="li" key={step.title} className="group">
                                    <Step index={index} {...step}/>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </div>

                    {/* Celular e tablet: a mesma linha, na vertical. */}
                    <div className="relative mt-10 lg:hidden">
                        <ScrollLine axis="y" className="absolute top-2 bottom-8 left-[17px] w-px"/>
                        <RevealGroup as="ol" className="relative flex flex-col gap-7">
                            {steps.map((step, index) => (
                                <RevealItem as="li" key={step.title} className="group grid grid-cols-[36px_minmax(0,1fr)] gap-x-5">
                                    <Step index={index} {...step}/>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </div>

                    <Divider className="mt-14 lg:mt-[72px]"/>
                    <RevealGroup as="ul" className="grid gap-8 pt-8 sm:grid-cols-3 sm:gap-5">
                        {facts.map((fact) => (
                            <RevealItem as="li" key={fact.label}>
                                <p className="text-[44px] font-light leading-none text-brand md:text-[52px]">
                                    <CountUp value={fact.value}/>
                                </p>
                                <p className="mt-3 max-w-[260px] text-[14px] text-muted">{fact.label}</p>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </Container>
        </section>
    );
}
