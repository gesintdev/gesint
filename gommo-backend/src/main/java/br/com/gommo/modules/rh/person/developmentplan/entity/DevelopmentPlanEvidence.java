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

/** Evidence attached/recorded in a development plan. Relational child of {@link DevelopmentPlan}. */
@Entity
@Table(name = "development_plan_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private DevelopmentPlan plan;

    @Column(name = "evidence_type_id")
    private UUID evidenceTypeId;

    @Column(name = "evidence_type_name", length = 200)
    private String evidenceTypeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 400)
    private String file;

    @Column(length = 600)
    private String link;

    @Column(name = "goal_id")
    private UUID goalId;

    @Column(name = "action_id")
    private UUID actionId;

    @Column
    private LocalDate date;

    @Column(name = "responsible_user_id")
    private UUID responsibleUserId;

    @Column(name = "responsible_user_name", length = 200)
    private String responsibleUserName;
}
