package br.com.gommo.modules.rh.person.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "experience_evaluation_score")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class ExperienceEvaluationScore extends BranchScopedEntity {

    @Column(name = "evaluation_id", nullable = false)
    private UUID evaluationId;

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Column(nullable = false)
    private Integer score;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "TEXT")
    private String justification = "";
}
