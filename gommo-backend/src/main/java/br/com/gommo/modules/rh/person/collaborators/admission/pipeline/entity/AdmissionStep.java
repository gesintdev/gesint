package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity;

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
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "admission_step")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class AdmissionStep extends BranchScopedEntity {

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "step_key", nullable = false, columnDefinition = "admission_step_key_enum")
    private AdmissionStepKeyEnum stepKey;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "step_status", nullable = false, columnDefinition = "admission_step_status_enum")
    private AdmissionStepStatusEnum stepStatus;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    /** Prazo legal da etapa, calculado a partir de {@code expected_start_date}. */
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "blocked_reason", columnDefinition = "TEXT")
    private String blockedReason;

    @Column(name = "skip_justification", columnDefinition = "TEXT")
    private String skipJustification;
}
