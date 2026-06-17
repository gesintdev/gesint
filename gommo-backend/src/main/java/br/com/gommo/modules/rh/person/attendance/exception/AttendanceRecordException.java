package br.com.gommo.modules.rh.person.attendance.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AttendanceRecordException {
    private AttendanceRecordException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                AttendanceRecordExceptions.NOT_FOUND_CODE,
                AttendanceRecordExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
