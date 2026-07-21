package br.com.gommo.modules.dp.organization.workschedule.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleRequestDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleResponseDto;
import br.com.gommo.modules.dp.organization.workschedule.service.IWorkScheduleService;

@RestController
@RequestMapping("/api/v1/work-schedules")
public class WorkScheduleController extends BaseController<WorkScheduleRequestDto, WorkScheduleResponseDto> {

    private final IWorkScheduleService workScheduleService;

    public WorkScheduleController(IWorkScheduleService service) {
        super(service);
        this.workScheduleService = service;
    }

    @GetMapping("/search")
    public ResponseEntity<PageableResponseDto<WorkScheduleResponseDto>> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(workScheduleService.search(page, size, name));
    }

    @GetMapping("/active")
    public ResponseEntity<List<WorkScheduleResponseDto>> listActive() {
        return ResponseEntity.ok(workScheduleService.listActive());
    }
}
