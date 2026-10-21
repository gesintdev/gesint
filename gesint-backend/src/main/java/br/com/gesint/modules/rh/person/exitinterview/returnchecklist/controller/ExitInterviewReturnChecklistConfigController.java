package br.com.gesint.modules.rh.person.exitinterview.returnchecklist.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigRequestDto;
import br.com.gesint.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigResponseDto;
import br.com.gesint.modules.rh.person.exitinterview.returnchecklist.service.IExitInterviewReturnChecklistConfigService;

@RestController
@RequestMapping("/api/v1/exit-interview-return-checklist-items")
public class ExitInterviewReturnChecklistConfigController
        extends BaseController<
                ExitInterviewReturnChecklistConfigRequestDto, ExitInterviewReturnChecklistConfigResponseDto> {

    public ExitInterviewReturnChecklistConfigController(IExitInterviewReturnChecklistConfigService service) {
        super(service);
    }
}
