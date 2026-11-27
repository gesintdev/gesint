import {AssistantChat} from "@/components/home/AssistantChat";
import {Reveal} from "@/components/motion";
import {NumberedList} from "@/components/NumberedList";
import {Br, Container, Divider, Eyebrow, SectionTitle} from "@/components/ui";

const skills = [
    {title: "Conversa sobre qualquer menu", description: "Clique com o botão direito em um item do menu e pergunte para que ele serve."},
    {title: "Resume processos", description: "O que já foi feito numa admissão, o que falta e qual prazo vence primeiro."},
    {title: "Explica pendências", description: "Por que o ASO está em atraso, por que o ponto não fecha, por que a férias travou."},
    {title: "Leva você à tela certa", description: "As respostas trazem atalhos que abrem a tela exata que você precisa."},
    {title: "Cria lembretes", description: "Peça um lembrete e ele aparece na agenda, com aviso no sino."},
];

/** Assistente de I.A. integrado: o texto à esquerda, uma conversa de exemplo à direita. */
export function Assistant() {
    return (
        <section id="assistente" className="scroll-mt-24">
            <Container>
                <div className="grid gap-12 pt-16 pb-16 md:pt-[88px] md:pb-[94px] xl:grid-cols-[minmax(0,552fr)_minmax(0,620fr)] xl:gap-[92px]">
                    <Reveal className="xl:pt-[9px]">
                        <Eyebrow>ASSISTENTE DE I.A. INTEGRADO</Eyebrow>
                        <SectionTitle className="mt-4 md:mt-[23px]">
                            Uma dúvida.
                            <br/>
                            Uma resposta clara.
                        </SectionTitle>
                        <p className="mt-6 text-[17px] text-muted md:mt-[30px]">
                            O assistente conhece as telas e os processos do Gesint.
                            <Br/> Ele consulta, explica e orienta; quem decide
                            <Br/> continua sendo o seu time.
                        </p>
                        <Divider className="mt-8 max-w-[508px] md:mt-9"/>
                        <NumberedList items={skills} className="mt-[22px]"/>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <AssistantChat/>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
