package br.com.gesint.modules.rh.person.jobvacancy.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;

@Repository
public interface JobVacancyRepository extends IBaseRepository<JobVacancy> {
    Optional<JobVacancy> findBySlugAndStatusNot(String slug, StatusEnum status);

    Optional<JobVacancy> findBySlugAndStatusNotAndIdNot(String slug, StatusEnum status, UUID id);

    Optional<JobVacancy> findBySlugAndIsPublicTrueAndStatus(String slug, StatusEnum status);

    List<JobVacancy> findAllByIsPublicTrueAndStatusOrderByPublishedAtDesc(StatusEnum status);
}
