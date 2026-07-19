package br.com.gommo.modules.rh.person.jobvacancy.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.service.IJobVacancyService;

@RestController
@RequestMapping("/api/v1/job-vacancies")
public class JobVacancyController extends BaseController<JobVacancyRequestDto, JobVacancyResponseDto> {
    public JobVacancyController(IJobVacancyService service) {
        super(service);
    }
}
