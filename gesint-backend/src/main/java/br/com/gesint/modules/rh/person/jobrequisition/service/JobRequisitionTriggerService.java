package br.com.gesint.modules.rh.person.jobrequisition.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.Offboarding;
import br.com.gesint.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gesint.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gesint.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisition;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionStatusEnum;
import br.com.gesint.modules.rh.person.jobrequisition.repository.JobRequisitionRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;

/**
 * Evento "posicao vaga" do desligamento (RN-21): abre a requisicao de substituicao em rascunho,
 * ja preenchida com cargo, vinculo e salario do contrato encerrado.
 */
@Service
public class JobRequisitionTriggerService {
    private final JobRequisitionRepository repository;
    private final EmploymentContractRepository employmentContractRepository;
    private final JobRequisitionSnapshotResolver snapshotResolver;

    public JobRequisitionTriggerService(
            JobRequisitionRepository repository,
            EmploymentContractRepository employmentContractRepository,
            JobRequisitionSnapshotResolver snapshotResolver) {
        this.repository = repository;
        this.employmentContractRepository = employmentContractRepository;
        this.snapshotResolver = snapshotResolver;
    }

    @Transactional
    public Optional<JobRequisition> onTermination(Offboarding offboarding) {
        if (offboarding == null || offboarding.getId() == null || offboarding.getCollaboratorId() == null) {
            return Optional.empty();
        }
        if (repository.existsByOffboardingIdAndStatusNot(offboarding.getId(), StatusEnum.DELETED)) {
            return Optional.empty();
        }
        EmploymentContract contract = employmentContractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                        offboarding.getCollaboratorId(), StatusEnum.DELETED)
                .orElse(null);
        if (contract == null || contract.getJobPositionId() == null) {
            return Optional.empty();
        }

        JobRequisition requisition = JobRequisition.builder()
                .jobPositionId(contract.getJobPositionId())
                .contractType(toVacancyContractType(contract.getContractType()))
                .positionsCount(1)
                .reason(JobRequisitionReasonEnum.REPLACEMENT)
                .offboardingId(offboarding.getId())
                .proposedSalary(contract.getBaseSalary())
                .salaryLevel(snapshotResolver
                        .inferLevel(contract.getJobPositionId(), contract.getBaseSalary())
                        .orElse(null))
                .requisitionStatus(JobRequisitionStatusEnum.DRAFT)
                .build();
        requisition.setStatus(StatusEnum.ACTIVE);
        requisition.setCompanyId(offboarding.getCompanyId());
        snapshotResolver.apply(requisition);
        return Optional.of(repository.save(requisition));
    }

    private static JobVacancyContractTypeEnum toVacancyContractType(ContractTypeEnum contractType) {
        if (contractType == null) {
            return null;
        }
        return switch (contractType) {
            case PJ -> JobVacancyContractTypeEnum.PJ;
            case INTERN -> JobVacancyContractTypeEnum.ESTAGIO;
            case CLT, INTERMITTENT, APPRENTICE -> JobVacancyContractTypeEnum.CLT;
        };
    }
}
