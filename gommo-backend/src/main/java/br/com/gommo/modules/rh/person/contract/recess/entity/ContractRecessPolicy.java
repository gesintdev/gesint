package br.com.gommo.modules.rh.person.contract.recess.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "contract_recess_policy")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ContractRecessPolicy extends AuditEntity {
    @Column(name = "employment_contract_id", nullable = false)
    private UUID employmentContractId;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "total_days_per_cycle")
    private Integer totalDaysPerCycle;

    @Column(name = "cycle_months")
    private Integer cycleMonths;

    @Column(name = "eligibility_after_months")
    private Integer eligibilityAfterMonths;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "financial_mode", columnDefinition = "recess_financial_mode_enum")
    private RecessFinancialModeEnum financialMode;

    @Column(name = "paid_percentage", precision = 5, scale = 2)
    private BigDecimal paidPercentage;

    @Column(name = "allow_split", nullable = false)
    private boolean allowSplit;

    @Column(name = "max_split_periods")
    private Integer maxSplitPeriods;

    @Column(name = "minimum_split_days")
    private Integer minimumSplitDays;

    @Column(name = "advance_notice_days", nullable = false)
    private int advanceNoticeDays;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_until")
    private LocalDate effectiveUntil;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
