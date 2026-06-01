package br.com.gommo.modules.person.collaborators.admission.dto;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.person.collaborators.people.entity.MaritalStatusEnum;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdmissionProcessResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final UUID photoObjectId;
    private final AdmissionStatusEnum admissionStatus;
    private final LocalDate startedAt;
    private final LocalDate completedAt;
    private final String notes;

    private final String fullName;
    private final String socialName;
    private final String cpf;
    private final String rg;
    private final LocalDate birthDate;
    private final GenderEnum gender;
    private final MaritalStatusEnum maritalStatus;
    private final String motherName;
    private final String fatherName;
    private final String nationality;
    private final String pisPasep;
    private final String email;
    private final String phone;
    private final String zipCode;
    private final String street;
    private final String number;
    private final String complement;
    private final String district;
    private final String city;
    private final String stateCode;

    private final LocalDate expectedStartDate;
    private final UUID companyId;
    private final UUID departmentId;
    private final UUID jobPositionId;
    private final ContractTypeEnum contractType;
    private final BigDecimal baseSalary;
    private final BigDecimal workloadHours;

    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
