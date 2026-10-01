package br.com.gommo.modules.rh.person.jobrequisition.controller;

import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionRejectRequestDto;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionRequestDto;
import br.com.gommo.modules.rh.person.jobrequisition.dto.JobRequisitionResponseDto;
import br.com.gommo.modules.rh.person.jobrequisition.service.IJobRequisitionService;

@RestController
@RequestMapping("/api/v1/job-requisitions")
public class JobRequisitionController extends BaseController<JobRequisitionRequestDto, JobRequisitionResponseDto> {

    private final IJobRequisitionService service;

    public JobRequisitionController(IJobRequisitionService service) {
        super(service);
        this.service = service;
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/submit-for-approval")
    public ResponseEntity<JobRequisitionResponseDto> submitForApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submitForApproval(id));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/approve")
    public ResponseEntity<JobRequisitionResponseDto> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/reject")
    public ResponseEntity<JobRequisitionResponseDto> reject(
            @PathVariable UUID id, @Valid @RequestBody JobRequisitionRejectRequestDto request) {
        return ResponseEntity.ok(service.reject(id, request));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/cancel")
    public ResponseEntity<JobRequisitionResponseDto> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancel(id));
    }
}
