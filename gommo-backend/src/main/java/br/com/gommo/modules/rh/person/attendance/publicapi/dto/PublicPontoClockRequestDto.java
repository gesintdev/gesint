package br.com.gommo.modules.rh.person.attendance.publicapi.dto;

import jakarta.validation.constraints.NotBlank;
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
public class PublicPontoClockRequestDto {

    @NotBlank
    @Size(max = 32)
    private String employerCode;

    @NotBlank
    @Size(max = 32)
    private String collaboratorCode;

    @Size(max = 80)
    private String clientRequestId;
}
