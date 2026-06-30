package br.com.gommo.modules.rh.person.developmentplan.planorigin.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.entity.DevelopmentPlanOrigin;

@Component
public class DevelopmentPlanOriginMapper {

    public DevelopmentPlanOrigin toEntity(DevelopmentPlanOriginRequestDto dto) {
        return DevelopmentPlanOrigin.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    public void updateEntity(DevelopmentPlanOrigin entity, DevelopmentPlanOriginRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
    }

    public DevelopmentPlanOriginResponseDto toResponse(DevelopmentPlanOrigin entity) {
        return DevelopmentPlanOriginResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
