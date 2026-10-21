package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity;

/**
 * Etapas da esteira, na ordem em que sao exibidas (RN-38: Pre-admissao na frente).
 *
 * <p>Nao confundir com os passos de {@code AdmissionProgressEvaluator}: aqueles sao as secoes do
 * formulario de cadastro.
 */
public enum AdmissionStepKeyEnum {
    PRE_ADMISSAO(1, "Pre-admissao"),
    DOCUMENTACAO(2, "Documentos"),
    EXAME(3, "ASO"),
    CONTRATO(4, "Contrato"),
    REGISTRO(5, "Registro"),
    ESOCIAL(6, "S-2200"),
    INTEGRACAO(7, "Integracao");

    private final int displayOrder;
    private final String shortLabel;

    AdmissionStepKeyEnum(int displayOrder, String shortLabel) {
        this.displayOrder = displayOrder;
        this.shortLabel = shortLabel;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public String getShortLabel() {
        return shortLabel;
    }
}
