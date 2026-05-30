package br.com.gommo.modules.person.exitinterview.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class ExitInterviewException {
    private ExitInterviewException() {}
    public static BusinessException notFound() {
        return new BusinessException(ExitInterviewExceptions.NOT_FOUND_CODE, ExitInterviewExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
