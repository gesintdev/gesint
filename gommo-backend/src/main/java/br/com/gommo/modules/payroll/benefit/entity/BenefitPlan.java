package br.com.gommo.modules.payroll.benefit.entity;
import br.com.gommo.core.entity.AuditEntity; import jakarta.persistence.*; import java.math.BigDecimal; import java.time.LocalDate;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "benefit_plan") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BenefitPlan extends AuditEntity {
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "benefit_type", nullable = false, length = 60) private String benefitType;
    @Column(name = "monthly_value", precision = 14, scale = 2) private BigDecimal monthlyValue;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
}
