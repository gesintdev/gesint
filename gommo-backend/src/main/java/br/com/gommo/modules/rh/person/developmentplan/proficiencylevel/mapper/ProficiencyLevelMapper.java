package br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.entity.ProficiencyLevel;

@Component
public class ProficiencyLevelMapper {

    public ProficiencyLevel toEntity(ProficiencyLevelRequestDto dto) {
        return ProficiencyLevel.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .levelOrder(dto.getLevelOrder())
                .weight(dto.getWeight())
                .build();
    }

    public void updateEntity(ProficiencyLevel entity, ProficiencyLevelRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setLevelOrder(dto.getLevelOrder());
        entity.setWeight(dto.getWeight());
    }

    public ProficiencyLevelResponseDto toResponse(ProficiencyLevel entity) {
        return ProficiencyLevelResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .levelOrder(entity.getLevelOrder())
                .weight(entity.getWeight())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
