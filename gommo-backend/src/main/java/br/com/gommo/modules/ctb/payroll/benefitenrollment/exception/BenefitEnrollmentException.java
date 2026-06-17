package br.com.gommo.modules.ctb.payroll.benefitenrollment.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class BenefitEnrollmentException {
    private BenefitEnrollmentException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                BenefitEnrollmentExceptions.NOT_FOUND_CODE,
                BenefitEnrollmentExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
