package br.com.gesint.modules.rh.person.jobvacancycompetency.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyRequestDto;
import br.com.gesint.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyResponseDto;

public interface IJobVacancyCompetencyService
        extends IBaseService<JobVacancyCompetencyRequestDto, JobVacancyCompetencyResponseDto> {

    List<JobVacancyCompetencyResponseDto> findByJobVacancyId(UUID jobVacancyId);
}
