package br.com.gommo.modules.dp.offboarding.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.offboarding.entity.NoticeTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingRequestDto {
    @NotNull
    private UUID collaboratorId;

    @NotNull
    private LocalDate dismissalDate;

    private DismissalTypeEnum dismissalType;
    private String dismissalNotes;
    private String homologationNotes;

    @Size(max = 10)
    private String esocialDismissalReasonCode;

    private LocalDate lastWorkDay;

    private NoticeTypeEnum noticeType;

    private Integer noticeDays;

    private LocalDate noticeStartDate;

    private LocalDate noticeEndDate;

    private Boolean workloadReductionApplicable;

    @Builder.Default
    private List<OffboardingChecklistItemDto> exitChecklist = new ArrayList<>();

    private UUID exitInterviewId;

    private Boolean demissionalWaiverRegistered;

    private String demissionalWaiverNotes;
}
