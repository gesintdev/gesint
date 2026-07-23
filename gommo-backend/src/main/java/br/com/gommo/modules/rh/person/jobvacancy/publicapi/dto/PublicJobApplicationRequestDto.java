package br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicJobApplicationRequestDto {
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

    @Size(max = 120)
    private String city;

    @Size(max = 2)
    private String stateCode;

    @Size(max = 300)
    private String linkedinUrl;

    @Size(max = 300)
    private String portfolioUrl;

    private String coverLetter;

    @Size(max = 80)
    private String referralSource;

    @Valid
    @Builder.Default
    private List<CandidateExperienceDto> experiences = new ArrayList<>();
}
