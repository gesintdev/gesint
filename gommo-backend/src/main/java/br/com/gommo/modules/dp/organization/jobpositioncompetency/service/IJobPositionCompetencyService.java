package br.com.gommo.modules.dp.organization.jobpositioncompetency.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyRequestDto;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyResponseDto;

public interface IJobPositionCompetencyService
        extends IBaseService<JobPositionCompetencyRequestDto, JobPositionCompetencyResponseDto> {

    List<JobPositionCompetencyResponseDto> findByJobPositionId(UUID jobPositionId);
}
