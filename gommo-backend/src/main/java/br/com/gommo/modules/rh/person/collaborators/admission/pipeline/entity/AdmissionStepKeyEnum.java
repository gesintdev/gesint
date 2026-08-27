package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity;

/**
 * As seis etapas da esteira, na ordem em que sao exibidas.
 *
 * <p>Nao confundir com os seis passos de {@code AdmissionProgressEvaluator}: aqueles sao as secoes
 * do formulario de cadastro. A coincidencia numerica e acidental.
 */
public enum AdmissionStepKeyEnum {
    DOCUMENTACAO(1, "Documentos"),
    EXAME(2, "ASO"),
    CONTRATO(3, "Contrato"),
    REGISTRO(4, "Registro"),
    ESOCIAL(5, "S-2200"),
    INTEGRACAO(6, "Integracao");

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
