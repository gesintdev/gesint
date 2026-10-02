package br.com.gommo.modules.careers.site.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class CareersSiteException {
    private CareersSiteException() {}

    public static BusinessException vacancyNotFound() {
        return new BusinessException(
                CareersSiteExceptions.VACANCY_NOT_FOUND_CODE,
                CareersSiteExceptions.VACANCY_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException nameRequired() {
        return badRequest(CareersSiteExceptions.NAME_REQUIRED_CODE, CareersSiteExceptions.NAME_REQUIRED_MSG);
    }

    public static BusinessException emailRequired() {
        return badRequest(CareersSiteExceptions.EMAIL_REQUIRED_CODE, CareersSiteExceptions.EMAIL_REQUIRED_MSG);
    }

    public static BusinessException phoneRequired() {
        return badRequest(CareersSiteExceptions.PHONE_REQUIRED_CODE, CareersSiteExceptions.PHONE_REQUIRED_MSG);
    }

    public static BusinessException privacyConsentRequired() {
        return badRequest(
                CareersSiteExceptions.PRIVACY_CONSENT_REQUIRED_CODE,
                CareersSiteExceptions.PRIVACY_CONSENT_REQUIRED_MSG);
    }

    public static BusinessException resumeOrExperienceRequired() {
        return badRequest(
                CareersSiteExceptions.RESUME_OR_EXPERIENCE_REQUIRED_CODE,
                CareersSiteExceptions.RESUME_OR_EXPERIENCE_REQUIRED_MSG);
    }

    public static BusinessException resumeInvalid() {
        return badRequest(CareersSiteExceptions.RESUME_INVALID_CODE, CareersSiteExceptions.RESUME_INVALID_MSG);
    }

    private static BusinessException badRequest(String code, String message) {
        return new BusinessException(code, message, HttpStatus.BAD_REQUEST);
    }
}
