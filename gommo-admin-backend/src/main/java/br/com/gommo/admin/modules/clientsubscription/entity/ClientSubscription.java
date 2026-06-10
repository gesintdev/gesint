package br.com.gommo.admin.modules.clientsubscription.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client_subscription")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientSubscription extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "plan_code", nullable = false, length = 50)
    private String planCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", nullable = false, length = 32)
    private BillingStatusEnum billingStatus;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    @Column(name = "monthly_amount", precision = 12, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
