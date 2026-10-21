package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

/** Motivos que impedem o inicio. Sao os unicos que produzem card no painel de bloqueios. */
public enum AdmissionPipelineBlockReasonEnum {
    SEM_ASO_APTO,
    INICIO_ULTRAPASSADO,
    ESOCIAL_REJEITADO
}
