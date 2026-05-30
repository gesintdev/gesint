package br.com.gommo.modules.organization.jobposition.mapper;

import br.com.gommo.modules.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.organization.jobposition.entity.JobPosition;
import org.springframework.stereotype.Component;

@Component
public class JobPositionMapper {

    public JobPosition toEntity(JobPositionRequestDto dto) {
        return JobPosition.builder()
                .departmentId(dto.getDepartmentId())
                .title(dto.getTitle())
                .cboCode(dto.getCboCode())
                .description(dto.getDescription())
                .build();
    }

    public void updateEntity(JobPosition entity, JobPositionRequestDto dto) {
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setTitle(dto.getTitle());
        entity.setCboCode(dto.getCboCode());
        entity.setDescription(dto.getDescription());
    }

    public JobPositionResponseDto toResponse(JobPosition entity) {
        return JobPositionResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .departmentId(entity.getDepartmentId())
                .title(entity.getTitle())
                .cboCode(entity.getCboCode())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
