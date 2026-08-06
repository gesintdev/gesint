package br.com.gommo.modules.cfg.settings.digitalcertificate.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class DigitalCertificateException {

    private DigitalCertificateException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DigitalCertificateExceptions.NOT_FOUND_CODE,
                DigitalCertificateExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidPkcs12() {
        return new BusinessException(
                DigitalCertificateExceptions.INVALID_PKCS12_CODE,
                DigitalCertificateExceptions.INVALID_PKCS12_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException fileRequired() {
        return new BusinessException(
                DigitalCertificateExceptions.FILE_REQUIRED_CODE,
                DigitalCertificateExceptions.FILE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicate() {
        return new BusinessException(
                DigitalCertificateExceptions.DUPLICATE_CODE,
                DigitalCertificateExceptions.DUPLICATE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException a3Unsupported() {
        return new BusinessException(
                DigitalCertificateExceptions.A3_UNSUPPORTED_CODE,
                DigitalCertificateExceptions.A3_UNSUPPORTED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
