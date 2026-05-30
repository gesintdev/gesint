package br.com.gommo.modules.person.offboarding.mapper;
import br.com.gommo.modules.person.offboarding.dto.*; import br.com.gommo.modules.person.offboarding.entity.Offboarding; import br.com.gommo.modules.person.offboarding.entity.DismissalTypeEnum;
import org.springframework.stereotype.Component;
@Component public class OffboardingMapper {
    public Offboarding toEntity(OffboardingRequestDto dto) {
        return Offboarding.builder().collaboratorId(dto.getCollaboratorId()).dismissalDate(dto.getDismissalDate())
            .dismissalType(dto.getDismissalType() != null ? dto.getDismissalType() : DismissalTypeEnum.WITHOUT_CAUSE)
            .dismissalNotes(dto.getDismissalNotes()).homologationNotes(dto.getHomologationNotes()).build();
    }
    public void updateEntity(Offboarding entity, OffboardingRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setDismissalDate(dto.getDismissalDate());
        if (dto.getDismissalType() != null) entity.setDismissalType(dto.getDismissalType());
        entity.setDismissalNotes(dto.getDismissalNotes()); entity.setHomologationNotes(dto.getHomologationNotes());
    }
    public OffboardingResponseDto toResponse(Offboarding entity) {
        return OffboardingResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).dismissalDate(entity.getDismissalDate()).dismissalType(entity.getDismissalType())
            .dismissalNotes(entity.getDismissalNotes()).homologationNotes(entity.getHomologationNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
