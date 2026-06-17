package br.com.gommo.modules.dp.organization.department.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.dp.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.dp.organization.department.dto.DepartmentResponseDto;
import br.com.gommo.modules.dp.organization.department.entity.Department;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentRequestDto dto) {
        return Department.builder()
                .companyId(dto.getCompanyId())
                .parentId(dto.getParentId())
                .name(dto.getName())
                .costCenter(dto.getCostCenter())
                .description(dto.getDescription())
                .monthlyBudget(dto.getMonthlyBudget())
                .location(dto.getLocation())
                .phone(dto.getPhone())
                .fax(dto.getFax())
                .phoneExtension(dto.getPhoneExtension())
                .email(dto.getEmail())
                .responsibleCollaboratorIds(copyCollaboratorIds(dto.getResponsibleCollaboratorIds()))
                .build();
    }

    public void updateEntity(Department entity, DepartmentRequestDto dto) {
        entity.setCompanyId(dto.getCompanyId());
        entity.setParentId(dto.getParentId());
        entity.setName(dto.getName());
        entity.setCostCenter(dto.getCostCenter());
        entity.setDescription(dto.getDescription());
        entity.setMonthlyBudget(dto.getMonthlyBudget());
        entity.setLocation(dto.getLocation());
        entity.setPhone(dto.getPhone());
        entity.setFax(dto.getFax());
        entity.setPhoneExtension(dto.getPhoneExtension());
        entity.setEmail(dto.getEmail());
        entity.setResponsibleCollaboratorIds(copyCollaboratorIds(dto.getResponsibleCollaboratorIds()));
    }

    public DepartmentResponseDto toResponse(Department entity) {
        return DepartmentResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .parentId(entity.getParentId())
                .name(entity.getName())
                .costCenter(entity.getCostCenter())
                .description(entity.getDescription())
                .monthlyBudget(entity.getMonthlyBudget())
                .location(entity.getLocation())
                .phone(entity.getPhone())
                .fax(entity.getFax())
                .phoneExtension(entity.getPhoneExtension())
                .email(entity.getEmail())
                .responsibleCollaboratorIds(copyCollaboratorIds(entity.getResponsibleCollaboratorIds()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private List<UUID> copyCollaboratorIds(List<UUID> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(source);
    }
}
