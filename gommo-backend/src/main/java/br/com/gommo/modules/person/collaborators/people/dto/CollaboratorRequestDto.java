package br.com.gommo.modules.person.collaborators.people.dto;

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

import br.com.gommo.modules.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.person.collaborators.people.entity.MaritalStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorRequestDto {

    @NotBlank @Size(max = 200) private String fullName;

    @Size(max = 200) private String socialName;

    @NotBlank @Size(max = 14) private String cpf;

    @Size(max = 20) private String rg;

    @Size(max = 20) private String rgIssuer;

    @Size(max = 2) private String rgStateCode;

    @NotNull private LocalDate birthDate;

    private GenderEnum gender;

    private MaritalStatusEnum maritalStatus;

    @Size(max = 200) private String motherName;

    @Size(max = 200) private String fatherName;

    @Size(max = 60) private String nationality;

    @Size(max = 20) private String pisPasep;

    private UUID photoObjectId;
}
