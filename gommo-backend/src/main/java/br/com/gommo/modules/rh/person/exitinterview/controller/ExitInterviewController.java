package br.com.gommo.modules.rh.person.exitinterview.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewCancelRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewInterviewerDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewResponseDto;
import br.com.gommo.modules.rh.person.exitinterview.service.IExitInterviewService;

@RestController
@RequestMapping("/api/v1/exit-interviews")
public class ExitInterviewController extends BaseController<ExitInterviewRequestDto, ExitInterviewResponseDto> {
    private final IExitInterviewService service;

    public ExitInterviewController(IExitInterviewService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/interviewers")
    public List<ExitInterviewInterviewerDto> listInterviewers() {
        return service.listInterviewers();
    }

    @PostMapping("/{id}/complete")
    public ExitInterviewResponseDto complete(@PathVariable UUID id) {
        return service.complete(id);
    }

    @PostMapping("/{id}/cancel")
    public ExitInterviewResponseDto cancel(
            @PathVariable UUID id, @Valid @RequestBody(required = false) ExitInterviewCancelRequestDto request) {
        return service.cancel(id, request == null ? new ExitInterviewCancelRequestDto() : request);
    }
}
