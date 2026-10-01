package br.com.gommo.modules.rh.person.jobrequisition.dto;

import jakarta.validation.constraints.NotBlank;
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
public class JobRequisitionRejectRequestDto {
    @NotBlank
    private String reason;
}
