package br.com.gesint.modules.rh.person.collaborators.admission.dto;

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
public class AdmissionDependentDto {

    @Size(max = 200)
    private String fullName;

    private LocalDate birthDate;

    @Size(max = 80)
    private String relationship;

    @Size(max = 14)
    private String cpf;
}
