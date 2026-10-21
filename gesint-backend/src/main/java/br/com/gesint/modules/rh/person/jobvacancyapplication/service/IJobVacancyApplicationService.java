package br.com.gesint.modules.rh.person.jobvacancyapplication.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectionReasonDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;

public interface IJobVacancyApplicationService
        extends IBaseService<JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto> {
    List<JobVacancyApplicationResponseDto> findByJobVacancyId(UUID jobVacancyId);

    List<JobVacancyApplicationResponseDto> startAdmissionProcess(UUID jobVacancyId);

    JobVacancyApplicationResponseDto updateKanbanColumn(
            UUID id, JobVacancyApplicationKanbanColumnRequestDto request);

    JobVacancyApplicationResponseDto upsertStageComment(
            UUID id, JobVacancyApplicationStageCommentRequestDto request);

    JobVacancyApplicationResponseDto reanalyze(UUID id);

    List<JobVacancyApplicationRejectionReasonDto> listRejectionReasons();

    JobVacancyApplicationResponseDto reject(UUID id, JobVacancyApplicationRejectRequestDto request);
}
