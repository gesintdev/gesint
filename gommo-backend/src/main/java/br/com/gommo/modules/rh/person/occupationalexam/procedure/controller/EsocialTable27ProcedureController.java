package br.com.gommo.modules.rh.person.occupationalexam.procedure.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.occupationalexam.procedure.dto.EsocialTable27ProcedureRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.procedure.dto.EsocialTable27ProcedureResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.procedure.service.IEsocialTable27ProcedureService;

@RestController
@RequestMapping("/api/v1/esocial-table27-procedures")
public class EsocialTable27ProcedureController
        extends BaseController<EsocialTable27ProcedureRequestDto, EsocialTable27ProcedureResponseDto> {

    public EsocialTable27ProcedureController(IEsocialTable27ProcedureService service) {
        super(service);
    }
}
