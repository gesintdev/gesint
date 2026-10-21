package br.com.gesint.modules.rh.person.attendance.service;

import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.settings.notification.entity.SystemSetting;
import br.com.gesint.modules.cfg.settings.notification.repository.SystemSettingRepository;
import br.com.gesint.modules.cfg.settings.notification.service.SystemNotificationService;
import br.com.gesint.modules.dp.organization.workschedule.entity.WeekDayEnum;
import br.com.gesint.modules.dp.organization.workschedule.entity.WorkSchedule;
import br.com.gesint.modules.dp.organization.workschedule.entity.WorkScheduleDay;
import br.com.gesint.modules.dp.organization.workschedule.repository.WorkScheduleRepository;
import br.com.gesint.modules.rh.person.attendance.dto.*;
import br.com.gesint.modules.rh.person.attendance.entity.*;
import br.com.gesint.modules.rh.person.attendance.exception.AttendanceRecordException;
import br.com.gesint.modules.rh.person.attendance.mapper.AttendanceRecordMapper;
import br.com.gesint.modules.rh.person.attendance.mapper.AttendanceRequestMapper;
import br.com.gesint.modules.rh.person.attendance.repository.AttendanceRecordRepository;
import br.com.gesint.modules.rh.person.attendance.repository.AttendanceRequestRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.entity.Role;
import br.com.gesint.modules.root.repository.AppUserRepository;
import br.com.gesint.modules.storage.service.IStorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AttendanceRecordService
    extends BaseService<AttendanceRecord, AttendanceRecordRequestDto, AttendanceRecordResponseDto>
    implements IAttendanceRecordService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final String STORAGE_ENTITY_TYPE = "attendance_record";
    private static final String REQUEST_STORAGE_ENTITY_TYPE = "attendance_request";
    private static final String ATTACHMENT_LINK_ROLE = "ATTACHMENT";
    private static final String PHOTO_LINK_ROLE = "CLOCK_PHOTO";
    private static final String REQUEST_PENDING = "PENDING";
    private static final String REQUEST_APPROVED = "APPROVED";
    private static final String REQUEST_REJECTED = "REJECTED";
    private static final String REQUIRE_PHOTO_KEY = "ATTENDANCE_REQUIRE_PHOTO";
    private static final String REQUIRE_LOCATION_KEY = "ATTENDANCE_REQUIRE_LOCATION";

    private final AttendanceRecordRepository repository;
    private final AttendanceRequestRepository requestRepository;
    private final AttendanceRecordMapper mapper;
    private final AttendanceRequestMapper requestMapper;
    private final AppUserRepository appUserRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final SystemSettingRepository settingRepository;
    private final SystemNotificationService notificationService;
    private final IStorageService storageService;
    private final AuditTrailRecorder auditTrail;

    public AttendanceRecordService(
        AttendanceRecordRepository repository,
        AttendanceRequestRepository requestRepository,
        AttendanceRecordMapper mapper,
        AttendanceRequestMapper requestMapper,
        AppUserRepository appUserRepository,
        AdmissionProcessRepository admissionProcessRepository,
        CollaboratorRepository collaboratorRepository,
        LeaveRequestRepository leaveRequestRepository,
        WorkScheduleRepository workScheduleRepository,
        SystemSettingRepository settingRepository,
        SystemNotificationService notificationService,
        IStorageService storageService,
        AuditTrailRecorder auditTrail) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.requestRepository = requestRepository;
        this.mapper = mapper;
        this.requestMapper = requestMapper;
        this.appUserRepository = appUserRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.workScheduleRepository = workScheduleRepository;
        this.settingRepository = settingRepository;
        this.notificationService = notificationService;
        this.storageService = storageService;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRecordResponseDto> findAll() {
        return mapToResponses(repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendancePresenceResponseDto> presence(LocalDate from, LocalDate to) {
        LocalDate periodStart = from != null && to != null && from.isAfter(to) ? to : from;
        LocalDate periodEnd = from != null && to != null && from.isAfter(to) ? from : to;
        if (periodStart == null || periodEnd == null) {
            throw AttendanceRecordException.invalidSubmission();
        }

        // Listagem = colaboradores com ponto e/ou solicitação no período (não o roster admitido inteiro).
        Set<UUID> matchingIds = new HashSet<>();
        matchingIds.addAll(repository.findDistinctCollaboratorIdsByWorkDateBetween(
            periodStart, periodEnd, StatusEnum.DELETED));
        matchingIds.addAll(requestRepository.findDistinctCollaboratorIdsByWorkDateBetween(
            periodStart, periodEnd, StatusEnum.DELETED));
        if (matchingIds.isEmpty()) {
            return List.of();
        }

        // Mantém apenas admitidos ativos (exclui vínculos sintéticos, ex.: ADMIN).
        Set<UUID> admittedIds = new HashSet<>(
            admissionProcessRepository.findCollaboratorIdsFromCompletedAdmissions(
                AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED));
        List<UUID> collaboratorIds = matchingIds.stream()
            .filter(admittedIds::contains)
            .toList();
        if (collaboratorIds.isEmpty()) {
            return List.of();
        }

        List<Collaborator> collaborators = collaboratorRepository.findAllById(collaboratorIds).stream()
            .filter(collaborator -> collaborator.getStatus() == StatusEnum.ACTIVE)
            .sorted(Comparator.comparing(Collaborator::getFullName, String.CASE_INSENSITIVE_ORDER))
            .toList();
        if (collaborators.isEmpty()) {
            return List.of();
        }

        List<UUID> activeIds = collaborators.stream().map(Collaborator::getId).toList();
        Map<UUID, List<AttendanceRecord>> recordsByCollaborator = repository
            .findByWorkDateBetweenAndStatusNot(periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .filter(record -> record.getCollaboratorId() != null)
            .collect(Collectors.groupingBy(AttendanceRecord::getCollaboratorId));

        Map<UUID, List<LeaveRequest>> vacationsByCollaborator = leaveRequestRepository
            .findApprovedByCollaboratorInAndTypeOverlapping(
                activeIds, LeaveTypeEnum.VACATION, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        Map<UUID, List<LeaveRequest>> absencesByCollaborator = leaveRequestRepository
            .findApprovedAbsencesByCollaboratorInOverlapping(
                activeIds, LeaveTypeEnum.VACATION, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        Map<UUID, AdmissionProcess> admissionsByCollaborator = latestCompletedAdmissionsByCollaborator(activeIds);
        Map<UUID, WorkSchedule> schedulesById = loadWorkSchedulesById(
            admissionsByCollaborator.values().stream()
                .map(AdmissionProcess::getWorkScheduleId)
                .filter(id -> id != null)
                .distinct()
                .toList());

        // Tag "Solicitação de Ajuste" = pendente; inclusão na lista usa qualquer request no período.
        Set<UUID> collaboratorsWithPendingAdjustment = requestRepository
            .findByRequestStatusAndPeriod(REQUEST_PENDING, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .map(AttendanceRequest::getCollaboratorId)
            .collect(Collectors.toSet());

        // Um resumo por colaborador no período (não uma linha por dia).
        List<AttendancePresenceResponseDto> rows = new ArrayList<>(collaborators.size());
        for (Collaborator collaborator : collaborators) {
            List<AttendanceRecord> records =
                recordsByCollaborator.getOrDefault(collaborator.getId(), List.of());
            boolean inVacation = !vacationsByCollaborator
                    .getOrDefault(collaborator.getId(), List.of())
                    .isEmpty()
                || records.stream().anyMatch(AttendanceRecordService::isVacationOccurrence);
            boolean onLeaveActive = !absencesByCollaborator
                    .getOrDefault(collaborator.getId(), List.of())
                    .isEmpty()
                || records.stream().anyMatch(AttendanceRecordService::isJustifiedLeaveOccurrence);
            AdmissionProcess admission = admissionsByCollaborator.get(collaborator.getId());
            WorkSchedule schedule = admission != null && admission.getWorkScheduleId() != null
                ? schedulesById.get(admission.getWorkScheduleId())
                : null;
            boolean pendingAdjustmentRequest =
                collaboratorsWithPendingAdjustment.contains(collaborator.getId());
            rows.add(toPresenceRosterResponse(
                collaborator,
                periodEnd,
                inVacation,
                onLeaveActive,
                pendingAdjustmentRequest,
                schedule,
                admission,
                records));
        }

        rows.sort(Comparator.comparing(
            row -> row.getCollaboratorName() != null ? row.getCollaboratorName() : "",
            String.CASE_INSENSITIVE_ORDER));
        return rows;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AttendanceScheduleDayResponseDto scheduleDay(UUID collaboratorId, LocalDate workDate) {
        if (collaboratorId == null || workDate == null) {
            throw AttendanceRecordException.invalidSubmission();
        }
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        WorkSchedule schedule = null;
        if (admission != null && admission.getWorkScheduleId() != null) {
            schedule = workScheduleRepository
                .findByIdWithDays(admission.getWorkScheduleId(), StatusEnum.DELETED)
                .orElse(null);
        }
        return AttendanceScheduleDayResponseDto.builder()
            .collaboratorId(collaboratorId)
            .outsideWorkSchedule(isOutsideWorkSchedule(schedule, workDate))
            .workScheduleId(schedule != null
                ? schedule.getId()
                : (admission != null ? admission.getWorkScheduleId() : null))
            .workScheduleName(schedule != null ? schedule.getName() : null)
            .expectedHours(expectedHoursFromAdmission(admission, workDate, schedule))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AttendanceCollaboratorScheduleResponseDto collaboratorSchedule(UUID collaboratorId) {
        if (collaboratorId == null) {
            throw AttendanceRecordException.invalidSubmission();
        }
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        WorkSchedule schedule = resolveWorkSchedule(admission);
        BigDecimal fallbackDailyHours = expectedHoursFromWorkloadText(admission);
        List<AttendanceCollaboratorScheduleResponseDto.DayHours> days = new ArrayList<>();
        if (schedule != null) {
            for (WeekDayEnum weekDay : WeekDayEnum.values()) {
                LocalDate sample = LocalDate.now(BUSINESS_ZONE)
                    .with(java.time.temporal.TemporalAdjusters.nextOrSame(
                        java.time.DayOfWeek.valueOf(weekDay.name())));
                days.add(AttendanceCollaboratorScheduleResponseDto.DayHours.builder()
                    .dayOfWeek(weekDay)
                    .expectedHours(hoursForScheduleDay(schedule, sample))
                    .build());
            }
        }
        return AttendanceCollaboratorScheduleResponseDto.builder()
            .collaboratorId(collaboratorId)
            .workScheduleId(schedule != null
                ? schedule.getId()
                : (admission != null ? admission.getWorkScheduleId() : null))
            .workScheduleName(schedule != null ? schedule.getName() : null)
            .workloadSchedule(admission != null ? admission.getWorkloadSchedule() : null)
            .fallbackDailyHours(fallbackDailyHours)
            .days(days)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AttendanceRecordResponseDto findById(UUID id) {
        return toEnrichedResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public PageableResponseDto<AttendanceRecordResponseDto> collaboratorHistory(
            UUID collaboratorId, LocalDate from, LocalDate to, int page, int size) {
        int safeSize = Math.max(1, size);
        int safePage = Math.max(0, page);

        if (from != null && to != null) {
            LocalDate periodStart = from.isAfter(to) ? to : from;
            LocalDate periodEnd = from.isAfter(to) ? from : to;
            List<AttendanceRecord> all = repository.findWorkdayByCollaboratorAndPeriod(
                    collaboratorId, periodStart, periodEnd, StatusEnum.DELETED);
            int total = all.size();
            int fromIdx = Math.min(safePage * safeSize, total);
            int toIdx = Math.min(fromIdx + safeSize, total);
            List<AttendanceRecordResponseDto> content = mapToResponses(all.subList(fromIdx, toIdx));
            int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safeSize);
            return PageableResponseDto.<AttendanceRecordResponseDto>builder()
                    .content(content)
                    .page(safePage)
                    .size(safeSize)
                    .totalElements((long) total)
                    .totalPages(totalPages)
                    .build();
        }

        var pageable = org.springframework.data.domain.PageRequest.of(safePage, safeSize);
        var result = repository.findByCollaboratorIdAndStatusNotOrderByWorkDateDesc(
                collaboratorId, StatusEnum.DELETED, pageable);
        List<AttendanceRecordResponseDto> content = mapToResponses(result.getContent());
        return PageableResponseDto.<AttendanceRecordResponseDto>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public PageableResponseDto<AttendanceRecordResponseDto> findPage(int page, int size) {
        PageableResponseDto<AttendanceRecordResponseDto> pageResult = super.findPage(page, size);
        List<AttendanceRecordResponseDto> content = pageResult.getContent();
        if (content.isEmpty()) {
            return pageResult;
        }
        Map<UUID, AttendanceRecord> entitiesById = repository
            .findAllById(content.stream().map(AttendanceRecordResponseDto::getId).toList())
            .stream()
            .filter(entity -> entity.getStatus() != StatusEnum.DELETED)
            .collect(Collectors.toMap(AttendanceRecord::getId, Function.identity()));
        List<AttendanceRecord> entities = content.stream()
            .map(dto -> entitiesById.get(dto.getId()))
            .filter(entity -> entity != null)
            .toList();
        List<AttendanceRecordResponseDto> enriched = mapToResponses(entities);
        return PageableResponseDto.<AttendanceRecordResponseDto>builder()
            .content(enriched)
            .page(pageResult.getPage())
            .size(pageResult.getSize())
            .totalElements(pageResult.getTotalElements())
            .totalPages(pageResult.getTotalPages())
            .filterOptions(pageResult.getFilterOptions())
            .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto create(AttendanceRecordRequestDto request) {
        ensureUniqueWorkDate(request.getCollaboratorId(), request.getWorkDate(), null);
        AttendanceRecord entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyDerivedHours(entity);
        return toEnrichedResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto update(UUID id, AttendanceRecordRequestDto request) {
        AttendanceRecord entity = findEntity(id);
        ensureUniqueWorkDate(request.getCollaboratorId(), request.getWorkDate(), id);
        updateEntity(entity, request);
        applyDerivedHours(entity);
        return toEnrichedResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public AttendanceRequestResponseDto submit(AttendanceSubmissionRequestDto request) {
        AttendanceSourceEnum source = request.getSource() != null ? request.getSource() : AttendanceSourceEnum.MOBILE;
        return requestRepository
            .findBySourceAndClientRequestIdAndStatusNot(source, request.getClientRequestId(), StatusEnum.DELETED)
            .map(this::toEnrichedRequestResponse)
            .orElseGet(() -> createAdjustmentRequest(request, source));
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public AttendanceRecordResponseDto clock(AttendanceClockRequestDto request) {
        return clockForCollaborator(resolveCurrentCollaboratorId(), request, true);
    }

    /**
     * Registro de ponto para um colaborador resolvido (autenticado ou via codigo publico).
     *
     * @param enforceCaptureSettings quando false, foto/geo das settings do tenant nao sao
     *     obrigatorios aqui (landing publica exige foto no PublicPontoService; geo continua opcional).
     */
    @Transactional
    public AttendanceRecordResponseDto clockForCollaborator(
            UUID collaboratorId, AttendanceClockRequestDto request, boolean enforceCaptureSettings) {
        AttendanceSettingsResponseDto settings = getSettingsInternal();
        if (enforceCaptureSettings) {
            if (settings.isRequirePhoto() && (request.getPhoto() == null || request.getPhoto().getObjectId() == null)) {
                throw AttendanceRecordException.invalidSubmission();
            }
            if (settings.isRequireLocation() && (request.getLatitude() == null || request.getLongitude() == null)) {
                throw AttendanceRecordException.invalidSubmission();
            }
        }

        LocalDate workDate = request.getCapturedAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate();
        LocalTime time = request.getCapturedAt().atZoneSameInstant(BUSINESS_ZONE).toLocalTime().withNano(0);
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        WorkSchedule schedule = resolveWorkSchedule(admission);
        boolean outsideWorkSchedule = isOutsideWorkSchedule(schedule, workDate);
        BigDecimal expectedHours = expectedHoursFromAdmission(admission, workDate, schedule);

        AttendanceRecord entity = repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, workDate, StatusEnum.DELETED)
            .orElseGet(() -> newWorkdayRecord(collaboratorId, workDate, expectedHours, outsideWorkSchedule));

        if (entity.getCompanyId() == null) {
            final AttendanceRecord record = entity;
            collaboratorRepository.findById(collaboratorId).ifPresent(c -> record.setCompanyId(c.getCompanyId()));
        }

        applyNextPunch(entity, time);
        entity.setExpectedHours(expectedHours);
        entity.setWorkedHours(calculateWorkedHours(entity));

        AttendanceRequest pendingOutside = null;
        boolean outsideAlreadyApproved = false;
        if (outsideWorkSchedule) {
            pendingOutside = requestRepository
                .findFirstByCollaboratorIdAndWorkDateAndRequestTypeAndRequestStatusAndStatusNot(
                    collaboratorId,
                    workDate,
                    AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE,
                    REQUEST_PENDING,
                    StatusEnum.DELETED)
                .orElse(null);
            outsideAlreadyApproved = requestRepository
                .findFirstByCollaboratorIdAndWorkDateAndRequestTypeAndRequestStatusAndStatusNot(
                    collaboratorId,
                    workDate,
                    AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE,
                    REQUEST_APPROVED,
                    StatusEnum.DELETED)
                .isPresent();
        }

        if (outsideWorkSchedule && !outsideAlreadyApproved) {
            entity.setOccurrenceType(AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT);
            entity.setOccurrenceOrigin(AttendanceOccurrenceOriginEnum.MOBILE);
            // Compensacao fica pendente ate aprovacao (banco de horas x hora extra).
            entity.setImpactsHourBank(Boolean.FALSE);
            entity.setImpactsPayroll(Boolean.FALSE);
        }
        entity.setPhotoObjectId(request.getPhoto() != null ? request.getPhoto().getObjectId() : null);
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setLocationAccuracyMeters(request.getLocationAccuracyMeters());
        entity = repository.save(entity);
        linkRecordAttachment(entity, request.getPhoto(), PHOTO_LINK_ROLE);

        boolean pendingOutsideScheduleApproval = false;
        if (outsideWorkSchedule && !outsideAlreadyApproved) {
            upsertOutsideScheduleRequest(entity, request, schedule, pendingOutside);
            pendingOutsideScheduleApproval = true;
        }
        return toEnrichedResponse(entity).toBuilder()
            .pendingOutsideScheduleApproval(pendingOutsideScheduleApproval)
            .build();
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public AttendanceMobileContextResponseDto mobileContext() {
        AttendanceSettingsResponseDto settings = getSettingsInternal();
        AppUser user = resolveCurrentUser();
        UUID collaboratorId = resolveCollaboratorIdForUser(user);
        if (collaboratorId == null) {
            return AttendanceMobileContextResponseDto.builder()
                .requirePhoto(settings.isRequirePhoto())
                .requireLocation(settings.isRequireLocation())
                .build();
        }

        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        AttendanceRecordResponseDto todayRecord = repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, today, StatusEnum.DELETED)
            .map(this::toEnrichedResponse)
            .orElse(null);
        String collaboratorName = admission != null
            ? displayName(admission)
            : collaboratorRepository
                .findById(collaboratorId)
                .map(Collaborator::getFullName)
                .orElse(user.getUsername());
        return AttendanceMobileContextResponseDto.builder()
            .collaboratorId(collaboratorId)
            .collaboratorName(collaboratorName)
            .contractType(admission != null && admission.getContractType() != null ? admission.getContractType().name() : null)
            .workloadSchedule(admission != null ? admission.getWorkloadSchedule() : null)
            .dailyWorkloadHours(expectedHoursFromAdmission(admission, today))
            .requirePhoto(settings.isRequirePhoto())
            .requireLocation(settings.isRequireLocation())
            .todayRecord(todayRecord)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<AttendanceRecordResponseDto> mobileRecords(LocalDate from, LocalDate to) {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        LocalDate periodStart = from != null ? from : LocalDate.now(BUSINESS_ZONE);
        LocalDate periodEnd = to != null ? to : periodStart;
        if (periodEnd.isBefore(periodStart)) {
            periodEnd = periodStart;
        }
        return mapToResponses(
            repository.findWorkdayByCollaboratorAndPeriod(collaboratorId, periodStart, periodEnd, StatusEnum.DELETED));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<AttendanceRequestResponseDto> mobileSubmissions(LocalDate from, LocalDate to) {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        LocalDate periodEnd = to != null ? to : LocalDate.now(BUSINESS_ZONE);
        LocalDate periodStart = from != null ? from : periodEnd.minusDays(89);
        if (periodEnd.isBefore(periodStart)) {
            periodEnd = periodStart;
        }
        return mapToRequestResponses(
            requestRepository.findByCollaboratorAndPeriod(collaboratorId, periodStart, periodEnd, StatusEnum.DELETED));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRequestResponseDto> listRequests() {
        return mapToRequestResponses(requestRepository.findByStatusNotOrderBySubmittedAtDesc(StatusEnum.DELETED));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRequestResponseDto> pendingRequests() {
        return mapToRequestResponses(
            requestRepository.findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRequestResponseDto review(UUID id, AttendanceReviewRequestDto request) {
        AttendanceRequest entity = findRequestEntity(id);
        if (!REQUEST_PENDING.equals(entity.getRequestStatus())) {
            throw AttendanceRecordException.invalidSubmission();
        }
        String action = request.getAction().trim().toUpperCase(Locale.ROOT);
        UUID reviewerId = resolveCurrentUserId();
        entity.setReviewedAt(OffsetDateTime.now(BUSINESS_ZONE));
        entity.setReviewedBy(reviewerId);
        entity.setReviewReason(request.getReason());
        if ("APPROVE".equals(action)) {
            if (entity.getRequestType() == AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE) {
                entity.setCompensationType(parseCompensationType(request.getCompensationType()));
            }
            applyApprovedRequest(entity);
            entity.setRequestStatus(REQUEST_APPROVED);
        } else if ("REJECT".equals(action)) {
            entity.setRequestStatus(REQUEST_REJECTED);
        } else {
            throw AttendanceRecordException.invalidSubmission();
        }
        AttendanceRequest saved = requestRepository.save(entity);
        auditTrail.record(AuditTrailEntry.of(
                        REQUEST_APPROVED.equals(saved.getRequestStatus())
                                ? AuditActionEnum.APPROVE
                                : AuditActionEnum.REJECT,
                        saved)
                .detail("solicitação de ponto")
                .reason(request.getReason()));
        notificationService.notifyAttendanceRequestReviewed(saved, action, request.getReason());
        return toEnrichedRequestResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AttendanceSettingsResponseDto getSettings() {
        return getSettingsInternal();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceSettingsResponseDto updateSettings(AttendanceSettingsRequestDto request) {
        upsertSetting(REQUIRE_PHOTO_KEY, request.isRequirePhoto(), "Exige selfie no registro de ponto pelo Gesint Tick");
        upsertSetting(REQUIRE_LOCATION_KEY, request.isRequireLocation(), "Exige localizacao no registro de ponto pelo Gesint Tick");
        return getSettingsInternal();
    }

    

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRecordResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected AttendanceRecord findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(AttendanceRecordException::notFound);
    }

    @Override
    protected void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto request) {
        mapper.updateEntity(entity, request);
        entity.setWorkedHours(calculateWorkedHours(entity));
    }

    private AttendanceRequest findRequestEntity(UUID id) {
        return requestRepository.findByIdAndStatusNot(id, StatusEnum.DELETED)
            .orElseThrow(AttendanceRecordException::notFound);
    }

    private AttendanceRequestResponseDto createAdjustmentRequest(
        AttendanceSubmissionRequestDto request, AttendanceSourceEnum source) {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        applyManualPunchTime(request, collaboratorId);
        validateSubmission(request);
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);

        AttendanceRecord original = resolveOriginalRecord(request, collaboratorId);
        UUID attendanceRecordId = original != null ? original.getId() : request.getTargetRecordId();

        AttendanceRequest entity = AttendanceRequest.builder()
            .collaboratorId(collaboratorId)
            .workDate(request.getRequestDate())
            .attendanceRecordId(attendanceRecordId)
            .originalClockIn(original != null ? original.getClockIn() : null)
            .originalClockOut(original != null ? original.getClockOut() : null)
            .originalBreakStart(original != null ? original.getBreakStart() : null)
            .originalBreakEnd(original != null ? original.getBreakEnd() : null)
            .originalBreakMinutes(original != null ? original.getBreakMinutes() : null)
            .originalNotes(original != null ? original.getNotes() : null)
            .clockIn(request.getClockIn())
            .clockOut(request.getClockOut())
            .breakStart(request.getBreakStart())
            .breakEnd(request.getBreakEnd())
            .breakMinutes(request.getBreakMinutes())
            .expectedHours(request.getExpectedHours() != null
                ? request.getExpectedHours()
                : expectedHoursFromAdmission(admission, request.getRequestDate()))
            .workedHours(request.getWorkedHours())
            .notes(request.getDetails())
            .requestType(request.getRequestType())
            .source(source)
            .clientRequestId(request.getClientRequestId())
            .submittedAt(request.getSubmittedAt())
            .requestStatus(REQUEST_PENDING)
            .build();
        entity.setStatus(StatusEnum.ACTIVE);
        entity = requestRepository.save(entity);
        linkRequestAttachment(entity, request.getAttachment(), ATTACHMENT_LINK_ROLE);
        return toEnrichedRequestResponse(entity);
    }

    private AttendanceRecord resolveOriginalRecord(AttendanceSubmissionRequestDto request, UUID collaboratorId) {
        if (request.getTargetRecordId() != null) {
            return repository.findByIdAndStatusNot(request.getTargetRecordId(), StatusEnum.DELETED).orElse(null);
        }
        return repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, request.getRequestDate(), StatusEnum.DELETED)
            .orElse(null);
    }

    private void applyApprovedRequest(AttendanceRequest request) {
        AttendanceRecord target = request.getAttendanceRecordId() != null
            ? findEntity(request.getAttendanceRecordId())
            : repository.findByCollaboratorIdAndWorkDateAndStatusNot(
                request.getCollaboratorId(), request.getWorkDate(), StatusEnum.DELETED)
            .orElseGet(() -> newWorkdayRecord(
                request.getCollaboratorId(),
                request.getWorkDate(),
                request.getExpectedHours(),
                request.getRequestType() == AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE));

        if (request.getRequestType() == AttendanceRequestTypeEnum.DAY_ABSENCE_EXCUSE
            || request.getRequestType() == AttendanceRequestTypeEnum.MEDICAL_CERTIFICATE
            || request.getRequestType() == AttendanceRequestTypeEnum.LEAVE_ABSENCE) {
            target.setExpectedHours(request.getExpectedHours() != null ? request.getExpectedHours() : target.getExpectedHours());
            target.setWorkedHours(target.getExpectedHours());
            target.setImpactsHourBank(Boolean.FALSE);
            target.setOccurrenceType(occurrenceFromRequestType(request.getRequestType()));
            if (request.getNotes() != null) {
                target.setNotes(request.getNotes());
            }
            repository.save(target);
            if (request.getAttendanceRecordId() == null) {
                request.setAttendanceRecordId(target.getId());
            }
            return;
        }

        if (request.getClockIn() != null) target.setClockIn(request.getClockIn());
        if (request.getBreakStart() != null) target.setBreakStart(request.getBreakStart());
        if (request.getBreakEnd() != null) target.setBreakEnd(request.getBreakEnd());
        if (request.getClockOut() != null) target.setClockOut(request.getClockOut());
        if (request.getBreakMinutes() != null) target.setBreakMinutes(request.getBreakMinutes());
        if (request.getExpectedHours() != null) target.setExpectedHours(request.getExpectedHours());
        target.setWorkedHours(calculateWorkedHours(target));
        if (request.getNotes() != null) target.setNotes(request.getNotes());
        target.setOccurrenceType(AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT);

        if (request.getRequestType() == AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE) {
            applyCompensationDestination(target, request.getCompensationType());
        } else if (request.getRequestType() == AttendanceRequestTypeEnum.HOUR_BANK) {
            target.setImpactsHourBank(Boolean.TRUE);
            target.setImpactsPayroll(Boolean.FALSE);
        }

        repository.save(target);
        if (request.getAttendanceRecordId() == null) {
            request.setAttendanceRecordId(target.getId());
        }
    }

    private void applyCompensationDestination(AttendanceRecord target, AttendanceCompensationTypeEnum compensationType) {
        if (compensationType == AttendanceCompensationTypeEnum.OVERTIME) {
            target.setImpactsHourBank(Boolean.FALSE);
            target.setImpactsPayroll(Boolean.TRUE);
            return;
        }
        // Default / HOUR_BANK
        target.setImpactsHourBank(Boolean.TRUE);
        target.setImpactsPayroll(Boolean.FALSE);
    }

    private AttendanceCompensationTypeEnum parseCompensationType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw AttendanceRecordException.compensationRequired();
        }
        try {
            return AttendanceCompensationTypeEnum.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw AttendanceRecordException.compensationRequired();
        }
    }

    private WorkSchedule resolveWorkSchedule(AdmissionProcess admission) {
        if (admission == null || admission.getWorkScheduleId() == null) {
            return null;
        }
        return workScheduleRepository
            .findByIdWithDays(admission.getWorkScheduleId(), StatusEnum.DELETED)
            .orElse(null);
    }

    private void upsertOutsideScheduleRequest(
        AttendanceRecord record,
        AttendanceClockRequestDto clockRequest,
        WorkSchedule schedule,
        AttendanceRequest existingPending) {
        AttendanceRequest pending = existingPending;
        String scheduleName = schedule != null && schedule.getName() != null ? schedule.getName() : "vinculada";
        String notes = "Ponto registrado fora dos dias de trabalho da escala \"" + scheduleName
            + "\". Aguardando aprovacao para definir banco de horas ou hora extra.";

        if (pending == null) {
            pending = AttendanceRequest.builder()
                .collaboratorId(record.getCollaboratorId())
                .workDate(record.getWorkDate())
                .attendanceRecordId(record.getId())
                .requestType(AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE)
                .source(AttendanceSourceEnum.MOBILE)
                .clientRequestId(clockRequest.getClientRequestId())
                .submittedAt(OffsetDateTime.now(BUSINESS_ZONE))
                .requestStatus(REQUEST_PENDING)
                .notes(notes)
                .build();
            pending.setStatus(StatusEnum.ACTIVE);
        } else {
            pending.setAttendanceRecordId(record.getId());
            pending.setClientRequestId(clockRequest.getClientRequestId());
            pending.setSubmittedAt(OffsetDateTime.now(BUSINESS_ZONE));
            if (pending.getNotes() == null || pending.getNotes().isBlank()) {
                pending.setNotes(notes);
            }
        }

        pending.setClockIn(record.getClockIn());
        pending.setBreakStart(record.getBreakStart());
        pending.setBreakEnd(record.getBreakEnd());
        pending.setClockOut(record.getClockOut());
        pending.setBreakMinutes(record.getBreakMinutes());
        pending.setExpectedHours(record.getExpectedHours());
        pending.setWorkedHours(record.getWorkedHours());
        requestRepository.save(pending);
    }

    private List<AttendanceRecordResponseDto> mapToResponses(List<AttendanceRecord> entities) {
        List<UUID> collaboratorIds = entities.stream()
            .map(AttendanceRecord::getCollaboratorId)
            .filter(id -> id != null)
            .distinct()
            .toList();
        Map<UUID, String> collaboratorNames = collaboratorNamesById(collaboratorIds);
        Map<UUID, AdmissionProcess> admissionsByCollaborator =
            latestCompletedAdmissionsByCollaborator(collaboratorIds);
        Map<UUID, WorkSchedule> schedulesById = loadWorkSchedulesById(
            admissionsByCollaborator.values().stream()
                .map(AdmissionProcess::getWorkScheduleId)
                .filter(id -> id != null)
                .distinct()
                .toList());
        return entities.stream()
            .map(entity -> {
                AdmissionProcess admission = entity.getCollaboratorId() != null
                    ? admissionsByCollaborator.get(entity.getCollaboratorId())
                    : null;
                WorkSchedule schedule = admission != null && admission.getWorkScheduleId() != null
                    ? schedulesById.get(admission.getWorkScheduleId())
                    : null;
                LocalDate workDate = entity.getWorkDate() != null
                    ? entity.getWorkDate()
                    : LocalDate.now(BUSINESS_ZONE);
                BigDecimal expected = entity.getCollaboratorId() == null
                    ? (entity.getExpectedHours() != null ? entity.getExpectedHours() : BigDecimal.valueOf(8))
                    : expectedHoursFromAdmission(admission, workDate, schedule);
                return mapper.toResponse(entity, collaboratorNames.get(entity.getCollaboratorId())).toBuilder()
                    .expectedHours(expected)
                    .workedHours(calculateWorkedHours(entity))
                    .build();
            })
            .toList();
    }

    private List<AttendanceRequestResponseDto> mapToRequestResponses(List<AttendanceRequest> entities) {
        Map<UUID, String> collaboratorNames = collaboratorNamesById(entities.stream()
            .map(AttendanceRequest::getCollaboratorId)
            .filter(id -> id != null)
            .distinct()
            .toList());
        return entities.stream()
            .map(entity -> requestMapper.toResponse(entity, collaboratorNames.get(entity.getCollaboratorId())))
            .toList();
    }

    private AttendanceRecordResponseDto toEnrichedResponse(AttendanceRecord entity) {
        BigDecimal expected = resolveExpectedHours(entity);
        BigDecimal worked = calculateWorkedHours(entity);
        return mapper.toResponse(entity, resolveCollaboratorName(entity.getCollaboratorId())).toBuilder()
            .expectedHours(expected)
            .workedHours(worked)
            .build();
    }

    /**
     * Linha de listagem (roster): um colaborador no período, com totais de horas.
     */
    private AttendancePresenceResponseDto toPresenceRosterResponse(
        Collaborator collaborator,
        LocalDate periodEnd,
        boolean inVacation,
        boolean onLeaveActive,
        boolean pendingAdjustmentRequest,
        WorkSchedule schedule,
        AdmissionProcess admission,
        List<AttendanceRecord> records) {
        UUID workScheduleId = schedule != null
            ? schedule.getId()
            : (admission != null ? admission.getWorkScheduleId() : null);
        String workScheduleName = schedule != null ? schedule.getName() : null;

        BigDecimal workedTotal = BigDecimal.ZERO;
        BigDecimal expectedTotal = BigDecimal.ZERO;
        BigDecimal debitTotal = BigDecimal.ZERO;
        BigDecimal creditTotal = BigDecimal.ZERO;
        for (AttendanceRecord record : records) {
            LocalDate workDate = record.getWorkDate() != null ? record.getWorkDate() : periodEnd;
            BigDecimal expected = expectedHoursFromAdmission(admission, workDate, schedule);
            if (expected == null) {
                expected = BigDecimal.ZERO;
            }
            BigDecimal worked = calculateWorkedHours(record);
            if (worked == null) {
                worked = BigDecimal.ZERO;
            }
            expectedTotal = expectedTotal.add(expected);
            workedTotal = workedTotal.add(worked);
            BigDecimal diff = expected.subtract(worked);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                debitTotal = debitTotal.add(diff);
            } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                creditTotal = creditTotal.add(diff.negate());
            }
        }

        return AttendancePresenceResponseDto.builder()
            .id("absent:" + collaborator.getId())
            .hasRecord(!records.isEmpty())
            .status(StatusEnum.ACTIVE)
            .collaboratorId(collaborator.getId())
            .collaboratorName(collaborator.getFullName())
            .photoObjectId(collaborator.getPhotoObjectId())
            .workDate(periodEnd)
            .expectedHours(expectedTotal)
            .workedHours(workedTotal)
            .debitHours(debitTotal)
            .creditHours(creditTotal)
            .inVacation(inVacation)
            .onLeaveActive(onLeaveActive)
            .pendingAdjustmentRequest(pendingAdjustmentRequest)
            .workScheduleId(workScheduleId)
            .workScheduleName(workScheduleName)
            .build();
    }

    private Map<UUID, AdmissionProcess> latestCompletedAdmissionsByCollaborator(List<UUID> collaboratorIds) {
        if (collaboratorIds == null || collaboratorIds.isEmpty()) {
            return Map.of();
        }
        Set<UUID> collaboratorIdSet = new HashSet<>(collaboratorIds);
        Map<UUID, AdmissionProcess> latestByCollaborator = new HashMap<>();
        for (AdmissionProcess admission : admissionProcessRepository
            .findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(
                AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)) {
            if (admission.getCollaboratorId() == null || !collaboratorIdSet.contains(admission.getCollaboratorId())) {
                continue;
            }
            AdmissionProcess current = latestByCollaborator.get(admission.getCollaboratorId());
            if (current == null || admissionStartDate(admission).isAfter(admissionStartDate(current))) {
                latestByCollaborator.put(admission.getCollaboratorId(), admission);
            }
        }
        return latestByCollaborator;
    }

    private static LocalDate admissionStartDate(AdmissionProcess admission) {
        LocalDate date = admission.getContractStartDate() != null
            ? admission.getContractStartDate()
            : admission.getExpectedStartDate();
        return date == null ? LocalDate.MIN : date;
    }

    private Map<UUID, WorkSchedule> loadWorkSchedulesById(List<UUID> scheduleIds) {
        if (scheduleIds == null || scheduleIds.isEmpty()) {
            return Map.of();
        }
        return workScheduleRepository.findAllByIdWithDays(scheduleIds, StatusEnum.DELETED).stream()
            .collect(Collectors.toMap(WorkSchedule::getId, Function.identity(), (left, right) -> left));
    }

    /**
     * Dia fora da escala: ha escala vinculada e a jornada esperada do dia e zero
     * (dia ausente no quadro ou com periodos vazios).
     */
    private boolean isOutsideWorkSchedule(WorkSchedule schedule, LocalDate workDate) {
        if (schedule == null || workDate == null) {
            return false;
        }
        BigDecimal expected = hoursForScheduleDay(schedule, workDate);
        return expected == null || expected.compareTo(BigDecimal.ZERO) <= 0;
    }

    private BigDecimal expectedHoursFromAdmission(
        AdmissionProcess admission, LocalDate workDate, WorkSchedule schedule) {
        if (schedule != null) {
            return hoursForScheduleDay(schedule, workDate);
        }
        return expectedHoursFromAdmission(admission, workDate);
    }

    private static boolean isVacationOccurrence(AttendanceRecord record) {
        return record != null && record.getOccurrenceType() == AttendanceOccurrenceTypeEnum.VACATION;
    }

    private static boolean isJustifiedLeaveOccurrence(AttendanceRecord record) {
        if (record == null || record.getOccurrenceType() == null) {
            return false;
        }
        return switch (record.getOccurrenceType()) {
            case MEDICAL_CERTIFICATE, LEAVE_ABSENCE, LICENSE -> true;
            default -> false;
        };
    }

    private AttendanceRequestResponseDto toEnrichedRequestResponse(AttendanceRequest entity) {
        return requestMapper.toResponse(entity, resolveCollaboratorName(entity.getCollaboratorId()));
    }

    private Map<UUID, String> collaboratorNamesById(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
            .filter(c -> c.getStatus() != StatusEnum.DELETED)
            .collect(Collectors.toMap(Collaborator::getId, Collaborator::getFullName, (a, b) -> a));
    }

    private String resolveCollaboratorName(UUID collaboratorId) {
        if (collaboratorId == null) {
            return null;
        }
        return collaboratorNamesById(List.of(collaboratorId)).get(collaboratorId);
    }

    private void ensureUniqueWorkDate(UUID collaboratorId, LocalDate workDate, UUID excludeId) {
        if (collaboratorId == null || workDate == null) {
            return;
        }
        repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, workDate, StatusEnum.DELETED)
            .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
            .ifPresent(existing -> {
                throw AttendanceRecordException.duplicateWorkDate();
            });
    }

    private AttendanceRecord newWorkdayRecord(
        UUID collaboratorId, LocalDate workDate, BigDecimal expectedHours, boolean outsideWorkSchedule) {
        AttendanceRecord entity = AttendanceRecord.builder()
            .collaboratorId(collaboratorId)
            .workDate(workDate)
            .breakMinutes(0)
            .expectedHours(expectedHours)
            .workedHours(BigDecimal.ZERO)
            .occurrenceType(outsideWorkSchedule
                ? AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT
                : AttendanceOccurrenceTypeEnum.NORMAL_WORK)
            .occurrenceOrigin(AttendanceOccurrenceOriginEnum.MOBILE)
            .impactsHourBank(!outsideWorkSchedule)
            .impactsPayroll(!outsideWorkSchedule)
            .build();
        entity.setStatus(StatusEnum.ACTIVE);
        return entity;
    }

    private void applyNextPunch(AttendanceRecord entity, LocalTime time) {
        if (entity.getClockIn() == null) {
            entity.setClockIn(time);
        } else if (entity.getBreakStart() == null) {
            entity.setBreakStart(time);
        } else if (entity.getBreakEnd() == null) {
            entity.setBreakEnd(time);
            entity.setBreakMinutes(minutesBetween(entity.getBreakStart(), entity.getBreakEnd()));
        } else if (entity.getClockOut() == null) {
            entity.setClockOut(time);
        } else {
            throw AttendanceRecordException.invalidSubmission();
        }
    }

    private BigDecimal calculateWorkedHours(AttendanceRecord entity) {
        if (entity.getWorkedHours() != null && entity.getClockIn() == null && entity.getClockOut() == null) {
            return entity.getWorkedHours();
        }
        if (entity.getClockIn() == null) {
            return BigDecimal.ZERO;
        }
        LocalDate workDate = entity.getWorkDate();
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        LocalTime end;
        if (entity.getClockOut() != null) {
            end = entity.getClockOut();
        } else if (workDate != null && workDate.equals(today)) {
            // Dia aberto de hoje: conta até o horário atual.
            end = LocalTime.now(BUSINESS_ZONE);
        } else {
            // Histórico incompleto sem saída: não inventa horas com o relógio de agora.
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        int grossMinutes = minutesBetween(entity.getClockIn(), end);
        int breakMinutes = entity.getBreakMinutes() != null ? entity.getBreakMinutes() : 0;
        if (entity.getBreakStart() != null && entity.getBreakEnd() != null) {
            breakMinutes = minutesBetween(entity.getBreakStart(), entity.getBreakEnd());
        }
        int netMinutes = Math.max(0, grossMinutes - Math.max(0, breakMinutes));
        return BigDecimal.valueOf(netMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private void applyDerivedHours(AttendanceRecord entity) {
        if (entity.getBreakStart() != null && entity.getBreakEnd() != null) {
            entity.setBreakMinutes(minutesBetween(entity.getBreakStart(), entity.getBreakEnd()));
        }
        entity.setWorkedHours(calculateWorkedHours(entity));
        entity.setExpectedHours(resolveExpectedHours(entity));
        if (entity.getOccurrenceOrigin() == null) {
            entity.setOccurrenceOrigin(AttendanceOccurrenceOriginEnum.MANUAL);
        }
        if (entity.getOccurrenceType() == null) {
            entity.setOccurrenceType(AttendanceOccurrenceTypeEnum.NORMAL_WORK);
        }
    }

    private BigDecimal resolveExpectedHours(AttendanceRecord entity) {
        if (entity.getCollaboratorId() == null) {
            return entity.getExpectedHours() != null ? entity.getExpectedHours() : BigDecimal.valueOf(8);
        }
        LocalDate workDate = entity.getWorkDate() != null ? entity.getWorkDate() : LocalDate.now(BUSINESS_ZONE);
        return expectedHoursFromAdmission(latestCompletedAdmission(entity.getCollaboratorId()), workDate);
    }

    private int minutesBetween(LocalTime start, LocalTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            return 0;
        }
        return (int) Duration.between(start, end).toMinutes();
    }

    private UUID resolveCurrentCollaboratorId() {
        AppUser user = resolveCurrentUser();
        UUID collaboratorId = resolveCollaboratorIdForUser(user);
        if (collaboratorId == null) {
            throw AttendanceRecordException.collaboratorNotLinked();
        }
        return collaboratorId;
    }

    /**
     * ADMIN (role de sistema) passa reto: se não houver colaborador vinculado,
     * cria/associa um registro pessoal automaticamente.
     */
    private UUID resolveCollaboratorIdForUser(AppUser user) {
        if (user.getCollaboratorId() != null) {
            return user.getCollaboratorId();
        }
        if (!isSystemAdmin(user)) {
            return null;
        }
        return ensurePersonalCollaborator(user);
    }

    private boolean isSystemAdmin(AppUser user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return false;
        }
        return user.getRoles().stream()
            .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
            .anyMatch(Role::isGlobalAdmin);
    }

    private UUID ensurePersonalCollaborator(AppUser user) {
        String cpf = syntheticCpfForUser(user.getId());
        Collaborator collaborator = collaboratorRepository
            .findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
            .orElseGet(() -> {
                String fullName = user.getName() != null && !user.getName().isBlank()
                    ? user.getName()
                    : user.getUsername();
                Collaborator created = Collaborator.builder()
                    .fullName(fullName)
                    .cpf(cpf)
                    .birthDate(LocalDate.of(1990, 1, 1))
                    .status(StatusEnum.ACTIVE)
                    .build();
                return collaboratorRepository.save(created);
            });
        user.setCollaboratorId(collaborator.getId());
        appUserRepository.save(user);
        return collaborator.getId();
    }

    /** CPF sintético estável por usuário (somente dígitos), para vínculo automático do ADMIN. */
    private static String syntheticCpfForUser(UUID userId) {
        String hex = userId.toString().replace("-", "");
        StringBuilder digits = new StringBuilder(11);
        for (int i = 0; i < hex.length() && digits.length() < 11; i++) {
            digits.append(Character.digit(hex.charAt(i), 16) % 10);
        }
        while (digits.length() < 11) {
            digits.append('0');
        }
        return digits.toString();
    }

    private UUID resolveCurrentUserId() {
        return resolveCurrentUser().getId();
    }

    private AppUser resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw AttendanceRecordException.collaboratorNotLinked();
        }
        return appUserRepository
            .findByIdAndStatusNot(userId, StatusEnum.DELETED)
            .orElseThrow(AttendanceRecordException::collaboratorNotLinked);
    }

    private AdmissionProcess latestCompletedAdmission(UUID collaboratorId) {
        return admissionProcessRepository
            .findByCollaboratorIdAndAdmissionStatusAndStatusNot(
                collaboratorId, AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)
            .stream()
            .max(Comparator.comparing((AdmissionProcess admission) -> {
                LocalDate date = admission.getContractStartDate() != null
                    ? admission.getContractStartDate()
                    : admission.getExpectedStartDate();
                return date == null ? LocalDate.MIN : date;
            }))
            .orElse(null);
    }

    /**
     * Jornada esperada do dia: períodos da escala vinculada na admissão.
     * Fallback: texto de carga horária (ex.: 40h → 8,00 | 44h → 8,80).
     */
    private BigDecimal expectedHoursFromAdmission(AdmissionProcess admission, LocalDate workDate) {
        BigDecimal fromSchedule = expectedHoursFromWorkSchedule(admission, workDate);
        if (fromSchedule != null) {
            return fromSchedule;
        }
        return expectedHoursFromWorkloadText(admission);
    }

    private BigDecimal expectedHoursFromWorkSchedule(AdmissionProcess admission, LocalDate workDate) {
        if (admission == null || admission.getWorkScheduleId() == null || workDate == null) {
            return null;
        }
        return workScheduleRepository
            .findByIdWithDays(admission.getWorkScheduleId(), StatusEnum.DELETED)
            .map(schedule -> hoursForScheduleDay(schedule, workDate))
            .orElse(null);
    }

    private BigDecimal hoursForScheduleDay(WorkSchedule schedule, LocalDate workDate) {
        WeekDayEnum weekDay = WeekDayEnum.valueOf(workDate.getDayOfWeek().name());
        if (schedule.getDays() == null || schedule.getDays().isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        WorkScheduleDay day = schedule.getDays().stream()
            .filter(item -> item.getDayOfWeek() == weekDay)
            .findFirst()
            .orElse(null);
        if (day == null) {
            // Dia sem quadro na escala = folga (0h esperadas)
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        int minutes = minutesBetween(day.getPeriod1Start(), day.getPeriod1End())
            + minutesBetween(day.getPeriod2Start(), day.getPeriod2End());
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    /**
     * Fallback pela carga textual da admissão.
     * Exemplos: 40h → 8,00 | 44h → 8,80 | 12x36 → 12 | 20h a 30h → 4,00 (usa o 1º número).
     */
    private BigDecimal expectedHoursFromWorkloadText(AdmissionProcess admission) {
        if (admission == null || admission.getWorkloadSchedule() == null || admission.getWorkloadSchedule().isBlank()) {
            return BigDecimal.valueOf(8);
        }
        String schedule = admission.getWorkloadSchedule().trim();
        String normalized = schedule.toLowerCase(Locale.ROOT).replace(" ", "");
        if (normalized.contains("12x36")) {
            return BigDecimal.valueOf(12);
        }
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d+)").matcher(schedule);
        if (!matcher.find()) {
            return BigDecimal.valueOf(8);
        }
        int hours = Integer.parseInt(matcher.group(1));
        if (hours <= 0) {
            return BigDecimal.valueOf(8);
        }
        // Cargas semanais típicas (20–44) → jornada diária em 5 dias úteis
        if (hours >= 20 && hours <= 44) {
            return BigDecimal.valueOf(hours).divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(hours);
    }

    private String displayName(AdmissionProcess admission) {
        return admission.getSocialName() != null && !admission.getSocialName().isBlank()
            ? admission.getSocialName()
            : admission.getFullName();
    }

    private AttendanceOccurrenceTypeEnum occurrenceFromRequestType(AttendanceRequestTypeEnum requestType) {
        if (requestType == AttendanceRequestTypeEnum.MEDICAL_CERTIFICATE) {
            return AttendanceOccurrenceTypeEnum.MEDICAL_CERTIFICATE;
        }
        if (requestType == AttendanceRequestTypeEnum.LEAVE_ABSENCE
            || requestType == AttendanceRequestTypeEnum.DAY_ABSENCE_EXCUSE) {
            return AttendanceOccurrenceTypeEnum.LEAVE_ABSENCE;
        }
        return AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT;
    }

    private void applyManualPunchTime(AttendanceSubmissionRequestDto request, UUID collaboratorId) {
        if (request.getManualPunchTime() == null || request.getTargetRecordId() != null) {
            return;
        }
        if (request.getClockIn() != null || request.getBreakStart() != null
            || request.getBreakEnd() != null || request.getClockOut() != null) {
            return;
        }

        AttendanceRecord target = repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, request.getRequestDate(), StatusEnum.DELETED)
            .orElse(null);
        LocalTime time = request.getManualPunchTime();
        String slot = inferManualPunchSlot(target, time);
        if ("clockIn".equals(slot)) {
            request.setClockIn(time);
        } else if ("breakStart".equals(slot)) {
            request.setBreakStart(time);
        } else if ("breakEnd".equals(slot)) {
            request.setBreakEnd(time);
        } else {
            request.setClockOut(time);
        }
    }

    private String inferManualPunchSlot(AttendanceRecord target, LocalTime time) {
        if (target == null || target.getClockIn() == null) {
            return "clockIn";
        }
        if (target.getBreakStart() == null && isBetween(time, target.getClockIn(), target.getBreakEnd())) {
            return "breakStart";
        }
        if (target.getBreakEnd() == null && isBetween(time, target.getBreakStart(), target.getClockOut())) {
            return "breakEnd";
        }
        if (target.getClockOut() == null && isAfterOrEqual(time, target.getBreakEnd())) {
            return "clockOut";
        }
        if (target.getBreakStart() == null) {
            return "breakStart";
        }
        if (target.getBreakEnd() == null) {
            return "breakEnd";
        }
        return "clockOut";
    }

    private boolean isBetween(LocalTime time, LocalTime previous, LocalTime next) {
        return isAfterOrEqual(time, previous) && (next == null || time.isBefore(next));
    }

    private boolean isAfterOrEqual(LocalTime time, LocalTime previous) {
        return previous == null || !time.isBefore(previous);
    }

    private void linkRecordAttachment(AttendanceRecord entity, AttendanceAttachmentReferenceDto attachment, String role) {
        if (attachment == null || attachment.getObjectId() == null) {
            return;
        }
        // Internal: autenticado (clock) e publico (landing /ponto) compartilham o mesmo vinculo CLOCK_PHOTO.
        storageService.linkToEntityInternal(
            STORAGE_ENTITY_TYPE,
            entity.getId(),
            attachment.getObjectId(),
            role,
            attachment.getFileName(),
            attachment.getDocumentType());
    }

    private void linkRequestAttachment(AttendanceRequest entity, AttendanceAttachmentReferenceDto attachment, String role) {
        if (attachment == null || attachment.getObjectId() == null) {
            return;
        }
        storageService.linkToEntity(
            REQUEST_STORAGE_ENTITY_TYPE,
            entity.getId(),
            attachment.getObjectId(),
            role,
            attachment.getFileName(),
            attachment.getDocumentType());
    }

    private AttendanceSettingsResponseDto getSettingsInternal() {
        return AttendanceSettingsResponseDto.builder()
            .requirePhoto(getBooleanSetting(REQUIRE_PHOTO_KEY, true))
            .requireLocation(getBooleanSetting(REQUIRE_LOCATION_KEY, true))
            .build();
    }

    private boolean getBooleanSetting(String key, boolean defaultValue) {
        return settingRepository.findBySettingKeyAndStatusNot(key, StatusEnum.DELETED)
            .map(SystemSetting::getSettingValue)
            .map(Boolean::parseBoolean)
            .orElse(defaultValue);
    }

    private void upsertSetting(String key, boolean value, String description) {
        SystemSetting setting = settingRepository.findBySettingKeyAndStatusNot(key, StatusEnum.DELETED)
            .orElseGet(() -> SystemSetting.builder()
                .settingKey(key)
                .description(description)
                .status(StatusEnum.ACTIVE)
                .build());
        setting.setSettingValue(String.valueOf(value));
        settingRepository.save(setting);
    }

    private static void validateSubmission(AttendanceSubmissionRequestDto request) {
        boolean hasTime = request.getClockIn() != null
            || request.getClockOut() != null
            || request.getBreakStart() != null
            || request.getBreakEnd() != null
            || request.getWorkedHours() != null;
        boolean detailsOnlyRequest = request.getRequestType() == AttendanceRequestTypeEnum.DAY_ABSENCE_EXCUSE
            || request.getRequestType() == AttendanceRequestTypeEnum.MEDICAL_CERTIFICATE
            || request.getRequestType() == AttendanceRequestTypeEnum.LEAVE_ABSENCE
            || request.getRequestType() == AttendanceRequestTypeEnum.HOUR_BANK
            || request.getRequestType() == AttendanceRequestTypeEnum.OTHER;
        if (!hasTime && !detailsOnlyRequest) {
            throw AttendanceRecordException.invalidSubmission();
        }
    }
}
