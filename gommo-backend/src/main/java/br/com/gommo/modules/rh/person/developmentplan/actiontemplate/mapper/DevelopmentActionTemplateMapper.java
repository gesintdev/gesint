package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.entity.DevelopmentActionTemplate;

@Component
public class DevelopmentActionTemplateMapper {

    public DevelopmentActionTemplate toEntity(DevelopmentActionTemplateRequestDto dto) {
        return DevelopmentActionTemplate.builder()
                .competencyId(dto.getCompetencyId())
                .competencyName(dto.getCompetencyName())
                .minGap(dto.getMinGap())
                .title(dto.getTitle())
                .suggestedDescription(dto.getSuggestedDescription())
                .actionType(dto.getActionType())
                .suggestedDeadlineDays(dto.getSuggestedDeadlineDays())
                .evidenceRequired(dto.getEvidenceRequired() != null ? dto.getEvidenceRequired() : false)
                .build();
    }

    public void updateEntity(DevelopmentActionTemplate entity, DevelopmentActionTemplateRequestDto dto) {
        entity.setCompetencyId(dto.getCompetencyId());
        entity.setCompetencyName(dto.getCompetencyName());
        entity.setMinGap(dto.getMinGap());
        entity.setTitle(dto.getTitle());
        entity.setSuggestedDescription(dto.getSuggestedDescription());
        entity.setActionType(dto.getActionType());
        entity.setSuggestedDeadlineDays(dto.getSuggestedDeadlineDays());
        entity.setEvidenceRequired(dto.getEvidenceRequired() != null ? dto.getEvidenceRequired() : false);
    }

    public DevelopmentActionTemplateResponseDto toResponse(DevelopmentActionTemplate entity) {
        return DevelopmentActionTemplateResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .competencyId(entity.getCompetencyId())
                .competencyName(entity.getCompetencyName())
                .minGap(entity.getMinGap())
                .title(entity.getTitle())
                .suggestedDescription(entity.getSuggestedDescription())
                .actionType(entity.getActionType())
                .suggestedDeadlineDays(entity.getSuggestedDeadlineDays())
                .evidenceRequired(entity.getEvidenceRequired())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
