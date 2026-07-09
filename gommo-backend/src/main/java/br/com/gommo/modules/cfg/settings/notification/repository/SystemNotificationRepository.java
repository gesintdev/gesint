package br.com.gommo.modules.cfg.settings.notification.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemNotification;

@Repository
public interface SystemNotificationRepository extends IBaseRepository<SystemNotification> {

    List<SystemNotification> findByStatusNotOrderByCreatedAtDesc(StatusEnum status, Pageable pageable);

    long countByStatusNotAndReadAtIsNull(StatusEnum status);

    Optional<SystemNotification> findByNotificationTypeAndReferenceTypeAndReferenceIdAndReferenceDueDateAndStatusNot(
            String notificationType,
            String referenceType,
            UUID referenceId,
            LocalDate referenceDueDate,
            StatusEnum status);

    List<SystemNotification> findByNotificationTypeAndReferenceTypeAndStatusNot(
            String notificationType, String referenceType, StatusEnum status);
}
