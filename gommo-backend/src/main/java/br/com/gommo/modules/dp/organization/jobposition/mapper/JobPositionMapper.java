package br.com.gommo.modules.dp.organization.jobposition.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;

@Component
public class JobPositionMapper {

    public JobPosition toEntity(JobPositionRequestDto dto) {
        return JobPosition.builder()
                .departmentId(dto.getDepartmentId())
                .title(dto.getTitle())
                .cboCode(dto.getCboCode())
                .nature(dto.getNature())
                .description(dto.getDescription())
                .build();
    }

    public void updateEntity(JobPosition entity, JobPositionRequestDto dto) {
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setTitle(dto.getTitle());
        entity.setCboCode(dto.getCboCode());
        entity.setNature(dto.getNature());
        entity.setDescription(dto.getDescription());
    }

    public JobPositionResponseDto toResponse(JobPosition entity) {
        return JobPositionResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .departmentId(entity.getDepartmentId())
                .title(entity.getTitle())
                .cboCode(entity.getCboCode())
                .nature(entity.getNature())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
