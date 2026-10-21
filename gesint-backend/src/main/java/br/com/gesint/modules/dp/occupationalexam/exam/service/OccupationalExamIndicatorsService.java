package br.com.gesint.modules.dp.occupationalexam.exam.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gesint.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamIndicatorsResponseDto;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.mapper.OccupationalExamMapper;
import br.com.gesint.modules.dp.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.entity.ExamRequirement;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.repository.ExamRequirementRepository;

@Service
public class OccupationalExamIndicatorsService {

    private static final List<OccupationalExamLifecycleStatusEnum> ALERT_STATUSES =
            List.of(OccupationalExamLifecycleStatusEnum.PREVISTO, OccupationalExamLifecycleStatusEnum.CONVOCADO);

    private static final List<OccupationalExamLifecycleStatusEnum> CLOSED_STATUSES = List.of(
            OccupationalExamLifecycleStatusEnum.REGISTRADO,
            OccupationalExamLifecycleStatusEnum.TRANSMITIDO,
            OccupationalExamLifecycleStatusEnum.ARQUIVADO);

    private static final List<String> PHASE3_PENDING = List.of("aderencia_transmissao_s2220", "tempo_ciclo_exame");

    private final OccupationalExamRepository occupationalExamRepository;
    private final ExamRequirementRepository examRequirementRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final EmploymentContractRepository employmentContractRepository;
    private final JobPositionRepository jobPositionRepository;
    private final OccupationalExamMapper occupationalExamMapper;

    public OccupationalExamIndicatorsService(
            OccupationalExamRepository occupationalExamRepository,
            ExamRequirementRepository examRequirementRepository,
            CollaboratorRepository collaboratorRepository,
            EmploymentContractRepository employmentContractRepository,
            JobPositionRepository jobPositionRepository,
            OccupationalExamMapper occupationalExamMapper) {
        this.occupationalExamRepository = occupationalExamRepository;
        this.examRequirementRepository = examRequirementRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.employmentContractRepository = employmentContractRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.occupationalExamMapper = occupationalExamMapper;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public OccupationalExamIndicatorsResponseDto getIndicators() {
        LocalDate today = LocalDate.now();

        Map<UUID, UUID> positionByCollaborator = resolveActivePositions(today);
        long activeWithPosition = positionByCollaborator.size();
        long compliant = positionByCollaborator.entrySet().stream()
                .filter(entry -> isCompliant(entry.getKey(), entry.getValue(), today))
                .count();

        List<JobPosition> activePositions =
                jobPositionRepository.findAllByStatusOrderByCreatedAtDesc(StatusEnum.ACTIVE);
        long positionsWithMatrix = activePositions.stream()
                .filter(position -> hasAnyVigenteRequirement(position.getId(), today))
                .count();

        List<OccupationalExamResponseDto> overdue =
                mapOperational(occupationalExamRepository.findOverdue(today, CLOSED_STATUSES, StatusEnum.DELETED));
        List<OccupationalExamResponseDto> due30 = mapOperational(findDueWindow(today, 30));
        List<OccupationalExamResponseDto> due60 = mapOperational(findDueWindow(today, 60));
        List<OccupationalExamResponseDto> due90 = mapOperational(findDueWindow(today, 90));

        List<OccupationalExamResponseDto> dismissalDtos = mapOperational(findDismissalPendencies(today));

        return OccupationalExamIndicatorsResponseDto.builder()
                .complianceRatePercent(percent(compliant, activeWithPosition))
                .activeCollaboratorsWithPosition(activeWithPosition)
                .compliantCollaborators(compliant)
                .matrixCoveragePercent(percent(positionsWithMatrix, activePositions.size()))
                .activeJobPositions(activePositions.size())
                .jobPositionsWithMatrix(positionsWithMatrix)
                .overdueCount(overdue.size())
                .dueIn30Count(due30.size())
                .dueIn60Count(due60.size())
                .dueIn90Count(due90.size())
                .overdueExams(overdue)
                .dueIn30Exams(due30)
                .dismissalPendingCount(dismissalDtos.size())
                .dismissalPendingExams(dismissalDtos)
                .phase3PendingIndicators(PHASE3_PENDING)
                .build();
    }

    private Map<UUID, UUID> resolveActivePositions(LocalDate today) {
        Map<UUID, UUID> result = new HashMap<>();
        List<Collaborator> active = collaboratorRepository.findByStatusOrderByFullNameAsc(StatusEnum.ACTIVE);
        Set<UUID> activeIds = active.stream().map(Collaborator::getId).collect(Collectors.toSet());
        for (UUID collaboratorId : activeIds) {
            employmentContractRepository
                    .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(collaboratorId, StatusEnum.DELETED)
                    .filter(contract -> isContractActive(contract, today))
                    .map(EmploymentContract::getJobPositionId)
                    .filter(Objects::nonNull)
                    .ifPresent(jobPositionId -> result.put(collaboratorId, jobPositionId));
        }
        return result;
    }

    private boolean isContractActive(EmploymentContract contract, LocalDate today) {
        if (contract.getStartDate() != null && contract.getStartDate().isAfter(today)) {
            return false;
        }
        return contract.getEndDate() == null || !contract.getEndDate().isBefore(today);
    }

    private boolean isCompliant(UUID collaboratorId, UUID jobPositionId, LocalDate today) {
        List<OccupationalExam> exams = occupationalExamRepository.findByCollaboratorIdAndStatusNotOrderByDueDateDesc(
                collaboratorId, StatusEnum.DELETED);
        boolean hasOverdueOpen = exams.stream().anyMatch(exam -> isOpenAndOverdue(exam, today));
        if (hasOverdueOpen) {
            return false;
        }
        Optional<ExamRequirement> periodico =
                examRequirementRepository.findVigente(jobPositionId, OccupationalExamTypeEnum.PERIODICO, today);
        if (periodico.isEmpty()) {
            // Sem matriz periodica: considera conforme se nao ha vencidos abertos.
            return true;
        }
        ExamRequirement requirement = periodico.get();
        return exams.stream().anyMatch(exam -> isValidCoverage(exam, requirement, today));
    }

    private boolean isOpenAndOverdue(OccupationalExam exam, LocalDate today) {
        if (exam.getDueDate() == null || !exam.getDueDate().isBefore(today)) {
            return false;
        }
        return !CLOSED_STATUSES.contains(exam.getLifecycleStatus());
    }

    private boolean isValidCoverage(OccupationalExam exam, ExamRequirement requirement, LocalDate today) {
        if (exam.getExamType() != OccupationalExamTypeEnum.PERIODICO
                && exam.getExamType() != OccupationalExamTypeEnum.ADMISSIONAL) {
            return false;
        }
        if (!CLOSED_STATUSES.contains(exam.getLifecycleStatus())
                && exam.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.VENCIDO_INADIMPLENTE) {
            // Exame previsto ainda no prazo conta como cobertura operacional.
            return exam.getDueDate() != null && !exam.getDueDate().isBefore(today);
        }
        if (!CLOSED_STATUSES.contains(exam.getLifecycleStatus())) {
            return false;
        }
        if (exam.getClinicalExamDate() == null || requirement.getPeriodicityMonths() == null) {
            return exam.getDueDate() == null || !exam.getDueDate().isBefore(today);
        }
        LocalDate validUntil = exam.getClinicalExamDate().plusMonths(requirement.getPeriodicityMonths());
        return !validUntil.isBefore(today);
    }

    private boolean hasAnyVigenteRequirement(UUID jobPositionId, LocalDate today) {
        for (OccupationalExamTypeEnum type : OccupationalExamTypeEnum.values()) {
            if (examRequirementRepository
                    .findVigente(jobPositionId, type, today)
                    .isPresent()) {
                return true;
            }
        }
        return false;
    }

    private List<OccupationalExam> findDismissalPendencies(LocalDate today) {
        return occupationalExamRepository
                .findByExamTypeAndDismissalWaiverAppliedAndStatusNot(
                        OccupationalExamTypeEnum.DEMISSIONAL, false, StatusEnum.DELETED)
                .stream()
                .filter(exam -> !CLOSED_STATUSES.contains(exam.getLifecycleStatus()))
                .filter(exam -> exam.getDueDate() != null && exam.getDueDate().isBefore(today))
                .toList();
    }

    private List<OccupationalExam> findDueWindow(LocalDate today, int days) {
        return occupationalExamRepository.findDueInWindow(
                today, today.plusDays(days), ALERT_STATUSES, StatusEnum.DELETED);
    }

    private List<OccupationalExamResponseDto> mapOperational(List<OccupationalExam> exams) {
        // Indicadores sao operacionais; sem clinicalData (LGPD).
        Map<UUID, String> names = collaboratorNamesById(exams.stream()
                .map(OccupationalExam::getCollaboratorId)
                .filter(Objects::nonNull)
                .distinct()
                .toList());
        return exams.stream()
                .map(exam -> occupationalExamMapper.toResponse(
                        exam, false, List.of(), names.get(exam.getCollaboratorId())))
                .toList();
    }

    private Map<UUID, String> collaboratorNamesById(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Collaborator::getId, Collaborator::getFullName, (a, b) -> a));
    }

    private static Double percent(long numerator, long denominator) {
        if (denominator <= 0) {
            return null;
        }
        return Math.round((numerator * 10000.0) / denominator) / 100.0;
    }
}
