package br.com.gommo.modules.rh.person.developmentplan.competency.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.service.ICompetencyService;

@RestController
@RequestMapping("/api/v1/development/competencies")
public class CompetencyController extends BaseController<CompetencyRequestDto, CompetencyResponseDto> {

    public CompetencyController(ICompetencyService service) {
        super(service);
    }
}
