package br.com.gommo.modules.cfg.settings.agenda.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventRequestDto;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventResponseDto;

public interface IAgendaEventService {

    List<AgendaEventResponseDto> listInRange(OffsetDateTime from, OffsetDateTime to);

    AgendaEventResponseDto create(AgendaEventRequestDto request);

    AgendaEventResponseDto update(UUID id, AgendaEventRequestDto request);

    void delete(UUID id);
}
