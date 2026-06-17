package br.com.gommo.modules.rh.person.contract.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class EmploymentContractException {
    private EmploymentContractException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                EmploymentContractExceptions.NOT_FOUND_CODE,
                EmploymentContractExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
