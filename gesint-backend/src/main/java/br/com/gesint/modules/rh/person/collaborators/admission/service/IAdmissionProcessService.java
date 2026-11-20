package br.com.gesint.modules.rh.person.collaborators.admission.service;

import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;

public interface IAdmissionProcessService
        extends IBaseService<AdmissionProcessRequestDto, AdmissionProcessResponseDto> {

    /**
     * Quando o ASO admissional fica apto, promove a admissao se os parametros do cadastro
     * ja estiverem completos e emite o codigo de ponto.
     */
    void grantClockAccessAfterAdmissionalExam(UUID collaboratorId);

    /**
     * Depois que o ASO admissional sai do cadastro e nao resta outro registrado,
     * desfaz a aprovacao e devolve a admissao ao status de quem nao tem exame.
     */
    void revertAdmissionAfterAdmissionalExamRemoval(UUID collaboratorId);

    /**
     * Gera o codigo de ponto de uma admissao que ainda nao tem, inclusive cadastros antigos ou migrados.
     */
    String issueClockAccess(UUID admissionId);
}
