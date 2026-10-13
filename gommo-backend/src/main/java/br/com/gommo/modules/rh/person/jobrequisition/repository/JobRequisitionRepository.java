package br.com.gommo.modules.rh.person.jobrequisition.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisition;

@Repository
public interface JobRequisitionRepository extends IBaseRepository<JobRequisition> {
    boolean existsByOffboardingIdAndStatusNot(UUID offboardingId, StatusEnum status);

    java.util.Optional<JobRequisition> findFirstByJobVacancyIdAndStatusNotOrderByCreatedAtDesc(
            UUID jobVacancyId, StatusEnum status);
}
