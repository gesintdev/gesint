package br.com.gommo.modules.person.offboarding.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class OffboardingException {
    private OffboardingException() {}
    public static BusinessException notFound() {
        return new BusinessException(OffboardingExceptions.NOT_FOUND_CODE, OffboardingExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
