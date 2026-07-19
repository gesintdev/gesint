package br.com.gommo.modules.rh.person.jobvacancy.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class JobVacancyException {
    private JobVacancyException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobVacancyExceptions.NOT_FOUND_CODE,
                JobVacancyExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException titleRequired() {
        return new BusinessException(
                JobVacancyExceptions.TITLE_REQUIRED_CODE,
                JobVacancyExceptions.TITLE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException positionsInvalid() {
        return new BusinessException(
                JobVacancyExceptions.POSITIONS_INVALID_CODE,
                JobVacancyExceptions.POSITIONS_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException jobPositionNotFound() {
        return new BusinessException(
                JobVacancyExceptions.JOB_POSITION_NOT_FOUND_CODE,
                JobVacancyExceptions.JOB_POSITION_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
