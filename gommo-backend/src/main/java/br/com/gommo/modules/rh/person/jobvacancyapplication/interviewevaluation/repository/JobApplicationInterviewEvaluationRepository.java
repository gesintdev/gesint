package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewEvaluationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewEvaluation;

@Repository
public interface JobApplicationInterviewEvaluationRepository
        extends IBaseRepository<JobApplicationInterviewEvaluation> {

    List<JobApplicationInterviewEvaluation> findByJobVacancyApplicationIdAndStatusNot(
            UUID jobVacancyApplicationId, StatusEnum status);

    List<JobApplicationInterviewEvaluation> findByJobVacancyApplicationIdAndColumnKeyAndStatusNot(
            UUID jobVacancyApplicationId, String columnKey, StatusEnum status);

    Optional<JobApplicationInterviewEvaluation>
            findByJobVacancyApplicationIdAndColumnKeyAndEvaluatorUserIdAndStatusNot(
                    UUID jobVacancyApplicationId,
                    String columnKey,
                    UUID evaluatorUserId,
                    StatusEnum status);

    List<JobApplicationInterviewEvaluation>
            findByJobVacancyApplicationIdInAndEvaluationStatusAndStatusNot(
                    Collection<UUID> applicationIds,
                    InterviewEvaluationStatusEnum evaluationStatus,
                    StatusEnum status);
}
