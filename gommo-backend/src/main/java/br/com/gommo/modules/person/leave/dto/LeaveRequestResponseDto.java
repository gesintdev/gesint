package br.com.gommo.modules.person.leave.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;

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
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
