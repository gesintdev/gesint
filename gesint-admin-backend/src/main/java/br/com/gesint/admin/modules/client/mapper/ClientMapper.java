package br.com.gesint.admin.modules.client.mapper;

import org.springframework.stereotype.Component;

import br.com.gesint.admin.modules.client.dto.ClientRequestDto;
import br.com.gesint.admin.modules.client.dto.ClientResponseDto;
import br.com.gesint.admin.modules.client.entity.Client;
import br.com.gesint.admin.modules.clientcontact.dto.ClientContactDto;
import br.com.gesint.admin.modules.clientcontact.entity.ClientContact;

import java.util.List;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequestDto dto) {
        return Client.builder()
                .name(dto.getName())
                .legalName(dto.getLegalName())
                .slug(dto.getSlug())
                .document(normalizeDocument(dto.getDocument()))
                .street(trimToNull(dto.getStreet()))
                .number(trimToNull(dto.getNumber()))
                .complement(trimToNull(dto.getComplement()))
                .district(trimToNull(dto.getDistrict()))
                .city(trimToNull(dto.getCity()))
                .stateCode(normalizeStateCode(dto.getStateCode()))
                .zipCode(normalizeZipCode(dto.getZipCode()))
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(Client entity, ClientRequestDto dto) {
        entity.setName(dto.getName());
        entity.setLegalName(dto.getLegalName());
        entity.setSlug(dto.getSlug());
        entity.setDocument(normalizeDocument(dto.getDocument()));
        entity.setStreet(trimToNull(dto.getStreet()));
        entity.setNumber(trimToNull(dto.getNumber()));
        entity.setComplement(trimToNull(dto.getComplement()));
        entity.setDistrict(trimToNull(dto.getDistrict()));
        entity.setCity(trimToNull(dto.getCity()));
        entity.setStateCode(normalizeStateCode(dto.getStateCode()));
        entity.setZipCode(normalizeZipCode(dto.getZipCode()));
        entity.setNotes(dto.getNotes());
    }

    public ClientResponseDto toResponse(Client entity) {
        return toResponse(entity, List.of());
    }

    public ClientResponseDto toResponse(Client entity, List<ClientContact> contacts) {
        return ClientResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .legalName(entity.getLegalName())
                .slug(entity.getSlug())
                .mobileLoginCode(entity.getMobileLoginCode())
                .document(entity.getDocument())
                .street(entity.getStreet())
                .number(entity.getNumber())
                .complement(entity.getComplement())
                .district(entity.getDistrict())
                .city(entity.getCity())
                .stateCode(entity.getStateCode())
                .zipCode(entity.getZipCode())
                .contacts(contacts.stream().map(this::toContactDto).toList())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ClientContactDto toContactDto(ClientContact contact) {
        return ClientContactDto.builder()
                .type(contact.getType())
                .value(contact.getValue())
                .build();
    }

    private String normalizeDocument(String document) {
        if (document == null || document.isBlank()) {
            return null;
        }
        String digits = document.replaceAll("\\D", "");
        return digits.isBlank() ? null : digits;
    }

    private String normalizeZipCode(String zipCode) {
        if (zipCode == null || zipCode.isBlank()) {
            return null;
        }
        String digits = zipCode.replaceAll("\\D", "");
        return digits.isBlank() ? null : digits;
    }

    private String normalizeStateCode(String stateCode) {
        String trimmed = trimToNull(stateCode);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
