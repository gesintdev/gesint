package br.com.gommo.modules.rh.person.developmentplan.entity;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** SMART goal of a development plan. Relational child of {@link DevelopmentPlan}; owns actions. */
@Entity
@Table(name = "development_plan_goal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private DevelopmentPlan plan;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "competency_id")
    private UUID competencyId;

    @Column(name = "competency_name", length = 200)
    private String competencyName;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private GoalTypeEnum type;

    @Column(name = "expected_result", columnDefinition = "TEXT")
    private String expectedResult;

    @Column(name = "success_indicator", columnDefinition = "TEXT")
    private String successIndicator;

    @Column
    private LocalDate deadline;

    @Column
    private Integer weight;

    @Enumerated(EnumType.STRING)
    @Column(length = 24)
    private DevelopmentActionStatusEnum status;

    @Column
    private Integer progress;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevelopmentPlanAction> actions = new ArrayList<>();
}
