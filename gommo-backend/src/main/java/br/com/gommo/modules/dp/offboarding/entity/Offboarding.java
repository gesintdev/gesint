package br.com.gommo.modules.dp.offboarding.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingChecklistItemDto;

@Entity
@Audited
@Table(name = "offboarding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class Offboarding extends BranchScopedEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "dismissal_date", nullable = false)
    private LocalDate dismissalDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "dismissal_type", nullable = false, columnDefinition = "dismissal_type_enum")
    private DismissalTypeEnum dismissalType;

    @Column(name = "dismissal_notes", columnDefinition = "TEXT")
    private String dismissalNotes;

    @Column(name = "homologation_notes", columnDefinition = "TEXT")
    private String homologationNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "process_status", nullable = false, length = 20)
    @Builder.Default
    private OffboardingProcessStatusEnum processStatus = OffboardingProcessStatusEnum.DRAFT;

    @Column(name = "esocial_dismissal_reason_code", length = 10)
    private String esocialDismissalReasonCode;

    @Column(name = "esocial_dismissal_reason_label", length = 240)
    private String esocialDismissalReasonLabel;

    @Column(name = "last_work_day")
    private LocalDate lastWorkDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "notice_type", length = 40)
    private NoticeTypeEnum noticeType;

    @Column(name = "notice_days")
    private Integer noticeDays;

    @Column(name = "notice_start_date")
    private LocalDate noticeStartDate;

    @Column(name = "notice_end_date")
    private LocalDate noticeEndDate;

    @Column(name = "workload_reduction_applicable", nullable = false)
    @Builder.Default
    private boolean workloadReductionApplicable = false;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "exit_checklist", columnDefinition = "jsonb", nullable = false)
    private List<OffboardingChecklistItemDto> exitChecklist = new ArrayList<>();

    @Column(name = "exit_interview_id")
    private UUID exitInterviewId;

    @Enumerated(EnumType.STRING)
    @Column(name = "accountant_package_status", nullable = false, length = 20)
    @Builder.Default
    private AccountantPackageStatusEnum accountantPackageStatus = AccountantPackageStatusEnum.PENDING;

    @Column(name = "accountant_package_sent_at")
    private OffsetDateTime accountantPackageSentAt;

    @Column(name = "accountant_package_detail", columnDefinition = "TEXT")
    private String accountantPackageDetail;

    @Column(name = "demissional_waiver_registered", nullable = false)
    @Builder.Default
    private boolean demissionalWaiverRegistered = false;

    @Column(name = "demissional_waiver_notes", columnDefinition = "TEXT")
    private String demissionalWaiverNotes;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
