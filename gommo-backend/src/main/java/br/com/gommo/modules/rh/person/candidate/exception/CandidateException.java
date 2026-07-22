package br.com.gommo.modules.rh.person.candidate.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class CandidateException {
    private CandidateException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                CandidateExceptions.NOT_FOUND_CODE,
                CandidateExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException nameRequired() {
        return new BusinessException(
                CandidateExceptions.NAME_REQUIRED_CODE,
                CandidateExceptions.NAME_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException cpfRequired() {
        return new BusinessException(
                CandidateExceptions.CPF_REQUIRED_CODE,
                CandidateExceptions.CPF_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException cpfDuplicate() {
        return new BusinessException(
                CandidateExceptions.CPF_DUPLICATE_CODE,
                CandidateExceptions.CPF_DUPLICATE_MSG,
                HttpStatus.CONFLICT);
    }
}
