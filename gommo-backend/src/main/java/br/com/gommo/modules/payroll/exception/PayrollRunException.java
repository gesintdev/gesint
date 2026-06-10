package br.com.gommo.modules.payroll.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PayrollRunException {
    private PayrollRunException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayrollRunExceptions.NOT_FOUND_CODE, PayrollRunExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
