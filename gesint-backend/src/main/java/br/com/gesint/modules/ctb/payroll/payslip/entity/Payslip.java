package br.com.gesint.modules.ctb.payroll.payslip.entity;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "payslip")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class Payslip extends BranchScopedEntity {

    @Column(name = "payroll_run_id", nullable = false)
    private UUID payrollRunId;

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "base_salary", precision = 14, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "gross_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "deductions_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal deductionsAmount;

    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "generated_at")
    private OffsetDateTime generatedAt;
}
