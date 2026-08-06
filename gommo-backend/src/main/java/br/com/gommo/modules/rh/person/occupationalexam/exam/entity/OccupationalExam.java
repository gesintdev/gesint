package br.com.gommo.modules.rh.person.occupationalexam.exam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "occupational_exam")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalExam extends AuditEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "job_position_id", nullable = false)
    private UUID jobPositionId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "exam_type", nullable = false, columnDefinition = "occupational_exam_type_enum")
    private OccupationalExamTypeEnum examType;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "lifecycle_status", nullable = false, columnDefinition = "occupational_exam_lifecycle_status_enum")
    private OccupationalExamLifecycleStatusEnum lifecycleStatus;

    @Column(name = "clinic_id")
    private UUID clinicId;

    @Column(name = "examiner_physician_id")
    private UUID examinerPhysicianId;

    @Column(name = "coordinator_physician_id")
    private UUID coordinatorPhysicianId;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "clinical_exam_date")
    private LocalDate clinicalExamDate;

    @Column(name = "aso_issue_date")
    private LocalDate asoIssueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "occupational_exam_result_enum")
    private OccupationalExamResultEnum result;

    @Column(length = 20)
    private String cid;

    @Column(name = "clinical_observations", columnDefinition = "TEXT")
    private String clinicalObservations;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "source_trigger", nullable = false, columnDefinition = "occupational_exam_source_trigger_enum")
    private OccupationalExamSourceTriggerEnum sourceTrigger;

    @Column(name = "related_leave_request_id")
    private UUID relatedLeaveRequestId;

    @Column(name = "exam_requirement_version_id")
    private UUID examRequirementVersionId;

    @Column(name = "dismissal_waiver_applied", nullable = false)
    private Boolean dismissalWaiverApplied;

    @Column(name = "dismissal_waiver_reason", columnDefinition = "TEXT")
    private String dismissalWaiverReason;

    @Column(name = "retention_until")
    private LocalDate retentionUntil;
}
