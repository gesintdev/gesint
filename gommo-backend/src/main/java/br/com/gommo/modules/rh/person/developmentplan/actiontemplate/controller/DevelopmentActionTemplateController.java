package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.service.IDevelopmentActionTemplateService;

@RestController
@RequestMapping("/api/v1/development/action-templates")
public class DevelopmentActionTemplateController
        extends BaseController<DevelopmentActionTemplateRequestDto, DevelopmentActionTemplateResponseDto> {

    public DevelopmentActionTemplateController(IDevelopmentActionTemplateService service) {
        super(service);
    }
}
