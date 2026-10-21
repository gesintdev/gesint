package br.com.gesint.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalRefreshRequestDto {

    @NotBlank
    private String refreshToken;
}
