package br.com.gommo.modules.rh.person.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateRequestDto {
    @NotBlank
    @Size(max = 200)
    private String fullName;

    @NotBlank
    @Size(max = 14)
    private String cpf;

    @Size(max = 200)
    private String email;

    @Size(max = 20)
    private String phone;

    private LocalDate birthDate;
}
