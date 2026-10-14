package br.com.gommo.modules.careers.candidateportal.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalApplicationSummaryDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalConsentUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalMeResponseDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalProfileUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.service.CandidatePortalService;

@RestController
@RequestMapping("/api/v1/candidate-portal")
public class CandidatePortalController {

    private final CandidatePortalService portalService;

    public CandidatePortalController(CandidatePortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/me")
    public ResponseEntity<CandidatePortalMeResponseDto> me() {
        return ResponseEntity.ok(portalService.me());
    }

    @PutMapping("/me")
    public ResponseEntity<CandidatePortalMeResponseDto> updateProfile(
            @Valid @RequestBody CandidatePortalProfileUpdateRequestDto request) {
        return ResponseEntity.ok(portalService.updateProfile(request));
    }

    @PutMapping("/me/consents")
    public ResponseEntity<CandidatePortalMeResponseDto> updateConsents(
            @Valid @RequestBody CandidatePortalConsentUpdateRequestDto request) {
        return ResponseEntity.ok(portalService.updateConsents(request));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<CandidatePortalApplicationSummaryDto>> listApplications() {
        return ResponseEntity.ok(portalService.listApplications());
    }

    @GetMapping("/applications/by-vacancy/{slug}")
    public ResponseEntity<CandidatePortalApplicationSummaryDto> byVacancySlug(@PathVariable String slug) {
        return ResponseEntity.ok(portalService.findByVacancySlug(slug));
    }

    @PostMapping("/applications/{id}/withdraw")
    public ResponseEntity<CandidatePortalApplicationSummaryDto> withdraw(@PathVariable UUID id) {
        return ResponseEntity.ok(portalService.withdraw(id));
    }
}
