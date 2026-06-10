package br.com.gommo.modules.person.exitinterview.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.person.exitinterview.dto.ExitInterviewResponseDto;
import br.com.gommo.modules.person.exitinterview.service.IExitInterviewService;

@RestController
@RequestMapping("/api/v1/exit-interviews")
public class ExitInterviewController extends BaseController<ExitInterviewRequestDto, ExitInterviewResponseDto> {
    public ExitInterviewController(IExitInterviewService service) {
        super(service);
    }
}
