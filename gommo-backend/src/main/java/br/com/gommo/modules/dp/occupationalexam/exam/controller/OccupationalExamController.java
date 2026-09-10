package br.com.gommo.modules.dp.occupationalexam.exam.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.occupationalexam.exam.dto.OccupationalExamIndicatorsResponseDto;
import br.com.gommo.modules.dp.occupationalexam.exam.dto.OccupationalExamRegisterResultRequestDto;
import br.com.gommo.modules.dp.occupationalexam.exam.dto.OccupationalExamRequestDto;
import br.com.gommo.modules.dp.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gommo.modules.dp.occupationalexam.exam.dto.OccupationalExamScheduleRequestDto;
import br.com.gommo.modules.dp.occupationalexam.exam.service.IOccupationalExamService;

@RestController
@RequestMapping("/api/v1/occupational-exams")
public class OccupationalExamController
        extends BaseController<OccupationalExamRequestDto, OccupationalExamResponseDto> {

    private final IOccupationalExamService occupationalExamService;

    public OccupationalExamController(IOccupationalExamService service) {
        super(service);
        this.occupationalExamService = service;
    }

    @GetMapping("/indicators")
    public OccupationalExamIndicatorsResponseDto indicators() {
        return occupationalExamService.indicators();
    }

    @GetMapping("/due")
    public List<OccupationalExamResponseDto> due(@RequestParam(defaultValue = "30") int days) {
        return occupationalExamService.findDue(days);
    }

    @GetMapping("/overdue")
    public List<OccupationalExamResponseDto> overdue() {
        return occupationalExamService.findOverdue();
    }

    @PostMapping("/mark-overdue")
    public int markOverdue() {
        return occupationalExamService.markOverdueInadimplente();
    }

    @GetMapping("/by-collaborator/{collaboratorId}")
    public List<OccupationalExamResponseDto> byCollaborator(@PathVariable UUID collaboratorId) {
        return occupationalExamService.findByCollaboratorId(collaboratorId);
    }

    @PostMapping("/{id}/schedule")
    public OccupationalExamResponseDto schedule(
            @PathVariable UUID id, @Valid @RequestBody OccupationalExamScheduleRequestDto request) {
        return occupationalExamService.schedule(id, request);
    }

    @PostMapping("/{id}/register-result")
    public OccupationalExamResponseDto registerResult(
            @PathVariable UUID id, @Valid @RequestBody OccupationalExamRegisterResultRequestDto request) {
        return occupationalExamService.registerResult(id, request);
    }
}
