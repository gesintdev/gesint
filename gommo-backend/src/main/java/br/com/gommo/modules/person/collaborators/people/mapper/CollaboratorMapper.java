package br.com.gommo.modules.person.collaborators.people.mapper;

import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import org.springframework.stereotype.Component;

@Component
public class CollaboratorMapper {

    public Collaborator toEntity(CollaboratorRequestDto dto) {
        return Collaborator.builder()
                .fullName(dto.getFullName())
                .socialName(dto.getSocialName())
                .cpf(dto.getCpf())
                .rg(dto.getRg())
                .rgIssuer(dto.getRgIssuer())
                .rgStateCode(dto.getRgStateCode())
                .birthDate(dto.getBirthDate())
                .gender(dto.getGender())
                .maritalStatus(dto.getMaritalStatus())
                .motherName(dto.getMotherName())
                .fatherName(dto.getFatherName())
                .nationality(dto.getNationality() != null ? dto.getNationality() : "Brasileiro")
                .pisPasep(dto.getPisPasep())
                .photoObjectId(dto.getPhotoObjectId())
                .build();
    }

    public void updateEntity(Collaborator entity, CollaboratorRequestDto dto) {
        entity.setFullName(dto.getFullName());
        entity.setSocialName(dto.getSocialName());
        entity.setCpf(dto.getCpf());
        entity.setRg(dto.getRg());
        entity.setRgIssuer(dto.getRgIssuer());
        entity.setRgStateCode(dto.getRgStateCode());
        entity.setBirthDate(dto.getBirthDate());
        entity.setGender(dto.getGender());
        entity.setMaritalStatus(dto.getMaritalStatus());
        entity.setMotherName(dto.getMotherName());
        entity.setFatherName(dto.getFatherName());
        if (dto.getNationality() != null) {
            entity.setNationality(dto.getNationality());
        }
        entity.setPisPasep(dto.getPisPasep());
        entity.setPhotoObjectId(dto.getPhotoObjectId());
    }

    public CollaboratorResponseDto toResponse(Collaborator entity) {
        return toResponse(entity, null, null);
    }

    public CollaboratorResponseDto toResponse(Collaborator entity, String email, String phone) {
        return CollaboratorResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .fullName(entity.getFullName())
                .socialName(entity.getSocialName())
                .cpf(entity.getCpf())
                .rg(entity.getRg())
                .rgIssuer(entity.getRgIssuer())
                .rgStateCode(entity.getRgStateCode())
                .birthDate(entity.getBirthDate())
                .gender(entity.getGender())
                .maritalStatus(entity.getMaritalStatus())
                .motherName(entity.getMotherName())
                .fatherName(entity.getFatherName())
                .nationality(entity.getNationality())
                .pisPasep(entity.getPisPasep())
                .email(email)
                .phone(phone)
                .photoObjectId(entity.getPhotoObjectId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
