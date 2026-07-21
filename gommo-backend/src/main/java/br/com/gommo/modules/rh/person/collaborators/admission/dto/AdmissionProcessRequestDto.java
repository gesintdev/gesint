package br.com.gommo.modules.rh.person.collaborators.admission.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.MaritalStatusEnum;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessFinancialModeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionProcessRequestDto {

    private AdmissionStatusEnum admissionStatus;
    private LocalDate startedAt;
    private String notes;
    private UUID photoObjectId;

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

    @Email @Size(max = 200) private String email;

    @Size(max = 20) private String phone;

    @Size(max = 10) private String zipCode;

    @Size(max = 200) private String street;

    @Size(max = 20) private String number;

    @Size(max = 100) private String complement;

    @Size(max = 100) private String district;

    private UUID cityId;
    private UUID stateId;

    @NotNull private LocalDate expectedStartDate;

    private UUID companyId;
    private UUID departmentId;
    private UUID jobPositionId;

    @NotNull private ContractTypeEnum contractType;

    private BigDecimal baseSalary;
    private String workloadSchedule;
    private UUID workScheduleId;

    private List<AdmissionEmergencyContactDto> emergencyContacts;

    private LocalDate contractStartDate;
    private LocalDate contractEndDate;

    @Size(max = 14) private String providerCnpj;

    @Size(max = 200) private String providerLegalName;

    @Size(max = 200) private String providerTradeName;

    private boolean recessEnabled;
    private Integer recessTotalDaysPerCycle;
    private Integer recessCycleMonths;
    private Integer recessEligibilityAfterMonths;
    private RecessFinancialModeEnum recessFinancialMode;
    private BigDecimal recessPaidPercentage;
    private boolean recessAllowSplit;
    private Integer recessMaxSplitPeriods;
    private Integer recessMinimumSplitDays;
    private Integer recessAdvanceNoticeDays;
    private String recessNotes;
}
