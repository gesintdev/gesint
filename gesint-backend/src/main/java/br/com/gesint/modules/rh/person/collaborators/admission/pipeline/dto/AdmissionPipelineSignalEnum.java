package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

/** Sinal dominante da linha na esteira. Define o destaque e a ordem por urgencia. */
public enum AdmissionPipelineSignalEnum {
    PRAZO_VENCIDO,
    BLOQUEIO,
    AGUARDANDO_PESSOA,
    EM_DIA,
    PRONTO,
    /** Aprovada manualmente na esteira, ainda podendo ter etapas pendentes. */
    APROVADA
}
