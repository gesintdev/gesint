package br.com.gesint.modules.dp.occupationalexam.exam.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamSourceTriggerEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Getter
@Builder
public class OccupationalExamResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final UUID jobPositionId;
    private final OccupationalExamTypeEnum examType;
    private final OccupationalExamLifecycleStatusEnum lifecycleStatus;
    private final UUID clinicId;
    private final UUID examinerPhysicianId;
    private final UUID coordinatorPhysicianId;
    private final LocalDate scheduledDate;
    private final LocalDate clinicalExamDate;
    private final LocalDate asoIssueDate;
    private final LocalDate dueDate;
    private final OccupationalExamResultEnum result;
    private final OccupationalExamSourceTriggerEnum sourceTrigger;
    private final UUID relatedLeaveRequestId;
    private final UUID examRequirementVersionId;
    private final Boolean dismissalWaiverApplied;
    private final String dismissalWaiverReason;
    private final LocalDate retentionUntil;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    /**
     * Null quando o usuario nao possui {@code occupationalexam:clinical}
     * (LGPD - minimizacao de acesso a dado de saude sensivel).
     */
    private final OccupationalExamClinicalDataDto clinicalData;
}
