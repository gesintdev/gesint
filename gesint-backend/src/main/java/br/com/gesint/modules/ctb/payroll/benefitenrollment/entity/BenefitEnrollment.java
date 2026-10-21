package br.com.gesint.modules.ctb.payroll.benefitenrollment.entity;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "benefit_enrollment")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class BenefitEnrollment extends BranchScopedEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "benefit_plan_id", nullable = false)
    private UUID benefitPlanId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "monthly_value", precision = 14, scale = 2)
    private BigDecimal monthlyValue;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
