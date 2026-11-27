import {FeatureTabs, type FeatureTab} from "@/components/home/FeatureTabs";
import {Reveal} from "@/components/motion";
import {Br, Container, SectionHeader} from "@/components/ui";

/** Tudo o que o sistema faz hoje, por módulo. A Contabilidade fica de fora até estar disponível. */
const tabs: FeatureTab[] = [
    {
        id: "dp",
        label: "Departamento pessoal",
        summary: "As rotinas que têm prazo, com cada etapa visível e nenhum documento perdido.",
        items: [
            {title: "Admissão digital", description: "Do convite à integração, com documentos, ASO, contrato e eSocial no mesmo fluxo."},
            {title: "Férias", description: "Períodos aquisitivo e concessivo calculados a partir do contrato."},
            {title: "Afastamentos", description: "Licenças e afastamentos por tipo, sem expor dados médicos nos relatórios."},
            {title: "Desligamento", description: "Rescisão acompanhada de ponta a ponta, com checklist de devoluções."},
            {title: "Pagamentos", description: "Envie o PDF da folha e o sistema separa um holerite para cada colaborador."},
            {title: "Saúde ocupacional", description: "Exames exigidos por cargo, clínicas e médicos do trabalho em um só cadastro."},
            {title: "Estrutura da empresa", description: "Departamentos e cargos organizados, prontos para cada nova admissão."},
        ],
    },
    {
        id: "rh",
        label: "Recursos humanos",
        summary: "Da vaga aberta ao desenvolvimento de cada pessoa, sem planilha paralela.",
        items: [
            {title: "Recrutamento", description: "Requisição, vaga, candidaturas e proposta. Aceitou? Vira admissão."},
            {title: "Página de carreiras", description: "A página da sua empresa montada em blocos: benefícios, vagas, números e dúvidas."},
            {title: "Banco de talentos", description: "Quem não passou agora fica guardado para a próxima oportunidade."},
            {title: "Período de experiência", description: "Fila de avaliações de 45 e 90 dias, com aviso antes do prazo."},
            {title: "PDI", description: "Competências, trilhas e metas de desenvolvimento para cada colaborador."},
            {title: "Feedback", description: "Avaliações de desempenho registradas e fáceis de retomar."},
            {title: "Entrevista de desligamento", description: "Entenda o porquê de cada saída e acompanhe as devoluções."},
            {title: "Férias do time", description: "Quem está apto, quem pediu e o que já foi enviado ao DP."},
        ],
    },
    {
        id: "ponto",
        label: "Gestão de ponto",
        summary: "A jornada de cada pessoa acompanhada de perto, com os limites da CLT avisados antes de virar problema.",
        items: [
            {title: "Painel do dia", description: "Quem está trabalhando, quem atrasou, quem está em hora extra e quem está fora hoje."},
            {title: "Limites da CLT", description: "Mais de 10 horas no dia, intervalo curto e descanso menor que 11 horas, em números que abrem a lista."},
            {title: "Banco de horas", description: "Saldo de cada pessoa calculado pela escala, em verde quando sobra e em vermelho quando falta."},
            {title: "Espelho de ponto", description: "Aberto para ajustes ou fechado com as marcações travadas, com PDF pronto para assinar."},
            {title: "Pedidos de ajuste", description: "Fila de pendentes, aprovados e reprovados, com o motivo de cada decisão."},
            {title: "Registro com foto", description: "Pelo celular ou pela página da empresa, com código do colaborador, foto e localização."},
            {title: "Avisos que previnem", description: "O colaborador é avisado perto de 10 horas e de 6 horas sem pausa, antes da infração."},
            {title: "Agenda de ausências", description: "Férias, afastamentos e faltas do mês em um calendário, sem cadastro duplicado."},
        ],
    },
    {
        id: "gestao",
        label: "Gestão e controle",
        summary: "O que dá segurança para quem administra: acessos, histórico e informação na hora certa.",
        items: [
            {title: "Perfis e permissões", description: "Defina quais menus e quais ações cada perfil pode usar."},
            {title: "Trilha de auditoria", description: "Quem alterou o quê e quando, em um registro que não se edita."},
            {title: "Importação por Excel", description: "Planilhas-modelo para trazer departamentos, cargos e admissões de uma vez."},
            {title: "Relatórios em PDF", description: "Colaboradores, movimentações, afastamentos e indicadores prontos para imprimir."},
            {title: "Várias filiais", description: "Troque de filial pela barra superior; cada uma com os seus dados."},
            {title: "Certificado digital", description: "Certificado A1 por empresa, para os eventos do eSocial."},
            {title: "Agenda e notificações", description: "Prazos e lembretes no sino, do jeito que cada pessoa preferir."},
            {title: "Abas, busca e tema", description: "Várias telas abertas, busca no menu e modo claro ou escuro."},
        ],
    },
];

export function Features() {
    return (
        <section id="recursos" className="scroll-mt-24">
            <Container>
                <div className="pt-16 pb-16 md:pt-[66px] md:pb-[90px]">
                    <Reveal>
                        <SectionHeader
                            eyebrow="TUDO O QUE SUA ROTINA PEDE"
                            title={
                                <>
                                    Cada módulo no seu lugar.
                                    <br/>
                                    Todos falando a mesma língua.
                                </>
                            }
                            aside={
                                <>
                                    Um mesmo cadastro de pessoas
                                    <Br/> para o DP, o RH, o ponto e a gestão.
                                </>
                            }
                        />
                    </Reveal>
                    <Reveal delay={0.1} className="mt-10 lg:mt-[60px]">
                        <FeatureTabs tabs={tabs}/>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
