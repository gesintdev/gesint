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
@Table(name = "payment_batch")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentBatch extends AuditEntity {

    @Column(name = "payment_period_id", nullable = false)
    private UUID paymentPeriodId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "batch_type", nullable = false, columnDefinition = "payment_batch_type_enum")
    private PaymentBatchTypeEnum batchType;

    @Column(length = 500)
    private String description;

    @Column(name = "source_object_id", nullable = false)
    private UUID sourceObjectId;

    @Column(name = "source_file_name", length = 500)
    private String sourceFileName;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "batch_status", nullable = false, columnDefinition = "payment_batch_status_enum")
    private PaymentBatchStatusEnum batchStatus;

    @Column(name = "item_count", nullable = false)
    private Integer itemCount;

    @Column(name = "divergent_count", nullable = false)
    private Integer divergentCount;

    @Column(name = "sent_count", nullable = false)
    private Integer sentCount;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(name = "processing_page")
    private Integer processingPage;

    @Column(name = "total_pages")
    private Integer totalPages;
}
