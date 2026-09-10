package br.com.gommo.modules.dp.occupationalexam.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.dp.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamSourceTriggerEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalExamRequestDto {

    @NotNull private UUID collaboratorId;

    @NotNull private UUID jobPositionId;

    @NotNull private OccupationalExamTypeEnum examType;

    private OccupationalExamLifecycleStatusEnum lifecycleStatus;

    private UUID clinicId;
    private UUID examinerPhysicianId;
    private UUID coordinatorPhysicianId;

    private LocalDate scheduledDate;
    private LocalDate clinicalExamDate;
    private LocalDate asoIssueDate;

    /**
     * Nao aceito como sobrescrita manual quando houver matriz vigente;
     * o service calcula a partir de ExamRequirement.
     */
    private LocalDate dueDate;

    private OccupationalExamResultEnum result;
    private String cid;
    private String clinicalObservations;

    private OccupationalExamSourceTriggerEnum sourceTrigger;
    private UUID relatedLeaveRequestId;
    private UUID examRequirementVersionId;

    private Boolean dismissalWaiverApplied;
    private String dismissalWaiverReason;
    private LocalDate retentionUntil;

    @Builder.Default
    private List<ComplementaryExamRequestDto> complementaryExams = new ArrayList<>();
}
