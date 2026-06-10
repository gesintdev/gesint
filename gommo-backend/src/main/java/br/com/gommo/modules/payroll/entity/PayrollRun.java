package br.com.gommo.modules.payroll.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "payroll_run")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRun extends AuditEntity {
    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "reference_year", nullable = false)
    private Integer referenceYear;

    @Column(name = "reference_month", nullable = false)
    private Integer referenceMonth;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "payroll_status", nullable = false, columnDefinition = "payroll_status_enum")
    private PayrollStatusEnum payrollStatus;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
