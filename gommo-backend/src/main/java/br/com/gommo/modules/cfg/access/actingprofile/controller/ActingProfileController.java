package br.com.gommo.modules.cfg.access.actingprofile.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

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

import br.com.gommo.modules.cfg.access.actingprofile.dto.ActingProfileRequestDto;
import br.com.gommo.modules.cfg.access.actingprofile.dto.ActingProfileResponseDto;
import br.com.gommo.modules.cfg.access.actingprofile.service.IActingProfileService;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

@RestController
@RequestMapping("/api/v1/acting-profiles")
public class ActingProfileController {

    private final IActingProfileService actingProfileService;

    public ActingProfileController(IActingProfileService actingProfileService) {
        this.actingProfileService = actingProfileService;
    }

    @GetMapping
    public ResponseEntity<List<ActingProfileResponseDto>> findAll(
            @RequestParam(required = false) SystemScopeEnum system,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(actingProfileService.findAll(system, includeInactive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActingProfileResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(actingProfileService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ActingProfileResponseDto> create(@Valid @RequestBody ActingProfileRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(actingProfileService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActingProfileResponseDto> update(
            @PathVariable UUID id, @Valid @RequestBody ActingProfileRequestDto request) {
        return ResponseEntity.ok(actingProfileService.update(id, request));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable UUID id) {
        actingProfileService.activate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        actingProfileService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        actingProfileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
