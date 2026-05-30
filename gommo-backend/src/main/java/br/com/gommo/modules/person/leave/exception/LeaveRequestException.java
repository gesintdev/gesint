package br.com.gommo.modules.person.leave.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class LeaveRequestException {
    private LeaveRequestException() {}
    public static BusinessException notFound() {
        return new BusinessException(LeaveRequestExceptions.NOT_FOUND_CODE, LeaveRequestExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
