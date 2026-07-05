package br.com.gommo.modules.rh.person.attendance.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSubmissionRequestDto;
import br.com.gommo.modules.rh.person.attendance.service.IAttendanceRecordService;

@RestController
@RequestMapping("/api/v1/attendance-records")
public class AttendanceRecordController
        extends BaseController<AttendanceRecordRequestDto, AttendanceRecordResponseDto> {
    private final IAttendanceRecordService attendanceRecordService;

    public AttendanceRecordController(IAttendanceRecordService service) {
        super(service);
        this.attendanceRecordService = service;
    }

    @PostMapping("/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceRecordResponseDto submit(@Valid @RequestBody AttendanceSubmissionRequestDto request) {
        return attendanceRecordService.submit(request);
    }
}
