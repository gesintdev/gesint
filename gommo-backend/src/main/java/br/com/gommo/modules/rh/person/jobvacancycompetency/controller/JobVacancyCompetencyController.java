package br.com.gommo.modules.rh.person.jobvacancycompetency.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.service.IJobVacancyCompetencyService;

@RestController
@RequestMapping("/api/v1/job-vacancy-competencies")
public class JobVacancyCompetencyController
        extends BaseController<JobVacancyCompetencyRequestDto, JobVacancyCompetencyResponseDto> {

    private final IJobVacancyCompetencyService competencyService;

    public JobVacancyCompetencyController(IJobVacancyCompetencyService service) {
        super(service);
        this.competencyService = service;
    }

    @GetMapping("/by-job-vacancy/{jobVacancyId}")
    public List<JobVacancyCompetencyResponseDto> byJobVacancy(@PathVariable UUID jobVacancyId) {
        return competencyService.findByJobVacancyId(jobVacancyId);
    }
}
