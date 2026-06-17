package br.com.gommo.modules.rh.person.attendance.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRecordResponseDto;

public interface IAttendanceRecordService
        extends IBaseService<AttendanceRecordRequestDto, AttendanceRecordResponseDto> {}
