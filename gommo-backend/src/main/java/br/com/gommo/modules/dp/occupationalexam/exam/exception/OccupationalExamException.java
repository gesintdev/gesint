package br.com.gommo.modules.dp.occupationalexam.exam.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class OccupationalExamException {

    private OccupationalExamException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                OccupationalExamExceptions.NOT_FOUND_CODE,
                OccupationalExamExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException dueDateOverride() {
        return new BusinessException(
                OccupationalExamExceptions.DUE_DATE_OVERRIDE_CODE,
                OccupationalExamExceptions.DUE_DATE_OVERRIDE_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException immutable() {
        return new BusinessException(
                OccupationalExamExceptions.IMMUTABLE_CODE,
                OccupationalExamExceptions.IMMUTABLE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException registerIncomplete(String message) {
        return new BusinessException(
                OccupationalExamExceptions.REGISTER_INCOMPLETE_CODE, message, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException scheduleInvalid() {
        return new BusinessException(
                OccupationalExamExceptions.SCHEDULE_INVALID_STATUS_CODE,
                OccupationalExamExceptions.SCHEDULE_INVALID_STATUS_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
