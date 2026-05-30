package br.com.gommo.modules.payroll.benefit.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class BenefitPlanException {
    private BenefitPlanException() {}
    public static BusinessException notFound() {
        return new BusinessException(BenefitPlanExceptions.NOT_FOUND_CODE, BenefitPlanExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
