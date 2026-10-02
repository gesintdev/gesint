package br.com.gommo.modules.rh.person.jobvacancyapplication.entity;

/**
 * Motivos padronizados de reprovacao (RN-35). Sempre ligados a requisito da vaga ou ao andamento do processo,
 * nunca a atributo pessoal. Provisorio: sera substituido por cadastro proprio.
 */
public enum JobVacancyApplicationRejectionReasonEnum {
    REQUIRED_EXPERIENCE("Não atende à experiência exigida", true, true),
    REQUIRED_EDUCATION("Não atende à formação exigida", true, true),
    TECHNICAL_SKILLS("Não atende às competências técnicas exigidas", true, true),
    CERTIFICATION_LICENSE("Não possui certificação ou registro obrigatório", true, true),
    ASSESSMENT_PERFORMANCE("Resultado insuficiente em teste ou avaliação técnica", true, true),
    SCHEDULE_LOCATION("Incompatível com jornada, local ou disponibilidade exigidos", true, true),
    MORE_ALIGNED_CANDIDATE("Outro candidato mais aderente aos requisitos", true, true),
    SALARY_MISALIGNMENT("Pretensão salarial acima da faixa da vaga", false, true),
    INCOMPLETE_APPLICATION("Candidatura incompleta ou documentação pendente", false, true),
    NO_SHOW("Não compareceu à entrevista ou etapa agendada", false, true),
    UNREACHABLE("Sem retorno após tentativas de contato", false, true),
    POSITION_CLOSED("Vaga encerrada, preenchida ou suspensa", false, true),
    CANDIDATE_WITHDREW("Candidato desistiu do processo", false, false),
    OFFER_DECLINED("Candidato recusou a proposta", false, false),
    INCONSISTENT_INFORMATION("Informações inconsistentes na candidatura", false, false);

    private final String label;
    private final boolean requiresRequirement;
    private final boolean defaultSendFeedback;

    JobVacancyApplicationRejectionReasonEnum(String label, boolean requiresRequirement, boolean defaultSendFeedback) {
        this.label = label;
        this.requiresRequirement = requiresRequirement;
        this.defaultSendFeedback = defaultSendFeedback;
    }

    public String getLabel() {
        return label;
    }

    public boolean isRequiresRequirement() {
        return requiresRequirement;
    }

    public boolean isDefaultSendFeedback() {
        return defaultSendFeedback;
    }
}
