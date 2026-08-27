package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineRowDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto.AdmissionPipelineSummaryDto;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.service.IAdmissionPipelineService;

/**
 * Somente leitura. O RBAC vive no service, como nos demais modulos.
 *
 * <p>O segmento literal {@code /pipeline} tem precedencia sobre o {@code /{id}} do BaseController de
 * admissoes, entao os dois convivem sob o mesmo prefixo.
 */
@RestController
@RequestMapping("/api/v1/admissions/pipeline")
public class AdmissionPipelineController {

    private final IAdmissionPipelineService service;

    public AdmissionPipelineController(IAdmissionPipelineService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<AdmissionPipelineSummaryDto> summary() {
        return ResponseEntity.ok(service.summary());
    }

    @GetMapping("/page")
    public ResponseEntity<PageableResponseDto<AdmissionPipelineRowDto>> page(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.findPage(page, size));
    }
}
