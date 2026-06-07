package br.com.gommo.modules.payroll.event.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class PayrollEventException {

    private PayrollEventException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PayrollEventExceptions.NOT_FOUND_CODE,
                PayrollEventExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
