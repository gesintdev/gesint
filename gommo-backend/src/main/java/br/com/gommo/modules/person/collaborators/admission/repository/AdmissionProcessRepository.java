package br.com.gommo.modules.person.collaborators.admission.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmissionProcessRepository extends IBaseRepository<AdmissionProcess> {

    Optional<AdmissionProcess> findByCpfAndStatusNot(String cpf, StatusEnum status);

    Optional<AdmissionProcess> findByCpfAndStatusNotAndIdNot(String cpf, StatusEnum status, UUID id);

    @Query(
            """
            SELECT DISTINCT a.collaboratorId FROM AdmissionProcess a
            WHERE a.admissionStatus = :completed
            AND a.collaboratorId IS NOT NULL
            AND a.status <> :deleted
            """)
    List<UUID> findCollaboratorIdsFromCompletedAdmissions(
            @Param("completed") AdmissionStatusEnum completed, @Param("deleted") StatusEnum deleted);
}
