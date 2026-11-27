package br.com.gesint.modules.gp.timesheet.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.timesheet.dto.TimesheetActionRequestDto;
import br.com.gesint.modules.gp.timesheet.dto.TimesheetResponseDto;
import br.com.gesint.modules.gp.timesheet.service.ITimesheetService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/timesheets")
public class TimesheetController {

    private final ITimesheetService service;

    public TimesheetController(ITimesheetService service) {
        this.service = service;
    }

    @GetMapping
    public TimesheetResponseDto list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.list(from, to);
    }

    @GetMapping("/collaborators/{collaboratorId}")
    public TimesheetResponseDto.Detail detail(
            @PathVariable UUID collaboratorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.detail(collaboratorId, from, to);
    }

    @PostMapping("/close")
    public TimesheetResponseDto.CloseResult close(@Valid @RequestBody TimesheetActionRequestDto request) {
        return service.close(request);
    }

    @PostMapping("/collaborators/{collaboratorId}/reopen")
    public TimesheetResponseDto.Detail reopen(
            @PathVariable UUID collaboratorId, @Valid @RequestBody TimesheetActionRequestDto request) {
        return service.reopen(collaboratorId, request);
    }

    @GetMapping(value = "/collaborators/{collaboratorId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf(
            @PathVariable UUID collaboratorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] content = service.pdf(collaboratorId, from, to);
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(service.filename(collaboratorId, from, to), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(content.length)
                .body(content);
    }
}
