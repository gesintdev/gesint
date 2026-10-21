package br.com.gesint.modules.rh.person.jobrequisition.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.Offboarding;
import br.com.gesint.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTable;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTableItem;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.repository.JobPositionSalaryTableRepository;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisition;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gesint.modules.rh.person.jobrequisition.exception.JobRequisitionException;

/**
 * Dados copiados para a requisicao no momento da gravacao: titulo do cargo, quem esta sendo
 * substituido e a faixa vigente do cargo/nivel (RN-12). A alcada e decidida sobre essa copia.
 */
@Component
public class JobRequisitionSnapshotResolver {
    private final JobPositionRepository jobPositionRepository;
    private final JobPositionSalaryTableRepository salaryTableRepository;
    private final OffboardingRepository offboardingRepository;
    private final CollaboratorRepository collaboratorRepository;

    public JobRequisitionSnapshotResolver(
            JobPositionRepository jobPositionRepository,
            JobPositionSalaryTableRepository salaryTableRepository,
            OffboardingRepository offboardingRepository,
            CollaboratorRepository collaboratorRepository) {
        this.jobPositionRepository = jobPositionRepository;
        this.salaryTableRepository = salaryTableRepository;
        this.offboardingRepository = offboardingRepository;
        this.collaboratorRepository = collaboratorRepository;
    }

    public void apply(JobRequisition entity) {
        applyJobPosition(entity);
        applyReplacement(entity);
        applySalaryBand(entity);
    }

    public Optional<JobPositionSalaryLevelEnum> inferLevel(UUID jobPositionId, BigDecimal salary) {
        if (jobPositionId == null || salary == null) {
            return Optional.empty();
        }
        return currentBandItems(jobPositionId).stream()
                .filter(item -> salary.compareTo(item.getMinSalary()) >= 0
                        && salary.compareTo(item.getMaxSalary()) <= 0)
                .map(JobPositionSalaryTableItem::getLevel)
                .findFirst();
    }

    private void applyJobPosition(JobRequisition entity) {
        JobPosition jobPosition = jobPositionRepository
                .findByIdAndStatusNot(entity.getJobPositionId(), StatusEnum.DELETED)
                .orElseThrow(JobRequisitionException::jobPositionNotFound);
        entity.setJobPositionTitle(jobPosition.getTitle());
    }

    private void applyReplacement(JobRequisition entity) {
        if (entity.getReason() != JobRequisitionReasonEnum.REPLACEMENT || entity.getOffboardingId() == null) {
            entity.setOffboardingId(null);
            entity.setReplacedCollaboratorId(null);
            entity.setReplacedCollaboratorName(null);
            entity.setReplacedDismissalDate(null);
            entity.setReplacedDismissalType(null);
            return;
        }
        Offboarding offboarding = offboardingRepository
                .findByIdAndStatusNot(entity.getOffboardingId(), StatusEnum.DELETED)
                .orElseThrow(JobRequisitionException::offboardingNotFound);
        entity.setReplacedCollaboratorId(offboarding.getCollaboratorId());
        entity.setReplacedCollaboratorName(collaboratorRepository
                .findById(offboarding.getCollaboratorId())
                .map(collaborator -> collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                        ? collaborator.getSocialName()
                        : collaborator.getFullName())
                .orElse(null));
        entity.setReplacedDismissalDate(offboarding.getDismissalDate());
        entity.setReplacedDismissalType(offboarding.getDismissalType());
    }

    private void applySalaryBand(JobRequisition entity) {
        JobPositionSalaryTableItem band = entity.getSalaryLevel() == null
                ? null
                : currentBandItems(entity.getJobPositionId()).stream()
                        .filter(item -> item.getLevel() == entity.getSalaryLevel())
                        .findFirst()
                        .orElse(null);
        entity.setBandMinSalary(band != null ? band.getMinSalary() : null);
        entity.setBandReferenceSalary(band != null ? band.getReferenceSalary() : null);
        entity.setBandMaxSalary(band != null ? band.getMaxSalary() : null);
        BigDecimal proposed = entity.getProposedSalary();
        entity.setOutOfBand(band != null
                && proposed != null
                && (proposed.compareTo(band.getMinSalary()) < 0 || proposed.compareTo(band.getMaxSalary()) > 0));
    }

    private List<JobPositionSalaryTableItem> currentBandItems(UUID jobPositionId) {
        return salaryTableRepository
                .findCurrentByJobPositionIdWithItems(jobPositionId, StatusEnum.DELETED)
                .stream()
                .findFirst()
                .map(JobPositionSalaryTable::getItems)
                .orElse(List.of());
    }
}
