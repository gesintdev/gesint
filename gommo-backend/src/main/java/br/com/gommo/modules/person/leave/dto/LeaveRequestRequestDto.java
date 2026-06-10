package br.com.gommo.modules.person.leave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;

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
}
