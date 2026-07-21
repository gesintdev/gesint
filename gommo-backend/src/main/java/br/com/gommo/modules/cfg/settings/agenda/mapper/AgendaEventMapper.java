package br.com.gommo.modules.cfg.settings.agenda.mapper;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventRequestDto;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventResponseDto;
import br.com.gommo.modules.cfg.settings.agenda.entity.AgendaEvent;

@Component
public class AgendaEventMapper {

    public AgendaEvent toEntity(AgendaEventRequestDto dto) {
        return AgendaEvent.builder()
                .title(dto.getTitle().trim())
                .startsAt(dto.getStartsAt())
                .endsAt(dto.getEndsAt())
                .location(blankToNull(dto.getLocation()))
                .description(blankToNull(dto.getDescription()))
                .build();
    }

    public void updateEntity(AgendaEvent entity, AgendaEventRequestDto dto) {
        entity.setTitle(dto.getTitle().trim());
        entity.setStartsAt(dto.getStartsAt());
        entity.setEndsAt(dto.getEndsAt());
        entity.setLocation(blankToNull(dto.getLocation()));
        entity.setDescription(blankToNull(dto.getDescription()));
    }

    public AgendaEventResponseDto toResponse(AgendaEvent entity) {
        return AgendaEventResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .ownerUserId(entity.getOwnerUserId())
                .title(entity.getTitle())
                .startsAt(entity.getStartsAt())
                .endsAt(entity.getEndsAt())
                .location(entity.getLocation())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
