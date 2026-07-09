package br.com.gommo.modules.rh.person.attendance.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceClockRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceMobileContextResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceReviewRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSettingsRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSettingsResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSubmissionRequestDto;
import br.com.gommo.modules.rh.person.attendance.service.IAttendanceRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance-records")
public class AttendanceRecordController extends BaseController<AttendanceRecordRequestDto, AttendanceRecordResponseDto> {

    private final IAttendanceRecordService attendanceRecordService;

    public AttendanceRecordController(IAttendanceRecordService service) {
        super(service);
        this.attendanceRecordService = service;
    }

    @GetMapping("/mobile/context")
    public AttendanceMobileContextResponseDto mobileContext() {
        return attendanceRecordService.mobileContext();
    }

    @GetMapping("/mobile/records")
    public List<AttendanceRecordResponseDto> mobileRecords(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to) {
        return attendanceRecordService.mobileRecords(from, to);
    }

    @GetMapping("/mobile/submissions")
    public List<AttendanceRecordResponseDto> mobileSubmissions(
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to) {
        return attendanceRecordService.mobileSubmissions(from, to);
    }

    @PostMapping("/clock")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceRecordResponseDto clock(@Valid @RequestBody AttendanceClockRequestDto request) {
        return attendanceRecordService.clock(request);
    }

    @PostMapping("/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceRecordResponseDto submit(@Valid @RequestBody AttendanceSubmissionRequestDto request) {
        return attendanceRecordService.submit(request);
    }

    @GetMapping("/requests/pending")
    public List<AttendanceRecordResponseDto> pendingRequests() {
        return attendanceRecordService.pendingRequests();
    }

    @PostMapping("/{id}/review")
    public AttendanceRecordResponseDto review(@PathVariable UUID id, @Valid @RequestBody AttendanceReviewRequestDto request) {
        return attendanceRecordService.review(id, request);
    }

    @GetMapping("/settings")
    public AttendanceSettingsResponseDto getSettings() {
        return attendanceRecordService.getSettings();
    }

    @PutMapping("/settings")
    public AttendanceSettingsResponseDto updateSettings(@Valid @RequestBody AttendanceSettingsRequestDto request) {
        return attendanceRecordService.updateSettings(request);
    }
}
