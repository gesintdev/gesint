package br.com.gommo.modules.storage.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class StorageException {

    private StorageException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                StorageExceptions.NOT_FOUND_CODE, StorageExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException uploadFailed() {
        return new BusinessException(
                StorageExceptions.UPLOAD_FAILED_CODE,
                StorageExceptions.UPLOAD_FAILED_MSG,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static BusinessException fileTooLarge(long maxBytes) {
        long maxMb = Math.max(1, maxBytes / (1024 * 1024));
        return new BusinessException(
                StorageExceptions.FILE_TOO_LARGE_CODE,
                "Arquivo excede o tamanho máximo permitido (" + maxMb + " MB)",
                HttpStatus.PAYLOAD_TOO_LARGE);
    }

    public static BusinessException fileMissing() {
        return new BusinessException(
                StorageExceptions.FILE_MISSING_CODE, StorageExceptions.FILE_MISSING_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException linkNotFound() {
        return new BusinessException(
                StorageExceptions.LINK_NOT_FOUND_CODE, StorageExceptions.LINK_NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
