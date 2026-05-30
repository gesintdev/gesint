package br.com.gommo.modules.payroll.payslip.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class PayslipException {
    private PayslipException() {}
    public static BusinessException notFound() {
        return new BusinessException(PayslipExceptions.NOT_FOUND_CODE, PayslipExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
