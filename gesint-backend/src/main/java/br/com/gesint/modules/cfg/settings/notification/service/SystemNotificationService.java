package br.com.gesint.modules.cfg.settings.notification.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
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

import br.com.gesint.core.branch.BranchContextHolder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.modules.cfg.settings.notification.dto.NotificationSummaryResponseDto;
import br.com.gesint.modules.cfg.settings.notification.dto.SystemNotificationResponseDto;
import br.com.gesint.modules.cfg.settings.notification.entity.SystemNotification;
import br.com.gesint.modules.cfg.settings.notification.exception.NotificationException;
import br.com.gesint.modules.cfg.settings.notification.repository.SystemNotificationRepository;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRequest;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gesint.modules.gp.attendance.repository.AttendanceRequestRepository;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.leave.dto.VacationEligibleCollaboratorDto;
import br.com.gesint.modules.rh.person.leave.service.ILeaveRequestService;
import br.com.gesint.modules.root.repository.AppUserRepository;

/**
 * Notificacoes do sistema. Duas caixas:
 * <ul>
 *   <li>RH ({@code recipient_user_id} nulo): so quem tem acesso de gestao (ponto, ferias,
 *       pessoas, admissao ou recrutamento) enxerga. {@code notification:read} sozinho nao basta,
 *       porque todo usuario vinculado a colaborador recebe essa authority para a caixa pessoal.</li>
 *   <li>Pessoal ({@code recipient_user_id} preenchido): so o proprio usuario.</li>
 * </ul>
 */
@Service
public class SystemNotificationService {

    public static final String VACATION_DUE = "VACATION_DUE";
    public static final String VACATION_PERIOD = "VACATION_PERIOD";
    public static final String ATTENDANCE_ADJUSTMENT_REQUEST = "ATTENDANCE_ADJUSTMENT_REQUEST";
    public static final String ATTENDANCE_RECORD_REQUEST = "ATTENDANCE_RECORD_REQUEST";
    public static final String ATTENDANCE_REQUEST_REVIEWED = "ATTENDANCE_REQUEST_REVIEWED";

    /** Authorities que dao acesso a caixa do RH (alem do admin global). */
    static final List<String> HR_INBOX_AUTHORITIES = List.of(
            "attendance:read", "leave:read", "collaborator:read", "admission:read", "jobvacancyapplication:read");

    private static final String REQUEST_PENDING = "PENDING";
    private static final int INBOX_SIZE = 20;
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SystemNotificationRepository repository;
    private final NotificationSettingsService settingsService;
    private final ILeaveRequestService leaveRequestService;
    private final AttendanceRequestRepository attendanceRequestRepository;
    private final AppUserRepository appUserRepository;
    private final CollaboratorRepository collaboratorRepository;

    public SystemNotificationService(
            SystemNotificationRepository repository,
            NotificationSettingsService settingsService,
            ILeaveRequestService leaveRequestService,
            AttendanceRequestRepository attendanceRequestRepository,
            AppUserRepository appUserRepository,
            CollaboratorRepository collaboratorRepository) {
        this.repository = repository;
        this.settingsService = settingsService;
        this.leaveRequestService = leaveRequestService;
        this.attendanceRequestRepository = attendanceRequestRepository;
        this.appUserRepository = appUserRepository;
        this.collaboratorRepository = collaboratorRepository;
    }

    /** Sino do web: notificacoes pessoais + caixa do RH (quando o usuario tem acesso de gestao). */
    @Transactional
    @PreAuthorize("hasAuthority('notification:read')")
    public NotificationSummaryResponseDto getSummary() {
        UUID userId = currentUserIdOrNull();
        boolean hrReader = isHrInboxReader();
        if (hrReader) {
            syncAttendanceAdjustmentNotifications();
        }
        List<SystemNotification> items = new ArrayList<>();
        long unread = 0;
        if (userId != null) {
            items.addAll(repository.findByRecipientUserId(userId, StatusEnum.DELETED, PageRequest.of(0, INBOX_SIZE)));
            unread += repository.countByRecipientUserIdAndUnread(userId, StatusEnum.DELETED);
        }
        if (hrReader) {
            items.addAll(repository.findHrInbox(StatusEnum.DELETED, PageRequest.of(0, INBOX_SIZE)));
            unread += repository.countHrUnread(StatusEnum.DELETED);
        }
        return NotificationSummaryResponseDto.builder()
                .unreadCount(unread)
                .notifications(items.stream()
                        .sorted(Comparator.comparing(SystemNotification::getCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .limit(INBOX_SIZE)
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
        ensureCanRead(notification);
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now(BUSINESS_ZONE));
            repository.save(notification);
        }
        return toResponse(notification);
    }

    /** Marca como lidas todas as notificacoes que o usuario enxerga no sino. */
    @Transactional
    @PreAuthorize("hasAuthority('notification:write')")
    public NotificationSummaryResponseDto markAllAsRead() {
        UUID userId = currentUserIdOrNull();
        OffsetDateTime now = OffsetDateTime.now(BUSINESS_ZONE);
        List<SystemNotification> unread = new ArrayList<>();
        if (userId != null) {
            unread.addAll(repository.findByRecipientUserId(userId, StatusEnum.DELETED, PageRequest.of(0, 500)));
        }
        if (isHrInboxReader()) {
            unread.addAll(repository.findHrInbox(StatusEnum.DELETED, PageRequest.of(0, 500)));
        }
        unread.stream().filter(item -> item.getReadAt() == null).forEach(item -> {
            item.setReadAt(now);
            repository.save(item);
        });
        return getSummary();
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

        publish(ATTENDANCE_REQUEST_REVIEWED, ATTENDANCE_RECORD_REQUEST, request.getId(), request.getWorkDate(),
                title, message, recipientUserId, request.getCompanyId());
    }

    /**
     * Cria ou atualiza (mesma chave: tipo, referencia e vencimento) uma notificacao. Atualizar
     * volta a deixa-la como nao lida. {@code recipientUserId} nulo = caixa do RH.
     * Uso interno (jobs e servicos); quem chama ja autorizou.
     */
    @Transactional
    public SystemNotification publish(
            String type,
            String referenceType,
            UUID referenceId,
            LocalDate dueDate,
            String title,
            String message,
            UUID recipientUserId,
            UUID companyId) {
        return BranchContextHolder.runUnscoped(() -> {
            SystemNotification notification = repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            type, referenceType, referenceId, dueDate, StatusEnum.DELETED)
                    .orElseGet(() -> SystemNotification.builder()
                            .notificationType(type)
                            .referenceType(referenceType)
                            .referenceId(referenceId)
                            .referenceDueDate(dueDate)
                            .status(StatusEnum.ACTIVE)
                            .build());
            boolean changed = notification.getId() == null
                    || !title.equals(notification.getTitle())
                    || !message.equals(notification.getMessage());
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRecipientUserId(recipientUserId);
            if (notification.getCompanyId() == null) {
                notification.setCompanyId(companyId != null ? companyId : BranchContextHolder.getOptional().orElse(null));
            }
            if (changed) {
                notification.setReadAt(null);
            }
            return repository.save(notification);
        });
    }

    /**
     * Rodada agendada (sem usuario): ferias a vencer e ajustes de ponto pendentes. Antes isso so
     * acontecia quando alguem abria o sino, entao ninguem era avisado de forma proativa.
     */
    @Transactional
    public void refreshScheduledNotifications() {
        BranchContextHolder.runUnscoped(() -> {
            syncVacationDueNotifications();
            syncAttendanceAdjustmentNotifications();
            return null;
        });
    }

    /** O usuario logado tem acesso a caixa do RH. */
    public boolean isHrInboxReader() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        for (String authority : HR_INBOX_AUTHORITIES) {
            if (AuthorityWildcards.allows(auth.getAuthorities(), authority)) {
                return true;
            }
        }
        return false;
    }

    private void ensureCanRead(SystemNotification notification) {
        if (notification.getRecipientUserId() != null) {
            if (!notification.getRecipientUserId().equals(resolveCurrentUserId())) {
                throw NotificationException.notFound();
            }
        } else if (!isHrInboxReader()) {
            throw NotificationException.notFound();
        }
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
            boolean exists = repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            VACATION_DUE, VACATION_PERIOD, collaborator.getCollaboratorId(), dueDate, StatusEnum.DELETED)
                    .isPresent();
            if (!exists) {
                repository.save(buildVacationNotification(collaborator, today, dueDate));
            }
        }
    }

    private void syncAttendanceAdjustmentNotifications() {
        List<AttendanceRequest> pendingAdjustments =
                attendanceRequestRepository
                        .findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED)
                        .stream()
                        .filter(record -> record.getRequestType() == AttendanceRequestTypeEnum.TIME_ADJUSTMENT
                                || record.getRequestType() == AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE)
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
            Optional<SystemNotification> existing = BranchContextHolder.runUnscoped(() -> repository
                    .findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
                            ATTENDANCE_ADJUSTMENT_REQUEST,
                            ATTENDANCE_RECORD_REQUEST,
                            record.getId(),
                            record.getWorkDate(),
                            StatusEnum.DELETED));
            if (existing.isEmpty()) {
                repository.save(buildAttendanceAdjustmentNotification(record));
            }
        }
    }

    private SystemNotification buildVacationNotification(
            VacationEligibleCollaboratorDto collaborator, LocalDate today, LocalDate dueDate) {
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
        String dayText = daysRemaining == 1 ? "1 dia" : daysRemaining + " dias";
        UUID companyId = collaboratorRepository.findById(collaborator.getCollaboratorId())
                .map(item -> item.getCompanyId())
                .orElse(null);
        return SystemNotification.builder()
                .notificationType(VACATION_DUE)
                .title("Férias a vencer")
                .message("O período concessivo de " + collaborator.getCollaboratorName() + " vence em " + dayText + ".")
                .referenceType(VACATION_PERIOD)
                .referenceId(collaborator.getCollaboratorId())
                .referenceDueDate(dueDate)
                .companyId(companyId)
                .status(StatusEnum.ACTIVE)
                .build();
    }

    private SystemNotification buildAttendanceAdjustmentNotification(AttendanceRequest record) {
        String date = record.getWorkDate() != null ? record.getWorkDate().format(DATE_FORMATTER) : "sem data";
        boolean outsideSchedule = record.getRequestType() == AttendanceRequestTypeEnum.OUTSIDE_SCHEDULE;
        return SystemNotification.builder()
                .notificationType(ATTENDANCE_ADJUSTMENT_REQUEST)
                .title(outsideSchedule ? "Ponto fora da escala" : "Solicitação de ajuste de ponto")
                .message(
                        outsideSchedule
                                ? "Existe um ponto fora da escala pendente de aprovação (banco de horas ou hora extra) para "
                                        + date
                                        + "."
                                : "Existe uma solicitação de ajuste de ponto pendente para " + date + ".")
                .referenceType(ATTENDANCE_RECORD_REQUEST)
                .referenceId(record.getId())
                .referenceDueDate(record.getWorkDate())
                .companyId(record.getCompanyId())
                .status(StatusEnum.ACTIVE)
                .build();
    }

    private UUID currentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof UUID userId ? userId : null;
    }

    private UUID resolveCurrentUserId() {
        UUID userId = currentUserIdOrNull();
        if (userId == null) {
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
                .personal(entity.getRecipientUserId() != null)
                .build();
    }
}
