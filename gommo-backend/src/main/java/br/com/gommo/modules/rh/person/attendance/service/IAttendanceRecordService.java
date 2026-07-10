package br.com.gommo.modules.rh.person.attendance.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceClockRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceMobileContextResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendancePresenceResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRequestResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceReviewRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSettingsRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSettingsResponseDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceSubmissionRequestDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IAttendanceRecordService
        extends IBaseService<AttendanceRecordRequestDto, AttendanceRecordResponseDto> {

    List<AttendancePresenceResponseDto> presence(LocalDate from, LocalDate to);

    AttendanceRequestResponseDto submit(AttendanceSubmissionRequestDto request);

    AttendanceRecordResponseDto clock(AttendanceClockRequestDto request);

    AttendanceMobileContextResponseDto mobileContext();

    List<AttendanceRecordResponseDto> mobileRecords(LocalDate from, LocalDate to);

    List<AttendanceRequestResponseDto> mobileSubmissions(LocalDate from, LocalDate to);

    List<AttendanceRequestResponseDto> listRequests();

    List<AttendanceRequestResponseDto> pendingRequests();

    AttendanceRequestResponseDto review(UUID id, AttendanceReviewRequestDto request);

    AttendanceSettingsResponseDto getSettings();

    AttendanceSettingsResponseDto updateSettings(AttendanceSettingsRequestDto request);
}
