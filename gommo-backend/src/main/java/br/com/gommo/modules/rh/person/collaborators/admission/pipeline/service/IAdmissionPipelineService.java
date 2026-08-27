package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineRowDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineSummaryDto;

public interface IAdmissionPipelineService {

    AdmissionPipelineSummaryDto summary();

    PageableResponseDto<AdmissionPipelineRowDto> findPage(int page, int size);

    /** Cria as seis etapas de uma admissao recem-criada, se ainda nao existirem. */
    void ensureSteps(java.util.UUID admissionId);
}
