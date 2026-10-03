package br.com.gommo.modules.rh.person.jobvacancyapplication.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectionReasonDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHirePreviewDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHireRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHireResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScorecardResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScorecardUpsertRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.service.InterviewScorecardService;
import br.com.gommo.modules.rh.person.jobvacancyapplication.service.IJobVacancyApplicationService;
import br.com.gommo.modules.rh.person.jobvacancyapplication.service.JobVacancyApplicationHireService;

@RestController
@RequestMapping("/api/v1/job-vacancy-applications")
public class JobVacancyApplicationController
        extends BaseController<JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto> {
    private final IJobVacancyApplicationService applicationService;
    private final InterviewScorecardService interviewScorecardService;
    private final JobVacancyApplicationHireService hireService;

    public JobVacancyApplicationController(
            IJobVacancyApplicationService service,
            InterviewScorecardService interviewScorecardService,
            JobVacancyApplicationHireService hireService) {
        super(service);
        this.applicationService = service;
        this.interviewScorecardService = interviewScorecardService;
        this.hireService = hireService;
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

    @PostMapping("/{id}/reanalyze")
    public ResponseEntity<JobVacancyApplicationResponseDto> reanalyze(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.reanalyze(id));
    }

    @GetMapping("/rejection-reasons")
    public ResponseEntity<List<JobVacancyApplicationRejectionReasonDto>> listRejectionReasons() {
        return ResponseEntity.ok(applicationService.listRejectionReasons());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<JobVacancyApplicationResponseDto> reject(
            @PathVariable UUID id, @Valid @RequestBody JobVacancyApplicationRejectRequestDto request) {
        return ResponseEntity.ok(applicationService.reject(id, request));
    }

    @GetMapping("/{id}/interview-scorecard")
    public ResponseEntity<InterviewScorecardResponseDto> getInterviewScorecard(
            @PathVariable UUID id, @RequestParam String columnKey) {
        return ResponseEntity.ok(interviewScorecardService.getScorecard(id, columnKey));
    }

    @PutMapping("/{id}/interview-scorecard")
    public ResponseEntity<InterviewScorecardResponseDto> saveInterviewScorecardDraft(
            @PathVariable UUID id, @Valid @RequestBody InterviewScorecardUpsertRequestDto request) {
        return ResponseEntity.ok(interviewScorecardService.saveDraft(id, request));
    }

    @PostMapping("/{id}/interview-scorecard/submit")
    public ResponseEntity<InterviewScorecardResponseDto> submitInterviewScorecard(
            @PathVariable UUID id, @Valid @RequestBody InterviewScorecardUpsertRequestDto request) {
        return ResponseEntity.ok(interviewScorecardService.submit(id, request));
    }

    @GetMapping("/{id}/hire-preview")
    public ResponseEntity<JobVacancyApplicationHirePreviewDto> hirePreview(@PathVariable UUID id) {
        return ResponseEntity.ok(hireService.preview(id));
    }

    @PostMapping("/{id}/hire")
    public ResponseEntity<JobVacancyApplicationHireResponseDto> hire(
            @PathVariable UUID id, @Valid @RequestBody JobVacancyApplicationHireRequestDto request) {
        return ResponseEntity.ok(hireService.hire(id, request));
    }
}
