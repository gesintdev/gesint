package br.com.gommo.modules.rh.person.jobvacancyapplication.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;

public interface JobVacancyApplicationRepository extends IBaseRepository<JobVacancyApplication> {
    List<JobVacancyApplication> findByJobVacancyIdAndStatusNotOrderByAppliedAtDesc(
            UUID jobVacancyId, StatusEnum status);

    Optional<JobVacancyApplication> findByJobVacancyIdAndCandidateIdAndStatusNot(
            UUID jobVacancyId, UUID candidateId, StatusEnum status);

    long countByJobVacancyIdAndStatusNot(UUID jobVacancyId, StatusEnum status);

    @Query(
            """
            SELECT a.jobVacancyId, COUNT(a)
            FROM JobVacancyApplication a
            WHERE a.status <> :deleted
            GROUP BY a.jobVacancyId
            """)
    List<Object[]> countActiveGroupedByJobVacancyId(@Param("deleted") StatusEnum deleted);
}
