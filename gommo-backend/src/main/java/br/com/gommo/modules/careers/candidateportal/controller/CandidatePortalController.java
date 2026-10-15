package br.com.gommo.modules.careers.candidateportal.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalApplicationSummaryDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalConsentUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalMeResponseDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalOfferDecisionRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalOfferDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalPreAdmissionViewDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalProfileUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.service.CandidatePortalPreAdmissionService;
import br.com.gommo.modules.careers.candidateportal.service.CandidatePortalService;

@RestController
@RequestMapping("/api/v1/candidate-portal")
public class CandidatePortalController {

    private final CandidatePortalService portalService;
    private final CandidatePortalPreAdmissionService preAdmissionService;

    public CandidatePortalController(
            CandidatePortalService portalService, CandidatePortalPreAdmissionService preAdmissionService) {
        this.portalService = portalService;
        this.preAdmissionService = preAdmissionService;
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

    @GetMapping("/offers")
    public ResponseEntity<List<CandidatePortalOfferDto>> listOffers() {
        return ResponseEntity.ok(portalService.listPendingOffers());
    }

    @PostMapping("/applications/{id}/offer/accept")
    public ResponseEntity<CandidatePortalOfferDto> acceptOffer(@PathVariable UUID id) {
        return ResponseEntity.ok(portalService.acceptOffer(id));
    }

    @PostMapping("/applications/{id}/offer/decline")
    public ResponseEntity<CandidatePortalOfferDto> declineOffer(
            @PathVariable UUID id, @RequestBody(required = false) CandidatePortalOfferDecisionRequestDto request) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(portalService.declineOffer(id, reason));
    }

    @GetMapping("/pre-admission")
    public ResponseEntity<CandidatePortalPreAdmissionViewDto> getPreAdmission(
            @RequestParam(required = false) String token) {
        return ResponseEntity.ok(preAdmissionService.getMyPreAdmission(token));
    }

    @PutMapping("/pre-admission")
    public ResponseEntity<CandidatePortalPreAdmissionViewDto> updatePreAdmission(
            @RequestParam(required = false) String token,
            @Valid @RequestBody CandidatePortalPreAdmissionUpdateRequestDto request) {
        return ResponseEntity.ok(preAdmissionService.updateMyPreAdmission(token, request));
    }

    @PostMapping(value = "/pre-admission/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CandidatePortalPreAdmissionViewDto> uploadPreAdmissionDocument(
            @RequestParam(required = false) String token,
            @RequestParam String documentType,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(preAdmissionService.uploadDocument(token, file, documentType));
    }

    @PostMapping("/pre-admission/complete")
    public ResponseEntity<CandidatePortalPreAdmissionViewDto> completePreAdmission(
            @RequestParam(required = false) String token) {
        return ResponseEntity.ok(preAdmissionService.complete(token));
    }
}
