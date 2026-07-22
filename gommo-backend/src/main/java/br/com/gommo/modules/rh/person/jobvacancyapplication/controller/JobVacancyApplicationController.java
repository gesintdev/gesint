package br.com.gommo.modules.rh.person.jobvacancyapplication.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.service.IJobVacancyApplicationService;

@RestController
@RequestMapping("/api/v1/job-vacancy-applications")
public class JobVacancyApplicationController
        extends BaseController<JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto> {
    private final IJobVacancyApplicationService applicationService;

    public JobVacancyApplicationController(IJobVacancyApplicationService service) {
        super(service);
        this.applicationService = service;
    }

    @GetMapping("/by-vacancy/{jobVacancyId}")
    public ResponseEntity<List<JobVacancyApplicationResponseDto>> findByJobVacancyId(
            @PathVariable UUID jobVacancyId) {
        return ResponseEntity.ok(applicationService.findByJobVacancyId(jobVacancyId));
    }

    @PostMapping("/by-vacancy/{jobVacancyId}/start-admission-process")
    public ResponseEntity<List<JobVacancyApplicationResponseDto>> startAdmissionProcess(
            @PathVariable UUID jobVacancyId) {
        return ResponseEntity.ok(applicationService.startAdmissionProcess(jobVacancyId));
    }

    @PatchMapping("/{id}/kanban-column")
    public ResponseEntity<JobVacancyApplicationResponseDto> updateKanbanColumn(
            @PathVariable UUID id, @Valid @RequestBody JobVacancyApplicationKanbanColumnRequestDto request) {
        return ResponseEntity.ok(applicationService.updateKanbanColumn(id, request));
    }

    @PatchMapping("/{id}/stage-comments")
    public ResponseEntity<JobVacancyApplicationResponseDto> upsertStageComment(
            @PathVariable UUID id, @Valid @RequestBody JobVacancyApplicationStageCommentRequestDto request) {
        return ResponseEntity.ok(applicationService.upsertStageComment(id, request));
    }
}
