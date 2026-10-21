package br.com.gesint.modules.rh.person.experience.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceDecideRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationResponseDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceScoresUpsertRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceSummaryDto;
import br.com.gesint.modules.rh.person.experience.service.IExperienceEvaluationService;

@RestController
@RequestMapping("/api/v1/experience-evaluations")
public class ExperienceEvaluationController
        extends BaseController<ExperienceEvaluationRequestDto, ExperienceEvaluationResponseDto> {

    private final IExperienceEvaluationService service;

    public ExperienceEvaluationController(IExperienceEvaluationService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/summary")
    public ExperienceSummaryDto summary() {
        return service.summary();
    }

    @GetMapping("/queue")
    public List<ExperienceEvaluationResponseDto> queue(
            @RequestParam(name = "bucket", defaultValue = "open") String bucket) {
        return service.listByBucket(bucket);
    }

    @PutMapping("/{id}/scores")
    public ExperienceEvaluationResponseDto saveDraft(
            @PathVariable UUID id, @Valid @RequestBody ExperienceScoresUpsertRequestDto request) {
        return service.saveDraft(id, request);
    }

    @PostMapping("/{id}/scores/submit")
    public ExperienceEvaluationResponseDto submit(
            @PathVariable UUID id, @Valid @RequestBody ExperienceScoresUpsertRequestDto request) {
        return service.submit(id, request);
    }

    @PostMapping("/{id}/decide")
    public ExperienceEvaluationResponseDto decide(
            @PathVariable UUID id, @Valid @RequestBody ExperienceDecideRequestDto request) {
        return service.decide(id, request);
    }
}
