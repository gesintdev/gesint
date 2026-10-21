package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.pipeline.entity.EsocialEvent;

@Repository
public interface EsocialEventRepository extends IBaseRepository<EsocialEvent> {

    List<EsocialEvent> findByAdmissionIdInAndStatusNot(List<UUID> admissionIds, StatusEnum status);

    @Query(
            value =
                    """
                    SELECT * FROM esocial_event
                    WHERE admission_id IN (:admissionIds) AND status <> 'DELETED'
                    """,
            nativeQuery = true)
    List<EsocialEvent> findActiveByAdmissionIdInUnscoped(@Param("admissionIds") Collection<UUID> admissionIds);
}
