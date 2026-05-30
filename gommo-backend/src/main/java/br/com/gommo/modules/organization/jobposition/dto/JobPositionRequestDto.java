package br.com.gommo.modules.organization.jobposition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
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
public class JobPositionRequestDto {

    private UUID departmentId;

    @NotBlank
    @Size(max = 120)
    private String title;

    @Size(max = 10)
    private String cboCode;

    private String description;
}
