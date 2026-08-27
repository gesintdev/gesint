package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStep;

@Repository
public interface AdmissionStepRepository extends IBaseRepository<AdmissionStep> {

    List<AdmissionStep> findByAdmissionIdAndStatusNotOrderByDisplayOrderAsc(UUID admissionId, StatusEnum status);

    List<AdmissionStep> findByAdmissionIdInAndStatusNot(List<UUID> admissionIds, StatusEnum status);
}
