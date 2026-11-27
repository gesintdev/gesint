import {Reveal, RevealGroup, RevealItem} from "@/components/motion";
import {NumberedList} from "@/components/NumberedList";
import {Br, Container, Divider, Eyebrow, SectionTitle, StatusBadge} from "@/components/ui";

const guarantees = [
    {title: "Ambiente só da sua empresa", description: "Cada cliente acessa pelo próprio endereço, com os dados separados dos demais."},
    {title: "Acesso por perfil", description: "Cada perfil vê os menus e executa as ações que você liberar."},
    {title: "Documentos por nível de proteção", description: "Arquivos comuns, pessoais, sensíveis e financeiros tratados de forma diferente."},
    {title: "Histórico que não se apaga", description: "Toda alteração entra na trilha de auditoria, que ninguém consegue editar."},
];

/** Eventos fictícios: só códigos, nenhum nome de colaborador. */
const events = [
    {who: "Perfil DP", action: "aprovou férias", target: "Colaborador #1042", when: "há 2 min", tone: "success"},
    {who: "Perfil RH", action: "alterou um cargo", target: "Colaborador #0871", when: "há 18 min", tone: "info"},
    {who: "Administrador", action: "mudou permissões", target: "Perfil Gestores", when: "há 1 h", tone: "warning"},
    {who: "Perfil DP", action: "anexou documento sensível", target: "Admissão #0219", when: "ontem", tone: "neutral"},
] as const;

const toneLabel = {success: "Aprovação", info: "Alteração", warning: "Acesso", neutral: "Documento"} as const;

/** Segurança e privacidade: dados de pessoas pedem cuidado redobrado. */
export function Security() {
    return (
        <section id="seguranca" className="scroll-mt-24 bg-white">
            <Container>
                <div className="grid gap-12 pt-16 pb-16 md:pt-[88px] md:pb-[94px] xl:grid-cols-[minmax(0,620fr)_minmax(0,552fr)] xl:gap-[92px]">
                    <Reveal className="order-2 rounded-md bg-surface px-5 pt-6 pb-8 md:px-8 md:pt-[28px] md:pb-10 xl:order-1">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[22px] font-light text-ink md:text-[24px]">Trilha de auditoria</p>
                                <p className="mt-1.5 text-[13px] text-muted">Somente leitura. Visível para quem tem permissão.</p>
                            </div>
                            <span aria-hidden className="relative flex size-2.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-fg/40"/>
                                <span className="relative inline-flex size-2.5 rounded-full bg-success-fg"/>
                            </span>
                        </div>
                        <Divider className="mt-[25px]"/>
                        <RevealGroup as="ol" className="mt-2">
                            {events.map((event) => (
                                <RevealItem as="li" key={event.target} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-line py-[18px] last:border-b-0">
                                    <div className="min-w-0">
                                        <p className="text-[15px] text-ink">
                                            <span className="font-medium">{event.who}</span> {event.action}
                                        </p>
                                        <p className="mt-1 truncate text-[12px] text-muted">
                                            {event.target} · {event.when}
                                        </p>
                                    </div>
                                    <StatusBadge tone={event.tone} className="h-7 self-center px-2.5 text-[11px]">
                                        {toneLabel[event.tone]}
                                    </StatusBadge>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </Reveal>

                    <Reveal delay={0.1} className="order-1 xl:order-2 xl:pt-[9px]">
                        <Eyebrow>SEGURANÇA E PRIVACIDADE</Eyebrow>
                        <SectionTitle className="mt-4 md:mt-[23px]">
                            Dados de pessoas.
                            <br/>
                            Cuidado de verdade.
                        </SectionTitle>
                        <p className="mt-6 text-[17px] text-muted md:mt-[30px]">
                            Informação de colaborador é sensível. Por isso o Gesint
                            <Br/> separa, protege e registra, por padrão.
                        </p>
                        <Divider className="mt-8 max-w-[508px] md:mt-9"/>
                        <NumberedList items={guarantees} className="mt-[22px]"/>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
