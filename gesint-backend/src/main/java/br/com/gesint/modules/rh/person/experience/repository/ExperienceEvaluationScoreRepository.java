package br.com.gesint.modules.rh.person.experience.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperienceEvaluationScore;

@Repository
public interface ExperienceEvaluationScoreRepository extends IBaseRepository<ExperienceEvaluationScore> {

    List<ExperienceEvaluationScore> findByEvaluationIdAndStatusNot(UUID evaluationId, StatusEnum status);
}
