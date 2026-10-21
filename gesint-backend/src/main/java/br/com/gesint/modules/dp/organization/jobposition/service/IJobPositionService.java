package br.com.gesint.modules.dp.organization.jobposition.service;

import java.util.UUID;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gesint.modules.dp.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;

public interface IJobPositionService extends IBaseService<JobPositionRequestDto, JobPositionResponseDto> {

    PageableResponseDto<JobPositionResponseDto> search(
            int page, int size, String title, String cboCode, UUID departmentId, JobPositionNatureEnum nature);
}
