package br.com.gommo.modules.cfg.settings.notification.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSummaryResponseDto;
import br.com.gommo.modules.cfg.settings.notification.dto.SystemNotificationResponseDto;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemNotification;
import br.com.gommo.modules.cfg.settings.notification.exception.NotificationException;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemNotificationRepository;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequest;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRequestRepository;
import br.com.gommo.modules.rh.person.leave.dto.VacationEligibleCollaboratorDto;
import br.com.gommo.modules.rh.person.leave.service.ILeaveRequestService;
import br.com.gommo.modules.root.repository.AppUserRepository;

@Service
public class SystemNotificationService {

    private static final String VACATION_DUE = "VACATION_DUE";
    private static final String VACATION_PERIOD = "VACATION_PERIOD";
    private static final String ATTENDANCE_ADJUSTMENT_REQUEST = "ATTENDANCE_ADJUSTMENT_REQUEST";
    private static final String ATTENDANCE_RECORD_REQUEST = "ATTENDANCE_RECORD_REQUEST";
    private static final String ATTENDANCE_REQUEST_REVIEWED = "ATTENDANCE_REQUEST_REVIEWED";
    private static final String REQUEST_PENDING = "PENDING";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SystemNotificationRepository repository;
    private final NotificationSettingsService settingsService;
    private final ILeaveRequestService leaveRequestService;
    private final AttendanceRequestRepository attendanceRequestRepository;
    private final AppUserRepository appUserRepository;

    public SystemNotificationService(
            SystemNotificationRepository repository,
            NotificationSettingsService settingsService,
            ILeaveRequestService leaveRequestService,
            AttendanceRequestRepository attendanceRequestRepository,
            AppUserRepository appUserRepository) {
        this.repository = repository;
        this.settingsService = settingsService;
        this.leaveRequestService = leaveRequestService;
        this.attendanceRequestRepository = attendanceRequestRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    @PreAuthorize("hasAuthority('notification:read')")
    public NotificationSummaryResponseDto getSummary() {
        syncVacationDueNotifications();
        syncAttendanceAdjustmentNotifications();
        return NotificationSummaryResponseDto.builder()
                .unreadCount(repository.countHrUnread(StatusEnum.DELETED))
                .notifications(
                        repository.findHrInbox(StatusEnum.DELETED, PageRequest.of(0, 20)).stream()
                                .map(this::toResponse)
                                .toList())
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('notification:read')")
    public NotificationSummaryResponseDto getMobileSummary() {
        UUID userId = resolveCurrentUserId();
        return NotificationSummaryResponseDto.builder()
                .unreadCount(repository.countByRecipientUserIdAndUnread(userId, StatusEnum.DELETED))
                .notifications(
                        repository
                                .findByRecipientUserId(userId, StatusEnum.DELETED, PageRequest.of(0, 50))
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
        UUID userId = resolveCurrentUserId();
        if (notification.getRecipientUserId() != null && !notification.getRecipientUserId().equals(userId)) {
            throw NotificationException.notFound();
        }
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now(BUSINESS_ZONE));
            repository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public void notifyAttendanceRequestReviewed(AttendanceRequest request, String action, String reason) {
        clearHrAttendancePendingNotification(request.getId());

        UUID recipientUserId = appUserRepository
                .findFirstByCollaboratorIdAndStatusNot(request.getCollaboratorId(), StatusEnum.DELETED)
                .map(user -> user.getId())
                .orElse(null);
        if (recipientUserId == null) {
            return;
        }

        boolean approved = "APPROVE".equalsIgnoreCase(action);
        String date = request.getWorkDate() != null ? request.getWorkDate().format(DATE_FORMATTER) : "sem data";
        String title = approved ? "Ajuste de ponto aprovado" : "Ajuste de ponto recusado";
        String message = approved
                ? "Sua solicitação de ajuste de ponto de " + date + " foi aprovada."
                : "Sua solicitação de ajuste de ponto de " + date + " foi recusada."
                        + (reason != null && !reason.isBlank() ? " Motivo: " + reason.trim() : "");

        repository.save(SystemNotification.builder()
                .notificationType(ATTENDANCE_REQUEST_REVIEWED)
                .title(title)
                .message(message)
                .referenceType(ATTENDANCE_RECORD_REQUEST)
                .referenceId(request.getId())
                .referenceDueDate(request.getWorkDate())
                .recipientUserId(recipientUserId)
                .status(StatusEnum.ACTIVE)
                .build());
    }

    private void clearHrAttendancePendingNotification(UUID requestId) {
        repository
                .findByNotificationTypeAndReferenceTypeAndReferenceIdAndStatusNot(
                        ATTENDANCE_ADJUSTMENT_REQUEST, ATTENDANCE_RECORD_REQUEST, requestId, StatusEnum.DELETED)
                .stream()
                .filter(notification -> notification.getRecipientUserId() == null)
                .forEach(notification -> {
                    notification.setStatus(StatusEnum.DELETED);
                    repository.save(notification);
                });
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
        List<AttendanceRequest> pendingAdjustments =
                attendanceRequestRepository
                        .findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED)
                        .stream()
                        .filter(record -> record.getRequestType() == AttendanceRequestTypeEnum.TIME_ADJUSTMENT)
                        .toList();
        Set<UUID> pendingIds = pendingAdjustments.stream().map(AttendanceRequest::getId).collect(Collectors.toSet());

        for (SystemNotification notification :
                repository.findByNotificationTypeAndReferenceTypeAndStatusNot(
                        ATTENDANCE_ADJUSTMENT_REQUEST, ATTENDANCE_RECORD_REQUEST, StatusEnum.DELETED)) {
            if (notification.getRecipientUserId() != null) {
                continue;
            }
            if (!pendingIds.contains(notification.getReferenceId())) {
                notification.setStatus(StatusEnum.DELETED);
                repository.save(notification);
            }
        }

        for (AttendanceRequest record : pendingAdjustments) {
            Optional<SystemNotification> existing = repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            ATTENDANCE_ADJUSTMENT_REQUEST,
                            ATTENDANCE_RECORD_REQUEST,
                            record.getId(),
                            record.getWorkDate(),
                            StatusEnum.DELETED)
                    .filter(notification -> notification.getRecipientUserId() == null);
            if (existing.isEmpty()) {
                repository.save(buildAttendanceAdjustmentNotification(record));
            }
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

    private SystemNotification buildAttendanceAdjustmentNotification(AttendanceRequest record) {
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

    private UUID resolveCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw NotificationException.notFound();
        }
        return userId;
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
