package br.com.gommo.modules.person.contract.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class EmploymentContractException {
    private EmploymentContractException() {}
    public static BusinessException notFound() {
        return new BusinessException(EmploymentContractExceptions.NOT_FOUND_CODE, EmploymentContractExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
