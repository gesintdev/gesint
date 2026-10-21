package br.com.gesint.modules.dp.occupationalexam.exam.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gesint.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.domain.OccupationalExamComplianceRules;
import br.com.gesint.modules.dp.occupationalexam.exam.domain.OccupationalExamComplianceRules.DismissalWaiverDecision;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamSourceTriggerEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.entity.ExamRequirement;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.repository.ExamRequirementRepository;

/**
 * Gatilhos automaticos do modulo (Fase 2). Sem RBAC proprio: chamado por
 * services de admissao/afastamento/contrato/desligamento ja autorizados.
 */
@Service
public class OccupationalExamTriggerService {

    private static final Logger log = LoggerFactory.getLogger(OccupationalExamTriggerService.class);

    /** Grau de risco default quando o cargo ainda nao tem PGR/GHE formal. */
    private static final int DEFAULT_RISK_GRADE = 2;

    private final OccupationalExamRepository occupationalExamRepository;
    private final ExamRequirementRepository examRequirementRepository;
    private final EmploymentContractRepository employmentContractRepository;

    public OccupationalExamTriggerService(
            OccupationalExamRepository occupationalExamRepository,
            ExamRequirementRepository examRequirementRepository,
            EmploymentContractRepository employmentContractRepository) {
        this.occupationalExamRepository = occupationalExamRepository;
        this.examRequirementRepository = examRequirementRepository;
        this.employmentContractRepository = employmentContractRepository;
    }

    @Transactional
    public Optional<OccupationalExam> ensureAdmissionalPredicted(UUID collaboratorId, UUID jobPositionId) {
        if (collaboratorId == null || jobPositionId == null) {
            return Optional.empty();
        }
        if (hasOpenExam(collaboratorId, OccupationalExamTypeEnum.ADMISSIONAL)) {
            return Optional.empty();
        }
        return Optional.of(createPredicted(
                collaboratorId,
                jobPositionId,
                OccupationalExamTypeEnum.ADMISSIONAL,
                OccupationalExamSourceTriggerEnum.ADMISSION,
                null,
                LocalDate.now(),
                null));
    }

    @Transactional(readOnly = true)
    public boolean hasAdmissionalFit(UUID collaboratorId) {
        if (collaboratorId == null) {
            return false;
        }
        return occupationalExamRepository
                .findByCollaboratorIdAndExamTypeAndResultAndStatusNot(
                        collaboratorId,
                        OccupationalExamTypeEnum.ADMISSIONAL,
                        OccupationalExamResultEnum.FIT,
                        StatusEnum.DELETED)
                .stream()
                .anyMatch(exam -> exam.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.REGISTRADO
                        || exam.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.TRANSMITIDO
                        || exam.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.ARQUIVADO);
    }

    @Transactional
    public Optional<OccupationalExam> onLeaveValidated(LeaveRequest leave) {
        if (leave == null || leave.getCollaboratorId() == null) {
            return Optional.empty();
        }
        int duration = leave.getDurationDays() != null
                ? leave.getDurationDays()
                : (leave.getStartDate() != null && leave.getEndDate() != null
                        ? (int) (leave.getEndDate().toEpochDay()
                                        - leave.getStartDate().toEpochDay())
                                + 1
                        : 0);
        LeaveTypeEnum leaveType = leave.getLeaveType();
        if (!OccupationalExamComplianceRules.isReturnExamRequired(duration, leaveType)) {
            return Optional.empty();
        }
        if (hasOpenExam(leave.getCollaboratorId(), OccupationalExamTypeEnum.RETORNO_AO_TRABALHO)) {
            return Optional.empty();
        }
        UUID jobPositionId = resolveLatestJobPosition(leave.getCollaboratorId());
        if (jobPositionId == null) {
            log.warn("Retorno ao trabalho exigivel sem jobPosition para collaboratorId={}", leave.getCollaboratorId());
            return Optional.empty();
        }
        LocalDate dueDate = leave.getReturnDate() != null ? leave.getReturnDate() : leave.getEndDate();
        return Optional.of(createPredicted(
                leave.getCollaboratorId(),
                jobPositionId,
                OccupationalExamTypeEnum.RETORNO_AO_TRABALHO,
                OccupationalExamSourceTriggerEnum.LEAVE_RETURN,
                leave.getId(),
                dueDate,
                null));
    }

    @Transactional
    public Optional<OccupationalExam> onJobPositionChange(
            UUID collaboratorId, UUID sourceJobPositionId, UUID destinationJobPositionId, LocalDate effectiveDate) {
        if (collaboratorId == null
                || destinationJobPositionId == null
                || destinationJobPositionId.equals(sourceJobPositionId)) {
            return Optional.empty();
        }
        LocalDate reference = effectiveDate != null ? effectiveDate : LocalDate.now();
        Optional<ExamRequirement> destination = examRequirementRepository.findVigente(
                destinationJobPositionId, OccupationalExamTypeEnum.MUDANCA_DE_RISCO_OCUPACIONAL, reference);
        if (destination.isEmpty()) {
            destination = examRequirementRepository.findVigente(
                    destinationJobPositionId, OccupationalExamTypeEnum.PERIODICO, reference);
        }
        if (destination.isEmpty()) {
            return Optional.empty();
        }
        ExamRequirement destReq = destination.get();
        Set<String> covered = new HashSet<>();
        if (sourceJobPositionId != null) {
            examRequirementRepository
                    .findVigente(sourceJobPositionId, OccupationalExamTypeEnum.PERIODICO, reference)
                    .ifPresent(src -> {
                        if (src.getComplementaryProcedureCodes() != null) {
                            covered.addAll(src.getComplementaryProcedureCodes());
                        }
                    });
        }
        boolean requires = destReq.getComplementaryProcedureCodes() == null
                || destReq.getComplementaryProcedureCodes().isEmpty()
                || OccupationalExamComplianceRules.positionChangeRequiresExam(
                        destReq.getComplementaryProcedureCodes(), covered);
        if (!requires && destReq.getExamType() != OccupationalExamTypeEnum.MUDANCA_DE_RISCO_OCUPACIONAL) {
            return Optional.empty();
        }
        if (hasOpenExam(collaboratorId, OccupationalExamTypeEnum.MUDANCA_DE_RISCO_OCUPACIONAL)) {
            return Optional.empty();
        }
        LocalDate dueDate = reference.minusDays(1);
        if (dueDate.isBefore(LocalDate.now().minusDays(1))) {
            dueDate = LocalDate.now();
        }
        return Optional.of(createPredicted(
                collaboratorId,
                destinationJobPositionId,
                OccupationalExamTypeEnum.MUDANCA_DE_RISCO_OCUPACIONAL,
                OccupationalExamSourceTriggerEnum.POSITION_CHANGE,
                null,
                dueDate,
                destReq.getId()));
    }

    @Transactional
    public Optional<OccupationalExam> onTermination(
            UUID collaboratorId, UUID jobPositionId, LocalDate dismissalDate, int riskGrade) {
        if (collaboratorId == null || dismissalDate == null) {
            return Optional.empty();
        }
        UUID positionId = jobPositionId != null ? jobPositionId : resolveLatestJobPosition(collaboratorId);
        Optional<OccupationalExam> lastExam = occupationalExamRepository
                .findByCollaboratorIdAndStatusNotOrderByClinicalExamDateDesc(collaboratorId, StatusEnum.DELETED)
                .stream()
                .filter(exam -> exam.getClinicalExamDate() != null)
                .filter(exam -> exam.getResult() != null)
                .findFirst();
        LocalDate lastClinical =
                lastExam.map(OccupationalExam::getClinicalExamDate).orElse(null);
        int grade = riskGrade > 0 ? riskGrade : DEFAULT_RISK_GRADE;
        // Lista de agentes criticos e configuravel; default vazia ate parametro SST.
        boolean criticalExposure = false;
        DismissalWaiverDecision decision = OccupationalExamComplianceRules.evaluateDismissalWaiver(
                lastClinical, dismissalDate, grade, criticalExposure);

        if (decision.waived()) {
            OccupationalExam waiverRecord = OccupationalExam.builder()
                    .status(StatusEnum.ACTIVE)
                    .collaboratorId(collaboratorId)
                    .jobPositionId(
                            positionId != null
                                    ? positionId
                                    : lastExam.map(OccupationalExam::getJobPositionId)
                                            .orElse(null))
                    .examType(OccupationalExamTypeEnum.DEMISSIONAL)
                    .lifecycleStatus(OccupationalExamLifecycleStatusEnum.ARQUIVADO)
                    .sourceTrigger(OccupationalExamSourceTriggerEnum.TERMINATION)
                    .dismissalWaiverApplied(true)
                    .dismissalWaiverReason(decision.reason())
                    .dueDate(OccupationalExamComplianceRules.dismissalExamDueDate(dismissalDate))
                    .build();
            if (waiverRecord.getJobPositionId() == null) {
                log.warn("Dispensa demissional sem jobPosition collaboratorId={}", collaboratorId);
                return Optional.empty();
            }
            return Optional.of(occupationalExamRepository.save(waiverRecord));
        }

        if (positionId == null) {
            log.warn("Demissional exigivel sem jobPosition collaboratorId={}", collaboratorId);
            return Optional.empty();
        }
        if (hasOpenExam(collaboratorId, OccupationalExamTypeEnum.DEMISSIONAL)) {
            return Optional.empty();
        }
        OccupationalExam exam = createPredicted(
                collaboratorId,
                positionId,
                OccupationalExamTypeEnum.DEMISSIONAL,
                OccupationalExamSourceTriggerEnum.TERMINATION,
                null,
                OccupationalExamComplianceRules.dismissalExamDueDate(dismissalDate),
                null);
        exam.setDismissalWaiverApplied(false);
        exam.setDismissalWaiverReason(decision.reason());
        return Optional.of(occupationalExamRepository.save(exam));
    }

    @Transactional
    public int markOverdueInadimplente(LocalDate referenceDate) {
        LocalDate ref = referenceDate != null ? referenceDate : LocalDate.now();
        List<OccupationalExamLifecycleStatusEnum> closed = List.of(
                OccupationalExamLifecycleStatusEnum.REGISTRADO,
                OccupationalExamLifecycleStatusEnum.TRANSMITIDO,
                OccupationalExamLifecycleStatusEnum.ARQUIVADO,
                OccupationalExamLifecycleStatusEnum.VENCIDO_INADIMPLENTE);
        List<OccupationalExam> overdue = occupationalExamRepository.findOverdue(ref, closed, StatusEnum.DELETED);
        int count = 0;
        for (OccupationalExam exam : overdue) {
            exam.setLifecycleStatus(OccupationalExamLifecycleStatusEnum.VENCIDO_INADIMPLENTE);
            occupationalExamRepository.save(exam);
            count++;
        }
        return count;
    }

    private OccupationalExam createPredicted(
            UUID collaboratorId,
            UUID jobPositionId,
            OccupationalExamTypeEnum examType,
            OccupationalExamSourceTriggerEnum trigger,
            UUID relatedLeaveId,
            LocalDate dueDate,
            UUID examRequirementVersionId) {
        Optional<ExamRequirement> matrix =
                examRequirementRepository.findVigente(jobPositionId, examType, LocalDate.now());
        UUID requirementId = examRequirementVersionId;
        LocalDate computedDue = dueDate;
        if (matrix.isPresent()) {
            ExamRequirement requirement = matrix.get();
            requirementId = requirement.getId();
            if (computedDue == null && requirement.getPeriodicityMonths() != null) {
                computedDue = OccupationalExamComplianceRules.calculateDueDate(
                        LocalDate.now(), requirement.getPeriodicityMonths());
            }
        }
        OccupationalExam entity = OccupationalExam.builder()
                .status(StatusEnum.ACTIVE)
                .collaboratorId(collaboratorId)
                .jobPositionId(jobPositionId)
                .examType(examType)
                .lifecycleStatus(OccupationalExamLifecycleStatusEnum.PREVISTO)
                .sourceTrigger(trigger)
                .relatedLeaveRequestId(relatedLeaveId)
                .examRequirementVersionId(requirementId)
                .dueDate(computedDue)
                .dismissalWaiverApplied(false)
                .build();
        return occupationalExamRepository.save(entity);
    }

    private boolean hasOpenExam(UUID collaboratorId, OccupationalExamTypeEnum examType) {
        return occupationalExamRepository
                .findByCollaboratorIdAndExamTypeAndStatusNot(collaboratorId, examType, StatusEnum.DELETED)
                .stream()
                .anyMatch(exam -> exam.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.ARQUIVADO
                        && exam.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.REGISTRADO
                        && exam.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.TRANSMITIDO);
    }

    private UUID resolveLatestJobPosition(UUID collaboratorId) {
        return employmentContractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(collaboratorId, StatusEnum.DELETED)
                .map(contract -> contract.getJobPositionId())
                .or(() ->
                        occupationalExamRepository
                                .findByCollaboratorIdAndStatusNotOrderByDueDateDesc(collaboratorId, StatusEnum.DELETED)
                                .stream()
                                .map(OccupationalExam::getJobPositionId)
                                .filter(id -> id != null)
                                .findFirst())
                .orElse(null);
    }
}
