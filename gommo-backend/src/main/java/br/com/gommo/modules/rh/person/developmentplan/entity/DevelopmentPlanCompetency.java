package br.com.gommo.modules.rh.person.developmentplan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/** Competency diagnosis assessed in a development plan. Relational child of {@link DevelopmentPlan}. */
@Entity
@Table(name = "development_plan_competency")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanCompetency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private DevelopmentPlan plan;

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Column(name = "competency_name", length = 200)
    private String competencyName;

    @Column(name = "current_level_id")
    private UUID currentLevelId;

    @Column(name = "current_level_order")
    private Integer currentLevelOrder;

    @Column(name = "expected_level_id")
    private UUID expectedLevelId;

    @Column(name = "expected_level_order")
    private Integer expectedLevelOrder;

    @Column(name = "gap")
    private Integer gap;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 24)
    private GapPriorityEnum priority;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
