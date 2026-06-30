package br.com.gommo.modules.rh.person.developmentplan.evidencetype.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.service.IEvidenceTypeService;

@RestController
@RequestMapping("/api/v1/development/evidence-types")
public class EvidenceTypeController extends BaseController<EvidenceTypeRequestDto, EvidenceTypeResponseDto> {

    public EvidenceTypeController(IEvidenceTypeService service) {
        super(service);
    }
}
