package br.com.gommo.modules.dp.organization.jobpositioncompetency.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyRequestDto;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyResponseDto;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.service.IJobPositionCompetencyService;

@RestController
@RequestMapping("/api/v1/job-position-competencies")
public class JobPositionCompetencyController
        extends BaseController<JobPositionCompetencyRequestDto, JobPositionCompetencyResponseDto> {

    private final IJobPositionCompetencyService competencyService;

    public JobPositionCompetencyController(IJobPositionCompetencyService service) {
        super(service);
        this.competencyService = service;
    }

    @GetMapping("/by-job-position/{jobPositionId}")
    public List<JobPositionCompetencyResponseDto> byJobPosition(@PathVariable UUID jobPositionId) {
        return competencyService.findByJobPositionId(jobPositionId);
    }
}
