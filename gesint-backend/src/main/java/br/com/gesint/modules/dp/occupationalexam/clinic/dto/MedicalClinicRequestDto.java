package br.com.gesint.modules.dp.occupationalexam.clinic.dto;

import jakarta.validation.constraints.NotBlank;
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
public class MedicalClinicRequestDto {

    @NotBlank @Size(max = 200) private String corporateName;

    @NotBlank @Size(max = 20) private String cnpj;

    @Size(max = 10) private String zipCode;

    @Size(max = 200) private String street;

    @Size(max = 20) private String number;

    @Size(max = 100) private String complement;

    @Size(max = 100) private String district;

    private UUID stateId;

    private UUID cityId;

    @Size(max = 30) private String phone;

    @Size(max = 150) private String email;

    private String examsOffered;

    private LocalDate accreditationValidUntil;
}
