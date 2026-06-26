package br.com.gommo.modules.rh.person.leave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessFinancialModeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestRequestDto {
    @NotNull private UUID collaboratorId;

    private LeaveTypeEnum leaveType;

    @NotNull private LocalDate startDate;

    @NotNull private LocalDate endDate;

    private LeaveAbsenceStatusEnum absenceStatus;
    private Integer durationDays;
    private String cid;
    private String physicianName;
    private String physicianCrm;
    private String certificateSource;
    private Boolean requiresInss;
    private LocalDate inssReferralDate;
    private LocalDate returnDate;
    private Boolean workAccidentStability;
    private Integer relatedCertificateDays;

    private Boolean approved;
    private String notes;

    private Integer pecuniaryAllowanceDays;
    private Integer unjustifiedAbsences;
    private Integer vacationDaysEntitled;
    private LocalDate acquisitionPeriodStart;
    private LocalDate acquisitionPeriodEnd;
    private UUID splitGroupId;
    private Integer splitSequence;
    private BigDecimal baseSalarySnapshot;
    private Integer justifiedAbsences;
    private VacationReviewStatusEnum reviewStatus;
    private String reviewReason;
    private UUID recessPeriodId;
    private RecessFinancialModeEnum recessFinancialMode;
    private BigDecimal recessPaidPercentage;
}
