package br.com.gommo.modules.rh.person.collaborators.admission.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;

@Repository
public interface AdmissionProcessRepository extends IBaseRepository<AdmissionProcess> {

    Optional<AdmissionProcess> findByCpfAndStatusNot(String cpf, StatusEnum status);

    Optional<AdmissionProcess> findByCpfAndStatusNotAndIdNot(String cpf, StatusEnum status, UUID id);

    Optional<AdmissionProcess> findByCollaboratorIdAndStatusNot(UUID collaboratorId, StatusEnum status);

    List<AdmissionProcess> findByCollaboratorIdAndAdmissionStatusAndStatusNot(
            UUID collaboratorId, AdmissionStatusEnum admissionStatus, StatusEnum status);

    @Query(
            """
            SELECT DISTINCT a.collaboratorId FROM AdmissionProcess a
            WHERE a.admissionStatus = :completed
            AND a.collaboratorId IS NOT NULL
            AND a.status <> :deleted
            """)
    List<UUID> findCollaboratorIdsFromCompletedAdmissions(
            @Param("completed") AdmissionStatusEnum completed, @Param("deleted") StatusEnum deleted);

    List<AdmissionProcess> findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(
            AdmissionStatusEnum admissionStatus, StatusEnum status);

    @Query(
            """
            SELECT a FROM AdmissionProcess a
            WHERE a.status <> :deleted
              AND a.admissionStatus <> :cancelled
              AND (
                   LOWER(FUNCTION('unaccent', a.fullName)) LIKE LOWER(FUNCTION('unaccent', :pattern))
                OR (a.socialName IS NOT NULL AND LOWER(FUNCTION('unaccent', a.socialName)) LIKE LOWER(FUNCTION('unaccent', :pattern)))
                OR LOWER(a.cpf) LIKE LOWER(:pattern)
              )
            ORDER BY a.fullName ASC
            """)
    List<AdmissionProcess> searchForGlobal(
            @Param("deleted") StatusEnum deleted,
            @Param("cancelled") AdmissionStatusEnum cancelled,
            @Param("pattern") String pattern,
            Pageable pageable);
}
