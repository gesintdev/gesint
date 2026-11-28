package br.com.gesint.modules.gp.attendance.exception;

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
    public static BusinessException periodClosed() {
        return new BusinessException(
                AttendanceRecordExceptions.PERIOD_CLOSED_CODE,
                AttendanceRecordExceptions.PERIOD_CLOSED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException timesheetHasPending() {
        return new BusinessException(
                AttendanceRecordExceptions.TIMESHEET_HAS_PENDING_CODE,
                AttendanceRecordExceptions.TIMESHEET_HAS_PENDING_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException timesheetReopenReasonRequired() {
        return new BusinessException(
                AttendanceRecordExceptions.TIMESHEET_REOPEN_REASON_CODE,
                AttendanceRecordExceptions.TIMESHEET_REOPEN_REASON_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException timesheetNotClosed() {
        return new BusinessException(
                AttendanceRecordExceptions.TIMESHEET_NOT_CLOSED_CODE,
                AttendanceRecordExceptions.TIMESHEET_NOT_CLOSED_MSG,
                HttpStatus.CONFLICT);
    }
    public static BusinessException timesheetPeriodNotEnded() {
        return new BusinessException(
                AttendanceRecordExceptions.TIMESHEET_PERIOD_NOT_ENDED_CODE,
                AttendanceRecordExceptions.TIMESHEET_PERIOD_NOT_ENDED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
