package br.com.gesint.modules.dp.occupationalexam.esocial.entity;

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

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "esocial_health_event")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class EsocialHealthEvent extends BranchScopedEntity {

    @Column(name = "occupational_exam_id", nullable = false)
    private UUID occupationalExamId;

    @Column(name = "event_type", nullable = false, length = 10)
    private String eventType;

    @Column(name = "layout_version", nullable = false, length = 10)
    private String layoutVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_json", columnDefinition = "jsonb")
    private Map<String, Object> payloadJson;

    @Column(name = "protocol_number", length = 60)
    private String protocolNumber;

    @Column(name = "receipt_number", length = 60)
    private String receiptNumber;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "transmission_status", nullable = false, columnDefinition = "esocial_transmission_status_enum")
    private EsocialTransmissionStatusEnum transmissionStatus;

    @Column(name = "transmission_deadline")
    private LocalDate transmissionDeadline;

    @Column(columnDefinition = "TEXT")
    private String errors;
}
