package br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.service.IProficiencyLevelService;

@RestController
@RequestMapping("/api/v1/development/proficiency-levels")
public class ProficiencyLevelController
        extends BaseController<ProficiencyLevelRequestDto, ProficiencyLevelResponseDto> {

    public ProficiencyLevelController(IProficiencyLevelService service) {
        super(service);
    }
}
