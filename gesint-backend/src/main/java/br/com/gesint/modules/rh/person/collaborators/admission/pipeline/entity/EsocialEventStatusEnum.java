package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity;

/**
 * NAO_GERADO -> GERADO -> TRANSMITIDO -> ACEITO, com REJEITADO retornando a TRANSMITIDO apos
 * correcao. Rejeitado nao e falha terminal: e retorno com lista de erros.
 */
public enum EsocialEventStatusEnum {
    NAO_GERADO,
    GERADO,
    TRANSMITIDO,
    ACEITO,
    REJEITADO
}
