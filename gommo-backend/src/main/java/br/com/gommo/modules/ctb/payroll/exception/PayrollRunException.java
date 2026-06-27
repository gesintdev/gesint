package br.com.gommo.modules.ctb.payroll.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PayrollRunException {
    private PayrollRunException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayrollRunExceptions.NOT_FOUND_CODE, PayrollRunExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidStatus() {
        return new BusinessException(
                PayrollRunExceptions.INVALID_STATUS_CODE, PayrollRunExceptions.INVALID_STATUS_MSG, HttpStatus.CONFLICT);
    }

    public static BusinessException noEventsConfigured() {
        return new BusinessException(
                PayrollRunExceptions.NO_EVENTS_CODE,
                PayrollRunExceptions.NO_EVENTS_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException locked() {
        return new BusinessException(
                PayrollRunExceptions.LOCKED_CODE, PayrollRunExceptions.LOCKED_MSG, HttpStatus.CONFLICT);
    }

    public static BusinessException processing() {
        return new BusinessException(
                PayrollRunExceptions.PROCESSING_CODE, PayrollRunExceptions.PROCESSING_MSG, HttpStatus.CONFLICT);
    }

    public static BusinessException invalidTransition() {
        return new BusinessException(
                PayrollRunExceptions.INVALID_TRANSITION_CODE,
                PayrollRunExceptions.INVALID_TRANSITION_MSG,
                HttpStatus.CONFLICT);
    }
}
