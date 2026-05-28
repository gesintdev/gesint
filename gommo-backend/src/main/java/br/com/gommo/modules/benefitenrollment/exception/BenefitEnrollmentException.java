package br.com.gommo.modules.benefitenrollment.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class BenefitEnrollmentException {
    private BenefitEnrollmentException() {}
    public static BusinessException notFound() {
        return new BusinessException(BenefitEnrollmentExceptions.NOT_FOUND_CODE, BenefitEnrollmentExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
