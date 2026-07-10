package br.com.gommo.modules.cfg.settings.notification.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemNotification;

@Repository
public interface SystemNotificationRepository extends IBaseRepository<SystemNotification> {

    @Query(
            """
            SELECT n FROM SystemNotification n
            WHERE n.status <> :deletedStatus
              AND n.recipientUserId IS NULL
            ORDER BY n.createdAt DESC
            """)
    List<SystemNotification> findHrInbox(@Param("deletedStatus") StatusEnum deletedStatus, Pageable pageable);

    @Query(
            """
            SELECT COUNT(n) FROM SystemNotification n
            WHERE n.status <> :deletedStatus
              AND n.recipientUserId IS NULL
              AND n.readAt IS NULL
            """)
    long countHrUnread(@Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT n FROM SystemNotification n
            WHERE n.status <> :deletedStatus
              AND n.recipientUserId = :recipientUserId
            ORDER BY n.createdAt DESC
            """)
    List<SystemNotification> findByRecipientUserId(
            @Param("recipientUserId") UUID recipientUserId,
            @Param("deletedStatus") StatusEnum deletedStatus,
            Pageable pageable);

    @Query(
            """
            SELECT COUNT(n) FROM SystemNotification n
            WHERE n.status <> :deletedStatus
              AND n.recipientUserId = :recipientUserId
              AND n.readAt IS NULL
            """)
    long countByRecipientUserIdAndUnread(
            @Param("recipientUserId") UUID recipientUserId, @Param("deletedStatus") StatusEnum deletedStatus);

    Optional<SystemNotification> findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
            String notificationType,
            String referenceType,
            UUID referenceId,
            LocalDate referenceDueDate,
            StatusEnum status);

    List<SystemNotification> findByNotificationTypeAndReferenceTypeAndStatusNot(
            String notificationType, String referenceType, StatusEnum status);

    List<SystemNotification> findByNotificationTypeAndReferenceTypeAndReferenceIdAndStatusNot(
            String notificationType, String referenceType, UUID referenceId, StatusEnum status);
}
