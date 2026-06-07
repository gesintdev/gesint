package br.com.gommo.modules.payroll.payslip.entry.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class PayslipEntryException {

    private PayslipEntryException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayslipEntryExceptions.NOT_FOUND_CODE,
                PayslipEntryExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
