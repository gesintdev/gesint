package br.com.gommo.modules.rh.person.jobrequisition.service;

import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionRejectRequestDto;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionRequestDto;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionResponseDto;

public interface IJobRequisitionService extends IBaseService<JobRequisitionRequestDto, JobRequisitionResponseDto> {
    JobRequisitionResponseDto submitForApproval(UUID id);

    JobRequisitionResponseDto approve(UUID id);

    JobRequisitionResponseDto reject(UUID id, JobRequisitionRejectRequestDto request);

    JobRequisitionResponseDto cancel(UUID id);
}
