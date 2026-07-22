package br.com.gommo.modules.rh.person.attendance.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemSetting;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemSettingRepository;
import br.com.gommo.modules.cfg.settings.notification.service.SystemNotificationService;
import br.com.gommo.modules.dp.organization.workschedule.entity.WeekDayEnum;
import br.com.gommo.modules.dp.organization.workschedule.entity.WorkSchedule;
import br.com.gommo.modules.dp.organization.workschedule.entity.WorkScheduleDay;
import br.com.gommo.modules.dp.organization.workschedule.repository.WorkScheduleRepository;
import br.com.gommo.modules.rh.person.attendance.dto.*;
import br.com.gommo.modules.rh.person.attendance.entity.*;
import br.com.gommo.modules.rh.person.attendance.exception.AttendanceRecordException;
import br.com.gommo.modules.rh.person.attendance.mapper.AttendanceRecordMapper;
import br.com.gommo.modules.rh.person.attendance.mapper.AttendanceRequestMapper;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRecordRepository;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRequestRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.storage.service.IStorageService;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
        IStorageService storageService) {
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

        // Apenas colaboradores com admissão concluída (exclui vínculos sintéticos, ex.: ADMIN).
        List<UUID> admittedIds = admissionProcessRepository.findCollaboratorIdsFromCompletedAdmissions(
            AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED);
        if (admittedIds.isEmpty()) {
            return List.of();
        }
        List<Collaborator> collaborators = collaboratorRepository.findAllById(admittedIds).stream()
            .filter(collaborator -> collaborator.getStatus() == StatusEnum.ACTIVE)
            .sorted(Comparator.comparing(Collaborator::getFullName, String.CASE_INSENSITIVE_ORDER))
            .toList();
        if (collaborators.isEmpty()) {
            return List.of();
        }

        List<UUID> collaboratorIds = collaborators.stream().map(Collaborator::getId).toList();
        Map<String, AttendanceRecord> recordsByKey = repository
            .findByWorkDateBetweenAndStatusNot(periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .collect(Collectors.toMap(
                record -> presenceKey(record.getCollaboratorId(), record.getWorkDate()),
                Function.identity(),
                (left, right) -> left.getCreatedAt() != null
                        && right.getCreatedAt() != null
                        && left.getCreatedAt().isAfter(right.getCreatedAt())
                    ? left
                    : right));

        Map<UUID, List<LeaveRequest>> vacationsByCollaborator = leaveRequestRepository
            .findApprovedByCollaboratorInAndTypeOverlapping(
                collaboratorIds, LeaveTypeEnum.VACATION, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        Map<UUID, List<LeaveRequest>> absencesByCollaborator = leaveRequestRepository
            .findApprovedAbsencesByCollaboratorInOverlapping(
                collaboratorIds, LeaveTypeEnum.VACATION, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        List<AttendancePresenceResponseDto> rows = new ArrayList<>();
        for (LocalDate day = periodStart; !day.isAfter(periodEnd); day = day.plusDays(1)) {
            for (Collaborator collaborator : collaborators) {
                AttendanceRecord record = recordsByKey.get(presenceKey(collaborator.getId(), day));
                boolean inVacation = coversDate(vacationsByCollaborator.get(collaborator.getId()), day)
                    || isVacationOccurrence(record);
                boolean onLeaveActive = coversDate(absencesByCollaborator.get(collaborator.getId()), day)
                    || isJustifiedLeaveOccurrence(record);
                boolean present = record != null && record.getClockIn() != null;
                rows.add(toPresenceResponse(collaborator, day, record, present, inVacation, onLeaveActive));
            }
        }

        rows.sort(Comparator
            .comparing(AttendancePresenceResponseDto::getWorkDate, Comparator.reverseOrder())
            .thenComparing(
                row -> row.getCollaboratorName() != null ? row.getCollaboratorName() : "",
                String.CASE_INSENSITIVE_ORDER));
        return rows;
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
            UUID collaboratorId, int page, int size) {
        int safeSize = Math.max(1, size);
        int safePage = Math.max(0, page);
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
        Map<UUID, String> collaboratorNames = collaboratorNamesById(content.stream()
            .map(AttendanceRecordResponseDto::getCollaboratorId)
            .distinct()
            .toList());
        Map<UUID, AttendanceRecord> entitiesById = repository
            .findAllById(content.stream().map(AttendanceRecordResponseDto::getId).toList())
            .stream()
            .filter(entity -> entity.getStatus() != StatusEnum.DELETED)
            .collect(Collectors.toMap(AttendanceRecord::getId, Function.identity()));
        List<AttendanceRecordResponseDto> enriched = content.stream()
            .map(dto -> mapper.toResponse(
                entitiesById.get(dto.getId()), collaboratorNames.get(dto.getCollaboratorId())))
            .toList();
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
        updateEntity(entity, request);
        applyDerivedHours(entity);
        return toEnrichedResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
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
        AttendanceSettingsResponseDto settings = getSettingsInternal();
        if (settings.isRequirePhoto() && (request.getPhoto() == null || request.getPhoto().getObjectId() == null)) {
            throw AttendanceRecordException.invalidSubmission();
        }
        if (settings.isRequireLocation() && (request.getLatitude() == null || request.getLongitude() == null)) {
            throw AttendanceRecordException.invalidSubmission();
        }

        UUID collaboratorId = resolveCurrentCollaboratorId();
        LocalDate workDate = request.getCapturedAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate();
        LocalTime time = request.getCapturedAt().atZoneSameInstant(BUSINESS_ZONE).toLocalTime().withNano(0);
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        BigDecimal expectedHours = expectedHoursFromAdmission(admission, workDate);

        AttendanceRecord entity = repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(collaboratorId, workDate, StatusEnum.DELETED)
            .orElseGet(() -> newWorkdayRecord(collaboratorId, workDate, expectedHours));

        applyNextPunch(entity, time);
        entity.setExpectedHours(expectedHours);
        entity.setWorkedHours(calculateWorkedHours(entity));
        entity.setPhotoObjectId(request.getPhoto() != null ? request.getPhoto().getObjectId() : null);
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setLocationAccuracyMeters(request.getLocationAccuracyMeters());
        entity = repository.save(entity);
        linkRecordAttachment(entity, request.getPhoto(), PHOTO_LINK_ROLE);
        return toEnrichedResponse(entity);
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
    @PreAuthorize("hasAuthority('attendance:write')")
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
    @PreAuthorize("hasAuthority('attendance:write')")
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
            applyApprovedRequest(entity);
            entity.setRequestStatus(REQUEST_APPROVED);
        } else if ("REJECT".equals(action)) {
            entity.setRequestStatus(REQUEST_REJECTED);
        } else {
            throw AttendanceRecordException.invalidSubmission();
        }
        AttendanceRequest saved = requestRepository.save(entity);
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
        upsertSetting(REQUIRE_PHOTO_KEY, request.isRequirePhoto(), "Exige selfie no registro de ponto pelo Gommo Tick");
        upsertSetting(REQUIRE_LOCATION_KEY, request.isRequireLocation(), "Exige localizacao no registro de ponto pelo Gommo Tick");
        return getSettingsInternal();
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
                request.getExpectedHours()));

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
        repository.save(target);
        if (request.getAttendanceRecordId() == null) {
            request.setAttendanceRecordId(target.getId());
        }
    }

    private List<AttendanceRecordResponseDto> mapToResponses(List<AttendanceRecord> entities) {
        Map<UUID, String> collaboratorNames = collaboratorNamesById(entities.stream()
            .map(AttendanceRecord::getCollaboratorId)
            .filter(id -> id != null)
            .distinct()
            .toList());
        return entities.stream()
            .map(entity -> mapper.toResponse(entity, collaboratorNames.get(entity.getCollaboratorId())).toBuilder()
                .expectedHours(resolveExpectedHours(entity))
                .workedHours(calculateWorkedHours(entity))
                .build())
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

    private AttendancePresenceResponseDto toPresenceResponse(
        Collaborator collaborator,
        LocalDate workDate,
        AttendanceRecord record,
        boolean present,
        boolean inVacation,
        boolean onLeaveActive) {
        if (record != null) {
            return AttendancePresenceResponseDto.builder()
                .id(record.getId().toString())
                .hasRecord(true)
                .code(record.getCode())
                .status(record.getStatus())
                .collaboratorId(collaborator.getId())
                .collaboratorName(collaborator.getFullName())
                .photoObjectId(collaborator.getPhotoObjectId())
                .workDate(workDate)
                .clockIn(record.getClockIn())
                .clockOut(record.getClockOut())
                .breakStart(record.getBreakStart())
                .breakEnd(record.getBreakEnd())
                .breakMinutes(record.getBreakMinutes())
                .occurrenceType(record.getOccurrenceType())
                .occurrenceOrigin(record.getOccurrenceOrigin())
                .referenceId(record.getReferenceId())
                .expectedHours(resolveExpectedHours(record))
                .workedHours(calculateWorkedHours(record))
                .impactsHourBank(record.getImpactsHourBank())
                .impactsPayroll(record.getImpactsPayroll())
                .notes(record.getNotes())
                .present(present)
                .inVacation(inVacation)
                .onLeaveActive(onLeaveActive)
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
        }
        return AttendancePresenceResponseDto.builder()
            .id("absent:" + collaborator.getId() + ":" + workDate)
            .hasRecord(false)
            .status(StatusEnum.ACTIVE)
            .collaboratorId(collaborator.getId())
            .collaboratorName(collaborator.getFullName())
            .photoObjectId(collaborator.getPhotoObjectId())
            .workDate(workDate)
            .expectedHours(expectedHoursFromAdmission(latestCompletedAdmission(collaborator.getId()), workDate))
            .present(false)
            .inVacation(inVacation)
            .onLeaveActive(onLeaveActive)
            .build();
    }

    private static String presenceKey(UUID collaboratorId, LocalDate workDate) {
        return collaboratorId + "|" + workDate;
    }

    private static boolean coversDate(List<LeaveRequest> leaves, LocalDate day) {
        if (leaves == null || leaves.isEmpty() || day == null) {
            return false;
        }
        return leaves.stream()
            .anyMatch(leave -> leave.getStartDate() != null
                && leave.getEndDate() != null
                && !leave.getStartDate().isAfter(day)
                && !leave.getEndDate().isBefore(day));
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

    private AttendanceRecord newWorkdayRecord(UUID collaboratorId, LocalDate workDate, BigDecimal expectedHours) {
        AttendanceRecord entity = AttendanceRecord.builder()
            .collaboratorId(collaboratorId)
            .workDate(workDate)
            .breakMinutes(0)
            .expectedHours(expectedHours)
            .workedHours(BigDecimal.ZERO)
            .occurrenceType(AttendanceOccurrenceTypeEnum.NORMAL_WORK)
            .occurrenceOrigin(AttendanceOccurrenceOriginEnum.MOBILE)
            .impactsHourBank(Boolean.TRUE)
            .impactsPayroll(Boolean.TRUE)
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
        LocalTime end = entity.getClockOut() != null ? entity.getClockOut() : LocalTime.now(BUSINESS_ZONE);
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
            .anyMatch(role -> role.isSystemRole() && "ADMIN".equalsIgnoreCase(role.getName()));
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
        storageService.linkToEntity(
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
