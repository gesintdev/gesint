package br.com.gommo.modules.payroll.dto;

import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequestDto {

    @NotNull
    private LocalDate referenceDate;

    private PayrollStatusEnum payrollStatus;

    private OffsetDateTime openedAt;

    private OffsetDateTime closedAt;

    private OffsetDateTime processedAt;

    private String notes;
}
