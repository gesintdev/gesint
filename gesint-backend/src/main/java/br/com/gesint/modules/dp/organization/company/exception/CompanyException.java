package br.com.gesint.modules.dp.organization.company.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class CompanyException {

    private CompanyException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                CompanyExceptions.NOT_FOUND_CODE, CompanyExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException cnpjAlreadyExists() {
        return new BusinessException(
                CompanyExceptions.CNPJ_ALREADY_EXISTS_CODE,
                CompanyExceptions.CNPJ_ALREADY_EXISTS_MSG,
                HttpStatus.CONFLICT);
    }
}
