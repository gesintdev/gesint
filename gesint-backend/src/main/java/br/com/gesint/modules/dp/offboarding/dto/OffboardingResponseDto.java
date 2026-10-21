package br.com.gesint.modules.dp.offboarding.dto;

import lombok.*;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.AccountantPackageStatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gesint.modules.dp.offboarding.entity.NoticeTypeEnum;
import br.com.gesint.modules.dp.offboarding.entity.OffboardingProcessStatusEnum;

@Getter
@Builder
public class OffboardingResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final LocalDate dismissalDate;
    private final DismissalTypeEnum dismissalType;
    private final String dismissalNotes;
    private final String homologationNotes;
    private final OffboardingProcessStatusEnum processStatus;
    private final String esocialDismissalReasonCode;
    private final String esocialDismissalReasonLabel;
    private final LocalDate lastWorkDay;
    private final NoticeTypeEnum noticeType;
    private final Integer noticeDays;
    private final LocalDate noticeStartDate;
    private final LocalDate noticeEndDate;
    private final boolean workloadReductionApplicable;
    @Builder.Default
    private final List<OffboardingChecklistItemDto> exitChecklist = new ArrayList<>();
    private final UUID exitInterviewId;
    private final AccountantPackageStatusEnum accountantPackageStatus;
    private final OffsetDateTime accountantPackageSentAt;
    private final String accountantPackageDetail;
    private final boolean demissionalWaiverRegistered;
    private final String demissionalWaiverNotes;
    private final OffsetDateTime completedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
