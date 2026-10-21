package br.com.gesint.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalLoginRequestDto {

    @NotBlank
    @Email
    @Size(max = 200)
    private String email;

    @NotBlank
    @Size(max = 72)
    private String password;
}
