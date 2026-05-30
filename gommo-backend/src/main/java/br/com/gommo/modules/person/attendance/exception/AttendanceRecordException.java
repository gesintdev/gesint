package br.com.gommo.modules.person.attendance.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class AttendanceRecordException {
    private AttendanceRecordException() {}
    public static BusinessException notFound() {
        return new BusinessException(AttendanceRecordExceptions.NOT_FOUND_CODE, AttendanceRecordExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
