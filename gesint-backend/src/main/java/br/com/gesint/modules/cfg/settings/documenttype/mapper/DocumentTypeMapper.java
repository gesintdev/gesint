package br.com.gesint.modules.cfg.settings.documenttype.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeRequestDto;
import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeResponseDto;
import br.com.gesint.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;
import br.com.gesint.modules.cfg.settings.documenttype.entity.DocumentType;

@Component
public class DocumentTypeMapper {

    public DocumentType toEntity(DocumentTypeRequestDto dto) {
        return DocumentType.builder()
                .typeCode(normalizeTypeCode(dto.getTypeCode()))
                .name(dto.getName().trim())
                .description(blankToNull(dto.getDescription()))
                .dataClass(dto.getDataClass() != null ? dto.getDataClass() : DocumentDataClassEnum.COMUM)
                .contexts(normalizeContexts(dto.getContexts()))
                .systemManaged(false)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .build();
    }

    public void updateEntity(DocumentType entity, DocumentTypeRequestDto dto, boolean lockTypeCode) {
        if (!lockTypeCode) {
            entity.setTypeCode(normalizeTypeCode(dto.getTypeCode()));
        }
        entity.setName(dto.getName().trim());
        entity.setDescription(blankToNull(dto.getDescription()));
        entity.setDataClass(dto.getDataClass() != null ? dto.getDataClass() : DocumentDataClassEnum.COMUM);
        entity.setContexts(normalizeContexts(dto.getContexts()));
        if (dto.getSortOrder() != null) {
            entity.setSortOrder(dto.getSortOrder());
        }
    }

    public DocumentTypeResponseDto toResponse(DocumentType entity) {
        return DocumentTypeResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .typeCode(entity.getTypeCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .dataClass(entity.getDataClass())
                .contexts(entity.getContexts() == null ? List.of() : List.copyOf(entity.getContexts()))
                .systemManaged(Boolean.TRUE.equals(entity.getSystemManaged()))
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String normalizeTypeCode(String typeCode) {
        return typeCode.trim().toUpperCase().replace(' ', '_');
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> normalizeContexts(List<String> contexts) {
        if (contexts == null || contexts.isEmpty()) {
            return new ArrayList<>();
        }
        List<String> normalized = new ArrayList<>();
        for (String context : contexts) {
            if (context == null || context.isBlank()) continue;
            String value = context.trim().toUpperCase();
            if (!normalized.contains(value)) {
                normalized.add(value);
            }
        }
        return normalized;
    }
}
