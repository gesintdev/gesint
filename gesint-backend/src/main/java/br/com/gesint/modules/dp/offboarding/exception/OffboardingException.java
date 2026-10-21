package br.com.gesint.modules.dp.offboarding.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class OffboardingException {
    private OffboardingException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                OffboardingExceptions.NOT_FOUND_CODE, OffboardingExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException alreadyCompleted() {
        return new BusinessException(
                OffboardingExceptions.ALREADY_COMPLETED_CODE,
                OffboardingExceptions.ALREADY_COMPLETED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException reasonRequired() {
        return new BusinessException(
                OffboardingExceptions.REASON_REQUIRED_CODE,
                OffboardingExceptions.REASON_REQUIRED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException lastWorkDayRequired() {
        return new BusinessException(
                OffboardingExceptions.LAST_WORK_DAY_REQUIRED_CODE,
                OffboardingExceptions.LAST_WORK_DAY_REQUIRED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException reasonInvalid() {
        return new BusinessException(
                OffboardingExceptions.REASON_INVALID_CODE,
                OffboardingExceptions.REASON_INVALID_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException completedReadonly() {
        return new BusinessException(
                OffboardingExceptions.COMPLETED_READONLY_CODE,
                OffboardingExceptions.COMPLETED_READONLY_MSG,
                HttpStatus.CONFLICT);
    }
}
