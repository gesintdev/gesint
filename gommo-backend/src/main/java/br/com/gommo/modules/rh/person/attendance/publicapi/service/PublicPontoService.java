package br.com.gommo.modules.rh.person.attendance.publicapi.service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantException;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceAttachmentReferenceDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceClockRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.rh.person.attendance.publicapi.dto.PublicPontoClockRequestDto;
import br.com.gommo.modules.rh.person.attendance.publicapi.dto.PublicPontoClockResponseDto;
import br.com.gommo.modules.rh.person.attendance.publicapi.exception.PublicPontoException;
import br.com.gommo.modules.rh.person.attendance.service.IAttendanceRecordService;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;

@Service
public class PublicPontoService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final String CLOCK_PHOTO_DOCUMENT_TYPE = "CLOCK_SELFIE";

    private final CollaboratorRepository collaboratorRepository;
    private final IAttendanceRecordService attendanceRecordService;
    private final IStorageService storageService;

    public PublicPontoService(
            CollaboratorRepository collaboratorRepository,
            IAttendanceRecordService attendanceRecordService,
            IStorageService storageService) {
        this.collaboratorRepository = collaboratorRepository;
        this.attendanceRecordService = attendanceRecordService;
        this.storageService = storageService;
    }

    /**
     * Registra ponto na landing publica web.
     * Tenant ja deve estar no contexto (Host / X-Tenant-Slug via TenantResolutionFilter).
     * Mobile continua usando mobileLoginCode (codigo do empregador) em outro fluxo.
     */
    public PublicPontoClockResponseDto clock(PublicPontoClockRequestDto request, MultipartFile photo) {
        TenantContext tenant = TenantContextHolder.require();
        // Apex / Host sem cliente (platform) ou tenant sintetico de dev nao registram ponto web.
        if (tenant.isPlatformAccess() || tenant.isDevelopmentPublic()) {
            throw TenantException.hostRequired();
        }

        String collaboratorCode = digitsOnly(request.getCollaboratorCode());
        if (!StringUtils.hasText(collaboratorCode)) {
            throw PublicPontoException.collaboratorRequired();
        }
        if (photo == null || photo.isEmpty()) {
            throw PublicPontoException.photoRequired();
        }

        Collaborator collaborator = collaboratorRepository
                .findByAccessCodeAndStatusNot(collaboratorCode, StatusEnum.DELETED)
                .filter(c -> c.getStatus() == StatusEnum.ACTIVE)
                .orElseThrow(PublicPontoException::collaboratorNotFound);

        StorageObjectResponseDto uploaded =
                storageService.uploadInternal(photo, collaborator.getCompanyId());

        AttendanceAttachmentReferenceDto photoRef = AttendanceAttachmentReferenceDto.builder()
                .objectId(uploaded.getId())
                .fileName(StringUtils.hasText(photo.getOriginalFilename())
                        ? photo.getOriginalFilename()
                        : "selfie-ponto.jpg")
                .documentType(CLOCK_PHOTO_DOCUMENT_TYPE)
                .build();

        OffsetDateTime capturedAt = OffsetDateTime.now(BUSINESS_ZONE);
        String clientRequestId = StringUtils.hasText(request.getClientRequestId())
                ? request.getClientRequestId().trim()
                : "public-ponto-" + UUID.randomUUID();

        AttendanceClockRequestDto clockRequest = AttendanceClockRequestDto.builder()
                .capturedAt(capturedAt)
                .clientRequestId(clientRequestId)
                .photo(photoRef)
                .build();

        AttendanceRecordResponseDto record =
                attendanceRecordService.clockForCollaborator(collaborator.getId(), clockRequest, false);

        String displayName = collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                ? collaborator.getSocialName()
                : collaborator.getFullName();

        return PublicPontoClockResponseDto.builder()
                .collaboratorName(displayName)
                .workDate(record.getWorkDate())
                .clockIn(record.getClockIn())
                .clockOut(record.getClockOut())
                .breakStart(record.getBreakStart())
                .breakEnd(record.getBreakEnd())
                .pendingOutsideScheduleApproval(record.isPendingOutsideScheduleApproval())
                .registeredAt(capturedAt)
                .message(record.isPendingOutsideScheduleApproval()
                        ? "Ponto registrado fora da escala. Aguardando aprovacao."
                        : "Ponto registrado com sucesso.")
                .build();
    }

    private static String digitsOnly(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }
}
