package br.com.gommo.modules.dp.organization.jobposition.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.dp.organization.jobposition.service.IJobPositionService;

@RestController
@RequestMapping("/api/v1/job-positions")
public class JobPositionController extends BaseController<JobPositionRequestDto, JobPositionResponseDto> {

    private final IJobPositionService jobPositionService;

    public JobPositionController(IJobPositionService service) {
        super(service);
        this.jobPositionService = service;
    }

    @GetMapping("/search")
    public ResponseEntity<PageableResponseDto<JobPositionResponseDto>> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String cboCode,
            @RequestParam(required = false) UUID departmentId) {
        return ResponseEntity.ok(jobPositionService.search(page, size, title, cboCode, departmentId));
    }
}
