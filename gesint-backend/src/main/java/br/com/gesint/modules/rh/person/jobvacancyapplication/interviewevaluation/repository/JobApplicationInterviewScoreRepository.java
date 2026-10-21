package br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewScore;

@Repository
public interface JobApplicationInterviewScoreRepository
        extends IBaseRepository<JobApplicationInterviewScore> {

    List<JobApplicationInterviewScore> findByEvaluationIdAndStatusNot(UUID evaluationId, StatusEnum status);

    List<JobApplicationInterviewScore> findByEvaluationIdInAndStatusNot(
            Collection<UUID> evaluationIds, StatusEnum status);
}
