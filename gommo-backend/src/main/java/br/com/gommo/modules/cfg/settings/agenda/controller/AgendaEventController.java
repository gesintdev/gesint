package br.com.gommo.modules.cfg.settings.agenda.controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventRequestDto;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventResponseDto;
import br.com.gommo.modules.cfg.settings.agenda.service.IAgendaEventService;

@RestController
@RequestMapping("/api/v1/agenda-events")
public class AgendaEventController {

    private final IAgendaEventService service;

    public AgendaEventController(IAgendaEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<AgendaEventResponseDto> listInRange(
            @RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to) {
        return service.listInRange(from, to);
    }

    @PostMapping
    public ResponseEntity<AgendaEventResponseDto> create(@Valid @RequestBody AgendaEventRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public AgendaEventResponseDto update(@PathVariable UUID id, @Valid @RequestBody AgendaEventRequestDto request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
