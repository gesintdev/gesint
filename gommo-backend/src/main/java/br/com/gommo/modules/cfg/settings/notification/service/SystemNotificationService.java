package br.com.gommo.modules.cfg.settings.notification.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSummaryResponseDto;
import br.com.gommo.modules.cfg.settings.notification.dto.SystemNotificationResponseDto;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemNotification;
import br.com.gommo.modules.cfg.settings.notification.exception.NotificationException;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemNotificationRepository;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRecordRepository;
import br.com.gommo.modules.rh.person.leave.dto.VacationEligibleCollaboratorDto;
import br.com.gommo.modules.rh.person.leave.service.ILeaveRequestService;

@Service
public class SystemNotificationService {

    private static final String VACATION_DUE = "VACATION_DUE";
    private static final String VACATION_PERIOD = "VACATION_PERIOD";
    private static final String ATTENDANCE_ADJUSTMENT_REQUEST = "ATTENDANCE_ADJUSTMENT_REQUEST";
    private static final String ATTENDANCE_RECORD_REQUEST = "ATTENDANCE_RECORD_REQUEST";
    private static final String REQUEST_PENDING = "PENDING";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SystemNotificationRepository repository;
    private final NotificationSettingsService settingsService;
    private final ILeaveRequestService leaveRequestService;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public SystemNotificationService(
            SystemNotificationRepository repository,
            NotificationSettingsService settingsService,
            ILeaveRequestService leaveRequestService,
            AttendanceRecordRepository attendanceRecordRepository) {
        this.repository = repository;
        this.settingsService = settingsService;
        this.leaveRequestService = leaveRequestService;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @Transactional
    @PreAuthorize("hasAuthority('notification:read')")
    public NotificationSummaryResponseDto getSummary() {
        syncVacationDueNotifications();
        syncAttendanceAdjustmentNotifications();
        return NotificationSummaryResponseDto.builder()
                .unreadCount(repository.countByStatusNotAndReadAtIsNull(StatusEnum.DELETED))
                .notifications(
                        repository
                                .findByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED, PageRequest.of(0, 20))
                                .stream()
                                .map(this::toResponse)
                                .toList())
                .build();
    }

    @Transactional
    @PreAuthorize("hasAuthority('notification:write')")
    public SystemNotificationResponseDto markAsRead(UUID id) {
        SystemNotification notification =
                repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(NotificationException::notFound);
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now(BUSINESS_ZONE));
            repository.save(notification);
        }
        return toResponse(notification);
    }

    private void syncVacationDueNotifications() {
        int advanceDays = settingsService.getVacationDueNoticeDays();
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        LocalDate limit = today.plusDays(advanceDays);

        for (VacationEligibleCollaboratorDto collaborator : leaveRequestService.findVacationEligibleCollaborators()) {
            LocalDate dueDate = collaborator.getConcessiveEnd();
            if (dueDate == null || dueDate.isBefore(today) || dueDate.isAfter(limit)) {
                continue;
            }
            repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            VACATION_DUE,
                            VACATION_PERIOD,
                            collaborator.getCollaboratorId(),
                            dueDate,
                            StatusEnum.DELETED)
                    .orElseGet(() -> repository.save(buildVacationNotification(collaborator, today, dueDate)));
        }
    }

    private void syncAttendanceAdjustmentNotifications() {
        List<AttendanceRecord> pendingAdjustments =
                attendanceRecordRepository
                        .findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED)
                        .stream()
                        .filter(record -> record.getRequestType() == AttendanceRequestTypeEnum.TIME_ADJUSTMENT)
                        .toList();
        Set<UUID> pendingIds = pendingAdjustments.stream().map(AttendanceRecord::getId).collect(Collectors.toSet());

        for (SystemNotification notification :
                repository.findByNotificationTypeAndReferenceTypeAndStatusNot(
                        ATTENDANCE_ADJUSTMENT_REQUEST, ATTENDANCE_RECORD_REQUEST, StatusEnum.DELETED)) {
            if (!pendingIds.contains(notification.getReferenceId())) {
                notification.setStatus(StatusEnum.DELETED);
                repository.save(notification);
            }
        }

        for (AttendanceRecord record : pendingAdjustments) {
            repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            ATTENDANCE_ADJUSTMENT_REQUEST,
                            ATTENDANCE_RECORD_REQUEST,
                            record.getId(),
                            record.getWorkDate(),
                            StatusEnum.DELETED)
                    .orElseGet(() -> repository.save(buildAttendanceAdjustmentNotification(record)));
        }
    }

    private SystemNotification buildVacationNotification(
            VacationEligibleCollaboratorDto collaborator, LocalDate today, LocalDate dueDate) {
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
        String dayText = daysRemaining == 1 ? "1 dia" : daysRemaining + " dias";
        return SystemNotification.builder()
                .notificationType(VACATION_DUE)
                .title("Ferias a vencer")
                .message("O periodo concessivo de " + collaborator.getCollaboratorName() + " vence em " + dayText + ".")
                .referenceType(VACATION_PERIOD)
                .referenceId(collaborator.getCollaboratorId())
                .referenceDueDate(dueDate)
                .status(StatusEnum.ACTIVE)
                .build();
    }

    private SystemNotification buildAttendanceAdjustmentNotification(AttendanceRecord record) {
        String date = record.getWorkDate() != null ? record.getWorkDate().format(DATE_FORMATTER) : "sem data";
        return SystemNotification.builder()
                .notificationType(ATTENDANCE_ADJUSTMENT_REQUEST)
                .title("Solicitacao de ajuste de ponto")
                .message("Existe uma solicitacao de ajuste de ponto pendente para " + date + ".")
                .referenceType(ATTENDANCE_RECORD_REQUEST)
                .referenceId(record.getId())
                .referenceDueDate(record.getWorkDate())
                .status(StatusEnum.ACTIVE)
                .build();
    }

    private SystemNotificationResponseDto toResponse(SystemNotification entity) {
        return SystemNotificationResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .notificationType(entity.getNotificationType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .referenceDueDate(entity.getReferenceDueDate())
                .readAt(entity.getReadAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
