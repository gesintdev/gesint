package br.com.gommo.modules.rh.person.collaborators.admission.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.MaritalStatusEnum;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessFinancialModeEnum;

@Getter
@Builder
public class AdmissionProcessResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final UUID photoObjectId;
    private final AdmissionStatusEnum admissionStatus;
    private final int completedStepCount;
    private final int requiredStepCount;
    private final List<String> completedStepIds;
    private final LocalDate startedAt;
    private final LocalDate completedAt;
    private final String notes;

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
    private final String zipCode;
    private final String street;
    private final String number;
    private final String complement;
    private final String district;
    private final UUID cityId;
    private final String cityName;
    private final UUID stateId;
    private final String stateCode;
    private final String stateName;

    private final LocalDate expectedStartDate;
    private final UUID companyId;
    private final UUID departmentId;
    private final String departmentName;
    private final UUID jobPositionId;
    private final ContractTypeEnum contractType;
    private final BigDecimal baseSalary;
    private final String workloadSchedule;
    private final List<AdmissionEmergencyContactDto> emergencyContacts;
    private final LocalDate contractStartDate;
    private final LocalDate contractEndDate;
    private final String providerCnpj;
    private final String providerLegalName;
    private final String providerTradeName;
    private final boolean recessEnabled;
    private final Integer recessTotalDaysPerCycle;
    private final Integer recessCycleMonths;
    private final Integer recessEligibilityAfterMonths;
    private final RecessFinancialModeEnum recessFinancialMode;
    private final BigDecimal recessPaidPercentage;
    private final boolean recessAllowSplit;
    private final Integer recessMaxSplitPeriods;
    private final Integer recessMinimumSplitDays;
    private final Integer recessAdvanceNoticeDays;
    private final String recessNotes;

    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
