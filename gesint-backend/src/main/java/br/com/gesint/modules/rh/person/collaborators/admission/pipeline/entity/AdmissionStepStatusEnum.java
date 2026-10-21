package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity;

public enum AdmissionStepStatusEnum {
    PENDING,
    IN_PROGRESS,
    /** Aguardando condicao externa: resultado de exame, assinatura, retorno do governo. */
    BLOCKED,
    DONE,
    /** Nao aplicavel a este vinculo. Exige justificativa registrada. */
    SKIPPED
}
