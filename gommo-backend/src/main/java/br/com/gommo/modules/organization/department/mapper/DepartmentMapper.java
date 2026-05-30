package br.com.gommo.modules.organization.department.mapper;

import br.com.gommo.modules.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.organization.department.dto.DepartmentResponseDto;
import br.com.gommo.modules.organization.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentRequestDto dto) {
        return Department.builder()
                .companyId(dto.getCompanyId())
                .parentId(dto.getParentId())
                .name(dto.getName())
                .costCenter(dto.getCostCenter())
                .build();
    }

    public void updateEntity(Department entity, DepartmentRequestDto dto) {
        entity.setCompanyId(dto.getCompanyId());
        entity.setParentId(dto.getParentId());
        entity.setName(dto.getName());
        entity.setCostCenter(dto.getCostCenter());
    }

    public DepartmentResponseDto toResponse(Department entity) {
        return DepartmentResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .parentId(entity.getParentId())
                .name(entity.getName())
                .costCenter(entity.getCostCenter())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
