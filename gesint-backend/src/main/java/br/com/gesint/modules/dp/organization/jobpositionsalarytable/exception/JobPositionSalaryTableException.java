package br.com.gesint.modules.dp.organization.jobpositionsalarytable.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class JobPositionSalaryTableException {

    private JobPositionSalaryTableException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobPositionSalaryTableExceptions.NOT_FOUND_CODE,
                JobPositionSalaryTableExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidRange() {
        return new BusinessException(
                JobPositionSalaryTableExceptions.INVALID_RANGE_CODE,
                JobPositionSalaryTableExceptions.INVALID_RANGE_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException invalidItems() {
        return new BusinessException(
                JobPositionSalaryTableExceptions.INVALID_ITEMS_CODE,
                JobPositionSalaryTableExceptions.INVALID_ITEMS_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
