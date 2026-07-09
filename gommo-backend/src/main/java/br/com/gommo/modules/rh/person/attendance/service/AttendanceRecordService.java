package br.com.gommo.modules.rh.person.attendance.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemSetting;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemSettingRepository;
import br.com.gommo.modules.rh.person.attendance.dto.*;
import br.com.gommo.modules.rh.person.attendance.entity.*;
import br.com.gommo.modules.rh.person.attendance.exception.AttendanceRecordException;
import br.com.gommo.modules.rh.person.attendance.mapper.AttendanceRecordMapper;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRecordRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AttendanceRecordService
    extends BaseService<AttendanceRecord, AttendanceRecordRequestDto, AttendanceRecordResponseDto>
    implements IAttendanceRecordService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final String STORAGE_ENTITY_TYPE = "attendance_record";
    private static final String ATTACHMENT_LINK_ROLE = "ATTACHMENT";
    private static final String PHOTO_LINK_ROLE = "CLOCK_PHOTO";
    private static final String REQUEST_PENDING = "PENDING";
    private static final String REQUEST_APPROVED = "APPROVED";
    private static final String REQUEST_REJECTED = "REJECTED";
    private static final String REQUIRE_PHOTO_KEY = "ATTENDANCE_REQUIRE_PHOTO";
    private static final String REQUIRE_LOCATION_KEY = "ATTENDANCE_REQUIRE_LOCATION";

    private final AttendanceRecordRepository repository;
    private final AttendanceRecordMapper mapper;
    private final AppUserRepository appUserRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final SystemSettingRepository settingRepository;
    private final IStorageService storageService;

    public AttendanceRecordService(
        AttendanceRecordRepository repository,
        AttendanceRecordMapper mapper,
        AppUserRepository appUserRepository,
        AdmissionProcessRepository admissionProcessRepository,
        SystemSettingRepository settingRepository,
        IStorageService storageService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.appUserRepository = appUserRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.settingRepository = settingRepository;
        this.storageService = storageService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRecordResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AttendanceRecordResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public PageableResponseDto<AttendanceRecordResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto create(AttendanceRecordRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto update(UUID id, AttendanceRecordRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto submit(AttendanceSubmissionRequestDto request) {
        AttendanceSourceEnum source = request.getSource() != null ? request.getSource() : AttendanceSourceEnum.MOBILE;
        return repository
            .findBySourceAndClientRequestIdAndStatusNot(source, request.getClientRequestId(), StatusEnum.DELETED)
            .map(mapper::toResponse)
            .orElseGet(() -> createAdjustmentRequest(request, source));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
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
        BigDecimal expectedHours = expectedHoursFromAdmission(admission);

        AttendanceRecord entity = repository
            .findByCollaboratorIdAndWorkDateAndRequestStatusIsNullAndStatusNot(collaboratorId, workDate, StatusEnum.DELETED)
            .orElseGet(() -> newWorkdayRecord(collaboratorId, workDate, expectedHours));

        applyNextPunch(entity, time);
        entity.setExpectedHours(expectedHours);
        entity.setWorkedHours(calculateWorkedHours(entity));
        entity.setSource(AttendanceSourceEnum.MOBILE);
        entity.setClientRequestId(request.getClientRequestId());
        entity.setSubmittedAt(request.getCapturedAt());
        entity.setPhotoObjectId(request.getPhoto() != null ? request.getPhoto().getObjectId() : null);
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setLocationAccuracyMeters(request.getLocationAccuracyMeters());
        entity = repository.save(entity);
        linkAttachment(entity, request.getPhoto(), PHOTO_LINK_ROLE);
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceMobileContextResponseDto mobileContext() {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        AttendanceRecordResponseDto todayRecord = repository
            .findByCollaboratorIdAndWorkDateAndRequestStatusIsNullAndStatusNot(collaboratorId, today, StatusEnum.DELETED)
            .map(mapper::toResponse)
            .orElse(null);
        AttendanceSettingsResponseDto settings = getSettingsInternal();
        return AttendanceMobileContextResponseDto.builder()
            .collaboratorId(collaboratorId)
            .collaboratorName(admission != null ? displayName(admission) : null)
            .contractType(admission != null && admission.getContractType() != null ? admission.getContractType().name() : null)
            .workloadSchedule(admission != null ? admission.getWorkloadSchedule() : null)
            .dailyWorkloadHours(expectedHoursFromAdmission(admission))
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
        return repository.findWorkdayByCollaboratorAndPeriod(collaboratorId, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:write')")
    public List<AttendanceRecordResponseDto> mobileSubmissions(LocalDate from, LocalDate to) {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        LocalDate periodEnd = to != null ? to : LocalDate.now(BUSINESS_ZONE);
        LocalDate periodStart = from != null ? from : periodEnd.minusDays(89);
        if (periodEnd.isBefore(periodStart)) {
            periodEnd = periodStart;
        }
        return repository.findRequestsByCollaboratorAndPeriod(collaboratorId, periodStart, periodEnd, StatusEnum.DELETED)
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public List<AttendanceRecordResponseDto> pendingRequests() {
        return repository.findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED)
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('attendance:write')")
    public AttendanceRecordResponseDto review(UUID id, AttendanceReviewRequestDto request) {
        AttendanceRecord entity = findEntity(id);
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
        return mapper.toResponse(repository.save(entity));
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

    private AttendanceRecordResponseDto createAdjustmentRequest(
        AttendanceSubmissionRequestDto request, AttendanceSourceEnum source) {
        UUID collaboratorId = resolveCurrentCollaboratorId();
        applyManualPunchTime(request, collaboratorId);
        validateSubmission(request);
        AdmissionProcess admission = latestCompletedAdmission(collaboratorId);
        AttendanceRecord entity = AttendanceRecord.builder()
            .collaboratorId(collaboratorId)
            .workDate(request.getRequestDate())
            .clockIn(request.getClockIn())
            .clockOut(request.getClockOut())
            .breakStart(request.getBreakStart())
            .breakEnd(request.getBreakEnd())
            .breakMinutes(request.getBreakMinutes())
            .expectedHours(request.getExpectedHours() != null ? request.getExpectedHours() : expectedHoursFromAdmission(admission))
            .workedHours(request.getWorkedHours())
            .notes(request.getDetails())
            .occurrenceType(occurrenceFromRequestType(request.getRequestType()))
            .occurrenceOrigin(source == AttendanceSourceEnum.MOBILE ? AttendanceOccurrenceOriginEnum.MOBILE : AttendanceOccurrenceOriginEnum.MANUAL)
            .referenceId(request.getTargetRecordId())
            .requestType(request.getRequestType())
            .source(source)
            .clientRequestId(request.getClientRequestId())
            .submittedAt(request.getSubmittedAt())
            .requestStatus(REQUEST_PENDING)
            .impactsHourBank(Boolean.TRUE)
            .impactsPayroll(Boolean.TRUE)
            .build();
        entity.setStatus(StatusEnum.ACTIVE);
        entity = repository.save(entity);
        linkAttachment(entity, request.getAttachment(), ATTACHMENT_LINK_ROLE);
        return mapper.toResponse(entity);
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

    private void applyApprovedRequest(AttendanceRecord request) {
        if (request.getRequestType() == AttendanceRequestTypeEnum.DAY_ABSENCE_EXCUSE
            || request.getRequestType() == AttendanceRequestTypeEnum.MEDICAL_CERTIFICATE
            || request.getRequestType() == AttendanceRequestTypeEnum.LEAVE_ABSENCE) {
            request.setWorkedHours(request.getExpectedHours());
            request.setImpactsHourBank(Boolean.FALSE);
            return;
        }
        AttendanceRecord target = request.getReferenceId() != null
            ? findEntity(request.getReferenceId())
            : repository.findByCollaboratorIdAndWorkDateAndRequestStatusIsNullAndStatusNot(
                request.getCollaboratorId(), request.getWorkDate(), StatusEnum.DELETED)
            .orElseGet(() -> newWorkdayRecord(request.getCollaboratorId(), request.getWorkDate(), request.getExpectedHours()));
        if (request.getClockIn() != null) target.setClockIn(request.getClockIn());
        if (request.getBreakStart() != null) target.setBreakStart(request.getBreakStart());
        if (request.getBreakEnd() != null) target.setBreakEnd(request.getBreakEnd());
        if (request.getClockOut() != null) target.setClockOut(request.getClockOut());
        if (request.getBreakMinutes() != null) target.setBreakMinutes(request.getBreakMinutes());
        target.setExpectedHours(request.getExpectedHours());
        target.setWorkedHours(calculateWorkedHours(target));
        target.setNotes(request.getNotes());
        repository.save(target);
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

    private int minutesBetween(LocalTime start, LocalTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            return 0;
        }
        return (int) Duration.between(start, end).toMinutes();
    }

    private UUID resolveCurrentCollaboratorId() {
        AppUser user = resolveCurrentUser();
        if (user.getCollaboratorId() == null) {
            throw AttendanceRecordException.collaboratorNotLinked();
        }
        return user.getCollaboratorId();
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

    private BigDecimal expectedHoursFromAdmission(AdmissionProcess admission) {
        if (admission == null || admission.getWorkloadSchedule() == null) {
            return BigDecimal.valueOf(8);
        }
        String digits = admission.getWorkloadSchedule().replaceAll("[^0-9]", "");
        if (digits.isBlank()) {
            return BigDecimal.valueOf(8);
        }
        int weeklyHours = Integer.parseInt(digits);
        if (weeklyHours >= 30) {
            return BigDecimal.valueOf(weeklyHours).divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(weeklyHours);
    }

    private String displayName(AdmissionProcess admission) {
        return admission.getSocialName() != null && !admission.getSocialName().isBlank()
            ? admission.getSocialName()
            : admission.getFullName();
    }

    private AttendanceOccurrenceTypeEnum occurrenceFromRequestType(AttendanceRequestTypeEnum requestType) {
        if (requestType == AttendanceRequestTypeEnum.MEDICAL_CERTIFICATE)
            return AttendanceOccurrenceTypeEnum.MEDICAL_CERTIFICATE;
        if (requestType == AttendanceRequestTypeEnum.LEAVE_ABSENCE || requestType == AttendanceRequestTypeEnum.DAY_ABSENCE_EXCUSE) {
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
            .findByCollaboratorIdAndWorkDateAndRequestStatusIsNullAndStatusNot(
                collaboratorId, request.getRequestDate(), StatusEnum.DELETED)
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

    private void linkAttachment(AttendanceRecord entity, AttendanceAttachmentReferenceDto attachment, String role) {
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

