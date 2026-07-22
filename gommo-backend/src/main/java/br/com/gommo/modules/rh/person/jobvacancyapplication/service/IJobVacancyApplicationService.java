package br.com.gommo.modules.rh.person.jobvacancyapplication.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;

public interface IJobVacancyApplicationService
        extends IBaseService<JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto> {
    List<JobVacancyApplicationResponseDto> findByJobVacancyId(UUID jobVacancyId);

    List<JobVacancyApplicationResponseDto> startAdmissionProcess(UUID jobVacancyId);

    JobVacancyApplicationResponseDto updateKanbanColumn(
            UUID id, JobVacancyApplicationKanbanColumnRequestDto request);

    JobVacancyApplicationResponseDto upsertStageComment(
            UUID id, JobVacancyApplicationStageCommentRequestDto request);
}
