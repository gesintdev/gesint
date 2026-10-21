package br.com.gesint.modules.rh.person.jobvacancycompetency.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class JobVacancyCompetencyException {
    private JobVacancyCompetencyException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobVacancyCompetencyExceptions.NOT_FOUND_CODE,
                JobVacancyCompetencyExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException competencyNotFound() {
        return new BusinessException(
                JobVacancyCompetencyExceptions.COMPETENCY_NOT_FOUND_CODE,
                JobVacancyCompetencyExceptions.COMPETENCY_NOT_FOUND_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException vacancyNotFound() {
        return new BusinessException(
                JobVacancyCompetencyExceptions.VACANCY_NOT_FOUND_CODE,
                JobVacancyCompetencyExceptions.VACANCY_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicate() {
        return new BusinessException(
                JobVacancyCompetencyExceptions.DUPLICATE_CODE,
                JobVacancyCompetencyExceptions.DUPLICATE_MSG,
                HttpStatus.CONFLICT);
    }
}
