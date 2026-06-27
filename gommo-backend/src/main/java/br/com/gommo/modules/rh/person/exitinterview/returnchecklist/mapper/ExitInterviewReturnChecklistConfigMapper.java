package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigResponseDto;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.entity.ExitInterviewReturnChecklistConfig;

@Component
public class ExitInterviewReturnChecklistConfigMapper {

    public ExitInterviewReturnChecklistConfig toEntity(ExitInterviewReturnChecklistConfigRequestDto dto) {
        return ExitInterviewReturnChecklistConfig.builder()
                .itemKey(normalizeKey(dto.getItemKey()))
                .description(dto.getDescription())
                .displayOrder(dto.getDisplayOrder())
                .build();
    }

    public void updateEntity(
            ExitInterviewReturnChecklistConfig entity, ExitInterviewReturnChecklistConfigRequestDto dto) {
        entity.setItemKey(normalizeKey(dto.getItemKey()));
        entity.setDescription(dto.getDescription());
        entity.setDisplayOrder(dto.getDisplayOrder());
    }

    public ExitInterviewReturnChecklistConfigResponseDto toResponse(ExitInterviewReturnChecklistConfig entity) {
        return ExitInterviewReturnChecklistConfigResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .itemKey(entity.getItemKey())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String normalizeKey(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }
}
