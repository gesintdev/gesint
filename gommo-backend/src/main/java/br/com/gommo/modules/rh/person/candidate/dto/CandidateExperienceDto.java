package br.com.gommo.modules.rh.person.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateExperienceDto {
    private UUID id;

    @NotBlank
    @Size(max = 200)
    private String companyName;

    @NotBlank
    @Size(max = 200)
    private String jobTitle;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean currentJob;

    private String description;
}
