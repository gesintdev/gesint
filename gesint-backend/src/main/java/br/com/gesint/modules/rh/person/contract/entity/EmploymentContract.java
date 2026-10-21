package br.com.gesint.modules.rh.person.contract.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "employment_contract")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class EmploymentContract extends BranchScopedEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "job_position_id")
    private UUID jobPositionId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "contract_type", nullable = false, columnDefinition = "contract_type_enum")
    private ContractTypeEnum contractType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "experience_period", length = 32)
    private String experiencePeriod;

    @Builder.Default
    @Column(name = "experience_extension_used", nullable = false)
    private boolean experienceExtensionUsed = false;

    @Column(name = "experience_milestone_days")
    private Integer experienceMilestoneDays;

    @Column(name = "experience_due_date")
    private LocalDate experienceDueDate;

    @Column(name = "experience_status", length = 32)
    private String experienceStatus;

    @Column(name = "base_salary", precision = 14, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "workload_hours", precision = 5, scale = 2)
    private BigDecimal workloadHours;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
