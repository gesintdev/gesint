package br.com.gommo.modules.organization.department.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class DepartmentException {

    private DepartmentException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DepartmentExceptions.NOT_FOUND_CODE,
                DepartmentExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
