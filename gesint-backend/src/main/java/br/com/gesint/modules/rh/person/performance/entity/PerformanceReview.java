package br.com.gesint.modules.rh.person.performance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "performance_review")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class PerformanceReview extends BranchScopedEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "performance_rating_enum")
    private PerformanceRatingEnum rating;

    @Column(name = "goals_summary", columnDefinition = "TEXT")
    private String goalsSummary;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "reviewer_name", length = 200)
    private String reviewerName;
}
