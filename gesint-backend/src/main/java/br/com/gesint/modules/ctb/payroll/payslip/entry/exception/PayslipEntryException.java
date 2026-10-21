package br.com.gesint.modules.ctb.payroll.payslip.entry.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class PayslipEntryException {

    private PayslipEntryException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayslipEntryExceptions.NOT_FOUND_CODE, PayslipEntryExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
