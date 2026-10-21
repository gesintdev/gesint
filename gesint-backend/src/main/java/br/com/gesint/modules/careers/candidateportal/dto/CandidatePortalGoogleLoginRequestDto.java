package br.com.gesint.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalGoogleLoginRequestDto {

    /** ID token emitido pelo Google Identity Services. */
    @NotBlank
    @Size(max = 4096)
    private String idToken;
}
