package br.com.gesint.modules.rh.report.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
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
public class PeriodReportFilterDto {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @AssertTrue(message = "A data final deve ser igual ou posterior à data inicial")
    public boolean isValidPeriod() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}
