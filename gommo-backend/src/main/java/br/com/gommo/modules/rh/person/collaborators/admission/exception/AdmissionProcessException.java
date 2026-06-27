package br.com.gommo.modules.rh.person.collaborators.admission.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AdmissionProcessException {
    private AdmissionProcessException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                AdmissionProcessExceptions.NOT_FOUND_CODE,
                AdmissionProcessExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException cpfAlreadyExists() {
        return new BusinessException(
                AdmissionProcessExceptions.CPF_ALREADY_EXISTS_CODE,
                AdmissionProcessExceptions.CPF_ALREADY_EXISTS_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException pjProviderRequired() {
        return new BusinessException(
                AdmissionProcessExceptions.PJ_PROVIDER_REQUIRED_CODE,
                AdmissionProcessExceptions.PJ_PROVIDER_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException pjRecessInvalid() {
        return new BusinessException(
                AdmissionProcessExceptions.PJ_RECESS_INVALID_CODE,
                AdmissionProcessExceptions.PJ_RECESS_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
