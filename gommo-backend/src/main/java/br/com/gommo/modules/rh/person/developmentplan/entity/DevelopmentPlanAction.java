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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Action of a development plan. Relational child of {@link DevelopmentPlanGoal}. */
@Entity
@Table(name = "development_plan_action")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanAction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private DevelopmentPlanGoal goal;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 32)
    private DevelopmentActionTypeEnum actionType;

    @Column(length = 200)
    private String assignee;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "workload_hours")
    private Integer workloadHours;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "evidence_required", nullable = false)
    private Boolean evidenceRequired;

    @Enumerated(EnumType.STRING)
    @Column(length = 24)
    private DevelopmentActionStatusEnum status;

    @Column
    private Integer progress;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
