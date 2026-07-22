package br.com.gommo.modules.rh.person.jobvacancyapplication.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class JobVacancyApplicationException {
    private JobVacancyApplicationException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException vacancyRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.VACANCY_REQUIRED_CODE,
                JobVacancyApplicationExceptions.VACANCY_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException candidateRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.CANDIDATE_REQUIRED_CODE,
                JobVacancyApplicationExceptions.CANDIDATE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException vacancyNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.VACANCY_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.VACANCY_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException candidateNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.CANDIDATE_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.CANDIDATE_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicate() {
        return new BusinessException(
                JobVacancyApplicationExceptions.DUPLICATE_CODE,
                JobVacancyApplicationExceptions.DUPLICATE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException kanbanColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.KANBAN_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.KANBAN_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException noCandidates() {
        return new BusinessException(
                JobVacancyApplicationExceptions.NO_CANDIDATES_CODE,
                JobVacancyApplicationExceptions.NO_CANDIDATES_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException stageCommentColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException stageCommentColumnNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
