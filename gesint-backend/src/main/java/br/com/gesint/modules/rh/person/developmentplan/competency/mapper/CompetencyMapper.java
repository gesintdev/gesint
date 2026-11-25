package br.com.gesint.modules.rh.person.developmentplan.competency.mapper;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.rh.person.developmentplan.competency.dto.CompetencyRequestDto;
import br.com.gesint.modules.rh.person.developmentplan.competency.dto.CompetencyResponseDto;
import br.com.gesint.modules.rh.person.developmentplan.competency.entity.Competency;

@Component
public class CompetencyMapper {

    public Competency toEntity(CompetencyRequestDto dto) {
        return Competency.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .interviewGuideQuestion(dto.getInterviewGuideQuestion())
                .type(dto.getType())
                .levelIndicators(copyIndicators(dto.getLevelIndicators()))
                .build();
    }

    public void updateEntity(Competency entity, CompetencyRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setInterviewGuideQuestion(dto.getInterviewGuideQuestion());
        entity.setType(dto.getType());
        if (dto.getLevelIndicators() != null) {
            entity.setLevelIndicators(copyIndicators(dto.getLevelIndicators()));
        }
    }

    public CompetencyResponseDto toResponse(Competency entity) {
        return CompetencyResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .interviewGuideQuestion(entity.getInterviewGuideQuestion())
                .type(entity.getType())
                .levelIndicators(copyIndicators(entity.getLevelIndicators()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static Map<String, String> copyIndicators(Map<String, String> source) {
        return source == null ? new LinkedHashMap<>() : new LinkedHashMap<>(source);
    }
}
