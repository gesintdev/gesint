package br.com.gesint.modules.rh.person.jobvacancyapplication.entity;

/**
 * Motivos padronizados de encerramento da candidatura (RN-35). Lista fixa do sistema; o campo
 * {@code rejectionRequirement} vem dos requisitos/competencias da vaga quando {@link #requiresRequirement}.
 */
public enum JobVacancyApplicationRejectionReasonEnum {
    REQUIREMENT_NOT_MET("Não atende requisito", true, true),
    ASSESSMENT_BELOW_MINIMUM("Avaliação abaixo do mínimo", false, true),
    MORE_ALIGNED_CANDIDATE("Outro candidato mais aderente", false, true),
    INCOMPATIBLE_CONDITIONS("Condições incompatíveis", false, true),
    CANDIDATE_WITHDREW("Candidato desistiu", false, false),
    NO_SHOW("Não compareceu", false, true),
    VACANCY_CANCELLED("Vaga cancelada", false, false);

    public static final int MINIMUM_COMPATIBILITY_SCORE = 80;

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
