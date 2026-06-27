package br.com.gommo.modules.ctb.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import br.com.gommo.modules.ctb.payroll.entity.PayrollStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequestDto {

    @NotNull private LocalDate referenceDate;

    private PayrollStatusEnum payrollStatus;

    private OffsetDateTime openedAt;

    private OffsetDateTime closedAt;

    private OffsetDateTime processedAt;

    private String notes;
}
