package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewScore;

@Repository
public interface JobApplicationInterviewScoreRepository
        extends IBaseRepository<JobApplicationInterviewScore> {

    List<JobApplicationInterviewScore> findByEvaluationIdAndStatusNot(UUID evaluationId, StatusEnum status);

    List<JobApplicationInterviewScore> findByEvaluationIdInAndStatusNot(
            Collection<UUID> evaluationIds, StatusEnum status);
}
