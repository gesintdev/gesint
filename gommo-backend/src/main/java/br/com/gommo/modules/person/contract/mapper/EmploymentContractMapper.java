package br.com.gommo.modules.person.contract.mapper;
import br.com.gommo.modules.person.contract.dto.EmploymentContractRequestDto; import br.com.gommo.modules.person.contract.dto.EmploymentContractResponseDto;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum; import br.com.gommo.modules.person.contract.entity.EmploymentContract;
import org.springframework.stereotype.Component;
@Component public class EmploymentContractMapper {
    public EmploymentContract toEntity(EmploymentContractRequestDto dto) {
        return EmploymentContract.builder().collaboratorId(dto.getCollaboratorId()).companyId(dto.getCompanyId())
            .jobPositionId(dto.getJobPositionId()).contractType(dto.getContractType() != null ? dto.getContractType() : ContractTypeEnum.CLT)
            .startDate(dto.getStartDate()).endDate(dto.getEndDate()).baseSalary(dto.getBaseSalary())
            .workloadHours(dto.getWorkloadHours()).notes(dto.getNotes()).build();
    }
    public void updateEntity(EmploymentContract entity, EmploymentContractRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setCompanyId(dto.getCompanyId());
        entity.setJobPositionId(dto.getJobPositionId());
        if (dto.getContractType() != null) entity.setContractType(dto.getContractType());
        entity.setStartDate(dto.getStartDate()); entity.setEndDate(dto.getEndDate());
        entity.setBaseSalary(dto.getBaseSalary()); entity.setWorkloadHours(dto.getWorkloadHours()); entity.setNotes(dto.getNotes());
    }
    public EmploymentContractResponseDto toResponse(EmploymentContract entity) {
        return EmploymentContractResponseDto.builder().id(entity.getId()).code(entity.getCode()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).companyId(entity.getCompanyId()).jobPositionId(entity.getJobPositionId())
            .contractType(entity.getContractType()).startDate(entity.getStartDate()).endDate(entity.getEndDate())
            .baseSalary(entity.getBaseSalary()).workloadHours(entity.getWorkloadHours()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
