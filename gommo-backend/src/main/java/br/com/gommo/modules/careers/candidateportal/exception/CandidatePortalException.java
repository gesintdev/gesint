package br.com.gommo.modules.careers.candidateportal.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class CandidatePortalException extends BusinessException {

    private CandidatePortalException(String code, String message, HttpStatus status) {
        super(code, message, status);
    }

    public static CandidatePortalException emailRequired() {
        return new CandidatePortalException(
                CandidatePortalExceptions.EMAIL_REQUIRED_CODE,
                CandidatePortalExceptions.EMAIL_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static CandidatePortalException passwordRequired() {
        return new CandidatePortalException(
                CandidatePortalExceptions.PASSWORD_REQUIRED_CODE,
                CandidatePortalExceptions.PASSWORD_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static CandidatePortalException nameRequired() {
        return new CandidatePortalException(
                CandidatePortalExceptions.NAME_REQUIRED_CODE,
                CandidatePortalExceptions.NAME_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static CandidatePortalException emailInUse() {
        return new CandidatePortalException(
                CandidatePortalExceptions.EMAIL_IN_USE_CODE,
                CandidatePortalExceptions.EMAIL_IN_USE_MSG,
                HttpStatus.CONFLICT);
    }

    public static CandidatePortalException invalidCredentials() {
        return new CandidatePortalException(
                CandidatePortalExceptions.INVALID_CREDENTIALS_CODE,
                CandidatePortalExceptions.INVALID_CREDENTIALS_MSG,
                HttpStatus.UNAUTHORIZED);
    }

    public static CandidatePortalException googleNotConfigured() {
        return new CandidatePortalException(
                CandidatePortalExceptions.GOOGLE_NOT_CONFIGURED_CODE,
                CandidatePortalExceptions.GOOGLE_NOT_CONFIGURED_MSG,
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    public static CandidatePortalException googleTokenInvalid() {
        return new CandidatePortalException(
                CandidatePortalExceptions.GOOGLE_TOKEN_INVALID_CODE,
                CandidatePortalExceptions.GOOGLE_TOKEN_INVALID_MSG,
                HttpStatus.UNAUTHORIZED);
    }

    public static CandidatePortalException accountNotFound() {
        return new CandidatePortalException(
                CandidatePortalExceptions.ACCOUNT_NOT_FOUND_CODE,
                CandidatePortalExceptions.ACCOUNT_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static CandidatePortalException applicationNotFound() {
        return new CandidatePortalException(
                CandidatePortalExceptions.APPLICATION_NOT_FOUND_CODE,
                CandidatePortalExceptions.APPLICATION_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static CandidatePortalException withdrawNotAllowed() {
        return new CandidatePortalException(
                CandidatePortalExceptions.WITHDRAW_NOT_ALLOWED_CODE,
                CandidatePortalExceptions.WITHDRAW_NOT_ALLOWED_MSG,
                HttpStatus.CONFLICT);
    }

    public static CandidatePortalException unauthorized() {
        return new CandidatePortalException(
                CandidatePortalExceptions.UNAUTHORIZED_CODE,
                CandidatePortalExceptions.UNAUTHORIZED_MSG,
                HttpStatus.UNAUTHORIZED);
    }

    public static CandidatePortalException offerNotFound() {
        return new CandidatePortalException(
                CandidatePortalExceptions.OFFER_NOT_FOUND_CODE,
                CandidatePortalExceptions.OFFER_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static CandidatePortalException offerNotActionable() {
        return new CandidatePortalException(
                CandidatePortalExceptions.OFFER_NOT_ACTIONABLE_CODE,
                CandidatePortalExceptions.OFFER_NOT_ACTIONABLE_MSG,
                HttpStatus.CONFLICT);
    }

    public static CandidatePortalException preAdmissionNotFound() {
        return new CandidatePortalException(
                CandidatePortalExceptions.PRE_ADMISSION_NOT_FOUND_CODE,
                CandidatePortalExceptions.PRE_ADMISSION_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static CandidatePortalException preAdmissionTokenInvalid() {
        return new CandidatePortalException(
                CandidatePortalExceptions.PRE_ADMISSION_TOKEN_INVALID_CODE,
                CandidatePortalExceptions.PRE_ADMISSION_TOKEN_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static CandidatePortalException preAdmissionIncomplete() {
        return new CandidatePortalException(
                CandidatePortalExceptions.PRE_ADMISSION_INCOMPLETE_CODE,
                CandidatePortalExceptions.PRE_ADMISSION_INCOMPLETE_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static CandidatePortalException preAdmissionDocumentType() {
        return new CandidatePortalException(
                CandidatePortalExceptions.PRE_ADMISSION_DOCUMENT_TYPE_CODE,
                CandidatePortalExceptions.PRE_ADMISSION_DOCUMENT_TYPE_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
