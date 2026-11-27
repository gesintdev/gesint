package br.com.gesint.modules.gp.notification.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.notification.service.AttendanceHealthService;

@RestController
@RequestMapping("/api/v1/time-management/health")
public class AttendanceHealthController {

    private final AttendanceHealthService service;

    public AttendanceHealthController(AttendanceHealthService service) {
        this.service = service;
    }

    /** Envia agora os avisos de saude do ponto do dia informado (padrao: ontem). */
    @PostMapping("/run")
    public Map<String, Integer> run(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Map.of("notified", service.runNow(date));
    }
}
