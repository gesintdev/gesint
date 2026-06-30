package br.com.gommo.modules.rh.person.developmentplan.evidencetype.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.entity.EvidenceType;

@Component
public class EvidenceTypeMapper {

    public EvidenceType toEntity(EvidenceTypeRequestDto dto) {
        return EvidenceType.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .requiresFile(dto.getRequiresFile() != null && dto.getRequiresFile())
                .allowsLink(dto.getAllowsLink() != null && dto.getAllowsLink())
                .build();
    }

    public void updateEntity(EvidenceType entity, EvidenceTypeRequestDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setRequiresFile(dto.getRequiresFile() != null && dto.getRequiresFile());
        entity.setAllowsLink(dto.getAllowsLink() != null && dto.getAllowsLink());
    }

    public EvidenceTypeResponseDto toResponse(EvidenceType entity) {
        return EvidenceTypeResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .description(entity.getDescription())
                .requiresFile(entity.getRequiresFile())
                .allowsLink(entity.getAllowsLink())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
