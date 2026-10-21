package br.com.gesint.modules.rh.person.jobvacancycompetency.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.jobvacancycompetency.entity.JobVacancyCompetency;

@Repository
public interface JobVacancyCompetencyRepository extends IBaseRepository<JobVacancyCompetency> {

    @Query(
            """
            SELECT e FROM JobVacancyCompetency e
            WHERE e.status <> :deletedStatus
              AND e.jobVacancyId = :jobVacancyId
            ORDER BY e.displayOrder ASC, e.createdAt ASC
            """)
    List<JobVacancyCompetency> findByJobVacancyIdOrdered(
            @Param("jobVacancyId") UUID jobVacancyId, @Param("deletedStatus") StatusEnum deletedStatus);

    Optional<JobVacancyCompetency> findByJobVacancyIdAndCompetencyIdAndStatusNot(
            UUID jobVacancyId, UUID competencyId, StatusEnum status);
}
