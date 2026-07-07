package br.com.gommo.modules.rh.person.attendance.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceAttachmentReferenceDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSubmissionRequestDto;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;
import br.com.gommo.modules.rh.person.attendance.exception.AttendanceRecordException;
import br.com.gommo.modules.rh.person.attendance.mapper.AttendanceRecordMapper;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRecordRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.storage.service.IStorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AttendanceRecordService
    extends BaseService<AttendanceRecord, AttendanceRecordRequestDto, AttendanceRecordResponseDto>
    implements IAttendanceRecordService {
    private static final String STORAGE_ENTITY_TYPE = "attendance_record";
    private static final String ATTACHMENT_LINK_ROLE = "ATTACHMENT";

    private final AttendanceRecordRepository repository;
    private final AttendanceRecordMapper mapper;
    private final AppUserRepository appUserRepository;
    private final IStorageService storageService;

    public AttendanceRecordService(
        AttendanceRecordRepository repository,
        AttendanceRecordMapper mapper,
        AppUserRepository appUserRepository,
        IStorageService storageService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.appUserRepository = appUserRepository;
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
            .orElseGet(() -> createSubmission(request, source));
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
    }

    private AttendanceRecordResponseDto createSubmission(
        AttendanceSubmissionRequestDto request, AttendanceSourceEnum source) {
        validateSubmission(request);
        UUID collaboratorId = resolveCurrentCollaboratorId();
        AttendanceRecord entity = repository
            .findByCollaboratorIdAndWorkDateAndStatusNot(
                collaboratorId, request.getRequestDate(), StatusEnum.DELETED)
            .orElseGet(() -> newSubmissionRecord(collaboratorId, request));

        applySubmission(entity, request, source);
        entity = repository.save(entity);
        linkAttachment(entity, request.getAttachment());
        return mapper.toResponse(entity);
    }

    private AttendanceRecord newSubmissionRecord(UUID collaboratorId, AttendanceSubmissionRequestDto request) {
        AttendanceRecord entity = AttendanceRecord.builder()
            .collaboratorId(collaboratorId)
            .workDate(request.getRequestDate())
            .breakMinutes(0)
            .impactsHourBank(Boolean.TRUE)
            .impactsPayroll(Boolean.TRUE)
            .build();
        entity.setStatus(StatusEnum.ACTIVE);
        return entity;
    }

    private void applySubmission(
        AttendanceRecord entity, AttendanceSubmissionRequestDto request, AttendanceSourceEnum source) {
        if (request.getClockIn() != null) {
            entity.setClockIn(request.getClockIn());
        }
        if (request.getClockOut() != null) {
            entity.setClockOut(request.getClockOut());
        }
        if (request.getBreakMinutes() != null) {
            entity.setBreakMinutes(request.getBreakMinutes());
        }
        entity.setExpectedHours(request.getExpectedHours());
        entity.setWorkedHours(request.getWorkedHours());
        entity.setNotes(request.getDetails());
        entity.setOccurrenceType(AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT);
        entity.setOccurrenceOrigin(
            source == AttendanceSourceEnum.MOBILE
                ? AttendanceOccurrenceOriginEnum.MOBILE
                : AttendanceOccurrenceOriginEnum.MANUAL);
        entity.setRequestType(request.getRequestType());
        entity.setSource(source);
        entity.setClientRequestId(request.getClientRequestId());
        entity.setSubmittedAt(request.getSubmittedAt());
        entity.setImpactsHourBank(Boolean.TRUE);
        entity.setImpactsPayroll(Boolean.TRUE);
    }

    private UUID resolveCurrentCollaboratorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw AttendanceRecordException.collaboratorNotLinked();
        }
        AppUser user = appUserRepository
            .findByIdAndStatusNot(userId, StatusEnum.DELETED)
            .orElseThrow(AttendanceRecordException::collaboratorNotLinked);
        if (user.getCollaboratorId() == null) {
            throw AttendanceRecordException.collaboratorNotLinked();
        }
        return user.getCollaboratorId();
    }

    private void linkAttachment(AttendanceRecord entity, AttendanceAttachmentReferenceDto attachment) {
        if (attachment == null || attachment.getObjectId() == null) {
            return;
        }
        storageService.linkToEntity(
            STORAGE_ENTITY_TYPE,
            entity.getId(),
            attachment.getObjectId(),
            ATTACHMENT_LINK_ROLE,
            attachment.getFileName(),
            attachment.getDocumentType());
    }

    private static void validateSubmission(AttendanceSubmissionRequestDto request) {
        if (request.getClockIn() == null && request.getClockOut() == null && request.getWorkedHours() == null) {
            throw AttendanceRecordException.invalidSubmission();
        }
    }
}
