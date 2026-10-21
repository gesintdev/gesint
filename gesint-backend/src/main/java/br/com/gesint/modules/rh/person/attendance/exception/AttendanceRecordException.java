package br.com.gesint.modules.rh.person.attendance.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

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

    public static BusinessException compensationRequired() {
        return new BusinessException(
                AttendanceRecordExceptions.COMPENSATION_REQUIRED_CODE,
                AttendanceRecordExceptions.COMPENSATION_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicateWorkDate() {
        return new BusinessException(
                AttendanceRecordExceptions.DUPLICATE_WORK_DATE_CODE,
                AttendanceRecordExceptions.DUPLICATE_WORK_DATE_MSG,
                HttpStatus.CONFLICT);
    }
}
