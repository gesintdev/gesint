package br.com.gommo.modules.dp.offboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingAccountantPackageDto {
    private UUID offboardingId;
    private Integer offboardingCode;
    private UUID collaboratorId;
    private String collaboratorName;
    private String collaboratorCpf;
    private String esocialDismissalReasonCode;
    private String esocialDismissalReasonLabel;
    private LocalDate dismissalDate;
    private LocalDate lastWorkDay;
    private String noticeType;
    private Integer noticeDays;
    private LocalDate noticeStartDate;
    private LocalDate noticeEndDate;
    private String accountantEmail;
    private String accountantName;
    private String packageStatus;
    private OffsetDateTime packageSentAt;
    private String packageDetail;

    @Builder.Default
    private List<OffboardingChecklistItemDto> checklist = new ArrayList<>();

    private String summaryText;
}
