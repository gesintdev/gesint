package br.com.gesint.core.audit.trail;

import java.net.InetAddress;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Evento da trilha de auditoria (RN-05). Imutavel: so insert, sem update nem delete.
 * Fica no schema do tenant e nao e filtrado por filial ({@code company_id} e informativo).
 */
@Entity
@Immutable
@Table(name = "audit_log")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private UUID id;

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    @Column(name = "entity_id")
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 40)
    private AuditActionEnum action;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private AuditCategoryEnum category;

    @Column(name = "record_label", length = 200)
    private String recordLabel;

    @Column(name = "detail", length = 500)
    private String detail;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "user_id")
    private UUID userId;

    @JdbcTypeCode(SqlTypes.INET)
    @Column(name = "ip_address", columnDefinition = "inet")
    private InetAddress ipAddress;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }
}
