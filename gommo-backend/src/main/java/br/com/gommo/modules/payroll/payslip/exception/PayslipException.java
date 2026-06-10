package br.com.gommo.modules.payroll.payslip.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PayslipException {
    private PayslipException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayslipExceptions.NOT_FOUND_CODE, PayslipExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
