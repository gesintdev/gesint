package br.com.gesint.modules.rh.person.experience.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceDecideRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationResponseDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceScoresUpsertRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceSummaryDto;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodStatusEnum;

public interface IExperienceEvaluationService
        extends IBaseService<ExperienceEvaluationRequestDto, ExperienceEvaluationResponseDto> {

    ExperienceSummaryDto summary();

    List<ExperienceEvaluationResponseDto> listByBucket(String bucket);

    ExperienceEvaluationResponseDto getDetail(UUID id);

    ExperienceEvaluationResponseDto saveDraft(UUID id, ExperienceScoresUpsertRequestDto request);

    ExperienceEvaluationResponseDto submit(UUID id, ExperienceScoresUpsertRequestDto request);

    ExperienceEvaluationResponseDto decide(UUID id, ExperienceDecideRequestDto request);

    void syncFromAdmission(AdmissionProcess admission, ExperiencePeriodEnum period);

    void processDailyDueDates();

    List<ExperiencePeriodStatusEnum> openStatuses();
}
