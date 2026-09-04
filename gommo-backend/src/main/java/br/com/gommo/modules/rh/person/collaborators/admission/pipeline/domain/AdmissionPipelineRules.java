package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.domain;

import java.time.LocalDate;
import java.util.Set;

import br.com.gommo.core.util.BrazilianBusinessCalendar;

/**
 * Prazos legais da esteira de admissao.
 *
 * <p>Leitura tecnica da especificacao funcional de 24 ago 2026, nao parecer juridico. As normas
 * citadas sao revisadas com frequencia e a numeracao de itens muda; conferir contra a redacao
 * vigente antes de tratar como regra dura.
 */
public final class AdmissionPipelineRules {

    /** CLT art. 29: anotacao do registro em cinco dias uteis contados da admissao. */
    public static final int REGISTRO_BUSINESS_DAYS = 5;

    /** Janela do KPI "Impedidos de iniciar". */
    public static final int STARTING_SOON_DAYS = 15;

    /** Janela do KPI "Vence em 7 dias" e do painel de prazos. */
    public static final int DUE_SOON_DAYS = 7;

    /** Horizonte do painel lateral de prazos legais. */
    public static final int DEADLINE_PANEL_DAYS = 30;

    /**
     * Documentos que fecham a etapa 1, espelhando o catalogo ja usado no formulario de admissao
     * (OUTRO fica de fora por nao ser exigivel). Vira checklist configuravel por tenant quando o
     * modelo do Checklist de devolucoes for estendido a admissao.
     */
    public static final Set<String> REQUIRED_DOCUMENT_TYPES = Set.of(
            "RG",
            "CPF",
            "COMPROVANTE_ENDERECO",
            "CTPS",
            "TITULO_ELEITOR",
            "CERTIDAO_NASCIMENTO",
            "COMPROVANTE_ESCOLARIDADE");

    private AdmissionPipelineRules() {}

    /** NR-7: o exame admissional precisa estar apto antes do inicio das atividades. */
    public static LocalDate examDueDate(LocalDate expectedStartDate) {
        return expectedStartDate == null ? null : expectedStartDate.minusDays(1);
    }

    /** eSocial S-2200: ate o dia imediatamente anterior ao inicio da prestacao de servico. */
    public static LocalDate esocialDueDate(LocalDate expectedStartDate) {
        return expectedStartDate == null ? null : expectedStartDate.minusDays(1);
    }

    /**
     * A transmissao S-2200 ainda nao existe no produto. Enquanto nao houver evento gerado pela
     * integracao, a esteira nao cobra prazo nem bloqueia a admissão por atraso de eSocial.
     */
    public static boolean isEsocialS2200Enforced(boolean hasEsocialEvent) {
        return hasEsocialEvent;
    }

    public static LocalDate registrationDueDate(LocalDate expectedStartDate) {
        return expectedStartDate == null
                ? null
                : BrazilianBusinessCalendar.addBusinessDays(expectedStartDate, REGISTRO_BUSINESS_DAYS);
    }

    public static boolean isOverdue(LocalDate dueDate, LocalDate today) {
        return dueDate != null && dueDate.isBefore(today);
    }

    public static boolean isDueWithin(LocalDate dueDate, LocalDate today, int days) {
        return dueDate != null && !dueDate.isBefore(today) && !dueDate.isAfter(today.plusDays(days));
    }

    public static boolean isStartingWithin(LocalDate expectedStartDate, LocalDate today, int days) {
        return expectedStartDate != null
                && !expectedStartDate.isBefore(today)
                && !expectedStartDate.isAfter(today.plusDays(days));
    }
}
