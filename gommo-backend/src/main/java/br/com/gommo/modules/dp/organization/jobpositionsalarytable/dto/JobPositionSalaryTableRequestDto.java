package br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionSalaryTableRequestDto {

    @NotNull private UUID jobPositionId;

    @Size(max = 120)
    private String name;

    @NotNull private LocalDate validFrom;

    private LocalDate validUntil;

    @Valid
    @NotEmpty
    @Builder.Default
    private List<JobPositionSalaryTableItemRequestDto> items = new ArrayList<>();
}
