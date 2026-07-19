package br.com.gommo.admin.modules.productsystem.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.admin.modules.productsystem.dto.ProductSystemRequestDto;
import br.com.gommo.admin.modules.productsystem.dto.ProductSystemResponseDto;
import br.com.gommo.admin.modules.productsystem.entity.ProductSystem;

@Component
public class ProductSystemMapper {

    public ProductSystem toEntity(ProductSystemRequestDto dto) {
        return ProductSystem.builder()
                .key(normalizeKey(dto.getKey()))
                .name(dto.getName().trim())
                .description(blankToNull(dto.getDescription()))
                .defaultPrice(dto.getDefaultPrice())
                .withAiAvailable(Boolean.TRUE.equals(dto.getWithAiAvailable()))
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .notes(blankToNull(dto.getNotes()))
                .build();
    }

    public void updateEntity(ProductSystem entity, ProductSystemRequestDto dto) {
        entity.setKey(normalizeKey(dto.getKey()));
        entity.setName(dto.getName().trim());
        entity.setDescription(blankToNull(dto.getDescription()));
        entity.setDefaultPrice(dto.getDefaultPrice());
        entity.setWithAiAvailable(Boolean.TRUE.equals(dto.getWithAiAvailable()));
        entity.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        entity.setNotes(blankToNull(dto.getNotes()));
    }

    public ProductSystemResponseDto toResponse(ProductSystem entity) {
        return ProductSystemResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .key(entity.getKey())
                .name(entity.getName())
                .description(entity.getDescription())
                .defaultPrice(entity.getDefaultPrice())
                .withAiAvailable(entity.isWithAiAvailable())
                .sortOrder(entity.getSortOrder())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String normalizeKey(String key) {
        return key == null ? null : key.trim().toUpperCase();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
