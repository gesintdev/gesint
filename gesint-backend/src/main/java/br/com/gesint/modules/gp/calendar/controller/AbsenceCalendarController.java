package br.com.gesint.modules.gp.calendar.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.calendar.dto.AbsenceCalendarResponseDto;
import br.com.gesint.modules.gp.calendar.service.IAbsenceCalendarService;

@RestController
@RequestMapping("/api/v1/time-management/calendar")
public class AbsenceCalendarController {

    private final IAbsenceCalendarService service;

    public AbsenceCalendarController(IAbsenceCalendarService service) {
        this.service = service;
    }

    @GetMapping
    public AbsenceCalendarResponseDto calendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.calendar(from, to);
    }
}
