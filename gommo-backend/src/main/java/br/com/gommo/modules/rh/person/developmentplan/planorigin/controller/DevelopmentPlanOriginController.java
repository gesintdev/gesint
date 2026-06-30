package br.com.gommo.modules.rh.person.developmentplan.planorigin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.service.IDevelopmentPlanOriginService;

@RestController
@RequestMapping("/api/v1/development/plan-origins")
public class DevelopmentPlanOriginController
        extends BaseController<DevelopmentPlanOriginRequestDto, DevelopmentPlanOriginResponseDto> {

    public DevelopmentPlanOriginController(IDevelopmentPlanOriginService service) {
        super(service);
    }
}
