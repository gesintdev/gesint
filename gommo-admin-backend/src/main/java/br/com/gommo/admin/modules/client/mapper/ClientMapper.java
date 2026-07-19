package br.com.gommo.admin.modules.client.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.entity.Client;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequestDto dto) {
        return Client.builder()
                .name(dto.getName())
                .legalName(dto.getLegalName())
                .slug(dto.getSlug())
                .document(normalizeDocument(dto.getDocument()))
                .address(dto.getAddress())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(Client entity, ClientRequestDto dto) {
        entity.setName(dto.getName());
        entity.setLegalName(dto.getLegalName());
        entity.setSlug(dto.getSlug());
        entity.setDocument(normalizeDocument(dto.getDocument()));
        entity.setAddress(dto.getAddress());
        entity.setContactEmail(dto.getContactEmail());
        entity.setContactPhone(dto.getContactPhone());
        entity.setNotes(dto.getNotes());
    }

    public ClientResponseDto toResponse(Client entity) {
        return ClientResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .legalName(entity.getLegalName())
                .slug(entity.getSlug())
                .mobileLoginCode(entity.getMobileLoginCode())
                .document(entity.getDocument())
                .address(entity.getAddress())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String normalizeDocument(String document) {
        if (document == null || document.isBlank()) {
            return null;
        }
        String digits = document.replaceAll("\\D", "");
        return digits.isBlank() ? null : digits;
    }
}
