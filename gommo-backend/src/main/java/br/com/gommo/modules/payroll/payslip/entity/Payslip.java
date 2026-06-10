package br.com.gommo.modules.payroll.payslip.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "payslip")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Payslip extends AuditEntity {
    @Column(name = "payroll_run_id", nullable = false)
    private UUID payrollRunId;

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "gross_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "deductions_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal deductionsAmount;

    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal netAmount;
}
