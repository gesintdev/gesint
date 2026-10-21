package br.com.gesint.modules.rh.person.candidate.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.candidate.entity.CandidateExperience;

@Repository
public interface CandidateExperienceRepository extends IBaseRepository<CandidateExperience> {
    List<CandidateExperience> findByCandidateIdAndStatusNotOrderByStartDateDesc(
            UUID candidateId, StatusEnum status);
}
