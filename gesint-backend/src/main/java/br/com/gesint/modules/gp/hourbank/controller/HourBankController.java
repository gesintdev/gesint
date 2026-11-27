package br.com.gesint.modules.gp.hourbank.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.hourbank.dto.HourBankResponseDto;
import br.com.gesint.modules.gp.hourbank.service.IHourBankService;

@RestController
@RequestMapping("/api/v1/hour-bank")
public class HourBankController {

    private final IHourBankService service;

    public HourBankController(IHourBankService service) {
        this.service = service;
    }

    @GetMapping
    public HourBankResponseDto balances(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.balances(from, to);
    }

    @GetMapping("/collaborators/{collaboratorId}")
    public HourBankResponseDto.Statement statement(
            @PathVariable UUID collaboratorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.statement(collaboratorId, from, to);
    }
}
