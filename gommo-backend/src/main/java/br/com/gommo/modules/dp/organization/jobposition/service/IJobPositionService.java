package br.com.gommo.modules.dp.organization.jobposition.service;

import java.util.UUID;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionResponseDto;

public interface IJobPositionService extends IBaseService<JobPositionRequestDto, JobPositionResponseDto> {

    PageableResponseDto<JobPositionResponseDto> search(
            int page, int size, String title, String cboCode, UUID departmentId);
}
