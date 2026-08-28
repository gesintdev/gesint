package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStep;

@Repository
public interface AdmissionStepRepository extends IBaseRepository<AdmissionStep> {

    List<AdmissionStep> findByAdmissionIdAndStatusNotOrderByDisplayOrderAsc(UUID admissionId, StatusEnum status);

    List<AdmissionStep> findByAdmissionIdInAndStatusNot(List<UUID> admissionIds, StatusEnum status);

  /**
   * Etapas sao filhas da admissao: busca por {@code admission_id} sem o filtro Hibernate de filial.
   * Sem isso, linhas com {@code company_id} nulo (backfill antigo) somem com o filtro ativo e o
   * servico tenta recriar as seis etapas, violando {@code uk_admission_step_code}.
   */
    @Query(
            value =
                    """
                    SELECT * FROM admission_step
                    WHERE admission_id = :admissionId AND status <> 'DELETED'
                    ORDER BY display_order
                    """,
            nativeQuery = true)
    List<AdmissionStep> findActiveByAdmissionIdUnscoped(@Param("admissionId") UUID admissionId);

    @Query(
            value =
                    """
                    SELECT * FROM admission_step
                    WHERE admission_id IN (:admissionIds) AND status <> 'DELETED'
                    """,
            nativeQuery = true)
    List<AdmissionStep> findActiveByAdmissionIdInUnscoped(@Param("admissionIds") Collection<UUID> admissionIds);
}
