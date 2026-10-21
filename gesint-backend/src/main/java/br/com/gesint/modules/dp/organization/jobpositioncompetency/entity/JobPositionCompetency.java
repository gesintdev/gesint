package br.com.gesint.modules.dp.organization.jobpositioncompetency.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gesint.core.branch.BranchCatalogEntity;

@Entity
@Audited
@Table(name = "job_position_competency")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchCatalogEntity.FILTER_NAME, condition = BranchCatalogEntity.FILTER_CONDITION)
public class JobPositionCompetency extends BranchCatalogEntity {

    @Column(name = "job_position_id", nullable = false)
    private UUID jobPositionId;

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "expected_level",
            nullable = false,
            columnDefinition = "gesint_types.job_position_competency_expected_level_enum")
    private JobPositionCompetencyExpectedLevelEnum expectedLevel;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "used_in", nullable = false, columnDefinition = "jsonb")
    private List<JobPositionCompetencyUsageEnum> usedIn = new ArrayList<>();

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;
}
