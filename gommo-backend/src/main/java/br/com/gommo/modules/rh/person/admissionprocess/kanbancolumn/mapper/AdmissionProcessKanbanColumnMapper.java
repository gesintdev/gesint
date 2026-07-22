package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;

@Component
public class AdmissionProcessKanbanColumnMapper {

    public AdmissionProcessKanbanColumn toEntity(AdmissionProcessKanbanColumnRequestDto dto) {
        return AdmissionProcessKanbanColumn.builder()
                .columnKey(normalizeKey(dto.getColumnKey()))
                .name(trimToNull(dto.getName()))
                .color(normalizeColor(dto.getColor()))
                .displayOrder(dto.getDisplayOrder())
                .build();
    }

    public void updateEntity(AdmissionProcessKanbanColumn entity, AdmissionProcessKanbanColumnRequestDto dto) {
        entity.setColumnKey(normalizeKey(dto.getColumnKey()));
        entity.setName(trimToNull(dto.getName()));
        entity.setColor(normalizeColor(dto.getColor()));
        entity.setDisplayOrder(dto.getDisplayOrder());
    }

    public AdmissionProcessKanbanColumnResponseDto toResponse(AdmissionProcessKanbanColumn entity) {
        return AdmissionProcessKanbanColumnResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .columnKey(entity.getColumnKey())
                .name(entity.getName())
                .color(entity.getColor())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String normalizeKey(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    private String normalizeColor(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        return trimmed.toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
