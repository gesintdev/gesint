package br.com.gommo.modules.access.profile.controller;

import br.com.gommo.modules.access.entity.SystemScopeEnum;
import br.com.gommo.modules.access.profile.dto.ProfileRequestDto;
import br.com.gommo.modules.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.access.profile.service.IProfileService;
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

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final IProfileService profileService;

    public ProfileController(IProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<List<ProfileResponseDto>> findAll(@RequestParam(required = false) SystemScopeEnum system) {
        return ResponseEntity.ok(profileService.findAll(system));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(profileService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProfileResponseDto> create(@Valid @RequestBody ProfileRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileResponseDto> update(
            @PathVariable UUID id, @Valid @RequestBody ProfileRequestDto request) {
        return ResponseEntity.ok(profileService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        profileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
