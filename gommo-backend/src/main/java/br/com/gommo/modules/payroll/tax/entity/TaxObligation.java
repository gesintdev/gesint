package br.com.gommo.modules.payroll.tax.entity;
import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity @Table(name = "tax_obligation") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class TaxObligation extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "obligation_type", nullable = false, columnDefinition = "tax_obligation_type_enum") private TaxObligationTypeEnum obligationType;
    @Column(name = "reference_code", length = 60) private String referenceCode;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "base_amount", precision = 14, scale = 2) private BigDecimal baseAmount;
    @Column(name = "rate_percent", precision = 5, scale = 2) private BigDecimal ratePercent;
    @Column(columnDefinition = "TEXT") private String notes;
}
