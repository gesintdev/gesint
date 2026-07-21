package br.com.gommo.modules.rh.person.collaborators.admission.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionEmergencyContactDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProgress;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;

@Component
public class AdmissionProcessMapper {

    private static final int REQUIRED_STEP_COUNT = 6;

    public AdmissionProcess toEntity(AdmissionProcessRequestDto dto) {
        return AdmissionProcess.builder()
                .admissionStatus(
                        dto.getAdmissionStatus() != null ? dto.getAdmissionStatus() : AdmissionStatusEnum.IN_PROGRESS)
                .startedAt(dto.getStartedAt())
                .notes(dto.getNotes())
                .fullName(dto.getFullName())
                .socialName(dto.getSocialName())
                .cpf(dto.getCpf())
                .rg(dto.getRg())
                .rgIssuer(dto.getRgIssuer())
                .rgStateCode(dto.getRgStateCode())
                .birthDate(dto.getBirthDate())
                .gender(dto.getGender())
                .maritalStatus(dto.getMaritalStatus())
                .motherName(dto.getMotherName())
                .fatherName(dto.getFatherName())
                .nationality(dto.getNationality() != null ? dto.getNationality() : "Brasileiro")
                .pisPasep(dto.getPisPasep())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .zipCode(dto.getZipCode())
                .street(dto.getStreet())
                .number(dto.getNumber())
                .complement(dto.getComplement())
                .district(dto.getDistrict())
                .expectedStartDate(dto.getExpectedStartDate())
                .companyId(dto.getCompanyId())
                .departmentId(dto.getDepartmentId())
                .jobPositionId(dto.getJobPositionId())
                .contractType(dto.getContractType() != null ? dto.getContractType() : ContractTypeEnum.CLT)
                .baseSalary(dto.getBaseSalary())
                .workloadSchedule(dto.getWorkloadSchedule())
                .workScheduleId(dto.getWorkScheduleId())
                .emergencyContacts(copyEmergencyContacts(dto.getEmergencyContacts()))
                .contractStartDate(dto.getContractStartDate())
                .contractEndDate(dto.getContractEndDate())
                .providerCnpj(dto.getProviderCnpj())
                .providerLegalName(dto.getProviderLegalName())
                .providerTradeName(dto.getProviderTradeName())
                .recessEnabled(dto.isRecessEnabled())
                .recessTotalDaysPerCycle(dto.getRecessTotalDaysPerCycle())
                .recessCycleMonths(dto.getRecessCycleMonths())
                .recessEligibilityAfterMonths(dto.getRecessEligibilityAfterMonths())
                .recessFinancialMode(dto.getRecessFinancialMode())
                .recessPaidPercentage(dto.getRecessPaidPercentage())
                .recessAllowSplit(dto.isRecessAllowSplit())
                .recessMaxSplitPeriods(dto.getRecessMaxSplitPeriods())
                .recessMinimumSplitDays(dto.getRecessMinimumSplitDays())
                .recessAdvanceNoticeDays(
                        dto.getRecessAdvanceNoticeDays() != null ? dto.getRecessAdvanceNoticeDays() : 0)
                .recessNotes(dto.getRecessNotes())
                .photoObjectId(dto.getPhotoObjectId())
                .build();
    }

    public void updateEntity(AdmissionProcess entity, AdmissionProcessRequestDto dto) {
        entity.setStartedAt(dto.getStartedAt());
        entity.setNotes(dto.getNotes());
        entity.setFullName(dto.getFullName());
        entity.setSocialName(dto.getSocialName());
        entity.setCpf(dto.getCpf());
        entity.setRg(dto.getRg());
        entity.setRgIssuer(dto.getRgIssuer());
        entity.setRgStateCode(dto.getRgStateCode());
        entity.setBirthDate(dto.getBirthDate());
        entity.setGender(dto.getGender());
        entity.setMaritalStatus(dto.getMaritalStatus());
        entity.setMotherName(dto.getMotherName());
        entity.setFatherName(dto.getFatherName());
        if (dto.getNationality() != null) {
            entity.setNationality(dto.getNationality());
        }
        entity.setPisPasep(dto.getPisPasep());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setZipCode(dto.getZipCode());
        entity.setStreet(dto.getStreet());
        entity.setNumber(dto.getNumber());
        entity.setComplement(dto.getComplement());
        entity.setDistrict(dto.getDistrict());
        entity.setExpectedStartDate(dto.getExpectedStartDate());
        entity.setCompanyId(dto.getCompanyId());
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setJobPositionId(dto.getJobPositionId());
        if (dto.getContractType() != null) {
            entity.setContractType(dto.getContractType());
        }
        entity.setBaseSalary(dto.getBaseSalary());
        entity.setWorkloadSchedule(dto.getWorkloadSchedule());
        entity.setWorkScheduleId(dto.getWorkScheduleId());
        entity.setEmergencyContacts(copyEmergencyContacts(dto.getEmergencyContacts()));
        entity.setContractStartDate(dto.getContractStartDate());
        entity.setContractEndDate(dto.getContractEndDate());
        entity.setProviderCnpj(dto.getProviderCnpj());
        entity.setProviderLegalName(dto.getProviderLegalName());
        entity.setProviderTradeName(dto.getProviderTradeName());
        entity.setRecessEnabled(dto.isRecessEnabled());
        entity.setRecessTotalDaysPerCycle(dto.getRecessTotalDaysPerCycle());
        entity.setRecessCycleMonths(dto.getRecessCycleMonths());
        entity.setRecessEligibilityAfterMonths(dto.getRecessEligibilityAfterMonths());
        entity.setRecessFinancialMode(dto.getRecessFinancialMode());
        entity.setRecessPaidPercentage(dto.getRecessPaidPercentage());
        entity.setRecessAllowSplit(dto.isRecessAllowSplit());
        entity.setRecessMaxSplitPeriods(dto.getRecessMaxSplitPeriods());
        entity.setRecessMinimumSplitDays(dto.getRecessMinimumSplitDays());
        entity.setRecessAdvanceNoticeDays(
                dto.getRecessAdvanceNoticeDays() != null ? dto.getRecessAdvanceNoticeDays() : 0);
        entity.setRecessNotes(dto.getRecessNotes());
        entity.setPhotoObjectId(dto.getPhotoObjectId());
    }

    public AdmissionProcessResponseDto toResponse(AdmissionProcess entity) {
        return toResponse(entity, entity.getAdmissionStatus(), 0, REQUIRED_STEP_COUNT, List.of());
    }

    public AdmissionProcessResponseDto toResponse(AdmissionProcess entity, AdmissionProgress progress) {
        return toResponse(
                entity,
                progress.status(),
                progress.completedStepCount(),
                progress.requiredStepCount(),
                progress.completedStepIds());
    }

    public AdmissionProcessResponseDto toResponse(
            AdmissionProcess entity,
            AdmissionStatusEnum admissionStatus,
            int completedStepCount,
            int requiredStepCount,
            List<String> completedStepIds) {
        return toResponse(entity, admissionStatus, completedStepCount, requiredStepCount, completedStepIds, null);
    }

    public AdmissionProcessResponseDto toResponse(
            AdmissionProcess entity,
            AdmissionStatusEnum admissionStatus,
            int completedStepCount,
            int requiredStepCount,
            List<String> completedStepIds,
            String departmentName) {
        return toResponse(
                entity,
                admissionStatus,
                completedStepCount,
                requiredStepCount,
                completedStepIds,
                departmentName,
                null,
                false,
                false,
                false);
    }

    public AdmissionProcessResponseDto toResponse(
            AdmissionProcess entity,
            AdmissionStatusEnum admissionStatus,
            int completedStepCount,
            int requiredStepCount,
            List<String> completedStepIds,
            String departmentName,
            StatusEnum collaboratorStatus,
            boolean inVacation,
            boolean onLeave,
            boolean onLeaveActive) {
        return AdmissionProcessResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorStatus(collaboratorStatus)
                .photoObjectId(entity.getPhotoObjectId())
                .admissionStatus(admissionStatus)
                .inVacation(inVacation)
                .onLeave(onLeave)
                .onLeaveActive(onLeaveActive)
                .completedStepCount(completedStepCount)
                .requiredStepCount(requiredStepCount)
                .completedStepIds(completedStepIds)
                .startedAt(entity.getStartedAt())
                .completedAt(admissionStatus == AdmissionStatusEnum.COMPLETED ? entity.getCompletedAt() : null)
                .notes(entity.getNotes())
                .fullName(entity.getFullName())
                .socialName(entity.getSocialName())
                .cpf(entity.getCpf())
                .rg(entity.getRg())
                .rgIssuer(entity.getRgIssuer())
                .rgStateCode(entity.getRgStateCode())
                .birthDate(entity.getBirthDate())
                .gender(entity.getGender())
                .maritalStatus(entity.getMaritalStatus())
                .motherName(entity.getMotherName())
                .fatherName(entity.getFatherName())
                .nationality(entity.getNationality())
                .pisPasep(entity.getPisPasep())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .zipCode(entity.getZipCode())
                .street(entity.getStreet())
                .number(entity.getNumber())
                .complement(entity.getComplement())
                .district(entity.getDistrict())
                .cityId(entity.getCity() != null ? entity.getCity().getId() : null)
                .cityName(entity.getCity() != null ? entity.getCity().getName() : null)
                .stateId(entity.getState() != null ? entity.getState().getId() : null)
                .stateCode(entity.getState() != null ? entity.getState().getAbbreviation() : null)
                .stateName(entity.getState() != null ? entity.getState().getName() : null)
                .expectedStartDate(entity.getExpectedStartDate())
                .companyId(entity.getCompanyId())
                .departmentId(entity.getDepartmentId())
                .departmentName(departmentName)
                .jobPositionId(entity.getJobPositionId())
                .contractType(entity.getContractType())
                .baseSalary(entity.getBaseSalary())
                .workloadSchedule(entity.getWorkloadSchedule())
                .workScheduleId(entity.getWorkScheduleId())
                .emergencyContacts(copyEmergencyContacts(entity.getEmergencyContacts()))
                .contractStartDate(entity.getContractStartDate())
                .contractEndDate(entity.getContractEndDate())
                .providerCnpj(entity.getProviderCnpj())
                .providerLegalName(entity.getProviderLegalName())
                .providerTradeName(entity.getProviderTradeName())
                .recessEnabled(entity.isRecessEnabled())
                .recessTotalDaysPerCycle(entity.getRecessTotalDaysPerCycle())
                .recessCycleMonths(entity.getRecessCycleMonths())
                .recessEligibilityAfterMonths(entity.getRecessEligibilityAfterMonths())
                .recessFinancialMode(entity.getRecessFinancialMode())
                .recessPaidPercentage(entity.getRecessPaidPercentage())
                .recessAllowSplit(entity.isRecessAllowSplit())
                .recessMaxSplitPeriods(entity.getRecessMaxSplitPeriods())
                .recessMinimumSplitDays(entity.getRecessMinimumSplitDays())
                .recessAdvanceNoticeDays(entity.getRecessAdvanceNoticeDays())
                .recessNotes(entity.getRecessNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static List<AdmissionEmergencyContactDto> copyEmergencyContacts(
            List<AdmissionEmergencyContactDto> contacts) {
        if (CollectionUtils.isEmpty(contacts)) {
            return new ArrayList<>();
        }
        return contacts.stream()
                .map(contact -> AdmissionEmergencyContactDto.builder()
                        .name(contact.getName())
                        .phone(contact.getPhone())
                        .relationship(contact.getRelationship())
                        .build())
                .toList();
    }
}
