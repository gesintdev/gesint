package br.com.gommo.modules.dp.offboarding.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.offboarding.dto.EsocialDismissalReasonDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingAccountantPackageDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingDemissionalPreviewDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.service.IOffboardingService;

@RestController
@RequestMapping("/api/v1/offboardings")
public class OffboardingController extends BaseController<OffboardingRequestDto, OffboardingResponseDto> {

    private final IOffboardingService offboardingService;

    public OffboardingController(IOffboardingService service) {
        super(service);
        this.offboardingService = service;
    }

    @GetMapping("/esocial-dismissal-reasons")
    public ResponseEntity<List<EsocialDismissalReasonDto>> esocialDismissalReasons() {
        return ResponseEntity.ok(offboardingService.listEsocialDismissalReasons());
    }

    @GetMapping("/{id}/demissional-preview")
    public ResponseEntity<OffboardingDemissionalPreviewDto> demissionalPreview(@PathVariable UUID id) {
        return ResponseEntity.ok(offboardingService.demissionalPreview(id));
    }

    @PostMapping("/{id}/demissional-waiver")
    public ResponseEntity<OffboardingResponseDto> registerDemissionalWaiver(
            @PathVariable UUID id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(offboardingService.registerDemissionalWaiver(id, notes));
    }

    @PostMapping("/{id}/conclude")
    public ResponseEntity<OffboardingResponseDto> conclude(@PathVariable UUID id) {
        return ResponseEntity.ok(offboardingService.conclude(id));
    }

    @GetMapping("/{id}/accountant-package")
    public ResponseEntity<OffboardingAccountantPackageDto> accountantPackagePreview(@PathVariable UUID id) {
        return ResponseEntity.ok(offboardingService.accountantPackagePreview(id));
    }

    @PostMapping("/{id}/accountant-package")
    public ResponseEntity<OffboardingAccountantPackageDto> sendAccountantPackage(@PathVariable UUID id) {
        return ResponseEntity.ok(offboardingService.sendAccountantPackage(id));
    }
}
