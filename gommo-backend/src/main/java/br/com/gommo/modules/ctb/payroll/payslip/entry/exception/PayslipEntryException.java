package br.com.gommo.modules.ctb.payroll.payslip.entry.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PayslipEntryException {

    private PayslipEntryException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayslipEntryExceptions.NOT_FOUND_CODE, PayslipEntryExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
