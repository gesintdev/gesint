package br.com.gommo.modules.rh.person.exitinterview.entity;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewAnswerDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRatingDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewReturnChecklistItemDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "exit_interview")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterview extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    @Column(name = "departure_reason", length = 255)
    private String departureReason;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "would_recommend")
    private Boolean wouldRecommend;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_status", nullable = false, length = 32)
    private ExitInterviewStatusEnum interviewStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 16)
    private ExitInterviewRelationshipTypeEnum relationshipType;

    @Column(name = "collaborator_name", length = 200)
    private String collaboratorName;

    @Column(name = "registration_number", length = 60)
    private String registrationNumber;

    @Column(name = "job_position_name", length = 160)
    private String jobPositionName;

    @Column(name = "department_name", length = 160)
    private String departmentName;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "manager_name", length = 200)
    private String managerName;

    @Column(name = "admission_or_contract_start_date")
    private LocalDate admissionOrContractStartDate;

    @Column(name = "termination_or_contract_end_date")
    private LocalDate terminationOrContractEndDate;

    @Column(name = "tenure_days")
    private Integer tenureDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "termination_type", length = 64)
    private ExitInterviewTerminationTypeEnum terminationType;

    @Column(name = "interviewer_name", length = 200)
    private String interviewerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "main_reason", length = 64)
    private ExitInterviewReasonEnum mainReason;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "secondary_reasons", columnDefinition = "jsonb", nullable = false)
    private List<ExitInterviewReasonEnum> secondaryReasons = new ArrayList<>();

    @Column(name = "detailed_reason", columnDefinition = "TEXT")
    private String detailedReason;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ratings", columnDefinition = "jsonb", nullable = false)
    private List<ExitInterviewRatingDto> ratings = new ArrayList<>();

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "open_answers", columnDefinition = "jsonb", nullable = false)
    private List<ExitInterviewAnswerDto> openAnswers = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "would_return", length = 16)
    private ExitInterviewRehireAnswerEnum wouldReturn;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_would_rehire", length = 16)
    private ExitInterviewRehireAnswerEnum companyWouldRehire;

    @Column(name = "rehire_notes", columnDefinition = "TEXT")
    private String rehireNotes;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "return_checklist", columnDefinition = "jsonb", nullable = false)
    private List<ExitInterviewReturnChecklistItemDto> returnChecklist = new ArrayList<>();

    @Column(name = "template_key", length = 100)
    private String templateKey;

    @Column(name = "template_version")
    private Integer templateVersion;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_payload", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> templatePayload = Map.of();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;
}