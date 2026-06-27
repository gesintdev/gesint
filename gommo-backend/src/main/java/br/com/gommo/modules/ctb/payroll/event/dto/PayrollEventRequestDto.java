package br.com.gommo.modules.ctb.payroll.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEventRequestDto {

    @NotBlank @Size(max = 30) private String eventCode;

    @NotBlank @Size(max = 200) private String description;

    @NotNull private PayrollEventTypeEnum eventType;

    private Boolean incidesInss;

    private Boolean incidesFgts;

    private Boolean incidesIrrf;

    private String formula;
}
