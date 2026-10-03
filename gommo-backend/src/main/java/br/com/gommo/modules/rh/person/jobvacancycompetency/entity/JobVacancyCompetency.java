package br.com.gommo.modules.rh.person.jobvacancycompetency.entity;

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
@Table(name = "job_vacancy_competency")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class JobVacancyCompetency extends BranchScopedEntity {

    @Column(name = "job_vacancy_id", nullable = false)
    private UUID jobVacancyId;

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
