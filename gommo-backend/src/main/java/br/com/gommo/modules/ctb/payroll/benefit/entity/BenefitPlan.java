package br.com.gommo.modules.ctb.payroll.benefit.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "benefit_plan")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BenefitPlan extends AuditEntity {
    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "benefit_type", nullable = false, length = 60)
    private String benefitType;

    @Column(name = "monthly_value", precision = 14, scale = 2)
    private BigDecimal monthlyValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}
