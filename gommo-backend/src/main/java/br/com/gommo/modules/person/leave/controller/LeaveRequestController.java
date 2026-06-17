package br.com.gommo.modules.person.leave.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.dto.VacationAbsenceSummaryDto;
import br.com.gommo.modules.person.leave.dto.VacationReviewRequestDto;
import br.com.gommo.modules.person.leave.service.ILeaveRequestService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/leave-requests")
public class LeaveRequestController extends BaseController<LeaveRequestRequestDto, LeaveRequestResponseDto> {

    private final ILeaveRequestService leaveRequestService;

    public LeaveRequestController(ILeaveRequestService service) {
        super(service);
        this.leaveRequestService = service;
    }

    @GetMapping("/vacation/absence-summary")
    public VacationAbsenceSummaryDto absenceSummary(
            @RequestParam UUID collaboratorId,
            @RequestParam LocalDate acquisitionStart,
            @RequestParam LocalDate acquisitionEnd) {
        return leaveRequestService.absenceSummary(collaboratorId, acquisitionStart, acquisitionEnd);
    }

    @PostMapping("/{id}/vacation-review")
    public LeaveRequestResponseDto reviewVacation(
            @PathVariable UUID id, @Valid @RequestBody VacationReviewRequestDto request) {
        return leaveRequestService.reviewVacation(id, request);
    }
}
