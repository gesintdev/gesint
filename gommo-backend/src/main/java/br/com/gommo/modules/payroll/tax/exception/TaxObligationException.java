package br.com.gommo.modules.payroll.tax.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class TaxObligationException {
    private TaxObligationException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                TaxObligationExceptions.NOT_FOUND_CODE, TaxObligationExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
