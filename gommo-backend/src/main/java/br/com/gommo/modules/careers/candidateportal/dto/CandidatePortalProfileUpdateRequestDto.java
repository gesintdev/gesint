package br.com.gommo.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalProfileUpdateRequestDto {

    @Size(max = 200)
    private String fullName;

    @Size(max = 20)
    private String phone;
}
