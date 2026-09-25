package br.com.gommo.modules.dp.organization.jobpositioncompetency.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class JobPositionCompetencyException {

    private JobPositionCompetencyException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobPositionCompetencyExceptions.NOT_FOUND_CODE,
                JobPositionCompetencyExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException competencyNotFound() {
        return new BusinessException(
                JobPositionCompetencyExceptions.COMPETENCY_NOT_FOUND_CODE,
                JobPositionCompetencyExceptions.COMPETENCY_NOT_FOUND_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
