package br.com.gesint.modules.cfg.settings.notification.entity;

import org.hibernate.annotations.Filter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Table(name = "system_notification")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class SystemNotification extends BranchScopedEntity {

    @Column(name = "notification_type", nullable = false, length = 80)
    private String notificationType;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "reference_type", length = 80)
    private String referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_due_date")
    private LocalDate referenceDueDate;

    @Column(name = "recipient_user_id")
    private UUID recipientUserId;

    @Column(name = "read_at")
    private OffsetDateTime readAt;
}
