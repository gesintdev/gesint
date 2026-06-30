package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.service.IDevelopmentTrackService;

@RestController
@RequestMapping("/api/v1/development/tracks")
public class DevelopmentTrackController
        extends BaseController<DevelopmentTrackRequestDto, DevelopmentTrackResponseDto> {

    public DevelopmentTrackController(IDevelopmentTrackService service) {
        super(service);
    }
}
