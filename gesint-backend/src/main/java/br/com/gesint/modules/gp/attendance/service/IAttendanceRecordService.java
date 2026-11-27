package br.com.gesint.modules.gp.attendance.service;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.gp.attendance.dto.AttendanceClockRequestDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceCollaboratorScheduleResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceMobileContextResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendancePresenceResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceRecordRequestDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceRecordResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceRequestResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceReviewRequestDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceScheduleDayResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceSettingsRequestDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceSettingsResponseDto;
import br.com.gesint.modules.gp.attendance.dto.AttendanceSubmissionRequestDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IAttendanceRecordService
        extends IBaseService<AttendanceRecordRequestDto, AttendanceRecordResponseDto> {

    List<AttendancePresenceResponseDto> presence(LocalDate from, LocalDate to);

    AttendanceScheduleDayResponseDto scheduleDay(UUID collaboratorId, LocalDate workDate);

    AttendanceCollaboratorScheduleResponseDto collaboratorSchedule(UUID collaboratorId);

    PageableResponseDto<AttendanceRecordResponseDto> collaboratorHistory(
            UUID collaboratorId, LocalDate from, LocalDate to, int page, int size);

    AttendanceRequestResponseDto submit(AttendanceSubmissionRequestDto request);

    AttendanceRecordResponseDto clock(AttendanceClockRequestDto request);

    AttendanceRecordResponseDto clockForCollaborator(
            UUID collaboratorId, AttendanceClockRequestDto request, boolean enforceCaptureSettings);

    AttendanceMobileContextResponseDto mobileContext();

    List<AttendanceRecordResponseDto> mobileRecords(LocalDate from, LocalDate to);

    List<AttendanceRequestResponseDto> mobileSubmissions(LocalDate from, LocalDate to);

    List<AttendanceRequestResponseDto> listRequests();

    List<AttendanceRequestResponseDto> pendingRequests();

    AttendanceRequestResponseDto review(UUID id, AttendanceReviewRequestDto request);

    AttendanceSettingsResponseDto getSettings();

    AttendanceSettingsResponseDto updateSettings(AttendanceSettingsRequestDto request);
}
