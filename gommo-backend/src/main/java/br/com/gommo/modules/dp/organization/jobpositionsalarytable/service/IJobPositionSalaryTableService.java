package br.com.gommo.modules.dp.organization.jobpositionsalarytable.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableRequestDto;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableResponseDto;

public interface IJobPositionSalaryTableService
        extends IBaseService<JobPositionSalaryTableRequestDto, JobPositionSalaryTableResponseDto> {

    List<JobPositionSalaryTableResponseDto> findByJobPositionId(UUID jobPositionId);

    Optional<JobPositionSalaryTableResponseDto> findCurrentByJobPositionId(UUID jobPositionId);
}
