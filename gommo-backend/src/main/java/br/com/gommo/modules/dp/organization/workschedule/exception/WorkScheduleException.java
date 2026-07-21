package br.com.gommo.modules.dp.organization.workschedule.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class WorkScheduleException {

    private WorkScheduleException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                WorkScheduleExceptions.NOT_FOUND_CODE, WorkScheduleExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException nameRequired() {
        return new BusinessException(
                WorkScheduleExceptions.NAME_REQUIRED_CODE,
                WorkScheduleExceptions.NAME_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
