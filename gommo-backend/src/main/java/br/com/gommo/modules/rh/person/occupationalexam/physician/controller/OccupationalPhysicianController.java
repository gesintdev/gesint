package br.com.gommo.modules.rh.person.occupationalexam.physician.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.service.IOccupationalPhysicianService;

@RestController
@RequestMapping("/api/v1/occupational-physicians")
public class OccupationalPhysicianController
        extends BaseController<OccupationalPhysicianRequestDto, OccupationalPhysicianResponseDto> {

    public OccupationalPhysicianController(IOccupationalPhysicianService service) {
        super(service);
    }
}
