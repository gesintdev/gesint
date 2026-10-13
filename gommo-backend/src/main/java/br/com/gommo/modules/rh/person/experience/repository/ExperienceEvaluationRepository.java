package br.com.gommo.modules.rh.person.experience.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.experience.entity.ExperienceEvaluation;
import br.com.gommo.modules.rh.person.experience.entity.ExperiencePeriodStatusEnum;

@Repository
public interface ExperienceEvaluationRepository extends IBaseRepository<ExperienceEvaluation> {

    Optional<ExperienceEvaluation> findByAdmissionProcessIdAndStatusNot(
            UUID admissionProcessId, StatusEnum status);

    List<ExperienceEvaluation> findByPeriodStatusInAndStatusNotOrderByExperienceDueDateAsc(
            List<ExperiencePeriodStatusEnum> periodStatuses, StatusEnum status);

    long countByPeriodStatusInAndExperienceDueDateLessThanEqualAndStatusNot(
            List<ExperiencePeriodStatusEnum> periodStatuses, LocalDate dueDate, StatusEnum status);

    long countByPeriodStatusInAndStatusNot(List<ExperiencePeriodStatusEnum> periodStatuses, StatusEnum status);

    List<ExperienceEvaluation> findByPeriodStatusInAndExperienceDueDateLessThanAndStatusNot(
            List<ExperiencePeriodStatusEnum> periodStatuses, LocalDate dueDate, StatusEnum status);

    List<ExperienceEvaluation> findByPeriodStatusInAndExperienceDueDateLessThanEqualAndStatusNot(
            List<ExperiencePeriodStatusEnum> periodStatuses, LocalDate dueDate, StatusEnum status);
}
