package br.com.gesint.modules.dp.occupationalexam.procedure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class EsocialTable27ProcedureRequestDto {

    @NotBlank @Size(max = 10) private String procedureCode;

    @NotBlank @Size(max = 200) private String description;

    @NotNull private Boolean active;
}
