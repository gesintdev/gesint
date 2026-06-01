package br.com.gommo.modules.person.collaborators.people.dto;

import br.com.gommo.modules.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.person.collaborators.people.entity.MaritalStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorRequestDto {

    @NotBlank
    @Size(max = 200)
    private String fullName;

    @Size(max = 200)
    private String socialName;

    @NotBlank
    @Size(max = 14)
    private String cpf;

    @Size(max = 20)
    private String rg;

    @NotNull
    private LocalDate birthDate;

    private GenderEnum gender;

    private MaritalStatusEnum maritalStatus;

    @Size(max = 200)
    private String motherName;

    @Size(max = 200)
    private String fatherName;

    @Size(max = 60)
    private String nationality;

    @Size(max = 20)
    private String pisPasep;

    private UUID photoObjectId;
}
