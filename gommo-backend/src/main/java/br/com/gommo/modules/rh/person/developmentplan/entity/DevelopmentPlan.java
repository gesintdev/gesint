package br.com.gommo.modules.rh.person.developmentplan.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;
import lombok.Builder;

@Entity
@Table(name = "development_plan")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlan extends AuditEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "collaborator_name", length = 200)
    private String collaboratorName;

    @Column(name = "registration_number", length = 60)
    private String registrationNumber;

    @Column(name = "job_position_id")
    private UUID jobPositionId;

    @Column(name = "job_position_name", length = 200)
    private String jobPositionName;

    @Column(name = "target_job_position_id")
    private UUID targetJobPositionId;

    @Column(name = "target_job_position_name", length = 200)
    private String targetJobPositionName;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "department_name", length = 200)
    private String departmentName;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "manager_name", length = 200)
    private String managerName;

    @Column(name = "track_id")
    private UUID trackId;

    @Column(name = "track_name", length = 200)
    private String trackName;

    @Column(name = "origin_id")
    private UUID originId;

    @Column(name = "origin_name", length = 200)
    private String originName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkin_frequency", length = 24)
    private CheckinFrequencyEnum checkinFrequency;

    @Column(name = "checkin_frequency_days")
    private Integer checkinFrequencyDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_status", nullable = false, length = 32)
    private DevelopmentPlanStatusEnum planStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "progress")
    private Integer progress;

    @Column(name = "last_checkin_at")
    private LocalDate lastCheckinAt;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevelopmentPlanCompetency> competencies = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevelopmentPlanGoal> goals = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevelopmentPlanCheckin> checkins = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevelopmentPlanEvidence> evidences = new ArrayList<>();
}
