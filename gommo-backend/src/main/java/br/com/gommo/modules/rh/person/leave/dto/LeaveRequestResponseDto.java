package br.com.gommo.modules.rh.person.leave.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessFinancialModeEnum;

@Getter
@Builder
public class LeaveRequestResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final LeaveTypeEnum leaveType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final LeaveAbsenceStatusEnum absenceStatus;
    private final Integer durationDays;
    private final String cid;
    private final String physicianName;
    private final String physicianCrm;
    private final String certificateSource;
    private final Boolean requiresInss;
    private final LocalDate inssReferralDate;
    private final LocalDate returnDate;
    private final Boolean workAccidentStability;
    private final Integer relatedCertificateDays;
    private final Boolean hasRelatedCidPeriods;
    private final Boolean approved;
    private final String notes;
    private final Integer pecuniaryAllowanceDays;
    private final Integer unjustifiedAbsences;
    private final Integer vacationDaysEntitled;
    private final LocalDate acquisitionPeriodStart;
    private final LocalDate acquisitionPeriodEnd;
    private final UUID splitGroupId;
    private final Integer splitSequence;
    private final BigDecimal baseSalarySnapshot;
    private final Integer justifiedAbsences;
    private final VacationReviewStatusEnum reviewStatus;
    private final String reviewReason;
    private final UUID recessPeriodId;
    private final RecessFinancialModeEnum recessFinancialMode;
    private final BigDecimal recessPaidPercentage;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
