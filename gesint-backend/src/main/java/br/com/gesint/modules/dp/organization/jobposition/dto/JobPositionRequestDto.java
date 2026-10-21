package br.com.gesint.modules.dp.organization.jobposition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gesint.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionRequestDto {

    private UUID departmentId;

    /** Quando true, o registro vale em todas as filiais ({@code company_id} nulo). Legado — preferir {@link #companyId}. */
    private Boolean sharedAcrossBranches;

    /** Filial do cadastro; nulo = disponivel em todas as filiais (Total). */
    private UUID companyId;

    @NotBlank @Size(max = 120) private String title;

    @Size(max = 10) private String cboCode;

    private JobPositionNatureEnum nature;

    private String description;
}
