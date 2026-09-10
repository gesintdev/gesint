package br.com.gommo.modules.dp.occupationalexam.clinic.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class MedicalClinicException {

    private MedicalClinicException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                MedicalClinicExceptions.NOT_FOUND_CODE, MedicalClinicExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
