package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.exception.AdmissionProcessException;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.domain.AdmissionPipelineRules;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineBlockDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineBlockReasonEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineDeadlineDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineDeadlineKindEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineKpisDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineRowDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineSignalEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineStepDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineSummaryDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStep;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepKeyEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.EsocialEvent;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.EsocialEventStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.EsocialEventTypeEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.repository.AdmissionStepRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.repository.EsocialEventRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExam;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gommo.modules.root.security.SystemAdminUsers;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;

/**
 * Monta a esteira de admissao: deriva o estado das seis etapas a partir das evidencias que ja
 * existem no sistema (anexos, ASO, contrato, evento do eSocial), persiste o resultado em
 * {@code admission_step} e calcula KPIs, prazos legais e bloqueios.
 *
 * <p>Etapas 1 a 3 e 5 sao derivadas; Registro e Integracao ainda nao tem evidencia automatica e
 * dependem da marcacao manual persistida, ganhando apenas o calculo de vencimento.
 */
@Service
public class AdmissionPipelineService implements IAdmissionPipelineService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final String ADMISSION_ENTITY_TYPE = "admission_process";
    private static final int DEADLINE_PANEL_LIMIT = 12;

    private static final Set<OccupationalExamLifecycleStatusEnum> EXAM_CLOSED_STATUSES = Set.of(
            OccupationalExamLifecycleStatusEnum.REGISTRADO,
            OccupationalExamLifecycleStatusEnum.TRANSMITIDO,
            OccupationalExamLifecycleStatusEnum.ARQUIVADO);

    private final AdmissionProcessRepository admissionRepository;
    private final AdmissionStepRepository stepRepository;
    private final EsocialEventRepository esocialEventRepository;
    private final OccupationalExamRepository occupationalExamRepository;
    private final StorageObjectLinkRepository storageObjectLinkRepository;
    private final DepartmentRepository departmentRepository;

    public AdmissionPipelineService(
            AdmissionProcessRepository admissionRepository,
            AdmissionStepRepository stepRepository,
            EsocialEventRepository esocialEventRepository,
            OccupationalExamRepository occupationalExamRepository,
            StorageObjectLinkRepository storageObjectLinkRepository,
            DepartmentRepository departmentRepository) {
        this.admissionRepository = admissionRepository;
        this.stepRepository = stepRepository;
        this.esocialEventRepository = esocialEventRepository;
        this.occupationalExamRepository = occupationalExamRepository;
        this.storageObjectLinkRepository = storageObjectLinkRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:pipeline')")
    public AdmissionPipelineSummaryDto summary() {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        List<AdmissionPipelineRowDto> rows = buildPipeline(today);
        return AdmissionPipelineSummaryDto.builder()
                .kpis(buildKpis(rows, today))
                .deadlines(buildDeadlines(rows, today))
                .blocks(buildBlocks(rows, today))
                .totalInPipeline(rows.size())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:pipeline')")
    public PageableResponseDto<AdmissionPipelineRowDto> findPage(int page, int size) {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        List<AdmissionPipelineRowDto> rows = buildPipeline(today);
        int safeSize = Math.max(1, size);
        int safePage = Math.max(0, page);
        int fromIndex = Math.min(safePage * safeSize, rows.size());
        int toIndex = Math.min(fromIndex + safeSize, rows.size());
        int totalPages = rows.isEmpty() ? 0 : (int) Math.ceil((double) rows.size() / safeSize);
        return PageableResponseDto.<AdmissionPipelineRowDto>builder()
                .content(rows.subList(fromIndex, toIndex))
                .page(safePage)
                .size(safeSize)
                .totalElements(rows.size())
                .totalPages(totalPages)
                .build();
    }

    @Override
    @Transactional
    public void ensureSteps(UUID admissionId) {
        if (admissionId == null) {
            return;
        }
        AdmissionProcess admission = admissionRepository.findById(admissionId).orElse(null);
        if (admission == null) {
            return;
        }
        List<AdmissionStep> steps = alignStepBranchScope(
                stepRepository.findActiveByAdmissionIdUnscoped(admissionId),
                Map.of(admissionId, admission.getCompanyId()));
        Set<AdmissionStepKeyEnum> existing =
                steps.stream().map(AdmissionStep::getStepKey).collect(Collectors.toSet());
        List<AdmissionStep> missing = new ArrayList<>();
        for (AdmissionStepKeyEnum key : AdmissionStepKeyEnum.values()) {
            if (existing.contains(key)) {
                continue;
            }
            missing.add(AdmissionStep.builder()
                    .status(StatusEnum.ACTIVE)
                    .admissionId(admissionId)
                    .companyId(admission.getCompanyId())
                    .stepKey(key)
                    .stepStatus(AdmissionStepStatusEnum.PENDING)
                    .displayOrder(key.getDisplayOrder())
                    .build());
        }
        if (!missing.isEmpty()) {
            stepRepository.saveAll(missing);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:pipeline')")
    public void approve(UUID admissionId) {
        AdmissionProcess admission = admissionRepository
                .findById(admissionId)
                .filter(entity -> entity.getStatus() != StatusEnum.DELETED)
                .orElseThrow(AdmissionProcessException::notFound);
        if (admission.getManuallyApprovedAt() != null) {
            return;
        }
        OffsetDateTime now = OffsetDateTime.now(BUSINESS_ZONE);
        admission.setManuallyApprovedAt(now);
        admission.setManuallyApprovedBy(SystemAdminUsers.currentUserId().orElse(null));
        admission.setAdmissionStatus(AdmissionStatusEnum.COMPLETED);
        if (admission.getCompletedAt() == null) {
            admission.setCompletedAt(LocalDate.now(BUSINESS_ZONE));
        }
        admissionRepository.save(admission);
    }

    private List<AdmissionPipelineRowDto> buildPipeline(LocalDate today) {
        List<AdmissionProcess> admissions = admissionRepository
                .findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED)
                .stream()
                .filter(a -> a.getAdmissionStatus() != AdmissionStatusEnum.CANCELLED)
                .toList();
        if (admissions.isEmpty()) {
            return List.of();
        }

        List<UUID> admissionIds = admissions.stream().map(AdmissionProcess::getId).toList();
        List<UUID> collaboratorIds = admissions.stream()
                .map(AdmissionProcess::getCollaboratorId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<UUID, List<StorageObjectLink>> linksByAdmission = storageObjectLinkRepository
                .findAllByEntityTypeAndEntityIdInAndStatusNot(ADMISSION_ENTITY_TYPE, admissionIds, StatusEnum.DELETED)
                .stream()
                .collect(Collectors.groupingBy(StorageObjectLink::getEntityId));

        Map<UUID, UUID> companyIdByAdmission = admissions.stream()
                .collect(Collectors.toMap(AdmissionProcess::getId, AdmissionProcess::getCompanyId, (first, second) -> first));
        Map<UUID, List<AdmissionStep>> stepsByAdmission = alignStepBranchScope(
                        stepRepository.findActiveByAdmissionIdInUnscoped(admissionIds), companyIdByAdmission)
                .stream()
                .collect(Collectors.groupingBy(AdmissionStep::getAdmissionId));

        Map<UUID, EsocialEvent> admissionEventByAdmission = alignEsocialBranchScope(
                        esocialEventRepository.findActiveByAdmissionIdInUnscoped(admissionIds), companyIdByAdmission)
                .stream()
                .filter(event -> event.getEventType() == EsocialEventTypeEnum.S_2200)
                .collect(Collectors.toMap(EsocialEvent::getAdmissionId, Function.identity(), (first, second) -> first));

        Map<UUID, OccupationalExam> examByCollaborator = collaboratorIds.isEmpty()
                ? Map.of()
                : occupationalExamRepository
                        .findByCollaboratorIdInAndExamTypeAndStatusNot(
                                collaboratorIds, OccupationalExamTypeEnum.ADMISSIONAL, StatusEnum.DELETED)
                        .stream()
                        .collect(Collectors.toMap(
                                OccupationalExam::getCollaboratorId,
                                Function.identity(),
                                AdmissionPipelineService::preferClosedExam));

        Map<UUID, String> departmentNames = loadDepartmentNames(admissions);

        List<AdmissionStep> toPersist = new ArrayList<>();
        List<AdmissionPipelineRowDto> rows = new ArrayList<>();
        for (AdmissionProcess admission : admissions) {
            Map<AdmissionStepKeyEnum, AdmissionStep> persisted =
                    indexSteps(stepsByAdmission.getOrDefault(admission.getId(), List.of()));
            List<StorageObjectLink> links = linksByAdmission.getOrDefault(admission.getId(), List.of());
            DocumentProgress documents = documentProgress(links);
            OccupationalExam exam = admission.getCollaboratorId() == null
                    ? null
                    : examByCollaborator.get(admission.getCollaboratorId());
            EsocialEvent event = admissionEventByAdmission.get(admission.getId());

            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses =
                    resolveStepStatuses(admission, persisted, documents, exam, event, today);
            Map<AdmissionStepKeyEnum, LocalDate> dueDates = resolveDueDates(admission, event);

            collectPersistence(admission.getId(), admission.getCompanyId(), persisted, statuses, dueDates, toPersist);

            AdmissionPipelineRowDto row = buildRow(
                    admission, departmentNames, documents, exam, event, statuses, dueDates, persisted, today);
            if (belongsToPipeline(row, statuses, event != null, today)) {
                rows.add(row);
            }
        }
        if (!toPersist.isEmpty()) {
            stepRepository.saveAll(toPersist);
        }

        rows.sort(Comparator.comparingInt(AdmissionPipelineRowDto::getUrgencyRank)
                .thenComparing(
                        AdmissionPipelineRowDto::getExpectedStartDate,
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(AdmissionPipelineRowDto::getFullName, Comparator.nullsLast(Comparator.naturalOrder())));
        return rows;
    }

    /** Entre dois ASO do mesmo colaborador, o encerrado tem precedencia sobre o apenas previsto. */
    private static OccupationalExam preferClosedExam(OccupationalExam first, OccupationalExam second) {
        boolean firstClosed = EXAM_CLOSED_STATUSES.contains(first.getLifecycleStatus());
        boolean secondClosed = EXAM_CLOSED_STATUSES.contains(second.getLifecycleStatus());
        if (firstClosed != secondClosed) {
            return firstClosed ? first : second;
        }
        return first;
    }

    private static Map<AdmissionStepKeyEnum, AdmissionStep> indexSteps(List<AdmissionStep> steps) {
        Map<AdmissionStepKeyEnum, AdmissionStep> byKey = new EnumMap<>(AdmissionStepKeyEnum.class);
        steps.forEach(step -> byKey.put(step.getStepKey(), step));
        return byKey;
    }

    private record DocumentProgress(long received, long required, long contractDocuments) {}

    private static DocumentProgress documentProgress(List<StorageObjectLink> links) {
        Set<String> receivedTypes = links.stream()
                .filter(link -> "DOCUMENT".equalsIgnoreCase(link.getLinkRole()))
                .map(StorageObjectLink::getDocumentType)
                .filter(java.util.Objects::nonNull)
                .map(type -> type.trim().toUpperCase())
                .filter(AdmissionPipelineRules.REQUIRED_DOCUMENT_TYPES::contains)
                .collect(Collectors.toSet());
        long contracts = links.stream()
                .filter(link -> "CONTRACT".equalsIgnoreCase(link.getLinkRole()))
                .count();
        return new DocumentProgress(
                receivedTypes.size(), AdmissionPipelineRules.REQUIRED_DOCUMENT_TYPES.size(), contracts);
    }

    private Map<AdmissionStepKeyEnum, LocalDate> resolveDueDates(AdmissionProcess admission, EsocialEvent event) {
        Map<AdmissionStepKeyEnum, LocalDate> dueDates = new EnumMap<>(AdmissionStepKeyEnum.class);
        LocalDate start = admission.getExpectedStartDate();
        dueDates.put(AdmissionStepKeyEnum.EXAME, AdmissionPipelineRules.examDueDate(start));
        dueDates.put(AdmissionStepKeyEnum.REGISTRO, AdmissionPipelineRules.registrationDueDate(start));
        // Sem evento S-2200 (integracao ainda nao gera transmissao), nao expoe prazo na esteira.
        if (AdmissionPipelineRules.isEsocialS2200Enforced(event != null)) {
            dueDates.put(AdmissionStepKeyEnum.ESOCIAL, AdmissionPipelineRules.esocialDueDate(start));
        }
        dueDates.put(AdmissionStepKeyEnum.INTEGRACAO, start);
        return dueDates;
    }

    private Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> resolveStepStatuses(
            AdmissionProcess admission,
            Map<AdmissionStepKeyEnum, AdmissionStep> persisted,
            DocumentProgress documents,
            OccupationalExam exam,
            EsocialEvent event,
            LocalDate today) {
        Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses = new EnumMap<>(AdmissionStepKeyEnum.class);

        statuses.put(AdmissionStepKeyEnum.DOCUMENTACAO, documentationStatus(documents));
        statuses.put(AdmissionStepKeyEnum.EXAME, examStatus(admission, exam, today));
        statuses.put(AdmissionStepKeyEnum.CONTRATO, contractStatus(admission, documents));
        statuses.put(AdmissionStepKeyEnum.ESOCIAL, esocialStatus(admission, event, today));
        boolean esocialClearsNext =
                AdmissionPipelineRules.isEsocialS2200Enforced(event != null)
                        ? statuses.get(AdmissionStepKeyEnum.ESOCIAL) == AdmissionStepStatusEnum.DONE
                        : true;
        statuses.put(
                AdmissionStepKeyEnum.REGISTRO,
                manualStatus(
                        persisted.get(AdmissionStepKeyEnum.REGISTRO),
                        AdmissionPipelineRules.registrationDueDate(admission.getExpectedStartDate()),
                        statuses.get(AdmissionStepKeyEnum.CONTRATO) == AdmissionStepStatusEnum.DONE,
                        today));
        statuses.put(
                AdmissionStepKeyEnum.INTEGRACAO,
                manualStatus(
                        persisted.get(AdmissionStepKeyEnum.INTEGRACAO),
                        null,
                        esocialClearsNext,
                        today));

        // Etapa pulada com justificativa registrada prevalece sobre a derivacao.
        persisted.forEach((key, step) -> {
            if (step.getStepStatus() == AdmissionStepStatusEnum.SKIPPED) {
                statuses.put(key, AdmissionStepStatusEnum.SKIPPED);
            }
        });
        return statuses;
    }

    private static AdmissionStepStatusEnum documentationStatus(DocumentProgress documents) {
        if (documents.received() >= documents.required()) {
            return AdmissionStepStatusEnum.DONE;
        }
        return documents.received() > 0 ? AdmissionStepStatusEnum.IN_PROGRESS : AdmissionStepStatusEnum.PENDING;
    }

    /**
     * NR-7: sem ASO apto o trabalhador nao pode assumir as atividades. O bloqueio so aparece quando
     * o inicio esta proximo — antes disso a etapa e apenas trabalho a fazer, nao uma trava.
     */
    private static AdmissionStepStatusEnum examStatus(
            AdmissionProcess admission, OccupationalExam exam, LocalDate today) {
        if (exam != null
                && exam.getResult() == OccupationalExamResultEnum.FIT
                && EXAM_CLOSED_STATUSES.contains(exam.getLifecycleStatus())) {
            return AdmissionStepStatusEnum.DONE;
        }
        boolean startingSoon = AdmissionPipelineRules.isStartingWithin(
                        admission.getExpectedStartDate(), today, AdmissionPipelineRules.STARTING_SOON_DAYS)
                || isStartDatePassed(admission, today);
        if (startingSoon) {
            return AdmissionStepStatusEnum.BLOCKED;
        }
        return exam != null && exam.getScheduledDate() != null
                ? AdmissionStepStatusEnum.IN_PROGRESS
                : AdmissionStepStatusEnum.PENDING;
    }

    private static AdmissionStepStatusEnum contractStatus(AdmissionProcess admission, DocumentProgress documents) {
        boolean hasDate = admission.getContractStartDate() != null;
        boolean hasDocument = documents.contractDocuments() > 0;
        if (hasDate && hasDocument) {
            return AdmissionStepStatusEnum.DONE;
        }
        return hasDate || hasDocument ? AdmissionStepStatusEnum.IN_PROGRESS : AdmissionStepStatusEnum.PENDING;
    }

    /**
     * Sem transmissao S-2200 no produto, nao cobra prazo legal so pelo calendario. Quando a
     * integracao passar a gerar eventos, o prazo e o bloqueio voltam a valer automaticamente.
     */
    private static AdmissionStepStatusEnum esocialStatus(
            AdmissionProcess admission, EsocialEvent event, LocalDate today) {
        if (event != null && event.getEventStatus() == EsocialEventStatusEnum.ACEITO) {
            return AdmissionStepStatusEnum.DONE;
        }
        if (event != null && event.getEventStatus() == EsocialEventStatusEnum.REJEITADO) {
            return AdmissionStepStatusEnum.BLOCKED;
        }
        if (!AdmissionPipelineRules.isEsocialS2200Enforced(event != null)) {
            return AdmissionStepStatusEnum.PENDING;
        }
        LocalDate dueDate = AdmissionPipelineRules.esocialDueDate(admission.getExpectedStartDate());
        if (AdmissionPipelineRules.isOverdue(dueDate, today)) {
            return AdmissionStepStatusEnum.BLOCKED;
        }
        return AdmissionStepStatusEnum.IN_PROGRESS;
    }

    private static AdmissionStepStatusEnum manualStatus(
            AdmissionStep persisted, LocalDate dueDate, boolean previousStepDone, LocalDate today) {
        if (persisted != null
                && (persisted.getStepStatus() == AdmissionStepStatusEnum.DONE
                        || persisted.getStepStatus() == AdmissionStepStatusEnum.SKIPPED)) {
            return persisted.getStepStatus();
        }
        if (AdmissionPipelineRules.isOverdue(dueDate, today)) {
            return AdmissionStepStatusEnum.BLOCKED;
        }
        return previousStepDone ? AdmissionStepStatusEnum.IN_PROGRESS : AdmissionStepStatusEnum.PENDING;
    }

    private List<AdmissionStep> alignStepBranchScope(
            List<AdmissionStep> steps, Map<UUID, UUID> companyIdByAdmission) {
        if (steps.isEmpty()) {
            return steps;
        }
        List<AdmissionStep> toAlign = new ArrayList<>();
        for (AdmissionStep step : steps) {
            UUID expectedCompanyId = companyIdByAdmission.get(step.getAdmissionId());
            if (expectedCompanyId != null && !expectedCompanyId.equals(step.getCompanyId())) {
                step.setCompanyId(expectedCompanyId);
                toAlign.add(step);
            }
        }
        if (!toAlign.isEmpty()) {
            stepRepository.saveAll(toAlign);
        }
        return steps;
    }

    private List<EsocialEvent> alignEsocialBranchScope(
            List<EsocialEvent> events, Map<UUID, UUID> companyIdByAdmission) {
        if (events.isEmpty()) {
            return events;
        }
        List<EsocialEvent> toAlign = new ArrayList<>();
        for (EsocialEvent event : events) {
            if (event.getAdmissionId() == null) {
                continue;
            }
            UUID expectedCompanyId = companyIdByAdmission.get(event.getAdmissionId());
            if (expectedCompanyId != null && !expectedCompanyId.equals(event.getCompanyId())) {
                event.setCompanyId(expectedCompanyId);
                toAlign.add(event);
            }
        }
        if (!toAlign.isEmpty()) {
            esocialEventRepository.saveAll(toAlign);
        }
        return events;
    }

    private void collectPersistence(
            UUID admissionId,
            UUID companyId,
            Map<AdmissionStepKeyEnum, AdmissionStep> persisted,
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses,
            Map<AdmissionStepKeyEnum, LocalDate> dueDates,
            List<AdmissionStep> target) {
        for (AdmissionStepKeyEnum key : AdmissionStepKeyEnum.values()) {
            AdmissionStepStatusEnum resolved = statuses.get(key);
            LocalDate dueDate = dueDates.get(key);
            AdmissionStep step = persisted.get(key);
            if (step == null) {
                target.add(AdmissionStep.builder()
                        .status(StatusEnum.ACTIVE)
                        .admissionId(admissionId)
                        .companyId(companyId)
                        .stepKey(key)
                        .stepStatus(resolved)
                        .displayOrder(key.getDisplayOrder())
                        .dueDate(dueDate)
                        .build());
                continue;
            }
            boolean changed = step.getStepStatus() != resolved || !java.util.Objects.equals(step.getDueDate(), dueDate);
            if (!changed) {
                continue;
            }
            step.setStepStatus(resolved);
            step.setDueDate(dueDate);
            target.add(step);
        }
    }

    private AdmissionPipelineRowDto buildRow(
            AdmissionProcess admission,
            Map<UUID, String> departmentNames,
            DocumentProgress documents,
            OccupationalExam exam,
            EsocialEvent event,
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses,
            Map<AdmissionStepKeyEnum, LocalDate> dueDates,
            Map<AdmissionStepKeyEnum, AdmissionStep> persisted,
            LocalDate today) {
        List<AdmissionPipelineStepDto> steps = new ArrayList<>(AdmissionStepKeyEnum.values().length);
        for (AdmissionStepKeyEnum key : AdmissionStepKeyEnum.values()) {
            AdmissionStepStatusEnum status = statuses.get(key);
            LocalDate dueDate = dueDates.get(key);
            AdmissionStep step = persisted.get(key);
            steps.add(AdmissionPipelineStepDto.builder()
                    .stepKey(key)
                    .stepStatus(status)
                    .displayOrder(key.getDisplayOrder())
                    .dueDate(dueDate)
                    .overdue(isStepOverdue(status, dueDate, today))
                    .blockedReason(step != null ? step.getBlockedReason() : null)
                    .skipJustification(step != null ? step.getSkipJustification() : null)
                    .build());
        }

        Optional<AdmissionPipelineStepDto> nextDue = steps.stream()
                .filter(step -> step.getDueDate() != null)
                .filter(step -> step.getStepStatus() != AdmissionStepStatusEnum.DONE
                        && step.getStepStatus() != AdmissionStepStatusEnum.SKIPPED)
                .min(Comparator.comparing(AdmissionPipelineStepDto::getDueDate));

        AdmissionPipelineSignalEnum signal = resolveSignal(admission, statuses, steps, event != null, today);
        Integer daysSinceStart = admission.getExpectedStartDate() == null
                ? null
                : (int) ChronoUnit.DAYS.between(admission.getExpectedStartDate(), today);

        return AdmissionPipelineRowDto.builder()
                .admissionId(admission.getId())
                .collaboratorId(admission.getCollaboratorId())
                .photoObjectId(admission.getPhotoObjectId())
                .fullName(displayName(admission))
                .departmentName(
                        admission.getDepartmentId() == null ? null : departmentNames.get(admission.getDepartmentId()))
                .expectedStartDate(admission.getExpectedStartDate())
                .steps(steps)
                .signal(signal)
                .manuallyApproved(admission.getManuallyApprovedAt() != null)
                .daysSinceExpectedStart(daysSinceStart)
                .examScheduledDate(exam != null ? exam.getScheduledDate() : null)
                .nextDueDate(nextDue.map(AdmissionPipelineStepDto::getDueDate).orElse(null))
                .nextDueKind(nextDue.map(step -> deadlineKind(step.getStepKey())).orElse(null))
                .documentsReceived(documents.received())
                .documentsRequired(documents.required())
                .urgencyRank(resolveUrgencyRank(admission, statuses, steps, event != null, today))
                .build();
    }

    private static String displayName(AdmissionProcess admission) {
        return admission.getSocialName() != null && !admission.getSocialName().isBlank()
                ? admission.getSocialName()
                : admission.getFullName();
    }

    private static boolean isStepOverdue(AdmissionStepStatusEnum status, LocalDate dueDate, LocalDate today) {
        if (status == AdmissionStepStatusEnum.DONE || status == AdmissionStepStatusEnum.SKIPPED) {
            return false;
        }
        return AdmissionPipelineRules.isOverdue(dueDate, today);
    }

    private static boolean isStartDatePassed(AdmissionProcess admission, LocalDate today) {
        return admission.getExpectedStartDate() != null
                && admission.getExpectedStartDate().isBefore(today);
    }

    private static boolean isPipelineClosed(
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses, boolean esocialEnforced) {
        return java.util.Arrays.stream(AdmissionStepKeyEnum.values())
                .filter(key -> esocialEnforced || key != AdmissionStepKeyEnum.ESOCIAL)
                .map(statuses::get)
                .allMatch(status ->
                        status == AdmissionStepStatusEnum.DONE || status == AdmissionStepStatusEnum.SKIPPED);
    }

    /**
     * Sai da esteira quem ja concluiu as etapas exigiveis e cujo primeiro dia ja passou. Ate la, mesmo
     * pronto, a pessoa continua visivel — e o numero que mostra a esteira funcionando.
     */
    private static boolean belongsToPipeline(
            AdmissionPipelineRowDto row,
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses,
            boolean esocialEnforced,
            LocalDate today) {
        if (!isPipelineClosed(statuses, esocialEnforced)) {
            return true;
        }
        return row.getExpectedStartDate() == null || !row.getExpectedStartDate().isBefore(today);
    }

    private static AdmissionPipelineSignalEnum resolveSignal(
            AdmissionProcess admission,
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses,
            List<AdmissionPipelineStepDto> steps,
            boolean esocialEnforced,
            LocalDate today) {
        if (admission.getManuallyApprovedAt() != null) {
            return AdmissionPipelineSignalEnum.APROVADA;
        }
        if (steps.stream().anyMatch(AdmissionPipelineStepDto::isOverdue)) {
            return AdmissionPipelineSignalEnum.PRAZO_VENCIDO;
        }
        if (statuses.get(AdmissionStepKeyEnum.EXAME) == AdmissionStepStatusEnum.BLOCKED
                || (esocialEnforced
                        && statuses.get(AdmissionStepKeyEnum.ESOCIAL) == AdmissionStepStatusEnum.BLOCKED)) {
            return AdmissionPipelineSignalEnum.BLOQUEIO;
        }
        if (isPipelineClosed(statuses, esocialEnforced) && admission.getCollaboratorId() != null) {
            return AdmissionPipelineSignalEnum.PRONTO;
        }
        if (statuses.get(AdmissionStepKeyEnum.DOCUMENTACAO) != AdmissionStepStatusEnum.DONE) {
            return AdmissionPipelineSignalEnum.AGUARDANDO_PESSOA;
        }
        return AdmissionPipelineSignalEnum.EM_DIA;
    }

    /** Ordem de urgencia da especificacao: inicio ultrapassado, prazo vencido, trava, vencendo. */
    private static int resolveUrgencyRank(
            AdmissionProcess admission,
            Map<AdmissionStepKeyEnum, AdmissionStepStatusEnum> statuses,
            List<AdmissionPipelineStepDto> steps,
            boolean esocialEnforced,
            LocalDate today) {
        if (admission.getManuallyApprovedAt() != null) {
            return 5;
        }
        if (isStartDatePassed(admission, today) && !isPipelineClosed(statuses, esocialEnforced)) {
            return 1;
        }
        if (steps.stream().anyMatch(AdmissionPipelineStepDto::isOverdue)) {
            return 2;
        }
        boolean blocked = statuses.get(AdmissionStepKeyEnum.EXAME) == AdmissionStepStatusEnum.BLOCKED
                || (esocialEnforced
                        && statuses.get(AdmissionStepKeyEnum.ESOCIAL) == AdmissionStepStatusEnum.BLOCKED);
        if (blocked
                && AdmissionPipelineRules.isStartingWithin(
                        admission.getExpectedStartDate(), today, AdmissionPipelineRules.STARTING_SOON_DAYS)) {
            return 3;
        }
        boolean dueSoon = steps.stream()
                .anyMatch(step -> step.getStepStatus() != AdmissionStepStatusEnum.DONE
                        && step.getStepStatus() != AdmissionStepStatusEnum.SKIPPED
                        && AdmissionPipelineRules.isDueWithin(
                                step.getDueDate(), today, AdmissionPipelineRules.DUE_SOON_DAYS));
        return dueSoon ? 4 : 5;
    }

    private static AdmissionPipelineDeadlineKindEnum deadlineKind(AdmissionStepKeyEnum stepKey) {
        return switch (stepKey) {
            case EXAME -> AdmissionPipelineDeadlineKindEnum.ASO_ADMISSIONAL;
            case REGISTRO -> AdmissionPipelineDeadlineKindEnum.REGISTRO_CARTEIRA;
            case ESOCIAL -> AdmissionPipelineDeadlineKindEnum.ESOCIAL_S2200;
            default -> null;
        };
    }

    private AdmissionPipelineKpisDto buildKpis(List<AdmissionPipelineRowDto> rows, LocalDate today) {
        List<AdmissionPipelineRowDto> open = rows.stream()
                .filter(row -> row.getSignal() != AdmissionPipelineSignalEnum.PRONTO
                        && row.getSignal() != AdmissionPipelineSignalEnum.APROVADA)
                .toList();
        List<AdmissionPipelineDeadlineDto> deadlines = allDeadlines(rows, today);
        List<AdmissionPipelineDeadlineDto> overdue = deadlines.stream()
                .filter(AdmissionPipelineDeadlineDto::isOverdue)
                .toList();
        Set<UUID> overduePeople =
                overdue.stream().map(AdmissionPipelineDeadlineDto::getAdmissionId).collect(Collectors.toSet());
        List<AdmissionPipelineDeadlineDto> dueSoon = deadlines.stream()
                .filter(deadline -> AdmissionPipelineRules.isDueWithin(
                        deadline.getDueDate(), today, AdmissionPipelineRules.DUE_SOON_DAYS))
                .toList();

        int blockedFromStarting = (int) rows.stream()
                .filter(row -> AdmissionPipelineRules.isStartingWithin(
                                row.getExpectedStartDate(), today, AdmissionPipelineRules.STARTING_SOON_DAYS)
                        || (row.getExpectedStartDate() != null
                                && row.getExpectedStartDate().isBefore(today)))
                .filter(row -> stepStatusOf(row, AdmissionStepKeyEnum.EXAME) != AdmissionStepStatusEnum.DONE
                        && stepStatusOf(row, AdmissionStepKeyEnum.EXAME) != AdmissionStepStatusEnum.SKIPPED)
                .count();

        return AdmissionPipelineKpisDto.builder()
                .inProgress(open.size())
                .startingWithinFifteenDays((int) open.stream()
                        .filter(row -> AdmissionPipelineRules.isStartingWithin(
                                row.getExpectedStartDate(), today, AdmissionPipelineRules.STARTING_SOON_DAYS))
                        .count())
                .blockedFromStarting(blockedFromStarting)
                .overdueDeadlines(overdue.size())
                .overdueDeadlinePeople(overduePeople.size())
                .dueWithinSevenDays(dueSoon.size())
                .nextDueDate(dueSoon.stream()
                        .map(AdmissionPipelineDeadlineDto::getDueDate)
                        .min(Comparator.naturalOrder())
                        .orElse(null))
                .readyForFirstDay((int) rows.stream()
                        .filter(row -> row.getSignal() == AdmissionPipelineSignalEnum.PRONTO
                                || row.getSignal() == AdmissionPipelineSignalEnum.APROVADA)
                        .count())
                .build();
    }

    private static AdmissionStepStatusEnum stepStatusOf(AdmissionPipelineRowDto row, AdmissionStepKeyEnum key) {
        return row.getSteps().stream()
                .filter(step -> step.getStepKey() == key)
                .map(AdmissionPipelineStepDto::getStepStatus)
                .findFirst()
                .orElse(AdmissionStepStatusEnum.PENDING);
    }

    private static List<AdmissionPipelineDeadlineDto> allDeadlines(
            List<AdmissionPipelineRowDto> rows, LocalDate today) {
        List<AdmissionPipelineDeadlineDto> deadlines = new ArrayList<>();
        for (AdmissionPipelineRowDto row : rows) {
            for (AdmissionPipelineStepDto step : row.getSteps()) {
                AdmissionPipelineDeadlineKindEnum kind = deadlineKind(step.getStepKey());
                if (kind == null || step.getDueDate() == null) {
                    continue;
                }
                if (step.getStepStatus() == AdmissionStepStatusEnum.DONE
                        || step.getStepStatus() == AdmissionStepStatusEnum.SKIPPED) {
                    continue;
                }
                deadlines.add(AdmissionPipelineDeadlineDto.builder()
                        .admissionId(row.getAdmissionId())
                        .fullName(row.getFullName())
                        .kind(kind)
                        .dueDate(step.getDueDate())
                        .expectedStartDate(row.getExpectedStartDate())
                        .daysFromToday((int) ChronoUnit.DAYS.between(today, step.getDueDate()))
                        .overdue(step.isOverdue())
                        .build());
            }
        }
        return deadlines;
    }

    private static List<AdmissionPipelineDeadlineDto> buildDeadlines(
            List<AdmissionPipelineRowDto> rows, LocalDate today) {
        return allDeadlines(rows, today).stream()
                .filter(deadline -> deadline.isOverdue()
                        || AdmissionPipelineRules.isDueWithin(
                                deadline.getDueDate(), today, AdmissionPipelineRules.DEADLINE_PANEL_DAYS))
                .sorted(Comparator.comparing(AdmissionPipelineDeadlineDto::getDueDate))
                .limit(DEADLINE_PANEL_LIMIT)
                .toList();
    }

    private static List<AdmissionPipelineBlockDto> buildBlocks(
            List<AdmissionPipelineRowDto> rows, LocalDate today) {
        List<AdmissionPipelineBlockDto> blocks = new ArrayList<>();
        for (AdmissionPipelineRowDto row : rows) {
            if (row.getExpectedStartDate() != null
                    && row.getExpectedStartDate().isBefore(today)
                    && row.getSignal() != AdmissionPipelineSignalEnum.PRONTO
                    && row.getSignal() != AdmissionPipelineSignalEnum.APROVADA) {
                blocks.add(block(row, AdmissionPipelineBlockReasonEnum.INICIO_ULTRAPASSADO));
                continue;
            }
            if (stepStatusOf(row, AdmissionStepKeyEnum.EXAME) == AdmissionStepStatusEnum.BLOCKED) {
                blocks.add(block(row, AdmissionPipelineBlockReasonEnum.SEM_ASO_APTO));
                continue;
            }
            if (stepStatusOf(row, AdmissionStepKeyEnum.ESOCIAL) == AdmissionStepStatusEnum.BLOCKED) {
                blocks.add(block(row, AdmissionPipelineBlockReasonEnum.ESOCIAL_REJEITADO));
            }
        }
        return blocks;
    }

    private static AdmissionPipelineBlockDto block(
            AdmissionPipelineRowDto row, AdmissionPipelineBlockReasonEnum reason) {
        return AdmissionPipelineBlockDto.builder()
                .admissionId(row.getAdmissionId())
                .fullName(row.getFullName())
                .reason(reason)
                .expectedStartDate(row.getExpectedStartDate())
                .examScheduledDate(row.getExamScheduledDate())
                .build();
    }

    private Map<UUID, String> loadDepartmentNames(List<AdmissionProcess> admissions) {
        List<UUID> departmentIds = admissions.stream()
                .map(AdmissionProcess::getDepartmentId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        if (departmentIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, String> names = new HashMap<>();
        departmentRepository.findAllById(departmentIds).stream()
                .filter(department -> department.getStatus() != StatusEnum.DELETED)
                .forEach(department -> names.put(department.getId(), department.getName()));
        return names;
    }
}
