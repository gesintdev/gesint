package br.com.gommo.modules.rh.person.developmentplan.competency.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;

@Component
public class CompetencyMapper {

    public Competency toEntity(CompetencyRequestDto dto) {
        return Competency.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .interviewGuideQuestion(dto.getInterviewGuideQuestion())
                .type(dto.getType())
                .build();
    }

    public void updateEntity(Competency entity, CompetencyRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setInterviewGuideQuestion(dto.getInterviewGuideQuestion());
        entity.setType(dto.getType());
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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
