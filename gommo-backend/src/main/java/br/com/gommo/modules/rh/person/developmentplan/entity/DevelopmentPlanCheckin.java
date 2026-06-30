package br.com.gommo.modules.rh.person.developmentplan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalDate;
import java.util.UUID;

/** Periodic follow-up check-in of a development plan. Relational child of {@link DevelopmentPlan}. */
@Entity
@Table(name = "development_plan_checkin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private DevelopmentPlan plan;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String participants;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "perceived_progress")
    private Integer perceivedProgress;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(name = "next_steps", columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "collaborator_rating")
    private Integer collaboratorRating;

    @Column(name = "manager_rating")
    private Integer managerRating;
}
