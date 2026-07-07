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

    public static BusinessException collaboratorNotLinked() {
        return new BusinessException(
                AttendanceRecordExceptions.COLLABORATOR_NOT_LINKED_CODE,
                AttendanceRecordExceptions.COLLABORATOR_NOT_LINKED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException invalidSubmission() {
        return new BusinessException(
                AttendanceRecordExceptions.INVALID_SUBMISSION_CODE,
                AttendanceRecordExceptions.INVALID_SUBMISSION_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
