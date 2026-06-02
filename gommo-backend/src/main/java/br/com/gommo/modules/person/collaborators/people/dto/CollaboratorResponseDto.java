package br.com.gommo.modules.person.collaborators.people.dto;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.person.collaborators.people.entity.MaritalStatusEnum;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CollaboratorResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String fullName;
    private final String socialName;
    private final String cpf;
    private final String rg;
    private final String rgIssuer;
    private final String rgStateCode;
    private final LocalDate birthDate;
    private final GenderEnum gender;
    private final MaritalStatusEnum maritalStatus;
    private final String motherName;
    private final String fatherName;
    private final String nationality;
    private final String pisPasep;
    private final String email;
    private final String phone;
    private final UUID photoObjectId;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
