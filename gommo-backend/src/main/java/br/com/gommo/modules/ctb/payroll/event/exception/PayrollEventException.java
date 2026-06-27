package br.com.gommo.modules.ctb.payroll.event.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PayrollEventException {

    private PayrollEventException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayrollEventExceptions.NOT_FOUND_CODE, PayrollEventExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
