package br.com.gommo.modules.dp.payment.entity;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_slip")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSlip extends AuditEntity {

    @Column(name = "payment_batch_id", nullable = false)
    private UUID paymentBatchId;

    @Column(name = "collaborator_id")
    private UUID collaboratorId;

    @Column(name = "extracted_name", nullable = false, length = 200)
    private String extractedName;

    @Column(name = "slip_object_id")
    private UUID slipObjectId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "slip_status", nullable = false, columnDefinition = "payment_slip_status_enum")
    private PaymentSlipStatusEnum slipStatus;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "email_sent_at")
    private OffsetDateTime emailSentAt;

    @Column(name = "whatsapp_sent_at")
    private OffsetDateTime whatsappSentAt;
}
