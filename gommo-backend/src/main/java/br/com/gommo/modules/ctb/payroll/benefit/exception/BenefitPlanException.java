package br.com.gommo.modules.ctb.payroll.benefit.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class BenefitPlanException {
    private BenefitPlanException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                BenefitPlanExceptions.NOT_FOUND_CODE, BenefitPlanExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
