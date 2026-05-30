package br.com.gommo.modules.person.performance.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class PerformanceReviewException {
    private PerformanceReviewException() {}
    public static BusinessException notFound() {
        return new BusinessException(PerformanceReviewExceptions.NOT_FOUND_CODE, PerformanceReviewExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
