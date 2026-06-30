package br.com.gommo.modules.rh.person.developmentplan.controller;

import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.dto.*;
import br.com.gommo.modules.rh.person.developmentplan.service.IDevelopmentPlanService;

@RestController
@RequestMapping("/api/v1/development-plans")
public class DevelopmentPlanController extends BaseController<DevelopmentPlanRequestDto, DevelopmentPlanResponseDto> {

    private final IDevelopmentPlanService service;

    public DevelopmentPlanController(IDevelopmentPlanService service) {
        super(service);
        this.service = service;
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/submit-for-approval")
    public ResponseEntity<DevelopmentPlanResponseDto> submitForApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submitForApproval(id));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/approve")
    public ResponseEntity<DevelopmentPlanResponseDto> approve(
            @PathVariable UUID id, @RequestBody(required = false) DevelopmentPlanApprovalRequestDto request) {
        return ResponseEntity.ok(service.approve(id, request));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/conclude")
    public ResponseEntity<DevelopmentPlanResponseDto> conclude(@PathVariable UUID id) {
        return ResponseEntity.ok(service.conclude(id));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/cancel")
    public ResponseEntity<DevelopmentPlanResponseDto> cancel(
            @PathVariable UUID id, @Valid @RequestBody DevelopmentPlanCancelRequestDto request) {
        return ResponseEntity.ok(service.cancel(id, request));
    }
}