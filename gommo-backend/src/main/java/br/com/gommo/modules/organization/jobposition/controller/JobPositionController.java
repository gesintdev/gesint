package br.com.gommo.modules.organization.jobposition.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.organization.jobposition.service.IJobPositionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/job-positions")
public class JobPositionController extends BaseController<JobPositionRequestDto, JobPositionResponseDto> {

    public JobPositionController(IJobPositionService service) {
        super(service);
    }
}
