package br.com.gommo.modules.rh.person.jobvacancy.publicapi.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.modules.rh.person.jobvacancy.exception.JobVacancyException;

public final class PublicCareersException {
    private PublicCareersException() {}

    public static BusinessException vacancyNotFound() {
        return JobVacancyException.publicNotFound();
    }

    public static BusinessException alreadyApplied() {
        return new BusinessException(
                PublicCareersExceptions.ALREADY_APPLIED_CODE,
                PublicCareersExceptions.ALREADY_APPLIED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException nameRequired() {
        return new BusinessException(
                PublicCareersExceptions.NAME_REQUIRED_CODE,
                PublicCareersExceptions.NAME_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException cpfRequired() {
        return new BusinessException(
                PublicCareersExceptions.CPF_REQUIRED_CODE,
                PublicCareersExceptions.CPF_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
