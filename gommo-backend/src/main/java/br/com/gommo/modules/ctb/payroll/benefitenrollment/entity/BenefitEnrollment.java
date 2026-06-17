package br.com.gommo.modules.ctb.payroll.benefitenrollment.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "benefit_enrollment")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BenefitEnrollment extends AuditEntity {
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
