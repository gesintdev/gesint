package br.com.gommo.modules.rh.person.contract.recess.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "contract_recess_period")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class ContractRecessPeriod extends BranchScopedEntity {
    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "cycle_start", nullable = false)
    private LocalDate cycleStart;

    @Column(name = "cycle_end", nullable = false)
    private LocalDate cycleEnd;

    @Column(name = "entitled_days", nullable = false)
    private int entitledDays;

    @Column(name = "used_days", nullable = false)
    private int usedDays;

    @Column(name = "reserved_days", nullable = false)
    private int reservedDays;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "period_status", nullable = false, columnDefinition = "recess_period_status_enum")
    private RecessPeriodStatusEnum periodStatus;

    public int getRemainingDays() {
        return entitledDays - usedDays - reservedDays;
    }
}
